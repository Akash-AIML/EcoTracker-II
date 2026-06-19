import PropTypes from 'prop-types';
import { SIMULATION_SCENARIOS } from '../../utils/constants';
import Button from '../ui/Button';

const categoryColors = {
  transport: 'border-emerald-500/40 bg-emerald-500/8',
  energy: 'border-blue-500/40 bg-blue-500/8',
  food: 'border-pink-500/40 bg-pink-500/8',
  shopping: 'border-orange-500/40 bg-orange-500/8',
};

/**
 * ScenarioSelector — renders categorised simulation scenarios as
 * selectable cards with an aria-pressed toggle pattern.
 * @param {Object} props
 * @param {Object|null} props.selectedScenario - Currently selected scenario or null
 * @param {Function} props.onSelect - Callback when a scenario is clicked
 * @param {Function} props.onRun - Callback to run the selected simulation
 * @param {boolean} props.loading - Whether a simulation is currently running
 * @returns {JSX.Element}
 */
export default function ScenarioSelector({ selectedScenario, onSelect, onRun, loading }) {
  const categories = [...new Set(SIMULATION_SCENARIOS.map((s) => s.category))];

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-sm uppercase tracking-wider text-slate-500 font-medium mb-3 capitalize">
            {category}
          </h3>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            role="radiogroup"
            aria-label={`${category} scenarios`}
          >
            {SIMULATION_SCENARIOS.filter((s) => s.category === category).map((scenario) => {
              const isSelected = selectedScenario?.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-describedby={`scenario-desc-${scenario.id}`}
                  onClick={() => onSelect(scenario)}
                  className={`
                    text-left p-4 rounded-xl border transition-all duration-200
                    ${
                      isSelected
                        ? `${categoryColors[category] || 'border-emerald-500/40 bg-emerald-500/8'} border-opacity-100 scale-[1.01]`
                        : 'border-white/6 bg-white/2 hover:border-white/12 hover:bg-white/5'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0" aria-hidden="true">
                      {scenario.icon}
                    </span>
                    <div>
                      <p
                        className={`font-semibold text-sm ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}
                      >
                        {scenario.name}
                      </p>
                      <p
                        id={`scenario-desc-${scenario.id}`}
                        className="text-xs text-slate-500 mt-0.5"
                      >
                        {scenario.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div
                        className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                        aria-hidden="true"
                      >
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedScenario && (
        <Button onClick={onRun} loading={loading} className="w-full" id="run-simulation-btn">
          ▶ Run Simulation: {selectedScenario.name}
        </Button>
      )}
    </div>
  );
}

ScenarioSelector.propTypes = {
  selectedScenario: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.string,
    category: PropTypes.string,
    params: PropTypes.object,
  }),
  onSelect: PropTypes.func.isRequired,
  onRun: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};
