import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const stats = [
  { value: '4.7t', label: 'Global avg CO₂/year' },
  { value: '2.0t', label: 'Paris Agreement target' },
  { value: '25%', label: 'From food production' },
  { value: '16%', label: 'From personal transport' },
];

const features = [
  {
    tag: '01',
    title: 'Carbon Calculator',
    description:
      'Measure your annual CO₂ footprint across transport, energy, food, and shopping with real IPCC emission factors.',
  },
  {
    tag: '02',
    title: 'AI Recommendations',
    description:
      'Get personalized, prioritized recommendations based on your largest emission sources — not generic advice.',
  },
  {
    tag: '03',
    title: 'Impact Simulator',
    description:
      'Simulate future scenarios — switch to an EV, install solar panels, go vegetarian — and see real projected savings.',
  },
  {
    tag: '04',
    title: 'Progress Tracking',
    description:
      'Track your footprint over time, compare assessments, and celebrate your reductions with visual trends.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Answer 4 sections',
    desc: 'Transport, energy, food, and shopping — takes less than 5 minutes.',
  },
  {
    num: '02',
    title: 'See your footprint',
    desc: 'Detailed CO₂ breakdown with a sustainability score out of 100.',
  },
  {
    num: '03',
    title: 'Get AI recommendations',
    desc: 'Personalized actions ranked by impact, tailored to your lifestyle.',
  },
  {
    num: '04',
    title: 'Simulate and track',
    desc: 'Model changes, retake the assessment, watch your footprint shrink.',
  },
];

function AnimatedStat({ value, label, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="glass-card p-5 text-center animated-border"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(12px)',
        transition: 'all 0.5s ease',
      }}
    >
      <p
        className="text-2xl font-bold mb-1 ticker"
        style={{ fontFamily: 'Syne, sans-serif', color: '#fff' }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: '#555' }}>
        {label}
      </p>
    </div>
  );
}

export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-32 px-4 grid-bg"
        aria-labelledby="hero-heading"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Label */}
          <div className="eco-badge inline-flex mb-8 animate-fade-in">
            AI-Powered Carbon Footprint Analysis
          </div>

          <h1
            id="hero-heading"
            className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-none mb-8"
            style={{
              fontFamily: 'Syne, sans-serif',
              color: '#fff',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'none' : 'translateY(24px)',
              transition: 'all 0.7s ease',
            }}
          >
            Understand Your
            <br />
            <span className="gradient-text">Carbon Impact</span>
          </h1>

          <p
            className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{
              color: '#666',
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'none' : 'translateY(16px)',
              transition: 'all 0.7s ease 0.15s',
            }}
          >
            Measure your annual CO₂ footprint, receive personalized AI recommendations, and simulate
            the impact of lifestyle changes — all backed by real emission science.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'none' : 'translateY(12px)',
              transition: 'all 0.7s ease 0.25s',
            }}
          >
            <Link to="/calculator" id="hero-cta">
              <button className="btn-primary !px-10 !py-4 !text-base glow-eco">
                Start Your Assessment
              </button>
            </Link>
            <Link to="/history">
              <button className="btn-secondary !px-10 !py-4 !text-base">View History</button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-20">
            {stats.map((stat, i) => (
              <AnimatedStat
                key={stat.label}
                value={stat.value}
                label={stat.label}
                delay={400 + i * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
            <h2
              id="features-heading"
              className="text-3xl sm:text-5xl font-bold"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Everything You Need
              <br />
              to Go Green
            </h2>
            <p className="text-sm max-w-xs" style={{ color: '#555' }}>
              A complete platform for measuring and reducing your environmental impact.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-px"
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1rem',
              overflow: 'hidden',
            }}
          >
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="p-8 animate-slide-up scan-line"
                style={{
                  background: '#0A0A0A',
                  borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  animationDelay: `${i * 0.08}s`,
                  transition: 'background 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#111')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0A0A0A')}
              >
                <span
                  className="text-xs font-mono mb-4 block"
                  style={{ color: '#444', letterSpacing: '0.1em' }}
                >
                  {feature.tag}
                </span>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ fontFamily: 'Syne, sans-serif', color: '#fff' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#555' }}>
                  {feature.description}
                </p>
                <div
                  className="mt-6 h-px"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.15), transparent)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4" aria-labelledby="how-heading">
        <div className="max-w-4xl mx-auto">
          <h2
            id="how-heading"
            className="text-3xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            How It Works
          </h2>
          <p className="mb-14 text-sm" style={{ color: '#555' }}>
            From first click to meaningful reduction in four steps.
          </p>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="flex gap-8 py-7 animate-slide-up"
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  animationDelay: `${i * 0.08}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                }}
              >
                <span
                  className="text-5xl font-bold flex-shrink-0 leading-none"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'rgba(255,255,255,0.08)' }}
                >
                  {step.num}
                </span>
                <div className="pt-1">
                  <p className="font-semibold mb-1.5 text-base" style={{ color: '#fff' }}>
                    {step.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: '#555' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div
            className="glass-card p-14 text-center scan-line"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}
          >
            <div
              className="text-sm font-mono mb-6 inline-block px-3 py-1 rounded-full"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#555',
                letterSpacing: '0.1em',
              }}
            >
              READY WHEN YOU ARE
            </div>
            <h2
              className="text-3xl sm:text-5xl font-bold mb-5"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              Ready to Make a Difference?
            </h2>
            <p className="mb-10" style={{ color: '#555' }}>
              It takes less than 5 minutes to calculate your carbon footprint. The first step to
              reducing it is knowing it.
            </p>
            <Link to="/calculator" id="footer-cta">
              <button className="btn-primary !px-12 !py-4 !text-base glow-eco">
                Calculate My Footprint
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
