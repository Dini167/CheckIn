import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { DATE_KEY_REGEX, MONTH_KEY_REGEX, TIME_REGEX, isValidDateKey } from './dates';

// Adds .openapi() to every Zod schema so the same schemas drive validation and Swagger.
extendZodWithOpenApi(z);

export { z };

export const dateKeySchema = z
  .string()
  .regex(DATE_KEY_REGEX, 'תאריך בפורמט YYYY-MM-DD')
  .refine(isValidDateKey, 'תאריך לא קיים')
  .openapi({ example: '2026-10-13' });

export const monthKeySchema = z
  .string()
  .regex(MONTH_KEY_REGEX, 'חודש בפורמט YYYY-MM')
  .openapi({ example: '2026-10' });

export const timeSchema = z.string().regex(TIME_REGEX, 'שעה בפורמט HH:mm').openapi({ example: '09:00' });

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive().openapi({ example: 1 }),
});

/** Query-string boolean: accepts "true"/"false". */
export const queryBoolean = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true')
  .openapi({ type: 'boolean' });

export const errorSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
      message: z.string().openapi({ example: 'הנתונים שנשלחו אינם תקינים' }),
      details: z
        .array(z.object({ field: z.string(), message: z.string() }))
        .optional()
        .openapi({ example: [{ field: 'email', message: 'כתובת אימייל לא תקינה' }] }),
    }),
  })
  .openapi('Error');

export const userSummarySchema = z
  .object({
    id: z.number().int().openapi({ example: 2 }),
    name: z.string().openapi({ example: 'יוסי לוי' }),
  })
  .openapi('UserSummary');
