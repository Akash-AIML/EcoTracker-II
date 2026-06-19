import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from '../components/calculator/StepIndicator';
import TransportForm from '../components/calculator/TransportForm';
import EnergyForm from '../components/calculator/EnergyForm';
import FoodForm from '../components/calculator/FoodForm';
import ShoppingForm from '../components/calculator/ShoppingForm';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAssessment } from '../hooks/useAssessment';
import { useUser } from '../hooks/useUser';

const STEPS = [
  { id: 'transport', label: 'Transport', sublabel: 'Car & flights' },
  { id: 'energy', label: 'Energy', sublabel: 'Home electricity' },
  { id: 'food', label: 'Food', sublabel: 'Diet & meals' },
  { id: 'shopping', label: 'Shopping', sublabel: 'Consumer goods' },
];

const DEFAULT_DATA = {
  dailyCarKm: 0,
  carFuelType: 'none',
  publicTransportKmPerWeek: 0,
  cyclingKmPerWeek: 0,
  shortFlightsPerYear: 0,
  longFlightsPerYear: 0,
  monthlyElectricityKwh: 0,
  renewablePercentage: 0,
  dietType: 'mixed',
  clothingItemsPerYear: 0,
  electronicsItemsPerYear: 0,
};

const PHRASES = [
  'Parsing travel and flight details...',
  'Calculating home electricity consumption...',
  'Quantifying diet and food emissions...',
  'Evaluating consumer shopping patterns...',
  'Processing IPCC emission factors...',
  'Invoking AI recommendation engine...',
  'Optimizing simulation presets...',
  'Finalizing carbon score...',
];

function LoadingSequence() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev < PHRASES.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm font-mono text-emerald-400 h-6 transition-all duration-300">
        {PHRASES[currentIdx]}
      </p>
      <div className="flex justify-center gap-1.5">
        {PHRASES.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background:
                i === currentIdx
                  ? '#10B981'
                  : i < currentIdx
                    ? '#059669'
                    : 'rgba(255,255,255,0.05)',
              transform: i === currentIdx ? 'scale(1.25)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(DEFAULT_DATA);
  const [submitError, setSubmitError] = useState('');

  const { createAssessment, loading } = useAssessment();
  const { user, registerUser } = useUser();
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    setSubmitError('');
    try {
      // Always upsert the user first — backend does upsert so this is safe
      // and handles stale localStorage IDs (e.g. after a DB wipe on Railway)
      const activeUser = await registerUser();
      if (!activeUser?.id) throw new Error('Could not register user. Please try again.');

      const result = await createAssessment({ ...formData, userId: activeUser.id });
      if (result?.id) {
        navigate(`/dashboard/${result.id}`);
      }
    } catch (err) {
      setSubmitError(
        err.message || 'Submission failed. Please check your connection and try again.'
      );
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <TransportForm data={formData} onChange={setFormData} />;
      case 1:
        return <EnergyForm data={formData} onChange={setFormData} />;
      case 2:
        return <FoodForm data={formData} onChange={setFormData} />;
      case 3:
        return <ShoppingForm data={formData} onChange={setFormData} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 animate-fade-in">
        <Card
          className="max-w-md w-full p-8 text-center relative overflow-hidden scan-line"
          style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}
        >
          {/* Glow effect */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
          />

          {/* Circular radar scanner */}
          <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border border-dashed border-[#10B981]/30 animate-spin"
              style={{ animationDuration: '8s' }}
            />
            <div
              className="absolute inset-2 rounded-full border border-dashed border-[#06B6D4]/40 animate-spin"
              style={{ animationDuration: '4s', animationDirection: 'reverse' }}
            />
            <div className="absolute inset-4 rounded-full border border-[#10B981]/15" />

            {/* Center icon */}
            <div className="absolute w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-[#10B981] border border-emerald-500/20 animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>

          <h2
            className="text-2xl font-bold mb-3 text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Calculating Footprint
          </h2>

          <LoadingSequence />

          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-6 relative border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full"
              style={{
                animation: 'progressFill 5.6s cubic-bezier(0.1, 0.8, 0.1, 1) forwards',
                width: '0%',
              }}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="eco-badge inline-flex mb-5">Carbon Footprint Calculator</div>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Calculate Your Footprint
          </h1>
          <p style={{ color: '#555' }}>
            Answer 4 sections of questions to get your personalized carbon footprint analysis.
          </p>

          {/* Dynamic progress bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono" style={{ color: '#444' }}>
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <span className="text-xs font-mono" style={{ color: '#444' }}>
                {Math.round(progress)}% complete
              </span>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <div
                className="h-full transition-all duration-500 bg-gradient-to-r from-[#10B981] to-[#06B6D4]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Form card */}
        <Card className="mb-6">
          <div className="mb-7">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-mono px-2 py-1 rounded"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#888',
                  border: '1px solid rgba(255,255,255,0.08)',
                  letterSpacing: '0.1em',
                }}
              >
                {String(currentStep + 1).padStart(2, '0')}
              </span>
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {STEPS[currentStep].label}
                </h2>
                <p className="text-xs" style={{ color: '#555' }}>
                  {STEPS[currentStep].sublabel}
                </p>
              </div>
            </div>
          </div>

          <div className="animate-fade-in" key={currentStep}>
            {renderStep()}
          </div>
        </Card>

        {/* Error */}
        {submitError && (
          <div
            className="rounded-xl p-4 mb-5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            role="alert"
          >
            <p className="text-sm" style={{ color: '#aaa' }}>
              {submitError}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 0}
            id="btn-back"
            aria-label="Go to previous step"
          >
            Back
          </Button>

          {/* Step pills */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentStep ? 24 : 5,
                  height: 5,
                  background:
                    i === currentStep
                      ? '#fff'
                      : i < currentStep
                        ? 'rgba(255,255,255,0.3)'
                        : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            loading={isLastStep && loading}
            id="btn-next"
            aria-label={isLastStep ? 'Calculate my carbon footprint' : 'Go to next step'}
          >
            {isLastStep ? 'Calculate' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
