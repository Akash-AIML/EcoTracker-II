import PropTypes from 'prop-types';
import { formatNumber } from '../../utils/formatters';

/** @constant {number} TONNES_DIVISOR - Converts kg to tonnes */
const TONNES_DIVISOR = 1000;

/** @constant {number} TREE_ABSORPTION_KG - Approx kg CO₂ absorbed per tree per year */
const TREE_ABSORPTION_KG = 21;

/** @constant {number} CAR_ANNUAL_EMISSION_KG - Approx kg CO₂ per car per year */
const CAR_ANNUAL_EMISSION_KG = 2000;

/** @constant {number} SHORT_FLIGHT_EMISSION_KG - Approx kg CO₂ per short-haul flight */
const SHORT_FLIGHT_EMISSION_KG = 255;

/**
 * ImpactDisplay — shows the projected impact of a simulation scenario
 * with before/after comparison and real-world equivalents.
 * @param {Object} props
 * @param {Object} props.simulation - The simulation result object
 * @returns {JSX.Element|null}
 */
export default function ImpactDisplay({ simulation }) {
  if (!simulation) return null;

  const { originalEmission, projectedEmission, reductionPercentage, annualSavingsKg } = simulation;
  const isReduction = annualSavingsKg > 0;

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h3 className="text-slate-200 font-semibold mb-6 text-center">Impact Analysis</h3>

      {/* Main result */}
      <div className="text-center mb-6">
        <div
          className={`text-5xl font-display font-bold mb-2 ${isReduction ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          {isReduction ? '▼' : '▲'} {Math.abs(reductionPercentage)}%
        </div>
        <p className="text-slate-400">
          {isReduction ? 'reduction in your carbon footprint' : 'increase in your carbon footprint'}
        </p>
        <div
          className={`mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
            isReduction ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
          }`}
        >
          {isReduction ? '🌍' : '⚠️'}
          {formatNumber(Math.abs(annualSavingsKg))} kg CO₂ {isReduction ? 'saved' : 'added'} per
          year
        </div>
      </div>

      {/* Before/After */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl p-4 bg-white/3 border border-white/5 text-center">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Current</p>
          <p className="text-2xl font-display font-bold text-slate-300">
            {(originalEmission / TONNES_DIVISOR).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">tonnes CO₂/year</p>
        </div>
        <div
          className="rounded-xl p-4 border text-center"
          style={{
            background: isReduction ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            borderColor: isReduction ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
          }}
        >
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Projected</p>
          <p
            className={`text-2xl font-display font-bold ${isReduction ? 'text-emerald-400' : 'text-rose-400'}`}
          >
            {(projectedEmission / TONNES_DIVISOR).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">tonnes CO₂/year</p>
        </div>
      </div>

      {/* Equivalents */}
      {isReduction && annualSavingsKg > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
            That&apos;s equivalent to...
          </p>
          {[
            {
              icon: '🌳',
              text: `${Math.round(annualSavingsKg / TREE_ABSORPTION_KG)} trees absorbing CO₂ for a year`,
            },
            {
              icon: '🚗',
              text: `Removing ${(annualSavingsKg / CAR_ANNUAL_EMISSION_KG).toFixed(1)} cars from the road`,
            },
            {
              icon: '✈️',
              text: `${(annualSavingsKg / SHORT_FLIGHT_EMISSION_KG).toFixed(1)} fewer short-haul flights`,
            },
          ].map((eq) => (
            <div key={eq.text} className="flex items-center gap-3 text-sm text-slate-400">
              <span className="text-base flex-shrink-0" aria-hidden="true">
                {eq.icon}
              </span>
              {eq.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ImpactDisplay.propTypes = {
  simulation: PropTypes.shape({
    originalEmission: PropTypes.number.isRequired,
    projectedEmission: PropTypes.number.isRequired,
    reductionPercentage: PropTypes.number.isRequired,
    annualSavingsKg: PropTypes.number.isRequired,
    scenarioName: PropTypes.string,
    categoryBreakdown: PropTypes.object,
  }),
};
