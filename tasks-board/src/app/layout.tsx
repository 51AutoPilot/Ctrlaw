'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { AgentProvider, useAgents } from "../lib/agent-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navItems = [
  { href: "/", label: "\u9996\u9801" },
  { href: "/tasks", label: "\u4efb\u52d9" },
  { href: "/calendar", label: "\u884c\u4e8b\u66c6" },
  { href: "/memory", label: "\u8a18\u61b6" },
  { href: "/content", label: "\u5167\u5bb9" },
  { href: "/team", label: "\u5718\u968a" },
  { href: "/office", label: "\u8fa6\u516c\u5ba4" },
  { href: "/settings", label: "\u8a2d\u5b9a" },
];

function ConnectionIndicator() {
  const { connectedCount, totalCount } = useAgents();

  let dotColor = 'bg-gray-400';
  if (totalCount === 0) dotColor = 'bg-gray-400';
  else if (connectedCount === totalCount) dotColor = 'bg-green-500';
  else if (connectedCount > 0) dotColor = 'bg-yellow-400';
  else dotColor = 'bg-red-500';

  return (
    <span className="flex items-center gap-1.5 text-sm text-gray-600">
      <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
      {totalCount === 0 ? '尚無 Agent' : `${connectedCount}/${totalCount} 個 Agent`}
    </span>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <title>Ctrlaw - AI 智能作業系統</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <AgentProvider>
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-4">
                  <Link href="/" className="font-bold text-lg">
                    Ctrlaw
                  </Link>
                  <ConnectionIndicator />
                </div>
                <div className="flex gap-1 overflow-x-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-3 py-2 rounded-md text-sm hover:bg-gray-100 whitespace-nowrap"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto">{children}</main>
        </AgentProvider>
      </body>
    </html>
  );
}
