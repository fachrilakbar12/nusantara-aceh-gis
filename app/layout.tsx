import type { Metadata } from 'next';
import { Inter, Orbitron, Space_Mono } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap'
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Interactive 3D Education Journey — Virtual Fitting Room Portfolio',
  description:
    'Portofolio interaktif perjalanan pendidikan 3D (SMPN 1 Peureulak, SMKN Taman Fajar, Universitas Malikussaleh) menggunakan Next.js 14, React Three Fiber, GSAP, dan Web Audio API.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${orbitron.variable} ${spaceMono.variable} ${inter.variable}`}
    >
      <body className="bg-[#05080a] font-mono text-[#e8eef0] antialiased">
        {children}
      </body>
    </html>
  );
}

