const DAY_MS = 24 * 60 * 60 * 1_000;

export const ERROR_EVENT_RETENTION_MS = 30 * DAY_MS;
export const ERROR_EVENT_SWEEP_INTERVAL_MS = DAY_MS;

export function errorEventRetentionCutoff(now = Date.now()): string {
  return new Date(now - ERROR_EVENT_RETENTION_MS).toISOString();
}

export function shouldSweepErrorEvents(lastSweepAt: number, now = Date.now()): boolean {
  return lastSweepAt <= 0 || now - lastSweepAt >= ERROR_EVENT_SWEEP_INTERVAL_MS;
}
