import { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Icon from '../ui/Icons';
import { sanitizeNumber, sanitizeInteger } from '../../utils/sanitize';
import { CAR_EMISSION_FACTORS, FLIGHT_FACTORS, INPUT_LIMITS } from '../../utils/constants';

/** @constant {number} DAYS_PER_YEAR - Number of days in a year for annualisation */
const DAYS_PER_YEAR = 365;

const fuelTypeOptions = [
  { value: 'none', label: "I don't drive / No car" },
  { value: 'petrol', label: 'Petrol / Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric (EV)' },
  { value: 'hybrid', label: 'Hybrid' },
];

/**
 * TransportForm — step 1 of the carbon calculator.
 * Collects car usage, public transport, cycling, and flight data.
 * @param {Object} props
 * @param {Object} props.data - Form field values for transport
 * @param {Function} props.onChange - Callback invoked with updated data object
 * @returns {JSX.Element}
 */
function TransportForm({ data, onChange }) {
  const handleChange = useCallback(
    (field, value) => onChange({ ...data, [field]: value }),
    [data, onChange]
  );

  // Live preview using constants — no magic numbers
  const preview = useMemo(() => {
    const carFactor = CAR_EMISSION_FACTORS[data.carFuelType] ?? 0;
    return {
      car: data.dailyCarKm > 0 ? Math.round(data.dailyCarKm * carFactor * DAYS_PER_YEAR) : 0,
      shortFlights:
        data.shortFlightsPerYear > 0 ? data.shortFlightsPerYear * FLIGHT_FACTORS.short_haul : 0,
      longFlights:
        data.longFlightsPerYear > 0 ? data.longFlightsPerYear * FLIGHT_FACTORS.long_haul : 0,
    };
  }, [data.dailyCarKm, data.carFuelType, data.shortFlightsPerYear, data.longFlightsPerYear]);

  const showPreview = preview.car > 0 || preview.shortFlights > 0 || preview.longFlights > 0;

  return (
    <fieldset>
      <legend className="sr-only">Transportation Information</legend>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            id="carFuelType"
            label="Vehicle Fuel Type"
            value={data.carFuelType || 'none'}
            options={fuelTypeOptions}
            onChange={(e) => handleChange('carFuelType', e.target.value)}
          />
          <Input
            id="dailyCarKm"
            label="Daily Car Distance (km)"
            type="number"
            min={INPUT_LIMITS.dailyCarKm.min}
            max={INPUT_LIMITS.dailyCarKm.max}
            placeholder="0"
            value={data.dailyCarKm || ''}
            onChange={(e) =>
              handleChange(
                'dailyCarKm',
                sanitizeNumber(
                  e.target.value,
                  INPUT_LIMITS.dailyCarKm.min,
                  INPUT_LIMITS.dailyCarKm.max
                )
              )
            }
            hint={
              data.carFuelType === 'none'
                ? "Set to 0 if you don't drive"
                : 'Average km driven per day'
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            id="publicTransportKmPerWeek"
            label="Public Transport Distance (km/week)"
            type="number"
            min={INPUT_LIMITS.publicTransportKmPerWeek.min}
            max={INPUT_LIMITS.publicTransportKmPerWeek.max}
            placeholder="0"
            value={data.publicTransportKmPerWeek || ''}
            onChange={(e) =>
              handleChange(
                'publicTransportKmPerWeek',
                sanitizeNumber(
                  e.target.value,
                  INPUT_LIMITS.publicTransportKmPerWeek.min,
                  INPUT_LIMITS.publicTransportKmPerWeek.max
                )
              )
            }
            hint="Bus, metro, tram — total km per week"
          />
          <Input
            id="cyclingKmPerWeek"
            label="Cycling Distance (km/week)"
            type="number"
            min={INPUT_LIMITS.cyclingKmPerWeek.min}
            max={INPUT_LIMITS.cyclingKmPerWeek.max}
            placeholder="0"
            value={data.cyclingKmPerWeek || ''}
            onChange={(e) =>
              handleChange(
                'cyclingKmPerWeek',
                sanitizeNumber(
                  e.target.value,
                  INPUT_LIMITS.cyclingKmPerWeek.min,
                  INPUT_LIMITS.cyclingKmPerWeek.max
                )
              )
            }
            hint="Cycling produces zero direct emissions"
          />
        </div>

        <div className="section-divider" />

        <div>
          <h3
            className="font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Icon name="plane" size={16} />
            Air Travel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="shortFlightsPerYear"
              label="Short-haul Flights per Year"
              type="number"
              min={INPUT_LIMITS.shortFlightsPerYear.min}
              max={INPUT_LIMITS.shortFlightsPerYear.max}
              placeholder="0"
              value={data.shortFlightsPerYear || ''}
              onChange={(e) =>
                handleChange(
                  'shortFlightsPerYear',
                  sanitizeInteger(
                    e.target.value,
                    INPUT_LIMITS.shortFlightsPerYear.min,
                    INPUT_LIMITS.shortFlightsPerYear.max
                  )
                )
              }
              hint={`Under 3 hours — ~${FLIGHT_FACTORS.short_haul} kg CO₂ per return flight`}
            />
            <Input
              id="longFlightsPerYear"
              label="Long-haul Flights per Year"
              type="number"
              min={INPUT_LIMITS.longFlightsPerYear.min}
              max={INPUT_LIMITS.longFlightsPerYear.max}
              placeholder="0"
              value={data.longFlightsPerYear || ''}
              onChange={(e) =>
                handleChange(
                  'longFlightsPerYear',
                  sanitizeInteger(
                    e.target.value,
                    INPUT_LIMITS.longFlightsPerYear.min,
                    INPUT_LIMITS.longFlightsPerYear.max
                  )
                )
              }
              hint={`Over 3 hours — ~${FLIGHT_FACTORS.long_haul.toLocaleString()} kg CO₂ per return flight`}
            />
          </div>
        </div>

        {/* Live preview — values from constants, no magic numbers */}
        {showPreview && (
          <div
            className="rounded-xl p-4 flex items-start gap-3 animate-fade-in"
            style={{ border: '1px solid rgba(0,194,123,0.18)', background: 'rgba(0,194,123,0.05)' }}
            aria-live="polite"
            aria-atomic="true"
          >
            <Icon
              name="info"
              size={15}
              style={{ color: '#00C27B' }}
              className="flex-shrink-0 mt-0.5 text-current"
            />
            <p className="text-sm font-medium" style={{ color: '#00C27B' }}>
              Quick estimate:
              {preview.car > 0 && ` Car: ~${preview.car.toLocaleString()} kg/yr`}
              {preview.shortFlights > 0 &&
                ` · Short flights: ~${preview.shortFlights.toLocaleString()} kg/yr`}
              {preview.longFlights > 0 &&
                ` · Long flights: ~${preview.longFlights.toLocaleString()} kg/yr`}
            </p>
          </div>
        )}
      </div>
    </fieldset>
  );
}

TransportForm.propTypes = {
  data: PropTypes.shape({
    carFuelType: PropTypes.string,
    dailyCarKm: PropTypes.number,
    publicTransportKmPerWeek: PropTypes.number,
    cyclingKmPerWeek: PropTypes.number,
    shortFlightsPerYear: PropTypes.number,
    longFlightsPerYear: PropTypes.number,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default memo(TransportForm);
