import { Link } from 'react-router-dom';
import { PRIVACY_NOTICE } from '../../utils/constants';

export default function Footer() {
  return (
    <footer
      className="mt-24"
      role="contentinfo"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <span
                className="font-bold text-base"
                style={{ fontFamily: 'Syne, sans-serif', color: '#fff', letterSpacing: '-0.03em' }}
              >
                EcoGuide<span style={{ color: '#333' }}>AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#444' }}>
              Helping individuals understand and reduce their carbon footprint through intelligent
              analysis and personalized recommendations.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: '#444' }}
            >
              Features
            </h3>
            <ul className="space-y-3" role="list">
              {[
                { to: '/calculator', label: 'Carbon Calculator' },
                { to: '/history', label: 'Progress Tracking' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm animated-underline transition-colors duration-200"
                    style={{ color: '#444' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: '#444' }}
            >
              Data Sources
            </h3>
            <ul className="space-y-2 text-sm" style={{ color: '#444' }} role="list">
              <li>IPCC Emission Factors 2023</li>
              <li>UK BEIS Carbon Factors</li>
              <li>EPA GHG Equivalencies</li>
              <li>Paris Agreement Targets</li>
            </ul>
          </div>
        </div>

        <div className="section-divider" />

        {/* Privacy Notice */}
        <div
          className="rounded-xl px-4 py-3 mb-6 text-xs leading-relaxed"
          style={{
            background: 'rgba(16,185,129,0.04)',
            border: '1px solid rgba(16,185,129,0.12)',
            color: '#475569',
          }}
          role="note"
          aria-label="Privacy notice"
        >
          🔒 <strong style={{ color: '#6b7280' }}>Privacy:</strong> {PRIVACY_NOTICE}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#333' }}>
            &copy; {new Date().getFullYear()} EcoGuide AI. Built for a sustainable future.
          </p>
          <div
            className="flex items-center gap-2 text-sm font-mono"
            style={{ color: '#333', letterSpacing: '0.05em' }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#fff' }}
            />
            CARBON NEUTRAL BY 2050
          </div>
        </div>
      </div>
    </footer>
  );
}
