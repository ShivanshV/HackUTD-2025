import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toyota Smart Search - Find Your Perfect Car',
  description: 'AI-powered smart search to help you find the perfect Toyota vehicle based on your needs and preferences',
  keywords: 'Toyota, car search, AI assistant, vehicle finder, smart search',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}

