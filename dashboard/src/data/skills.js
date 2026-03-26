export const STATUSES = {
  TODO: 'todo',
  PENDING: 'pending',
  DONE: 'done',
};

export const defaultSkills = [
  {
    id: 1,
    name: 'Morning Standup',
    description: 'Daily team sync meeting',
    lastUsed: null,
    status: STATUSES.TODO,
  },
  {
    id: 2,
    name: 'Code Review',
    description: 'Review open pull requests',
    lastUsed: '2026-03-25',
    status: STATUSES.TODO,
  },
  {
    id: 3,
    name: 'Deploy to Staging',
    description: 'Push latest changes to staging environment',
    lastUsed: '2026-03-24',
    status: STATUSES.DONE,
  },
  {
    id: 4,
    name: 'Update Docs',
    description: 'Update project documentation',
    lastUsed: '2026-03-20',
    status: STATUSES.PENDING,
  },
  {
    id: 5,
    name: 'Run Tests',
    description: 'Execute full test suite',
    lastUsed: '2026-03-25',
    status: STATUSES.TODO,
  },
  {
    id: 6,
    name: 'Security Scan',
    description: 'Run vulnerability scan on dependencies',
    lastUsed: null,
    status: STATUSES.TODO,
  },
];
