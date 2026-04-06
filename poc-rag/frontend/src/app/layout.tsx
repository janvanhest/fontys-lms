import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppThemeProvider } from '../components/app-theme-provider';

export const metadata: Metadata = {
  title: 'Fontys Studieassistent PoC',
  description: 'Lokale RAG chatbot voor Pro Open Learning',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="nl">
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
