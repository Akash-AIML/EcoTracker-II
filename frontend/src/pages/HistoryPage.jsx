import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAssessments } from '../hooks/useAssessment';
import { useUser } from '../hooks/useUser';
import { PageLoader } from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { formatDate, formatRelativeTime, getScoreInfo, formatNumber } from '../utils/formatters';

/** @constant {number} TONNES_DIVISOR - Converts kg to tonnes */
const TONNES_DIVISOR = 1000;

/** @constant {number} ANIMATION_DELAY_STEP - Seconds between staggered card animations */
const ANIMATION_DELAY_STEP = 0.04;

const CATEGORY_LABELS = {
  transport: 'Transport',
  energy: 'Energy',
  food: 'Food',
  shopping: 'Shopping',
};

export default function HistoryPage() {
  const { user } = useUser();
  const { assessments, loading, fetchAssessments } = useUserAssessments(user?.id);

  useEffect(() => {
    if (user?.id && user?.isRegistered) {
      fetchAssessments();
    }
  }, [user?.id, user?.isRegistered, fetchAssessments]);

  if (loading) return <PageLoader />;

  if (!assessments.length) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-xs font-mono mb-4" style={{ color: '#333', letterSpacing: '0.1em' }}>
            NO DATA
          </p>
          <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
            No Assessments Yet
          </h1>
          <p className="mb-6" style={{ color: '#555' }}>
            Complete your first carbon footprint assessment to start tracking your progress.
          </p>
          <Link to="/calculator">
            <Button>Start First Assessment</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sorted = [...assessments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const latest = sorted[sorted.length - 1];
  const earliest = sorted[0];
  const totalReduction = earliest.totalEmission - latest.totalEmission;
  const hasImproved = totalReduction > 0;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="eco-badge inline-flex mb-3">Progress Tracking</div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Assessment History
            </h1>
          </div>
          <Link to="/calculator">
            <Button id="btn-new-assessment-history">New Assessment</Button>
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="glass-card p-6 text-center">
            <p
              className="text-xs font-mono uppercase tracking-widest mb-3"
              style={{ color: '#444' }}
            >
              Total Assessments
            </p>
            <p className="text-4xl font-bold ticker" style={{ fontFamily: 'Syne, sans-serif' }}>
              {assessments.length}
            </p>
          </div>
          <div className="glass-card p-6 text-center">
            <p
              className="text-xs font-mono uppercase tracking-widest mb-3"
              style={{ color: '#444' }}
            >
              Latest Score
            </p>
            <p className="text-4xl font-bold ticker" style={{ fontFamily: 'Syne, sans-serif' }}>
              {latest.sustainabilityScore}
              <span className="text-xl" style={{ color: '#444' }}>
                /100
              </span>
            </p>
            <p className="text-xs mt-1.5" style={{ color: '#444' }}>
              {getScoreInfo(latest.sustainabilityScore).label}
            </p>
          </div>
          {assessments.length > 1 && (
            <div
              className="glass-card p-6 text-center"
              style={{
                borderColor: hasImproved ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              }}
            >
              <p
                className="text-xs font-mono uppercase tracking-widest mb-3"
                style={{ color: '#444' }}
              >
                {hasImproved ? 'Total Reduction' : 'Change'}
              </p>
              <p className="text-4xl font-bold ticker" style={{ fontFamily: 'Syne, sans-serif' }}>
                {hasImproved ? '−' : '+'}
                {formatNumber(Math.abs(totalReduction))}
              </p>
              <p className="text-xs mt-1.5" style={{ color: '#444' }}>
                kg CO₂ since first assessment
              </p>
            </div>
          )}
        </div>

        {/* List */}
        <section aria-label="Assessment history">
          <h2 className="text-sm font-mono mb-5" style={{ color: '#333', letterSpacing: '0.08em' }}>
            ALL ASSESSMENTS ({assessments.length})
          </h2>
          <div className="space-y-3">
            {assessments.map((a, i) => {
              const isLatest = i === 0;
              return (
                <article
                  key={a.id}
                  className="glass-card-hover p-5 animate-slide-up"
                  style={{ animationDelay: `${i * ANIMATION_DELAY_STEP}s` }}
                  aria-label={`Assessment from ${formatDate(a.createdAt)}, score ${a.sustainabilityScore}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      {/* Score badge */}
                      <div
                        className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <span
                          className="text-lg font-bold ticker"
                          style={{ fontFamily: 'Syne, sans-serif', color: '#fff' }}
                        >
                          {a.sustainabilityScore}
                        </span>
                        <span className="text-[9px]" style={{ color: '#444' }}>
                          /100
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-semibold" style={{ color: '#fff' }}>
                            {formatDate(a.createdAt)}
                          </p>
                          {isLatest && (
                            <span className="eco-badge text-[10px] px-2 py-0.5">Latest</span>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: '#555' }}>
                          {formatRelativeTime(a.createdAt)} ·{' '}
                          {(a.totalEmission / TONNES_DIVISOR).toFixed(2)} tonnes CO₂/year
                        </p>
                        {/* Category breakdown */}
                        <div className="flex items-center gap-4 mt-2">
                          {[
                            { key: 'transport', val: a.transportEmission },
                            { key: 'energy', val: a.energyEmission },
                            { key: 'food', val: a.foodEmission },
                            { key: 'shopping', val: a.shoppingEmission },
                          ].map(({ key, val }) => (
                            <span key={key} className="text-xs" style={{ color: '#444' }}>
                              <span style={{ color: '#555' }}>{CATEGORY_LABELS[key][0]}</span>{' '}
                              {formatNumber(val)}kg
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/simulator/${a.id}`}
                        aria-label={`Simulate changes for assessment from ${formatDate(a.createdAt)}, score ${a.sustainabilityScore}`}
                      >
                        <Button variant="secondary" size="sm">
                          Simulate
                        </Button>
                      </Link>
                      <Link
                        to={`/dashboard/${a.id}`}
                        aria-label={`View assessment from ${formatDate(a.createdAt)}, score ${a.sustainabilityScore}`}
                      >
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
