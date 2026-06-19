import { useState, useCallback } from 'react';
import { assessmentService } from '../services/assessmentService';
import { useUser } from './useUser';

/**
 * Custom hook for managing a single assessment's lifecycle.
 * Provides functions to create and fetch individual assessments.
 * @returns {{ assessment: Object|null, loading: boolean, error: string|null, createAssessment: Function, fetchAssessment: Function }}
 */
export function useAssessment() {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Create a new carbon footprint assessment.
   * @param {Object} data - Assessment input data (transport, energy, food, shopping fields)
   * @returns {Promise<Object>} The created assessment record
   */
  const createAssessment = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assessmentService.create(data);
      setAssessment(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch an existing assessment by its unique ID.
   * @param {string} id - The assessment UUID
   * @returns {Promise<Object>} The fetched assessment record
   */
  const fetchAssessment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assessmentService.getById(id);
      setAssessment(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { assessment, loading, error, createAssessment, fetchAssessment };
}

/**
 * Custom hook for fetching all assessments belonging to a specific user.
 * Handles "User not found" errors by resetting the user context.
 * @param {string} userId - The user UUID to fetch assessments for
 * @returns {{ assessments: Object[], loading: boolean, error: string|null, fetchAssessments: Function }}
 */
export function useUserAssessments(userId) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { resetUser } = useUser();

  /**
   * Fetch all assessments for the current userId.
   * Resets the user session if the backend reports "User not found".
   * @returns {Promise<Object[]|undefined>} Array of assessment records, or undefined if userId is missing
   */
  const fetchAssessments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await assessmentService.getByUser(userId);
      setAssessments(results);
      return results;
    } catch (err) {
      setError(err.message);
      if (err.message?.includes('User not found')) {
        resetUser();
      }
    } finally {
      setLoading(false);
    }
  }, [userId, resetUser]);

  return { assessments, loading, error, fetchAssessments };
}
