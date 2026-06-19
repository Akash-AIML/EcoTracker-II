import PropTypes from 'prop-types';

const variants = {
  eco: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
  cyan: 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400',
  purple: 'bg-purple-500/15 border border-purple-500/30 text-purple-400',
  slate: 'bg-slate-500/15 border border-slate-500/30 text-slate-400',
};

/**
 * Badge — small status label with color variants and optional dot indicator.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge text content
 * @param {'eco'|'high'|'medium'|'low'|'cyan'|'purple'|'slate'} [props.variant='eco'] - Color variant
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.dot=false] - Show dot indicator
 * @returns {JSX.Element}
 */
export default function Badge({ children, variant = 'eco', className = '', dot = false }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${variants[variant] || variants.eco}
        ${className}
      `}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['eco', 'high', 'medium', 'low', 'cyan', 'purple', 'slate']),
  className: PropTypes.string,
  dot: PropTypes.bool,
};
