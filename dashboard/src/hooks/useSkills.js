import { useState, useEffect } from 'react';
import { defaultSkills } from '../data/skills';

const STORAGE_KEY = 'commandcenter_skills';

export function useSkills() {
  const [skills, setSkills] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultSkills;
    } catch {
      return defaultSkills;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
  }, [skills]);

  function updateStatus(id, status) {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status, lastUsed: new Date().toISOString().split('T')[0] }
          : s
      )
    );
  }

  function addSkill(skill) {
    const newSkill = {
      ...skill,
      id: Date.now(),
      lastUsed: null,
      status: 'todo',
    };
    setSkills((prev) => [...prev, newSkill]);
  }

  function removeSkill(id) {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  function resetAllForToday() {
    setSkills((prev) => prev.map((s) => ({ ...s, status: 'todo' })));
  }

  return { skills, updateStatus, addSkill, removeSkill, resetAllForToday };
}
