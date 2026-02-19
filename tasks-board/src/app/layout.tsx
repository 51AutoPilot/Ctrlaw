'use client';

import React from "react";
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

// Error boundary to catch React render errors and display details
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#c00' }}>Runtime Error</h1>
          <pre style={{
            background: '#f5f5f5', padding: '1rem', borderRadius: '8px',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          }}>
            {this.state.error.message}{'\n\n'}{this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
        <script dangerouslySetInnerHTML={{ __html: `
          window.__CTRLAW_ERRORS = [];
          window.onerror = function(msg, src, line, col, err) {
            window.__CTRLAW_ERRORS.push({msg:msg, src:src, line:line, col:col, stack:err&&err.stack});
            var el = document.getElementById('__ctrlaw_err');
            if (!el) { el = document.createElement('pre'); el.id='__ctrlaw_err'; el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee;color:#c00;padding:1rem;font-size:12px;max-height:50vh;overflow:auto;white-space:pre-wrap;word-break:break-all;'; document.body.appendChild(el); }
            el.textContent = 'JS Error: ' + msg + '\\nSource: ' + src + ':' + line + ':' + col + '\\n' + (err&&err.stack||'');
          };
          window.addEventListener('unhandledrejection', function(e) {
            var msg = e.reason && (e.reason.message || e.reason);
            window.__CTRLAW_ERRORS.push({type:'unhandledrejection',msg:msg,stack:e.reason&&e.reason.stack});
            var el = document.getElementById('__ctrlaw_err');
            if (!el) { el = document.createElement('pre'); el.id='__ctrlaw_err'; el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#fee;color:#c00;padding:1rem;font-size:12px;max-height:50vh;overflow:auto;white-space:pre-wrap;word-break:break-all;'; document.body.appendChild(el); }
            el.textContent = 'Unhandled Promise Rejection: ' + msg + '\\n' + (e.reason&&e.reason.stack||'');
          });
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <AppErrorBoundary>
          <I18nProvider>
            <AgentProvider>
              <NavBar />
              <main className="max-w-7xl mx-auto">{children}</main>
            </AgentProvider>
          </I18nProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}
