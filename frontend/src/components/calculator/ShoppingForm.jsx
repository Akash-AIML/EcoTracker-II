import { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';
import Icon from '../ui/Icons';
import { sanitizeInteger } from '../../utils/sanitize';
import { CLOTHING_FACTOR, ELECTRONICS_FACTOR, INPUT_LIMITS } from '../../utils/constants';

const tips = [
  { icon: 'recycle', title: 'Second-Hand', desc: 'Buying second-hand reduces emissions by 60–80%' },
  {
    icon: 'wrench',
    title: 'Repair First',
    desc: 'Extending device life by 1 year saves ~150 kg CO₂',
  },
  { icon: 'minus_circle', title: 'Buy Less', desc: 'The most sustainable product is one not made' },
];

/**
 * ShoppingForm — step 4 of the carbon calculator.
 * Collects clothing and electronics purchasing data.
 * @param {Object} props
 * @param {Object} props.data - Form field values for shopping
 * @param {Function} props.onChange - Callback invoked with updated data object
 * @returns {JSX.Element}
 */
function ShoppingForm({ data, onChange }) {
  const handleChange = useCallback(
    (field, value) => onChange({ ...data, [field]: value }),
    [data, onChange]
  );

  // Memoized emission previews using CLOTHING_FACTOR and ELECTRONICS_FACTOR constants
  const clothingEmission = useMemo(
    () => (data.clothingItemsPerYear || 0) * CLOTHING_FACTOR,
    [data.clothingItemsPerYear]
  );
  const electronicsEmission = useMemo(
    () => (data.electronicsItemsPerYear || 0) * ELECTRONICS_FACTOR,
    [data.electronicsItemsPerYear]
  );
  const totalShoppingEmission = clothingEmission + electronicsEmission;

  return (
    <fieldset>
      <legend className="sr-only">Shopping and Consumer Goods Information</legend>
      <div className="space-y-6">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Manufacturing and shipping consumer goods accounts for a significant portion of personal
          carbon footprints. This includes production emissions, not just delivery.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Input
              id="clothingItemsPerYear"
              label="New Clothing Items per Year"
              type="number"
              min={INPUT_LIMITS.clothingItemsPerYear.min}
              max={INPUT_LIMITS.clothingItemsPerYear.max}
              placeholder="0"
              value={data.clothingItemsPerYear || ''}
              onChange={(e) =>
                handleChange(
                  'clothingItemsPerYear',
                  sanitizeInteger(
                    e.target.value,
                    INPUT_LIMITS.clothingItemsPerYear.min,
                    INPUT_LIMITS.clothingItemsPerYear.max
                  )
                )
              }
              hint={`Include shoes, accessories, etc. ~${CLOTHING_FACTOR} kg CO₂ per item`}
            />
            {data.clothingItemsPerYear > 0 && (
              <p className="mt-1.5 text-xs" style={{ color: '#fbbf24' }}>
                &asymp; {clothingEmission.toLocaleString()} kg CO₂/year from clothing
              </p>
            )}
          </div>

          <div>
            <Input
              id="electronicsItemsPerYear"
              label="New Electronic Devices per Year"
              type="number"
              min={INPUT_LIMITS.electronicsItemsPerYear.min}
              max={INPUT_LIMITS.electronicsItemsPerYear.max}
              placeholder="0"
              value={data.electronicsItemsPerYear || ''}
              onChange={(e) =>
                handleChange(
                  'electronicsItemsPerYear',
                  sanitizeInteger(
                    e.target.value,
                    INPUT_LIMITS.electronicsItemsPerYear.min,
                    INPUT_LIMITS.electronicsItemsPerYear.max
                  )
                )
              }
              hint={`Smartphones, laptops, tablets, etc. ~${ELECTRONICS_FACTOR} kg CO₂ per device`}
            />
            {data.electronicsItemsPerYear > 0 && (
              <p className="mt-1.5 text-xs" style={{ color: '#fbbf24' }}>
                &asymp; {electronicsEmission.toLocaleString()} kg CO₂/year from electronics
              </p>
            )}
          </div>
        </div>

        {/* Shopping tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tips.map((tip) => (
            <div
              key={tip.title}
              className="rounded-xl p-4"
              style={{
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.025)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: 'rgba(0,194,123,0.1)', color: '#00C27B' }}
              >
                <Icon name={tip.icon} size={15} className="text-current" />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                {tip.title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {tip.desc}
              </p>
            </div>
          ))}
        </div>

        {totalShoppingEmission > 0 && (
          <div
            className="rounded-xl p-4 flex items-start gap-3 animate-fade-in"
            style={{
              border: '1px solid rgba(245,158,11,0.18)',
              background: 'rgba(245,158,11,0.05)',
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            <Icon
              name="shopping"
              size={15}
              style={{ color: '#fbbf24' }}
              className="flex-shrink-0 mt-0.5 text-current"
            />
            <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>
              Total shopping emissions: ~{totalShoppingEmission.toLocaleString()} kg CO₂/year
            </p>
          </div>
        )}
      </div>
    </fieldset>
  );
}

ShoppingForm.propTypes = {
  data: PropTypes.shape({
    clothingItemsPerYear: PropTypes.number,
    electronicsItemsPerYear: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default memo(ShoppingForm);
