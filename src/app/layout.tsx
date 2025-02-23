import './globals.css';
import type { Metadata } from 'next';
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: 'Resumé Roaster by Kofi',
  description: 'Resumé feedback. Made with <3 by Kofi :)',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
