import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import MatchModal from '@/components/MatchModal';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DatingDApp - Web3 Dating',
  description: 'Swipe, match, earn. The future of dating on Avalanche',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-dark text-white`}>
        <div className="flex flex-col min-h-screen">
          <Navigation />

          <main className="flex-1 pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
              {children}
            </div>
          </main>

          <MatchModal />

          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid #FF4458',
                borderRadius: '12px',
                padding: '12px 20px',
              },
              success: {
                iconTheme: {
                  primary: '#FF4458',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
