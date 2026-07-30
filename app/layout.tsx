import type { Metadata } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/ui/ThemeProvider';

const mPlusRounded = M_PLUS_Rounded_1c({ 
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'スタディ・モンスターズ - 全学年対応RPG',
  description: '楽しみながら漢字と計算をマスターできる、小学生向けのRPG風ゲームアプリです。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`min-h-screen bg-transparent text-foreground antialiased selection:bg-primary selection:text-white ${mPlusRounded.className}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
