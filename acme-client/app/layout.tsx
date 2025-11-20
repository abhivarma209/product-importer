import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Acme Product Importer',
  description: 'Scalable product management and CSV import system',
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

