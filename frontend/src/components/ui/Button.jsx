import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger:
    'px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30',
  ghost:
    'px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-slate-400 hover:text-slate-200 hover:bg-white/5',
};

const sizes = {
  sm: '!px-4 !py-2 !text-sm',
  md: '',
  lg: '!px-8 !py-4 !text-lg',
};

/**
 * Button — reusable button component with variant, size, and loading state support.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary'|'secondary'|'danger'|'ghost'} [props.variant='primary'] - Visual variant
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.loading=false] - Whether to show loading spinner
 * @param {string} [props.type='button'] - HTML button type attribute
 * @param {Function} [props.onClick] - Click handler
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element}
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    type = 'button',
    onClick,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        inline-flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button;
