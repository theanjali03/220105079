// Custom logging middleware (replace with your Pre-Test Setup logic)
// Do NOT use console.log anywhere in the app

const logs = [];

export function logEvent(event, details = {}) {
  // Example: push logs to an array, or send to a server if required
  logs.push({
    timestamp: new Date().toISOString(),
    event,
    details,
  });
}

export function getLogs() {
  return logs;
}

// Usage: import { logEvent } from './logger';
// logEvent('Short URL created', { url, shortcode });
