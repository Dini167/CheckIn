import type { z } from 'zod';
import { badRequest, zodDetails } from './errors';

/** Parses input with a Zod schema; throws a 400 VALIDATION_ERROR on failure. */
export function parse<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest('הנתונים שנשלחו אינם תקינים', 'VALIDATION_ERROR', zodDetails(result.error));
  }
  return result.data;
}

/** Parses a positive integer route parameter such as :id. */
export function parseId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest('מזהה לא תקין', 'INVALID_ID');
  }
  return id;
}
