import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatDateShort, formatNumber } from '../../utils/formatters';
import { GLOBAL_AVERAGE_EMISSION, TARGET_EMISSION } from '../../utils/constants';

/** @constant {number} TONNES_DIVISOR - Converts kg to tonnes for axis labels */
const TONNES_DIVISOR = 1000;

/** @constant {number} MIN_ASSESSMENTS_FOR_CHART - Minimum assessments needed to show chart */
const MIN_ASSESSMENTS_FOR_CHART = 2;

/**
 * Custom tooltip for the trend line chart.
 * @param {Object} props
 * @param {boolean} props.active - Whether the tooltip is active
 * @param {Array} props.payload - Recharts tooltip payload
 * @param {string} props.label - X-axis label
 * @returns {JSX.Element|null}
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 text-sm" role="tooltip">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
            {formatNumber(p.value)} kg CO₂
          </p>
        ))}
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

/**
 * TrendChart — renders a line chart showing the user's carbon footprint
 * over multiple assessments, with reference lines for global avg and Paris target.
 * @param {Object} props
 * @param {Object[]} props.assessments - Array of assessment records
 * @returns {JSX.Element|null}
 */
export default function TrendChart({ assessments }) {
  if (!assessments?.length) return null;

  const data = [...assessments]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((a) => ({
      date: formatDateShort(a.createdAt),
      total: a.totalEmission,
      transport: a.transportEmission,
      energy: a.energyEmission,
      food: a.foodEmission,
    }));

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-200 font-semibold" id="trend-chart-title">
          Footprint Trend Over Time
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span
              className="w-5 h-0.5 border-t-2 border-dashed border-amber-500/50"
              aria-hidden="true"
            />
            Global avg
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span
              className="w-5 h-0.5 border-t-2 border-dashed border-emerald-500/50"
              aria-hidden="true"
            />
            Paris target
          </span>
        </div>
      </div>

      {assessments.length < MIN_ASSESSMENTS_FOR_CHART ? (
        <div className="flex items-center justify-center h-48 text-center">
          <div>
            <p className="text-slate-400 text-sm mb-1">📈 Trend chart will appear here</p>
            <p className="text-slate-600 text-xs">
              Complete more assessments to track your progress over time
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{ height: 220 }}
          role="img"
          aria-labelledby="trend-chart-title"
          aria-label={`Footprint trend: ${data.map((d) => `${d.date}: ${d.total}kg`).join(', ')}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / TONNES_DIVISOR).toFixed(1)}t`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={GLOBAL_AVERAGE_EMISSION}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                label={{ value: 'Global Avg', fill: '#f59e0b', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={TARGET_EMISSION}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
                label={{ value: 'Target', fill: '#10b981', fontSize: 10, position: 'right' }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#34d399"
                strokeWidth={2.5}
                dot={{ fill: '#34d399', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#34d399', strokeWidth: 2, stroke: '#0a0f1a' }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

TrendChart.propTypes = {
  assessments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      totalEmission: PropTypes.number.isRequired,
      transportEmission: PropTypes.number,
      energyEmission: PropTypes.number,
      foodEmission: PropTypes.number,
    })
  ),
};
