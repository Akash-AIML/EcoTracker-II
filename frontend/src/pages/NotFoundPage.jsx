import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-slide-up">
        <div className="text-8xl mb-6 animate-float" aria-hidden="true">
          🌿
        </div>
        <h1 className="text-4xl font-display font-bold text-slate-100 mb-4">
          <span className="gradient-text">404</span> — Lost in the Forest
        </h1>
        <p className="text-slate-400 leading-relaxed mb-8">
          This page seems to have gone carbon-negative and disappeared. Let&apos;s get you back on
          the right path.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/">
            <Button id="btn-404-home">← Back to Home</Button>
          </Link>
          <Link to="/calculator">
            <Button variant="secondary" id="btn-404-calculator">
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
