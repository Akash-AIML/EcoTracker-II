import PropTypes from 'prop-types';
import { formatNumber, getPriorityInfo } from '../../utils/formatters';
import Icon from '../ui/Icons';

const CATEGORY_ICON_MAP = {
  transport: 'transport',
  energy: 'energy',
  food: 'food',
  shopping: 'shopping',
};

/** @constant {number} ANIMATION_DELAY_STEP - Seconds between staggered card animations */
const ANIMATION_DELAY_STEP = 0.06;

/**
 * RecommendationCard — displays a single AI-generated reduction recommendation
 * with priority badge, category icon, and estimated CO₂ savings.
 * @param {Object} props
 * @param {Object} props.recommendation - The recommendation record
 * @param {number} props.index - Position index for stagger animation delay
 * @returns {JSX.Element}
 */
export default function RecommendationCard({ recommendation, index }) {
  const priorityInfo = getPriorityInfo(recommendation.priority);
  const iconName = CATEGORY_ICON_MAP[recommendation.category] || 'info';

  const priorityBg =
    recommendation.priority === 'HIGH'
      ? 'rgba(244,63,94,0.12)'
      : recommendation.priority === 'MEDIUM'
        ? 'rgba(245,158,11,0.12)'
        : 'rgba(79,142,247,0.12)';

  const priorityColor =
    recommendation.priority === 'HIGH'
      ? '#fb7185'
      : recommendation.priority === 'MEDIUM'
        ? '#fbbf24'
        : '#7aadfa';

  return (
    <div
      className="glass-card-hover p-5 animate-slide-up"
      style={{ animationDelay: `${index * ANIMATION_DELAY_STEP}s` }}
    >
      <div className="flex items-start gap-4">
        {/* Category icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: priorityBg }}
          aria-hidden="true"
        >
          <Icon
            name={iconName}
            size={18}
            style={{ color: priorityColor }}
            className="text-current"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4
              className="text-sm font-semibold leading-snug"
              style={{ color: 'var(--color-text)' }}
            >
              {recommendation.title}
            </h4>
            <span
              className={`
                flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                ${priorityInfo.bgClass} ${priorityInfo.textClass} border ${priorityInfo.borderClass}
              `}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
              {recommendation.priority}
            </span>
          </div>

          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {recommendation.description}
          </p>

          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-sm" style={{ color: '#00C27B' }}>
              −{formatNumber(recommendation.estimatedSavings)} kg
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
              CO₂ savings/year
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

RecommendationCard.propTypes = {
  recommendation: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    estimatedSavings: PropTypes.number.isRequired,
    priority: PropTypes.oneOf(['HIGH', 'MEDIUM', 'LOW']).isRequired,
    category: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};
