import { useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAssessment, useUserAssessments } from '../hooks/useAssessment';
import { useUser } from '../hooks/useUser';
import FootprintCard from '../components/dashboard/FootprintCard';
import ScoreGauge from '../components/dashboard/ScoreGauge';
import RecommendationCard from '../components/dashboard/RecommendationCard';
import LoadingSpinner, { PageLoader } from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { formatDate, getScoreInfo } from '../utils/formatters';
import { GLOBAL_AVERAGE_EMISSION, UK_AVERAGE_EMISSION, TARGET_EMISSION } from '../utils/constants';

// Lazy-load heavy Recharts-dependent visualization components to minimize initial bundle size
const EmissionPieChart = lazy(() => import('../components/dashboard/EmissionPieChart'));
const TrendChart = lazy(() => import('../components/dashboard/TrendChart'));

/** @constant {number} TONNES_DIVISOR - Divisor to convert kg to tonnes */
const TONNES_DIVISOR = 1000;

/** @constant {number} SCORE_EXCELLENT - Threshold for excellent score tier */
const SCORE_EXCELLENT = 90;

/** @constant {number} SCORE_GOOD - Threshold for good score tier */
const SCORE_GOOD = 70;

/** @constant {number} SCORE_MODERATE - Threshold for moderate score tier */
const SCORE_MODERATE = 50;

/** @constant {number} RECENT_ASSESSMENTS_LIMIT - Max recent assessments to display */
const RECENT_ASSESSMENTS_LIMIT = 3;

/**
 * Benchmark bar for the "How You Compare" section.
 * @param {Object} props
 * @param {string} props.label - Display label (e.g. "Global Average")
 * @param {number} props.benchmarkKg - Benchmark emission in kg
 * @param {number} props.userKg - User's emission in kg
 * @param {string} props.color - CSS color for the bar
 * @returns {JSX.Element}
 */
