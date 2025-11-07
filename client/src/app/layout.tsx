import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Town - Survival Game',
  description: '3D multiplayer survival game in a town',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
