import PropTypes from 'prop-types';
import { formatNumber } from '../../utils/formatters';
import { GLOBAL_AVERAGE_EMISSION, TARGET_EMISSION } from '../../utils/constants';
import Icon from '../ui/Icons';

/** @constant {number} PERCENTAGE_MULTIPLIER - Used in percentage calculations */
const PERCENTAGE_MULTIPLIER = 100;

/** @constant {number} TONNES_DIVISOR - Converts kg to tonnes */
const TONNES_DIVISOR = 1000;

const CATEGORIES = [
  { label: 'Transport', key: 'transport', icon: 'transport', color: '#00C27B' },
  { label: 'Energy', key: 'energy', icon: 'energy', color: '#4F8EF7' },
  { label: 'Food', key: 'food', icon: 'food', color: '#F472B6' },
  { label: 'Shopping', key: 'shopping', icon: 'shopping', color: '#FB923C' },
];

/**
 * FootprintCard — displays the annual carbon footprint headline stat
 * with category breakdown bars and benchmark comparisons.
 * @param {Object} props
 * @param {Object} props.assessment - The full assessment record
 * @returns {JSX.Element}
 */
export default function FootprintCard({ assessment }) {
  const { totalEmission, transportEmission, energyEmission, foodEmission, shoppingEmission } =
    assessment;
  const vsGlobal = (
    ((totalEmission - GLOBAL_AVERAGE_EMISSION) / GLOBAL_AVERAGE_EMISSION) *
    PERCENTAGE_MULTIPLIER
  ).toFixed(0);
  const vsTarget = (
    ((totalEmission - TARGET_EMISSION) / TARGET_EMISSION) *
    PERCENTAGE_MULTIPLIER
  ).toFixed(0);

  const values = {
    transport: transportEmission,
    energy: energyEmission,
    food: foodEmission,
    shopping: shoppingEmission,
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* Main stat */}
      <div className="text-center mb-6">
        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: 'var(--color-text-faint)' }}
        >
          Annual Carbon Footprint
        </p>
        <p
          className="text-6xl font-bold gradient-text mb-1"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          {(totalEmission / TONNES_DIVISOR).toFixed(2)}
        </p>
        <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
          tonnes CO₂e / year
        </p>

        {/* Benchmarks */}
        <div className="flex justify-center gap-8 mt-5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Icon
                name={vsGlobal < 0 ? 'trending_down' : 'trending_up'}
                size={14}
                style={{ color: vsGlobal < 0 ? '#00C27B' : '#f43f5e' }}
                className="text-current"
              />
              <p
                className="text-sm font-semibold"
                style={{ color: vsGlobal < 0 ? '#00C27B' : '#f43f5e' }}
              >
                {Math.abs(vsGlobal)}%
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
              vs global avg
            </p>
          </div>
          <div
            className="w-px"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            aria-hidden="true"
          />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Icon
                name={vsTarget < 0 ? 'trending_down' : 'trending_up'}
                size={14}
                style={{ color: vsTarget < 0 ? '#00C27B' : '#F59E0B' }}
                className="text-current"
              />
              <p
                className="text-sm font-semibold"
                style={{ color: vsTarget < 0 ? '#00C27B' : '#F59E0B' }}
              >
                {Math.abs(vsTarget)}%
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
              vs Paris target
            </p>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="section-divider" />
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const val = values[cat.key];
          const pct =
            totalEmission > 0 ? ((val / totalEmission) * PERCENTAGE_MULTIPLIER).toFixed(0) : 0;
          return (
            <div
              key={cat.label}
              className="rounded-xl p-3.5"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <Icon
                    name={cat.icon}
                    size={13}
                    style={{ color: cat.color }}
                    className="text-current"
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {cat.label}
                  </span>
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                  {pct}%
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {formatNumber(val)} kg
              </p>
              <div
                className="mt-2 h-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: cat.color }}
                  role="img"
                  aria-label={`${cat.label}: ${pct}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

FootprintCard.propTypes = {
  assessment: PropTypes.shape({
    totalEmission: PropTypes.number.isRequired,
    transportEmission: PropTypes.number.isRequired,
    energyEmission: PropTypes.number.isRequired,
    foodEmission: PropTypes.number.isRequired,
    shoppingEmission: PropTypes.number.isRequired,
  }).isRequired,
};
