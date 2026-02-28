import Image from "next/image";
import Link from "next/link";

export default function AuthHeader() {
  return (
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
  );
}
