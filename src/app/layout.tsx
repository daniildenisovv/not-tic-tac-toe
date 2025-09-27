import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelegramProvider } from "@/components/providers/telegram-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tic Tac Toe - Telegram Mini App",
  description: "Play Tic Tac Toe with friends in Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TelegramProvider>
          <SocketProvider>
            {children}
            <Toaster />
          </SocketProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
