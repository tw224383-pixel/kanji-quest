import type { Metadata } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { UserProvider } from '../contexts/UserContext';
import { ThemeContextProvider } from '../contexts/ThemeContext';
import { PwaRegister } from '../components/PwaRegister';

const mPlusRounded = M_PLUS_Rounded_1c({ 
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'スタディ・モンスターズ - 全学年対応RPG',
  description: '楽しみながら漢字と計算をマスターできる、小学生向けのRPG風ゲームアプリです。',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#f59e0b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`min-h-screen bg-transparent text-foreground antialiased selection:bg-primary selection:text-white ${mPlusRounded.className}`}>
        <UserProvider>
          <ThemeContextProvider>
            <ThemeProvider>
              <PwaRegister />
              {children}
            </ThemeProvider>
          </ThemeContextProvider>
        </UserProvider>
      </body>
    </html>
  );
}
