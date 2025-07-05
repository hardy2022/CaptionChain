import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "sonner";
import { AnimatedBackground } from "@/components/animated-background";

const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito"
});

export const metadata: Metadata = {
  title: "CaptionChain - AI Video Generation Platform",
  description: "Create, edit, and generate captions for your videos with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.className} min-h-screen bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-300`}>
        <AnimatedBackground />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
