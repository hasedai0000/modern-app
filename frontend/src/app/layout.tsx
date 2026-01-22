import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Twitter 風 SNS アプリ',
  description: '何気ないことをつぶやくことができる Twitter 風 SNS アプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

