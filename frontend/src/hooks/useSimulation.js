import { useState } from 'react';
import { simulationService } from '../services/simulationService';

export function useSimulation() {
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = async (assessmentId, scenarioName, scenarioParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await simulationService.create({ assessmentId, scenarioName, scenarioParams });
      setSimulation(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { simulation, loading, error, runSimulation, setSimulation };
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async (assessmentId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulationService.getRecommendations(assessmentId);
      setRecommendations(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { recommendations, loading, error, fetchRecommendations };
}
