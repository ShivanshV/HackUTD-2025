import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toyota AI Assistant - Find Your Perfect Car',
  description: 'AI-powered assistant to help you find the perfect Toyota vehicle based on your needs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

