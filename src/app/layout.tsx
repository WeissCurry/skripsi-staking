import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "AmanahStaking | Shariah-Compliant ETH Staking",
  description: "Enterprise-grade Risk Management Dashboard for Shariah-Compliant Ethereum Staking (Wakalah bil Istithmar)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        <Web3Provider>
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05)_0%,rgba(0,0,0,0)_50%)] pointer-events-none" />
          <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
          
          <div className="h-screen flex flex-col p-2 gap-2 relative z-10">
            <Header />
            <div className="flex-1 flex gap-2 min-h-0">
              <Sidebar />
              <main className="flex-1 overflow-y-auto min-h-0 pb-2 scrollbar-thin">
                {children}
              </main>
            </div>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
