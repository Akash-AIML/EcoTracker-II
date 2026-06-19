import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/calculator', label: 'Calculator' },
    { to: '/history', label: 'History' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="animated-underline"
            aria-label="EcoGuide AI — Home"
            style={{ textDecoration: 'none' }}
          >
            <span
              className="font-bold text-lg"
              style={{ fontFamily: 'Syne, sans-serif', color: '#fff', letterSpacing: '-0.03em' }}
            >
              EcoGuide<span style={{ color: '#444' }}>AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                role="listitem"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to) ? 'nav-link-active' : 'nav-link'
                }`}
                aria-current={isActive(link.to) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <Link to="/calculator">
              <button className="btn-primary !px-5 !py-2 !text-sm">Start Assessment</button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span
              className="block h-px w-5 transition-all duration-300"
              style={{
                background: '#fff',
                transform: mobileOpen ? 'rotate(45deg) translate(2px, 2px)' : 'none',
              }}
            />
            <span
              className="block h-px transition-all duration-300"
              style={{
                background: '#fff',
                width: mobileOpen ? '20px' : '14px',
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block h-px w-5 transition-all duration-300"
              style={{
                background: '#fff',
                transform: mobileOpen ? 'rotate(-45deg) translate(2px, -2px)' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t animate-fade-in"
          style={{ background: '#000', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to) ? 'nav-link-active' : 'nav-link'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link to="/calculator" onClick={() => setMobileOpen(false)}>
                <button className="btn-primary w-full !py-2.5 !text-sm">Start Assessment</button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
