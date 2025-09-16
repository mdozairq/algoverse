import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth/auth-context"
import { WalletProvider } from "@/lib/wallet/wallet-context"
import { DataProvider } from "@/lib/providers/data-provider"
import { ThemeWrapper } from "@/components/theme-wrapper"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "AlgoVerse - Powered by Algorand",
  description: "Decentralized NFT marketplace for event tickets and passes on Algorand blockchain",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ThemeWrapper>
            <AuthProvider>
              <WalletProvider>
                <DataProvider>{children}</DataProvider>
              </WalletProvider>
            </AuthProvider>
            <Toaster />
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
