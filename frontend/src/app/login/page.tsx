'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { verifyUserAfterLogin } from '@/app/actions/authApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  // 既にログイン済みの場合はホームにリダイレクト
  useEffect(() => {
    if (!auth) {
      setAuthChecking(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace('/');
        return;
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Firebase設定の確認
      if (!auth) {
        setError(
          'Firebaseが正しく設定されていません。環境変数を確認してください。'
        );
        setLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      const res = await verifyUserAfterLogin(token);

      if (res.data) {
        router.push('/');
      } else {
        setError(
          res.errorMessage ||
            'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
        );
      }
    } catch (err: unknown) {
      let errorMessage =
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。';

      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        switch (code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            errorMessage =
              'メールアドレスまたはパスワードが正しくありません。';
            break;
          case 'auth/invalid-email':
            errorMessage = '有効なメールアドレスを入力してください。';
            break;
          case 'auth/too-many-requests':
            errorMessage =
              'ログイン試行が多すぎます。しばらくしてから再度お試しください。';
            break;
          case 'auth/user-disabled':
            errorMessage = 'このアカウントは無効化されています。';
            break;
          case 'auth/configuration-not-found':
            errorMessage =
              'Firebase設定が見つかりません。環境変数を確認してください。';
            break;
          default:
            if ('message' in err && typeof (err as { message: string }).message === 'string') {
              errorMessage = (err as { message: string }).message;
            }
        }
      }

      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B2631] flex flex-col">
      {/* ヘッダー */}
      <header className="flex justify-between items-center p-6">
        <Image src="/assets/logo.png" alt="SHARE" width={120} height={40} />
        <nav className="flex gap-4">
          <Link href="/register" className="text-white hover:underline">
            新規登録
          </Link>
          <Link href="/login" className="text-white hover:underline">
            ログイン
          </Link>
        </nav>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
          {authChecking ? (
            <div className="text-center py-8 text-gray-600">
              確認中...
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-black text-center mb-6">ログイン</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  placeholder="メールアドレス"
                />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  placeholder="パスワード"
                />

                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full border-4 border-t-gray-500 border-l-gray-500 border-r-gray-900 border-b-gray-900 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'ログイン中...' : 'ログイン'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

