import { z } from 'zod';

export const ErrorEnvelopeSchema = z.object({
  error: z.string(),
  code: z.string(),
  requestId: z.string(),
  details: z.unknown().optional(),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

export const SuccessEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    requestId: z.string(),
  });

export interface SuccessEnvelope<T> {
  data: T;
  requestId: string;
}

export function createErrorEnvelope(
  error: string,
  code: string,
  requestId: string,
  details?: unknown,
): ErrorEnvelope {
  return {
    error,
    code,
    requestId,
    details,
  };
}

export function createSuccessEnvelope<T>(data: T, requestId: string): SuccessEnvelope<T> {
  return {
    data,
    requestId,
  };
}
