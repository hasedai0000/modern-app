<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class FirebaseAuthenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        if (config('firebase.auth_disabled', false) === true) {
            return $next($request);
        }

        $token = $this->getBearerToken($request);
        if ($token === null) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        try {
            $claims = $this->verifyAndDecodeJwt($token);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $firebase_uid = $claims['user_id'] ?? $claims['sub'] ?? null;
        if (!is_string($firebase_uid) || $firebase_uid === '') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $user = User::query()->where('firebase_uid', $firebase_uid)->first();
        if ($user === null) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        Auth::setUser($user);

        return $next($request);
    }

    private function getBearerToken(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if (!is_string($header) || $header === '') {
            return null;
        }

        if (preg_match('/^Bearer\s+(.+)$/i', $header, $matches) !== 1) {
            return null;
        }

        return $matches[1] ?? null;
    }

    /**
     * Minimal Firebase JWT verification without external libraries.
     * Required env:
     * - FIREBASE_PROJECT_ID
     * - FIREBASE_JWKS_JSON  (JWKS JSON string containing RSA public keys)
     */
    private function verifyAndDecodeJwt(string $jwt): array
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            throw new \RuntimeException('Invalid token');
        }

        [$encoded_header, $encoded_payload, $encoded_signature] = $parts;

        $header = json_decode($this->base64UrlDecode($encoded_header), true);
        $payload = json_decode($this->base64UrlDecode($encoded_payload), true);

        if (!is_array($header) || !is_array($payload)) {
            throw new \RuntimeException('Invalid token');
        }

        $kid = $header['kid'] ?? null;
        $alg = $header['alg'] ?? null;

        if (!is_string($kid) || $kid === '' || $alg !== 'RS256') {
            throw new \RuntimeException('Invalid token header');
        }

        $project_id = (string) config('firebase.project_id');
        if ($project_id === '') {
            throw new \RuntimeException('Firebase project_id is not configured');
        }

        $iss = $payload['iss'] ?? null;
        $aud = $payload['aud'] ?? null;

        if ($iss !== "https://securetoken.google.com/{$project_id}" || $aud !== $project_id) {
            throw new \RuntimeException('Invalid token claims');
        }

        $now = time();
        $exp = $payload['exp'] ?? null;
        if (!is_int($exp) || $exp < $now) {
            throw new \RuntimeException('Token expired');
        }

        $jwks_json = (string) config('firebase.jwks_json');
        if ($jwks_json === '') {
            throw new \RuntimeException('Firebase JWKS is not configured');
        }

        $jwks = json_decode($jwks_json, true);
        if (!is_array($jwks) || !isset($jwks['keys']) || !is_array($jwks['keys'])) {
            throw new \RuntimeException('Invalid JWKS');
        }

        $key = null;
        foreach ($jwks['keys'] as $k) {
            if (is_array($k) && ($k['kid'] ?? null) === $kid) {
                $key = $k;
                break;
            }
        }
        if (!is_array($key)) {
            throw new \RuntimeException('Public key not found');
        }

        $public_key_pem = $this->jwksToPem($key);
        $data = $encoded_header . '.' . $encoded_payload;
        $signature = $this->base64UrlDecode($encoded_signature);

        $ok = openssl_verify($data, $signature, $public_key_pem, OPENSSL_ALGO_SHA256);
        if ($ok !== 1) {
            throw new \RuntimeException('Signature verification failed');
        }

        return $payload;
    }

    private function base64UrlDecode(string $data): string
    {
        $data = strtr($data, '-_', '+/');
        $pad = strlen($data) % 4;
        if ($pad) {
            $data .= str_repeat('=', 4 - $pad);
        }
        $decoded = base64_decode($data, true);
        if ($decoded === false) {
            throw new \RuntimeException('Base64 decode failed');
        }
        return $decoded;
    }

    /**
     * Convert RSA JWK to PEM public key.
     * Expected keys: kty=RSA, n, e
     */
    private function jwksToPem(array $jwk): string
    {
        if (($jwk['kty'] ?? null) !== 'RSA' || !isset($jwk['n'], $jwk['e'])) {
            throw new \RuntimeException('Invalid JWK');
        }

        $n = $this->base64UrlDecode($jwk['n']);
        $e = $this->base64UrlDecode($jwk['e']);

        // ASN.1 DER encoding for RSA public key (SubjectPublicKeyInfo)
        $modulus = $this->asn1Integer($n);
        $exponent = $this->asn1Integer($e);
        $rsa_public_key = $this->asn1Sequence($modulus . $exponent);

        $algo = $this->asn1Sequence(
            $this->asn1ObjectIdentifier("\x2a\x86\x48\x86\xf7\x0d\x01\x01\x01") . // 1.2.840.113549.1.1.1 rsaEncryption
            $this->asn1Null()
        );

        $bit_string = $this->asn1BitString($rsa_public_key);
        $spki = $this->asn1Sequence($algo . $bit_string);

        $pem = "-----BEGIN PUBLIC KEY-----\n";
        $pem .= chunk_split(base64_encode($spki), 64, "\n");
        $pem .= "-----END PUBLIC KEY-----\n";
        return $pem;
    }

    private function asn1Length(int $length): string
    {
        if ($length < 128) {
            return chr($length);
        }
        $bytes = ltrim(pack('N', $length), "\x00");
        return chr(0x80 | strlen($bytes)) . $bytes;
    }

    private function asn1Integer(string $bytes): string
    {
        if ($bytes === '') {
            $bytes = "\x00";
        }
        // Ensure positive integer (prepend 0x00 if MSB set)
        if ((ord($bytes[0]) & 0x80) !== 0) {
            $bytes = "\x00" . $bytes;
        }
        return "\x02" . $this->asn1Length(strlen($bytes)) . $bytes;
    }

    private function asn1Sequence(string $bytes): string
    {
        return "\x30" . $this->asn1Length(strlen($bytes)) . $bytes;
    }

    private function asn1BitString(string $bytes): string
    {
        // prepend 0 unused bits count
        $bytes = "\x00" . $bytes;
        return "\x03" . $this->asn1Length(strlen($bytes)) . $bytes;
    }

    private function asn1Null(): string
    {
        return "\x05\x00";
    }

    private function asn1ObjectIdentifier(string $oid_bytes): string
    {
        return "\x06" . $this->asn1Length(strlen($oid_bytes)) . $oid_bytes;
    }
}


