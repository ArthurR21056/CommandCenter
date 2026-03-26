// Skills are executable actions that fire an API/HTTP call when Run is clicked.
// Each skill has a method + url + optional headers/body.
// lastStatus: 'idle' | 'running' | 'success' | 'error'

export const defaultSkills = [
  {
    id: 1,
    name: 'Health Check',
    description: 'Ping a public API to confirm connectivity',
    method: 'GET',
    url: 'https://httpbin.org/get',
    headers: {},
    body: '',
    lastRun: null,
    lastStatus: 'idle',
    lastResponse: null,
  },
  {
    id: 2,
    name: 'Get IP Info',
    description: 'Fetch current public IP address metadata',
    method: 'GET',
    url: 'https://httpbin.org/ip',
    headers: {},
    body: '',
    lastRun: null,
    lastStatus: 'idle',
    lastResponse: null,
  },
  {
    id: 3,
    name: 'Post Echo',
    description: 'Send a POST request and echo the body back',
    method: 'POST',
    url: 'https://httpbin.org/post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'hello from Command Center' }),
    lastRun: null,
    lastStatus: 'idle',
    lastResponse: null,
  },
];
