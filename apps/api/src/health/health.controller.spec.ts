import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController (Probes)', () => {
  it('should return ok for liveness probe (/healthz)', () => {
    const controller = new HealthController();
    const result = controller.getLiveness();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('should return ok for readiness probe when ready (/readyz)', () => {
    const controller = new HealthController();
    const result = controller.getReadiness();

    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('should return degraded when readiness probe is toggled to false', () => {
    const controller = new HealthController();
    controller.setReady(false);

    const result = controller.getReadiness();
    expect(result.status).toBe('degraded');
  });
});
