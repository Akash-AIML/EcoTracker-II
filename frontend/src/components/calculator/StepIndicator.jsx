import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * StepIndicator — displays progress through the calculator steps.
 * Wrapped in React.memo to prevent re-renders when parent re-renders for unrelated reasons.
 * @param {Object} props
 * @param {{ id: string, label: string, sublabel: string }[]} props.steps - Array of step definitions
 * @param {number} props.currentStep - Zero-based index of the active step
 * @returns {JSX.Element}
 */
function StepIndicator({ steps, currentStep }) {
  return (
    <nav aria-label="Form progress" className="mb-8">
      <ol className="flex items-center justify-between" role="list">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;

          return (
            <li key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isComplete
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                      : isActive
                        ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)] text-black'
                        : 'bg-transparent border border-white/10 text-slate-400'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? (
                    <span className="text-xs font-bold text-emerald-400" aria-label="Completed">
                      ✓
                    </span>
                  ) : (
                    <span
                      className={`text-xs font-bold font-mono ${
                        isActive ? 'text-black' : 'text-slate-400'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <p
                    className={`text-xs font-semibold transition-colors ${
                      isActive
                        ? 'text-emerald-400'
                        : isComplete
                          ? 'text-emerald-500'
                          : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] hidden md:block mt-0.5 text-slate-400">
                    {step.sublabel}
                  </p>
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3 mt-0 sm:-mt-5">
                  <div
                    className="h-px transition-all duration-500 rounded-full"
                    style={{
                      background: index < currentStep ? '#10B981' : 'rgba(255,255,255,0.07)',
                    }}
                    aria-hidden="true"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

StepIndicator.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sublabel: PropTypes.string,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
};

export default memo(StepIndicator);
