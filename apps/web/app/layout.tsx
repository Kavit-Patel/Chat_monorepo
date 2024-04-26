import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StoreProvider from "./store/StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat App",
  description: "Basic Chatting Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <StoreProvider>
        <body className={inter.className}>{children}</body>
      </StoreProvider>
    </html>
  );
}
