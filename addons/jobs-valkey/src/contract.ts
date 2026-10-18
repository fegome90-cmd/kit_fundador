import { createHash } from 'node:crypto';

export const DIGEST_JOB_NAME = 'digest-text';
export const MAX_TEXT_BYTES = 16 * 1024;

export interface DigestInput { version: 1; text: string }
export interface DigestResult { version: 1; sha256: string; bytes: number }

/** Strict versioned payload; reject unknown fields and accidental secrets/metadata. */
export function validateDigestInput(value: unknown): DigestInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid digest job input');
  }
  const data = value as Record<string, unknown>;
  if (Object.keys(data).sort().join(',') !== 'text,version' ||
      data.version !== 1 || typeof data.text !== 'string' ||
      !data.text.trim() || Buffer.byteLength(data.text, 'utf8') > MAX_TEXT_BYTES) {
    throw new Error('Invalid digest job input');
  }
  return { version: 1, text: data.text };
}

export function digestText(value: unknown): DigestResult {
  const input = validateDigestInput(value);
  const bytes = Buffer.byteLength(input.text, 'utf8');
  return { version: 1, sha256: createHash('sha256').update(input.text).digest('hex'), bytes };
}

export function digestJobId(value: DigestInput): string {
  // Same validated payload => same key while BullMQ retains the completed job.
  return 'digest-' + createHash('sha256').update(value.text).digest('hex');
}
