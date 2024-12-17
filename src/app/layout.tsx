import './globals.css'
import type { Metadata } from 'next'
import ClientWrapper from '@/components/ClientWrapper'

export const metadata: Metadata = {
  title: 'Monopoly Auction',
  description: 'A property auction system for Monopoly',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  )
}