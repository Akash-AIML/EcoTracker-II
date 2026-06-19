import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Select — accessible dropdown select with label and error support.
 * @param {Object} props
 * @param {string} [props.label] - Label text displayed above the select
 * @param {string} [props.id] - HTML id attribute (also used for label association)
 * @param {string} [props.error] - Error message to display below the select
 * @param {{ value: string, label: string }[]} [props.options=[]] - Array of option objects
 * @param {string} [props.placeholder] - Placeholder option text (disabled)
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.required=false] - Whether the field is required
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element}
 */
const Select = forwardRef(function Select(
  { label, id, error, options = [], placeholder, className = '', required = false, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && (
            <span className="text-rose-400 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`select-field ${error ? 'border-rose-500/50' : ''} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Select.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
};

export default Select;
