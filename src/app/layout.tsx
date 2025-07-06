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
      <body className={`${nunito.className} min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#f3e8ff] to-[#c7d2fe] relative overflow-x-hidden`}>
        <div className="pointer-events-none fixed inset-0 z-0 w-full h-full" style={{background: 'radial-gradient(ellipse at 60% 20%, #fff8, transparent 70%)'}} />
        <AnimatedBackground />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
