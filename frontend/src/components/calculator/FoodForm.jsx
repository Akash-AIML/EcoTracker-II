import { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import Icon from '../ui/Icons';

const dietOptions = [
  {
    value: 'vegan',
    label: 'Vegan',
    description: 'Entirely plant-based diet',
    emission: '1,500 kg/year',
    emissionNum: 1500,
    border: 'rgba(0,194,123,0.45)',
    bg: 'rgba(0,194,123,0.08)',
    textColor: '#00C27B',
  },
  {
    value: 'vegetarian',
    label: 'Vegetarian',
    description: 'Plant-based with dairy & eggs',
    emission: '1,700 kg/year',
    emissionNum: 1700,
    border: 'rgba(34,197,94,0.45)',
    bg: 'rgba(34,197,94,0.08)',
    textColor: '#4ade80',
  },
  {
    value: 'mixed',
    label: 'Mixed Diet',
    description: 'Occasional meat & fish',
    emission: '2,500 kg/year',
    emissionNum: 2500,
    border: 'rgba(245,158,11,0.45)',
    bg: 'rgba(245,158,11,0.08)',
    textColor: '#fbbf24',
  },
  {
    value: 'heavy_meat',
    label: 'Heavy Meat',
    description: 'Meat at most meals',
    emission: '3,300 kg/year',
    emissionNum: 3300,
    border: 'rgba(244,63,94,0.45)',
    bg: 'rgba(244,63,94,0.08)',
    textColor: '#fb7185',
  },
];

/** @constant {number} MAX_EMISSION - Highest diet emission value for bar chart scaling */
const MAX_EMISSION = 3300;

/** @constant {number} PERCENTAGE_MULTIPLIER - Multiplier for bar percentage calculation */
const PERCENTAGE_MULTIPLIER = 100;

/**
 * FoodForm — step 3 of the carbon calculator.
 * Collects diet type via accessible radio button group.
 * @param {Object} props
 * @param {Object} props.data - Form field values for food (includes dietType)
 * @param {Function} props.onChange - Callback invoked with updated data object
 * @returns {JSX.Element}
 */
function FoodForm({ data, onChange }) {
  const handleDietChange = useCallback(
    (value) => onChange({ ...data, dietType: value }),
    [data, onChange]
  );

  return (
    <fieldset>
      <legend className="sr-only">Food and Diet Information</legend>
      <div className="space-y-6">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Food production accounts for around 25% of global greenhouse gas emissions. Your diet
          choice significantly impacts your personal carbon footprint.
        </p>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          role="radiogroup"
          aria-label="Select your diet type"
        >
          {dietOptions.map((option) => {
            const isSelected = data.dietType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => handleDietChange(option.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDietChange(option.value);
                  }
                }}
                className="text-left p-4 rounded-xl transition-all duration-200"
                style={{
                  border: `1px solid ${isSelected ? option.border : 'rgba(255,255,255,0.07)'}`,
                  background: isSelected ? option.bg : 'rgba(255,255,255,0.025)',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  outline: 'none',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: isSelected ? option.textColor : 'var(--color-text)' }}
                    >
                      {option.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>
                      {option.description}
                    </p>
                    <p
                      className="text-xs font-mono mt-2"
                      style={{
                        color: isSelected ? option.textColor : 'var(--color-text-faint)',
                        opacity: isSelected ? 1 : 0.6,
                      }}
                    >
                      ~{option.emission} CO₂
                    </p>
                  </div>
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #00C27B, #059669)' }}
                    >
                      <Icon name="check" size={11} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* CO₂ comparison bars */}
        <div
          className="rounded-xl p-4"
          style={{
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <p
            className="text-xs uppercase tracking-wider font-medium mb-3"
            style={{ color: 'var(--color-text-faint)' }}
          >
            Annual CO₂ Comparison
          </p>
          {dietOptions.map((option) => {
            const percentage = (option.emissionNum / MAX_EMISSION) * PERCENTAGE_MULTIPLIER;
            const isSelected = data.dietType === option.value;
            return (
              <div key={option.value} className="flex items-center gap-3 mb-2">
                <span
                  className="text-sm w-24 text-right flex-shrink-0"
                  style={{ color: 'var(--color-text-faint)' }}
                >
                  {option.label}
                </span>
                <div
                  className="flex-1 h-2 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      background: option.textColor,
                      opacity: isSelected ? 1 : 0.25,
                    }}
                  />
                </div>
                <span
                  className="text-xs w-20 flex-shrink-0"
                  style={{ color: 'var(--color-text-faint)' }}
                >
                  {option.emission}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}

FoodForm.propTypes = {
  data: PropTypes.shape({
    dietType: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default memo(FoodForm);
