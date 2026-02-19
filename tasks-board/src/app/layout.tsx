'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { AgentProvider, useAgents } from "../lib/agent-context";
import { I18nProvider, useT } from "../lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navKeys = [
  { href: "/", key: "nav.home" },
  { href: "/tasks", key: "nav.tasks" },
  { href: "/calendar", key: "nav.calendar" },
  { href: "/memory", key: "nav.memory" },
  { href: "/content", key: "nav.content" },
  { href: "/team", key: "nav.team" },
  { href: "/office", key: "nav.office" },
  { href: "/settings", key: "nav.settings" },
];

function ConnectionIndicator() {
  const { connectedCount, totalCount } = useAgents();
  const { t } = useT();

  let dotColor = 'bg-gray-400';
  if (totalCount === 0) dotColor = 'bg-gray-400';
  else if (connectedCount === totalCount) dotColor = 'bg-green-500';
  else if (connectedCount > 0) dotColor = 'bg-yellow-400';
  else dotColor = 'bg-red-500';

  return (
    <span className="flex items-center gap-1.5 text-sm text-gray-600">
      <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
      {totalCount === 0
        ? t('nav.noAgents')
        : t('nav.agentCount', { connected: connectedCount, total: totalCount })}
    </span>
  );
}

function LanguageToggle() {
  const { locale, setLocale } = useT();
  return (
    <button
      onClick={() => setLocale(locale === 'zh-TW' ? 'en' : 'zh-TW')}
      className="px-2 py-1 text-xs rounded border hover:bg-gray-100 font-medium"
      title="Switch language"
    >
      {locale === 'zh-TW' ? 'EN' : '中'}
    </button>
  );
}

function NavBar() {
  const { t } = useT();
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg">
              Ctrlaw
            </Link>
            <ConnectionIndicator />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {navKeys.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm hover:bg-gray-100 whitespace-nowrap"
              >
                {t(item.key)}
              </Link>
            ))}
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
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
        <title>Ctrlaw</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <I18nProvider>
          <AgentProvider>
            <NavBar />
            <main className="max-w-7xl mx-auto">{children}</main>
          </AgentProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
