import { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';
import Icon from '../ui/Icons';
import { sanitizeNumber, sanitizeInteger } from '../../utils/sanitize';
import { ELECTRICITY_GRID_FACTOR, INPUT_LIMITS } from '../../utils/constants';

/** @constant {number} MONTHS_PER_YEAR - Months in a year for annualisation */
const MONTHS_PER_YEAR = 12;

/** @constant {number} MAX_RENEWABLE_PERCENT - Maximum renewable percentage */
const MAX_RENEWABLE_PERCENT = 100;

const energyFacts = [
  { icon: 'plug', label: 'Grid Average', value: '0.233 kg CO₂/kWh', color: '#F59E0B' },
  { icon: 'sun', label: 'Solar', value: '~0.04 kg CO₂/kWh', color: '#FDE047' },
  { icon: 'wind', label: 'Wind Power', value: '~0.01 kg CO₂/kWh', color: '#7aadfa' },
];

/**
 * EnergyForm — step 2 of the carbon calculator.
 * Collects monthly electricity usage and renewable energy percentage.
 * @param {Object} props
 * @param {Object} props.data - Form field values for energy
 * @param {Function} props.onChange - Callback invoked with updated data object
 * @returns {JSX.Element}
 */
function EnergyForm({ data, onChange }) {
  const handleChange = useCallback(
    (field, value) => onChange({ ...data, [field]: value }),
    [data, onChange]
  );

  // Memoized emission preview using ELECTRICITY_GRID_FACTOR constant
  const nonRenewableEmission = useMemo(() => {
    if (!data.monthlyElectricityKwh) return 0;
    const renewable = sanitizeInteger(data.renewablePercentage || 0, 0, MAX_RENEWABLE_PERCENT);
    return Math.round(
      data.monthlyElectricityKwh *
        MONTHS_PER_YEAR *
        ELECTRICITY_GRID_FACTOR *
        (1 - renewable / MAX_RENEWABLE_PERCENT)
    );
  }, [data.monthlyElectricityKwh, data.renewablePercentage]);

  const renewableSavings = useMemo(() => {
    if (!data.monthlyElectricityKwh || !data.renewablePercentage) return 0;
    const renewable = sanitizeInteger(data.renewablePercentage, 0, MAX_RENEWABLE_PERCENT);
    return Math.round(
      data.monthlyElectricityKwh *
        MONTHS_PER_YEAR *
        ELECTRICITY_GRID_FACTOR *
        (renewable / MAX_RENEWABLE_PERCENT)
    );
  }, [data.monthlyElectricityKwh, data.renewablePercentage]);

  return (
    <fieldset>
      <legend className="sr-only">Home Energy Information</legend>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            id="monthlyElectricityKwh"
            label="Monthly Electricity Usage (kWh)"
            type="number"
            min={INPUT_LIMITS.monthlyElectricityKwh.min}
            max={INPUT_LIMITS.monthlyElectricityKwh.max}
            placeholder="200"
            value={data.monthlyElectricityKwh || ''}
            onChange={(e) =>
              handleChange(
                'monthlyElectricityKwh',
                sanitizeNumber(
                  e.target.value,
                  INPUT_LIMITS.monthlyElectricityKwh.min,
                  INPUT_LIMITS.monthlyElectricityKwh.max
                )
              )
            }
            hint="Check your electricity bill for kWh usage. UK avg: ~280 kWh/month"
          />
          <div>
            <label htmlFor="renewablePercentage" className="form-label">
              Renewable Energy <span style={{ color: '#00C27B' }}>(%)</span>
            </label>
            <input
              id="renewablePercentage"
              type="range"
              min={INPUT_LIMITS.renewablePercentage.min}
              max={INPUT_LIMITS.renewablePercentage.max}
              step="5"
              value={data.renewablePercentage || 0}
              onChange={(e) =>
                handleChange(
                  'renewablePercentage',
                  sanitizeInteger(
                    e.target.value,
                    INPUT_LIMITS.renewablePercentage.min,
                    INPUT_LIMITS.renewablePercentage.max
                  )
                )
              }
              className="w-full mt-2"
              aria-valuemin={0}
              aria-valuemax={MAX_RENEWABLE_PERCENT}
              aria-valuenow={data.renewablePercentage || 0}
              aria-label="Renewable energy percentage"
            />
            <div
              className="flex justify-between text-xs mt-1"
              style={{ color: 'var(--color-text-faint)' }}
            >
              <span>0% (Grid)</span>
              <span className="font-semibold" style={{ color: '#00C27B' }}>
                {data.renewablePercentage || 0}%
              </span>
              <span>100% (Renewable)</span>
            </div>
          </div>
        </div>

        {/* Energy facts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {energyFacts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-xl p-3 text-center"
              style={{
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(255,255,255,0.025)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{ background: `${fact.color}15` }}
              >
                <Icon
                  name={fact.icon}
                  size={15}
                  style={{ color: fact.color }}
                  className="text-current"
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                {fact.label}
              </p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: fact.color }}>
                {fact.value}
              </p>
            </div>
          ))}
        </div>

        {/* Live estimate */}
        {data.monthlyElectricityKwh > 0 && (
          <div
            className="rounded-xl p-4 flex items-start gap-3 animate-fade-in"
            style={{
              border: '1px solid rgba(79,142,247,0.18)',
              background: 'rgba(79,142,247,0.05)',
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            <Icon
              name="info"
              size={15}
              style={{ color: '#4F8EF7' }}
              className="flex-shrink-0 mt-0.5 text-current"
            />
            <p className="text-sm font-medium" style={{ color: '#7aadfa' }}>
              Your energy emissions: ~{nonRenewableEmission.toLocaleString()} kg CO₂/year
              {data.renewablePercentage > 0 && (
                <span style={{ color: '#00C27B' }}>
                  {' '}
                  ({data.renewablePercentage}% renewable saves {renewableSavings.toLocaleString()}{' '}
                  kg)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </fieldset>
  );
}

EnergyForm.propTypes = {
  data: PropTypes.shape({
    monthlyElectricityKwh: PropTypes.number,
    renewablePercentage: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default memo(EnergyForm);
