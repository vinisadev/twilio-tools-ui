import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarNavigation from "@/components/SidebarNavigation";
import MobileNavigation from "@/components/MobileNavigation";
import { TwilioCredentialsProvider } from "@/contexts/TwilioCredentialsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Twilio API Explorer",
  description: "Learn and explore Twilio APIs with interactive examples",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TwilioCredentialsProvider>
          <div className="flex h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-80 md:flex-col">
              <div className="flex flex-col flex-grow pt-5 bg-card border-r">
                <SidebarNavigation />
              </div>
            </div>
            
            {/* Main content */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Mobile Navigation Header */}
              <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
                <h1 className="text-lg font-semibold">Twilio API Explorer</h1>
                <MobileNavigation />
              </div>
              
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </TwilioCredentialsProvider>
      </body>
    </html>
  );
}