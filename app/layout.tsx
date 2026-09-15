import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'Inter Red - Internet de Alta Velocidad en Choya, Santiago del Estero',
  description: 'Conectate con Inter Red. Internet por antenas de alta velocidad en el Departamento Choya, Santiago del Estero. Cobertura local, soporte cercano.',
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Inter Red - Internet de Alta Velocidad en Choya',
    description: 'Conectate con Inter Red. Internet por antenas de alta velocidad en el Departamento Choya, Santiago del Estero.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  )
}
