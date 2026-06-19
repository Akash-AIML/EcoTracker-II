import PropTypes from 'prop-types';

/**
 * LoadingSpinner — accessible loading indicator with configurable size.
 * Container includes aria-live="polite" and aria-busy="true" for assistive technologies.
 * @param {Object} props
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Spinner size variant
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.label='Loading...'] - Accessible label for screen readers
 * @returns {JSX.Element}
 */
export default function LoadingSpinner({ size = 'md', className = '', label = 'Loading...' }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
      className={`flex items-center justify-center ${className}`}
    >
      <div
        className={`${sizes[size]} rounded-full animate-spin`}
        style={{
          borderColor: 'rgba(16, 185, 129, 0.2)',
          borderTopColor: '#10b981',
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  label: PropTypes.string,
};

/**
 * PageLoader — full-page loading state with centered spinner and text.
 * @returns {JSX.Element}
 */
export function PageLoader() {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingSpinner size="xl" />
      <p className="text-slate-400 animate-pulse">Loading...</p>
    </div>
  );
}
