import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAssessment } from '../hooks/useAssessment';
import { useSimulation } from '../hooks/useSimulation';
import ScenarioSelector from '../components/simulator/ScenarioSelector';
import ImpactDisplay from '../components/simulator/ImpactDisplay';
import ComparisonBar from '../components/simulator/ComparisonBar';
import { PageLoader } from '../components/ui/LoadingSpinner';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icons';

/** @constant {number} TONNES_DIVISOR - Converts kg to tonnes */
const TONNES_DIVISOR = 1000;

/** @constant {number} MAX_HISTORY_ITEMS - Maximum simulation history entries to keep */
const MAX_HISTORY_ITEMS = 4;

export default function SimulatorPage() {
  const { assessmentId } = useParams();
  const { assessment, loading, fetchAssessment } = useAssessment();
  const { simulation, loading: simLoading, error: simError, runSimulation } = useSimulation();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (assessmentId) fetchAssessment(assessmentId);
  }, [assessmentId, fetchAssessment]);

  const handleRun = useCallback(async () => {
    if (!selectedScenario || !assessmentId) return;
    try {
      const result = await runSimulation(
        assessmentId,
        selectedScenario.name,
        selectedScenario.params
      );
      setHistory((prev) => [result, ...prev.slice(0, MAX_HISTORY_ITEMS)]);
    } catch (err) {
      // Error is already surfaced via simError state from useSimulation
    }
  }, [selectedScenario, assessmentId, runSimulation]);

  const categoryRows = useMemo(
    () => [
      { key: 'transport', label: 'Transport', icon: 'transport' },
      { key: 'energy', label: 'Energy', icon: 'energy' },
      { key: 'food', label: 'Food', icon: 'food' },
      { key: 'shopping', label: 'Shopping', icon: 'shopping' },
    ],
    []
  );

  if (loading) return <PageLoader />;

  if (!assessment) {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4"
        role="status"
        aria-label="Loading simulation data"
      >
        <LoadingSpinner size="xl" label="Loading simulation data..." />
        <p className="text-slate-400 animate-pulse">Loading simulation data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="eco-badge inline-flex mb-3">
              <Icon name="flask" size={13} />
              Impact Simulator
            </div>
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: 'Syne, sans-serif', color: 'var(--color-text)' }}
            >
              Simulate Lifestyle Changes
            </h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-faint)' }}>
              See the projected impact before making a change
            </p>
          </div>
          <Link to={`/dashboard/${assessmentId}`}>
            <Button variant="secondary">
              <Icon name="arrow_left" size={15} />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Current footprint banner */}
        <div
          className="glass-card p-5 mb-6 flex flex-wrap items-center gap-6"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div>
            <p
              className="text-xs uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--color-text-faint)' }}
            >
              Your Current Footprint
            </p>
            <p
              className="text-2xl font-bold gradient-text"
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {(assessment.totalEmission / TONNES_DIVISOR).toFixed(2)} tonnes CO₂/year
            </p>
          </div>
          <div
            className="h-8 w-px hidden sm:block"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            aria-hidden="true"
          />
          <div>
            <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-faint)' }}>
              Sustainability Score
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {assessment.sustainabilityScore}/100
            </p>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Scenario selector */}
          <Card>
            <h2
              className="text-lg font-bold mb-5"
              style={{ fontFamily: 'Syne, sans-serif', color: 'var(--color-text)' }}
            >
              Choose a Scenario
            </h2>
            <ScenarioSelector
              selectedScenario={selectedScenario}
              onSelect={setSelectedScenario}
              onRun={handleRun}
              loading={simLoading}
            />
            {simError && (
              <p className="mt-4 text-sm" style={{ color: '#fb7185' }} role="alert">
                {simError}
              </p>
            )}
          </Card>

          {/* Results column */}
          <div className="space-y-5">
            {simulation ? (
              <>
                <ImpactDisplay simulation={simulation} />
                <Card>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                    Detailed Comparison
                  </h3>
                  <ComparisonBar
                    original={simulation.originalEmission}
                    projected={simulation.projectedEmission}
                    label="Total Annual Emissions"
                  />
                  {simulation.categoryBreakdown && (
                    <div className="mt-5 space-y-4">
                      {categoryRows.map(({ key, label, icon }) => {
                        const orig = simulation.categoryBreakdown.original[key];
                        const proj = simulation.categoryBreakdown.projected[key];
                        if (orig === proj) return null;
                        return (
                          <ComparisonBar
                            key={key}
                            original={orig}
                            projected={proj}
                            label={
                              <span className="flex items-center gap-1.5">
                                <Icon name={icon} size={13} />
                                {label}
                              </span>
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <div className="glass-card p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(79,142,247,0.1)', color: '#4F8EF7' }}
                >
                  <Icon name="flask" size={28} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  Choose a Scenario to Simulate
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Select a lifestyle change from the left panel and click Run Simulation to see
                  projected impact.
                </p>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <Card>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                  Simulation History
                </h3>
                <div className="space-y-2.5">
                  {history.map((sim, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <span
                        className="text-sm truncate"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {sim.scenarioName}
                      </span>
                      <span
                        className="text-sm font-mono font-semibold flex-shrink-0 ml-3"
                        style={{ color: sim.annualSavingsKg > 0 ? '#00C27B' : '#f43f5e' }}
                      >
                        {sim.annualSavingsKg > 0 ? '−' : '+'}
                        {Math.abs(sim.annualSavingsKg).toLocaleString()} kg
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
