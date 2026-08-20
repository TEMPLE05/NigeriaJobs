import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Briefcase, FileText, HelpCircle, Info } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import InstallPrompt from './InstallPrompt';

const NAV_LINKS = [
  { to: '/', label: 'Browse Jobs', shortLabel: 'Jobs', icon: Briefcase },
  { to: '/cv-generator', label: 'CV Generator', shortLabel: 'CV', icon: FileText },
  { to: '/help', label: 'Help', shortLabel: 'Help', icon: HelpCircle },
  { to: '/contact', label: 'About', shortLabel: 'About', icon: Info },
];

// Shared app chrome for every page. Desktop (lg+) gets a fixed sidebar that
// stays put while the page content scrolls independently, similar to the
// Claude desktop app. Below that breakpoint there's no room for a sidebar,
// so it falls back to a top bar + bottom nav bar instead — same nav links,
// same colors/icons, just laid out horizontally rather than vertically, so
// the two feel like one design rather than two different apps.
const AppShell: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="lg:flex" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 border-r"
        style={{ backgroundColor: 'var(--header-bg-color)', borderColor: 'var(--header-border-color)' }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--header-border-color)' }}>
          <div className="flex items-center gap-2">
            <img src="/logo.app/in-site.png" alt="Logo" className="h-8 w-auto" />
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">JobVista.NG</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Find your dream job</div>
            </div>
          </div>
          <div className="mt-4">
            <InstallPrompt />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: active ? 'var(--badge-bg-color)' : 'transparent',
                  color: active ? 'var(--card-text-color)' : 'var(--card-secondary-text-color)',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--header-border-color)' }}>
          <ThemeToggle />
          <p className="text-xs text-center" style={{ color: 'var(--card-secondary-text-color)' }}>
            © 2025 JobVista.NG
          </p>
        </div>
      </aside>

      {/* Content column */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden flex-shrink-0 border-b shadow-sm" style={{ backgroundColor: 'var(--header-bg-color)', borderColor: 'var(--header-border-color)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-16 relative">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">JobVista.NG</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block text-center">Find your dream job</p>
              </div>
              <div className="absolute right-0">
                <InstallPrompt />
              </div>
            </div>
          </div>
        </header>

        {/* pb-20 (+ safe-area) reserves room so content never sits behind the
            fixed mobile tab bar below; lg:pb-0 since desktop has no such bar */}
        <main className="flex-1 pb-20 lg:pb-0" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
          <Outlet />
        </main>

        {/* Mobile bottom tab bar — fixed (not a scrolling footer), so nav is
            always one thumb-reach away regardless of scroll position. Sized
            per standard tab-bar touch-target guidance (~56px+ per item). */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-stretch gap-1 px-1"
          style={{
            backgroundColor: 'var(--footer-bg-color)',
            borderColor: 'var(--footer-border-color)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          aria-label="Primary"
        >
          {NAV_LINKS.map(({ to, shortLabel, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-14 text-center rounded-lg mx-0.5 my-1"
                style={{ color: active ? 'var(--card-text-color)' : 'var(--card-secondary-text-color)', backgroundColor: active ? 'var(--badge-bg-color)' : 'transparent' }}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[11px] font-medium leading-none">{shortLabel}</span>
              </Link>
            );
          })}
          <div className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-14">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AppShell;
