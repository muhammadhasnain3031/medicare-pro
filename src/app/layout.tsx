import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MediCare Pro — Hospital Management System',
  description: 'Advanced AI-powered hospital management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}