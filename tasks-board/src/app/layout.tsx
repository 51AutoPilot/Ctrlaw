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
  { href: "/", label: "Home" },
  { href: "/tasks", label: "Tasks" },
  { href: "/calendar", label: "Calendar" },
  { href: "/memory", label: "Memory" },
  { href: "/content", label: "Content" },
  { href: "/team", label: "Team" },
  { href: "/office", label: "Office" },
  { href: "/settings", label: "Settings" },
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
      {totalCount === 0 ? 'No agents' : `${connectedCount}/${totalCount} agents`}
    </span>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Mission Control - AI Operating System</title>
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
                    Mission Control
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
