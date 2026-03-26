import { useState, useEffect } from 'react';
import { defaultSkills } from '../data/skills';

const STORAGE_KEY = 'commandcenter_skills_v2';

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

  async function runSkill(id) {
    const skill = skills.find((s) => s.id === id);
    if (!skill) return;

    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, lastStatus: 'running', lastResponse: null } : s))
    );

    try {
      const options = {
        method: skill.method,
        headers: skill.headers || {},
      };
      if (skill.body && skill.method !== 'GET') {
        options.body = skill.body;
      }

      const res = await fetch(skill.url, options);
      const text = await res.text();
      let preview;
      try {
        const json = JSON.parse(text);
        preview = JSON.stringify(json, null, 2).slice(0, 300);
      } catch {
        preview = text.slice(0, 300);
      }

      setSkills((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                lastStatus: res.ok ? 'success' : 'error',
                lastRun: new Date().toISOString(),
                lastResponse: { status: res.status, preview },
              }
            : s
        )
      );
    } catch (err) {
      setSkills((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                lastStatus: 'error',
                lastRun: new Date().toISOString(),
                lastResponse: { status: null, preview: err.message },
              }
            : s
        )
      );
    }
  }

  function addSkill(skill) {
    setSkills((prev) => [
      ...prev,
      { ...skill, id: Date.now(), lastRun: null, lastStatus: 'idle', lastResponse: null },
    ]);
  }

  function removeSkill(id) {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  return { skills, runSkill, addSkill, removeSkill };
}
