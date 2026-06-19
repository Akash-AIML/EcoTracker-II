import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../utils/constants';
import { formatNumber } from '../../utils/formatters';

/** @constant {number} PERCENTAGE_MULTIPLIER - Used in percentage calculations */
const PERCENTAGE_MULTIPLIER = 100;

/**
 * Custom tooltip for the emission pie chart.
 * @param {Object} props
 * @param {boolean} props.active - Whether the tooltip is active
 * @param {Array} props.payload - Recharts tooltip payload
 * @returns {JSX.Element|null}
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="glass-card px-4 py-3 text-sm" style={{ minWidth: 160 }} role="tooltip">
        <p className="font-semibold text-slate-200 mb-1">{d.name}</p>
        <p className="text-slate-300">{formatNumber(d.value)} kg CO₂</p>
        <p className="text-slate-500">{d.percent?.toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.number,
        percent: PropTypes.number,
      }),
    })
  ),
};

/**
 * Custom legend for the pie chart.
 * @param {Object} props
 * @param {Array} props.payload - Recharts legend payload
 * @returns {JSX.Element}
 */
const CustomLegend = ({ payload }) => (
  <ul className="flex flex-wrap justify-center gap-3 mt-2" role="list">
    {payload?.map((entry) => (
      <li key={entry.value} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span
          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
          style={{ background: entry.color }}
          aria-hidden="true"
        />
        {entry.value}
      </li>
    ))}
  </ul>
);

CustomLegend.propTypes = {
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      color: PropTypes.string,
    })
  ),
};

/**
 * EmissionPieChart — renders a donut chart of emission categories
 * with an accessible hidden data table for screen readers.
 * @param {Object} props
 * @param {Object} props.assessment - The full assessment record
 * @returns {JSX.Element}
 */
export default function EmissionPieChart({ assessment }) {
  const data = [
    { name: CATEGORY_LABELS.transport, value: assessment.transportEmission, key: 'transport' },
    { name: CATEGORY_LABELS.energy, value: assessment.energyEmission, key: 'energy' },
    { name: CATEGORY_LABELS.food, value: assessment.foodEmission, key: 'food' },
    { name: CATEGORY_LABELS.shopping, value: assessment.shoppingEmission, key: 'shopping' },
  ]
    .filter((d) => d.value > 0)
    .map((d) => ({ ...d, percent: (d.value / assessment.totalEmission) * PERCENTAGE_MULTIPLIER }));

  return (
    <div className="glass-card p-6">
      <h3 className="text-slate-200 font-semibold mb-4" id="pie-chart-title">
        Emission Sources Breakdown
      </h3>
      <div
        style={{ height: 280 }}
        role="img"
        aria-labelledby="pie-chart-title"
        aria-describedby="pie-chart-desc"
      >
        <p id="pie-chart-desc" className="sr-only">
          Pie chart showing emission breakdown:{' '}
          {data.map((d) => `${d.name}: ${d.percent.toFixed(1)}%`).join(', ')}
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.key]}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible data table fallback for screen readers */}
      <table className="sr-only" aria-label="Emission breakdown data">
        <caption>Emission Sources Breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Emissions (kg CO₂)</th>
            <th scope="col">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{d.name}</td>
              <td>{formatNumber(d.value)}</td>
              <td>{d.percent.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

EmissionPieChart.propTypes = {
  assessment: PropTypes.shape({
    totalEmission: PropTypes.number.isRequired,
    transportEmission: PropTypes.number.isRequired,
    energyEmission: PropTypes.number.isRequired,
    foodEmission: PropTypes.number.isRequired,
    shoppingEmission: PropTypes.number.isRequired,
  }).isRequired,
};
