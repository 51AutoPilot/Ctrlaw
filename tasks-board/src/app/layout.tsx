import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mission Control - AI Operating System",
  description: "Dashboard for managing AI agent operations",
};

const navItems = [
  { href: "/", label: "🏠 Home", exact: true },
  { href: "/tasks", label: "🎯 Tasks" },
  { href: "/calendar", label: "📅 Calendar" },
  { href: "/memory", label: "🧠 Memory" },
  { href: "/content", label: "📝 Content" },
  { href: "/team", label: "👥 Team" },
  { href: "/office", label: "🏢 Office" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="font-bold text-lg">
                🏢 Mission Control
              </Link>
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
      </body>
    </html>
  );
}
