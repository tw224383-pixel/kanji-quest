import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/ui/ThemeProvider';

export const metadata: Metadata = {
  title: '漢字クエスト - 全学年対応 漢字読みゲーム',
  description: '楽しみながら漢字の読みをマスターできる、小学生向けのRPG風ゲームアプリです。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-transparent text-foreground antialiased selection:bg-primary selection:text-white">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
