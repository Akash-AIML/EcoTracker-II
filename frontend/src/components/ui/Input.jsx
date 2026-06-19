import { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input — accessible form input with label, hint text, and error display.
 * @param {Object} props
 * @param {string} [props.label] - Label text displayed above the input
 * @param {string} [props.id] - HTML id attribute (also used for label association)
 * @param {string} [props.error] - Error message to display below the input
 * @param {string} [props.hint] - Helper hint text displayed when no error
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.required=false] - Whether the field is required
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element}
 */
const Input = forwardRef(function Input(
  { label, id, error, hint, className = '', required = false, ...props },
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
      <input
        ref={ref}
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`input-field ${error ? 'border-rose-500/50 focus:border-rose-500' : ''} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
};

export default Input;
