import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card, { CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import LoadingSpinner, { PageLoader } from '../components/ui/LoadingSpinner';

// ── Mock assessmentService before any import of useAssessment ─────────────────
// vi.mock is hoisted by Vitest, so this runs before module evaluation.
vi.mock('../services/assessmentService', () => ({
  assessmentService: {
    create: vi.fn().mockRejectedValue(new Error('Network error')),
    getById: vi.fn().mockRejectedValue(new Error('Not found')),
    getByUser: vi.fn().mockRejectedValue(new Error('User not found')),
  },
}));

// ── Button Component ──────────────────────────────────────────────────────────

describe('Button Component', () => {
  it('renders the button with children text', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and shows spinner when loading', () => {
    render(<Button loading>Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(/submit/i)).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Submit</Button>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<Button variant="secondary">Sec</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');

    rerender(<Button variant="primary">Prim</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-primary');
  });

  it('does not trigger onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

// ── Badge Component ──────────────────────────────────────────────────────────

describe('Badge Component', () => {
  it('renders correctly with children', () => {
    render(<Badge>Eco Friendly</Badge>);
    expect(screen.getByText('Eco Friendly')).toBeInTheDocument();
  });

  it('renders dot when specified', () => {
    render(<Badge dot>Eco Friendly</Badge>);
    const badge = screen.getByText('Eco Friendly');
    expect(badge.querySelector('span')).toBeInTheDocument();
  });
});

// ── Card Component ──────────────────────────────────────────────────────────

describe('Card Component', () => {
  it('renders card with body, header and title structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Eco Title</CardTitle>
        </CardHeader>
        <CardBody>Eco Details</CardBody>
      </Card>
    );
    expect(screen.getByRole('heading', { name: /eco title/i })).toBeInTheDocument();
    expect(screen.getByText('Eco Details')).toBeInTheDocument();
  });
});

// ── LoadingSpinner Component ──────────────────────────────────────────────────

describe('LoadingSpinner Component', () => {
  it('renders with role="status" and aria-label', () => {
    render(<LoadingSpinner label="Loading data" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading data');
  });

  it('has aria-live="polite" and aria-busy="true"', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(spinner).toHaveAttribute('aria-busy', 'true');
  });

  it('renders sr-only label text', () => {
    render(<LoadingSpinner label="Fetching results" />);
    expect(screen.getByText('Fetching results')).toBeInTheDocument();
  });
});

describe('PageLoader Component', () => {
  it('renders with aria-live and aria-busy on container', () => {
    render(<PageLoader />);
    // PageLoader renders both a sr-only span and a <p> with "Loading...",
    // so we use getAllByText and find the outer container via the <p> element.
    const loadingTexts = screen.getAllByText('Loading...');
    // The outer container div has aria-live and aria-busy
    const container = loadingTexts[0].closest('[aria-live]');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-busy', 'true');
  });
});

// ── useAssessment error state tests ──────────────────────────────────────────

describe('useAssessment error handling', () => {
  // These tests verify the hook properly surfaces API errors.
  // The assessmentService mock is hoisted at the top of this file.

  it('createAssessment surfaces error message on API failure', async () => {
    const { useAssessment } = await import('../hooks/useAssessment');

    function TestComponent() {
      const { error, loading, createAssessment } = useAssessment();
      return (
        <div>
          <span data-testid="create-error">{error || 'none'}</span>
          <span data-testid="create-loading">{String(loading)}</span>
          <button onClick={() => createAssessment({}).catch(() => {})}>create</button>
        </div>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('create-error')).toHaveTextContent('none');

    fireEvent.click(screen.getByText('create'));
    await waitFor(() => {
      expect(screen.getByTestId('create-error')).toHaveTextContent('Network error');
    });
  });

  it('fetchAssessment surfaces error message on API failure', async () => {
    const { useAssessment } = await import('../hooks/useAssessment');

    function TestComponent() {
      const { error, fetchAssessment } = useAssessment();
      return (
        <div>
          <span data-testid="fetch-error">{error || 'none'}</span>
          <button onClick={() => fetchAssessment('bad-id').catch(() => {})}>fetch</button>
        </div>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId('fetch-error')).toHaveTextContent('none');

    fireEvent.click(screen.getByText('fetch'));
    await waitFor(() => {
      expect(screen.getByTestId('fetch-error')).toHaveTextContent('Not found');
    });
  });
});

// ── sanitizeText edge case tests ──────────────────────────────────────────────

describe('sanitizeText edge cases', () => {
  let sanitizeText;

  beforeEach(async () => {
    const mod = await import('../utils/sanitize');
    sanitizeText = mod.sanitizeText;
  });

  it('returns empty string for empty string input', () => {
    expect(sanitizeText('')).toBe('');
  });

  it('returns empty string when input is only HTML tags', () => {
    expect(sanitizeText('<div><span></span></div>')).toBe('');
  });

  it('truncates string exceeding maxLen', () => {
    const long = 'a'.repeat(300);
    const result = sanitizeText(long, 50);
    expect(result.length).toBe(50);
  });

  it('strips script tags and returns remaining text', () => {
    expect(sanitizeText('<script>alert("xss")</script>safe text')).toBe('safe text');
  });

  it('strips style tags and returns remaining text', () => {
    expect(sanitizeText('<style>body{color:red}</style>clean')).toBe('clean');
  });

  it('returns empty string for undefined input', () => {
    expect(sanitizeText(undefined)).toBe('');
  });

  it('returns empty string for numeric input', () => {
    expect(sanitizeText(42)).toBe('');
  });

  it('handles nested HTML tags correctly', () => {
    expect(sanitizeText('<div><b>bold</b> text</div>')).toBe('bold text');
  });
});
