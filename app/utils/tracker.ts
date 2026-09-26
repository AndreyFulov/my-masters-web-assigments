const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function trackAction(action: string, payload: Record<string, unknown> = {}) {
  const url = `${BASE_URL}/actions/log`;
  const body = JSON.stringify({ action, payload });

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch((err) => {
    console.error('Track error:', err);
  });
}