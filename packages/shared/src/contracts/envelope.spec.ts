import { describe, expect, it } from 'vitest';
import { ErrorEnvelopeSchema, createErrorEnvelope, createSuccessEnvelope } from './envelope';

describe('API Envelopes Contract', () => {
  it('should create and validate an error envelope without details', () => {
    const envelope = createErrorEnvelope('Resource not found', 'NOT_FOUND', 'req-123');

    expect(envelope).toEqual({
      error: 'Resource not found',
      code: 'NOT_FOUND',
      requestId: 'req-123',
      details: undefined,
    });

    const parsed = ErrorEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
  });

  it('should create and validate an error envelope with details', () => {
    const envelope = createErrorEnvelope('Validation failed', 'VALIDATION_ERROR', 'req-456', {
      field: 'email',
      reason: 'invalid format',
    });

    expect(envelope.details).toEqual({
      field: 'email',
      reason: 'invalid format',
    });

    const parsed = ErrorEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);
  });

  it('should create a success envelope wrapping payload', () => {
    const payload = { userId: 'usr-1', role: 'admin' };
    const envelope = createSuccessEnvelope(payload, 'req-789');

    expect(envelope).toEqual({
      data: payload,
      requestId: 'req-789',
    });
  });
});
