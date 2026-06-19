import PropTypes from 'prop-types';

/**
 * Card — glass-morphism container with optional hover and glow effects.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.hover=false] - Enable hover animation
 * @param {boolean} [props.glow=false] - Enable eco glow effect
 * @returns {JSX.Element}
 */
export default function Card({ children, className = '', hover = false, glow = false, ...props }) {
  return (
    <div
      className={`
        glass-card p-6
        ${hover ? 'glass-card-hover animated-border' : ''}
        ${glow ? 'glow-eco' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  glow: PropTypes.bool,
};

/**
 * CardHeader — header section inside a Card.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Header content
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element}
 */
export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * CardTitle — heading element inside a CardHeader.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Title text
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element}
 */
export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-lg font-semibold text-slate-100 ${className}`}>{children}</h3>;
}

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * CardBody — body section inside a Card.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Body content
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element}
 */
export function CardBody({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
