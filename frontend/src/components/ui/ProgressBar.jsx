import PropTypes from 'prop-types';

/** @constant {number} PERCENTAGE_MULTIPLIER - Used in percentage calculations */
const PERCENTAGE_MULTIPLIER = 100;

/**
 * ProgressBar — accessible progress indicator with label and color variants.
 * @param {Object} props
 * @param {number} [props.value=0] - Current value
 * @param {number} [props.max=100] - Maximum value
 * @param {string} [props.label] - Label text
 * @param {boolean} [props.showLabel=true] - Whether to show percentage text
 * @param {'eco'|'amber'|'cyan'|'rose'} [props.color='eco'] - Color variant
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element}
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showLabel = true,
  color = 'eco',
  className = '',
}) {
  const percentage = Math.min(
    PERCENTAGE_MULTIPLIER,
    Math.max(0, (value / max) * PERCENTAGE_MULTIPLIER)
  );
  const colors = {
    eco: 'linear-gradient(90deg, #10b981, #06b6d4)',
    amber: 'linear-gradient(90deg, #f59e0b, #ef4444)',
    cyan: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
    rose: 'linear-gradient(90deg, #ef4444, #f97316)',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-slate-400">{label}</span>}
          {showLabel && (
            <span className="text-sm font-medium text-slate-300">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="progress-bar"
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            background: colors[color] || colors.eco,
          }}
        />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  color: PropTypes.oneOf(['eco', 'amber', 'cyan', 'rose']),
  className: PropTypes.string,
};
