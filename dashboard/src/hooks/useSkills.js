import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/apiClient';
import { useUser } from '../context/UserContext';

export function useSkills() {
  const { isAuthenticated } = useUser();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ephemeral per-skill run state (not persisted): { [id]: { lastStatus, lastRun, lastResponse } }
  const [runState, setRunState] = useState({});

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/skills');
      setSkills(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchSkills();
  }, [isAuthenticated, fetchSkills]);

  async function runSkill(id) {
    setRunState((prev) => ({ ...prev, [id]: { lastStatus: 'running', lastRun: null, lastResponse: null } }));
    try {
      const result = await api.post(`/skills/${id}/run`, {});
      setRunState((prev) => ({
        ...prev,
        [id]: {
          lastStatus: result.ok ? 'success' : 'error',
          lastRun: new Date().toISOString(),
          lastResponse: { status: result.httpStatus, preview: result.preview },
        },
      }));
    } catch (err) {
      setRunState((prev) => ({
        ...prev,
        [id]: {
          lastStatus: 'error',
          lastRun: new Date().toISOString(),
          lastResponse: { status: null, preview: err.message },
        },
      }));
    }
  }

  async function addSkill(skill) {
    const created = await api.post('/skills', skill);
    setSkills((prev) => [...prev, created]);
  }

  async function removeSkill(id) {
    await api.delete(`/skills/${id}`);
    setSkills((prev) => prev.filter((s) => s.id !== id));
    setRunState((prev) => { const next = { ...prev }; delete next[id]; return next; });
  }

  // Merge persistent skills with ephemeral run state
  const skillsWithRunState = skills.map((s) => ({
    ...s,
    lastStatus: runState[s.id]?.lastStatus ?? 'idle',
    lastRun: runState[s.id]?.lastRun ?? null,
    lastResponse: runState[s.id]?.lastResponse ?? null,
  }));

  return { skills: skillsWithRunState, loading, error, runSkill, addSkill, removeSkill, refetch: fetchSkills };
}
