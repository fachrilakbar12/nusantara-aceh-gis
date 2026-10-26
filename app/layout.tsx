import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const fraunces = localFont({
  src: './fonts/Fraunces-Latin.woff2',
  weight: '600 700',
  variable: '--font-display',
  display: 'swap'
});

const instrumentSans = localFont({
  src: './fonts/InstrumentSans-Latin.woff2',
  weight: '400 700',
  variable: '--font-sans',
  display: 'swap'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0b1220'
};

export const metadata: Metadata = {
  title: 'Nusantara Aceh: 23 Negeri, Satu Tanah Rencong',
  description:
    'Peta 3D interaktif yang mengangkat kekayaan budaya, tari, musik, kuliner, dan sejarah dari 23 kabupaten dan kota di Provinsi Aceh.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${instrumentSans.variable}`}
    >
      <body className="bg-[#0b1220] font-sans text-[#f3efe6] antialiased">
        {children}
      </body>
    </html>
  );
}
