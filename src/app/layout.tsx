import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './Providers'
import SWRegistrar from './SWRegistrar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SendIt - Mobile Chat Application',
  description: 'Real-time chat application optimized for mobile devices',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon-192x192.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SendIt" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.className}`} suppressHydrationWarning>
        <Providers>
          <SWRegistrar />
          {children}
        </Providers>
      </body>
    </html>
  )
}