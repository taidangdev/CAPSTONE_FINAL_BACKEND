import { z } from 'zod';
import AppError from './AppError.js';

z.config(z.locales.vi());

export function parseOrThrow(schema, data = {}) {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  const [issue] = result.error.issues;
  const field = issue.path.join('.');
  throw new AppError(400, field ? `${field}: ${issue.message}` : issue.message);
}
