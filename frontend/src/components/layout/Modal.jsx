import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Icon from '../ui/Icons';

/** @constant {string} FOCUSABLE_SELECTOR - CSS selector for focusable elements */
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Modal — accessible dialog component with focus trapping, Escape key,
 * and backdrop click to close. Locks body scroll when open.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Modal body content
 * @param {Function} props.onClose - Callback invoked when modal should close
 * @param {string} props.title - Dialog title displayed in the header
 * @returns {JSX.Element}
 */
export default function Modal({ children, onClose, title }) {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  // Auto-focus first focusable element on mount
  useEffect(() => {
    const autoFocusEl = modalRef.current?.querySelector('[autoFocus]');
    if (autoFocusEl) {
      autoFocusEl.focus();
    } else {
      const focusable = modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
      focusable?.[0]?.focus();
    }
  }, []);

  // Handle Escape key and Tab-based focus trapping
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
        const first = focusable?.[0];
        const last = focusable?.[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  /**
   * Close modal on backdrop click (only if the click target is the overlay itself).
   * @param {React.MouseEvent} e - The click event
   */
  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="glass-card w-full max-w-md animate-slide-up p-6"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            id="modal-title"
            className="text-xl font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--color-text)' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Close dialog"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};