function BenchmarkBar({ label, benchmarkKg, userKg, color }) {
  const maxVal = Math.max(benchmarkKg, userKg) * 1.15;
  const benchPct = (benchmarkKg / maxVal) * 100;
  const userPct = (userKg / maxVal) * 100;
  const diff = (((userKg - benchmarkKg) / benchmarkKg) * 100).toFixed(0);
  const isBelow = userKg < benchmarkKg;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: '#aaa' }}>
          {label}
        </span>
        <span className="text-xs font-semibold" style={{ color: isBelow ? '#10b981' : '#f59e0b' }}>
          {isBelow ? '↓' : '↑'} {Math.abs(diff)}% {isBelow ? 'below' : 'above'}
        </span>
      </div>
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {/* Benchmark marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 z-10"
          style={{ left: `${benchPct}%`, background: color, opacity: 0.7 }}
          aria-hidden="true"
        />
        {/* User bar */}
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${userPct}%`,
            background: isBelow
              ? 'linear-gradient(90deg, #10b981, #06b6d4)'
              : 'linear-gradient(90deg, #f59e0b, #ef4444)',
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px]" style={{ color: '#555' }}>
          You: {(userKg / TONNES_DIVISOR).toFixed(2)}t
        </span>
        <span className="text-[10px]" style={{ color: '#555' }}>
          {label}: {(benchmarkKg / TONNES_DIVISOR).toFixed(2)}t
        </span>
      </div>
    </div>
  );
}

BenchmarkBar.propTypes = {
  label: PropTypes.string.isRequired,
  benchmarkKg: PropTypes.number.isRequired,
  userKg: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

export default function DashboardPage() {
  const { assessmentId } = useParams();
  const { assessment, loading, error, fetchAssessment } = useAssessment();
  const { user } = useUser();
  const { assessments, fetchAssessments } = useUserAssessments(user?.id);

  useEffect(() => {
    if (assessmentId) fetchAssessment(assessmentId);
  }, [assessmentId, fetchAssessment]);

  useEffect(() => {
    if (user?.id && user?.isRegistered) fetchAssessments();
  }, [user?.id, user?.isRegistered, fetchAssessments]);

  /** @type {{ label: string, color: string } | null} */
  const scoreInfo = useMemo(
    () => (assessment ? getScoreInfo(assessment.sustainabilityScore) : null),
    [assessment]
  );

  /**
   * Determine the contextual message for the score banner.
   * @param {number} score - The sustainability score (0-100)
   * @returns {string} Human-readable description
   */
  const getScoreMessage = useCallback((score) => {
    if (score >= SCORE_EXCELLENT) {
      return 'Outstanding! Your footprint is well below the Paris Agreement target.';
    }
    if (score >= SCORE_GOOD) {
      return 'Great work! A few more changes could put you in the excellent category.';
    }
    if (score >= SCORE_MODERATE) {
      return "You're around the global average. The recommendations below can help you reduce further.";
    }
    return 'There are significant opportunities to reduce your impact. Start with the high-priority recommendations.';
  }, []);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-xs font-mono mb-4" style={{ color: '#444', letterSpacing: '0.1em' }}>
            ERROR
          </p>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Assessment Not Found
          </h2>
          <p className="mb-6" style={{ color: '#555' }}>
            {error}
          </p>
          <Link to="/calculator">
            <Button>New Assessment</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4"
        role="status"
        aria-label="Loading assessment"
      >
        <LoadingSpinner size="xl" label="Loading assessment data..." />
        <p className="text-slate-400 animate-pulse">Loading assessment data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="eco-badge inline-flex mb-3">Dashboard</div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              Your Carbon Footprint
            </h1>
            <p className="text-sm mt-1.5" style={{ color: '#444' }}>
              Assessment from {formatDate(assessment.createdAt)}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to={`/simulator/${assessmentId}`}>
              <Button variant="secondary" id="btn-simulate">
                Simulate Changes
              </Button>
            </Link>
            <Link to="/calculator">
              <Button id="btn-new-assessment">New Assessment</Button>
            </Link>
          </div>
        </div>

        {/* Score banner */}
        <div
          className="glass-card p-5 mb-6 flex items-center gap-4 animate-slide-up"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          role="region"
          aria-label="Sustainability Score"
        >
          <div
            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span
              className="text-sm font-bold ticker"
              style={{ fontFamily: 'Syne, sans-serif', color: '#fff' }}
            >
              {assessment.sustainabilityScore}
            </span>
            <span className="text-[9px]" style={{ color: '#444' }}>
              /100
            </span>
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#fff' }}>
              {scoreInfo.label} — Score {assessment.sustainabilityScore}/100
            </p>
            <p className="text-sm mt-0.5" style={{ color: '#555' }}>
              {getScoreMessage(assessment.sustainabilityScore)}
            </p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2">
            <FootprintCard assessment={assessment} />
          </div>
          <div>
            <ScoreGauge score={assessment.sustainabilityScore} />
          </div>
        </div>

        {/* How You Compare section */}
        <section className="glass-card p-6 mb-5 animate-slide-up" aria-labelledby="compare-heading">
          <h2
            id="compare-heading"
            className="text-xl font-bold mb-5"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            How You Compare
          </h2>
          <BenchmarkBar
            label="Global Average"
            benchmarkKg={GLOBAL_AVERAGE_EMISSION}
            userKg={assessment.totalEmission}
            color="#f59e0b"
          />
          <BenchmarkBar
            label="UK Average"
            benchmarkKg={UK_AVERAGE_EMISSION}
            userKg={assessment.totalEmission}
            color="#60a5fa"
          />
          <BenchmarkBar
            label="Paris Agreement Target"
            benchmarkKg={TARGET_EMISSION}
            userKg={assessment.totalEmission}
            color="#10b981"
          />
        </section>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <Suspense
            fallback={
              <div
                className="glass-card p-6 h-80 flex flex-col items-center justify-center gap-4 animate-pulse"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <LoadingSpinner size="lg" label="Loading breakdown chart..." />
                <p className="text-xs text-slate-400">Loading breakdown chart...</p>
              </div>
            }
          >
            <EmissionPieChart assessment={assessment} />
          </Suspense>

          <Suspense
            fallback={
              <div
                className="glass-card p-6 h-80 flex flex-col items-center justify-center gap-4 animate-pulse"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <LoadingSpinner size="lg" label="Loading trend chart..." />
                <p className="text-xs text-slate-400">Loading history trends...</p>
              </div>
            }
          >
            <TrendChart assessments={assessments} />
          </Suspense>
        </div>

        {/* Recommendations */}
        {assessment.recommendations && assessment.recommendations.length > 0 && (
          <section aria-labelledby="recommendations-heading">
            <div className="flex items-center justify-between mb-5">
              <h2
                id="recommendations-heading"
                className="text-xl font-bold"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                AI Recommendations
              </h2>
              <span className="eco-badge">{assessment.recommendations.length} actions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.recommendations.map((rec, i) => (
                <RecommendationCard key={rec.id} recommendation={rec} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Recent assessments */}
        {assessments.length > 1 && (
          <section className="mt-10" aria-labelledby="history-heading">
            <div className="flex items-center justify-between mb-5">
              <h2
                id="history-heading"
                className="text-xl font-bold"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Recent Assessments
              </h2>
              <Link to="/history" className="text-sm animated-underline" style={{ color: '#555' }}>
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {assessments.slice(0, RECENT_ASSESSMENTS_LIMIT).map((a) => (
                <Link
                  key={a.id}
                  to={`/dashboard/${a.id}`}
                  aria-label={`View assessment from ${formatDate(a.createdAt)}, score ${a.sustainabilityScore}`}
                >
                  <div className="glass-card-hover p-5">
                    <p className="text-xs mb-2 font-mono" style={{ color: '#444' }}>
                      {formatDate(a.createdAt)}
                    </p>
                    <p
                      className="text-2xl font-bold ticker"
                      style={{ fontFamily: 'Syne, sans-serif' }}
                    >
                      {(a.totalEmission / TONNES_DIVISOR).toFixed(2)}t
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#444' }}>
                      Score: {a.sustainabilityScore}/100
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
