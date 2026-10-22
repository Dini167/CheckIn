import { dateKeySchema, timeSchema, userSummarySchema, z } from '../../common/zod';

export const createCorrectionSchema = z
  .object({
    workDate: dateKeySchema,
    sessionId: z
      .number()
      .int()
      .positive()
      .optional()
      .openapi({ description: 'קטע נוכחות קיים לתיקון. בלי sessionId = הוספת יום/קטע חסר (חובה גם כניסה וגם יציאה)' }),
    newClockIn: timeSchema.optional().openapi({ example: '09:00', description: 'שעת כניסה מתוקנת (שעון ישראל)' }),
    newClockOut: timeSchema.optional().openapi({ example: '17:00', description: 'שעת יציאה מתוקנת (שעון ישראל)' }),
    location: z.enum(['OFFICE', 'HOME']).optional().openapi({ description: 'רק בהוספת קטע חדש. ברירת מחדל: OFFICE' }),
    reason: z.string().trim().min(2, 'יש לכתוב סיבה').max(300).openapi({ example: 'שכחתי ללחוץ יציאה' }),
  })
  .refine((v) => v.newClockIn || v.newClockOut, { message: 'יש לשלוח שעת כניסה או שעת יציאה', path: ['newClockIn'] })
  .refine((v) => v.sessionId || (v.newClockIn && v.newClockOut), {
    message: 'בהוספת יום חסר יש לשלוח גם שעת כניסה וגם שעת יציאה',
    path: ['newClockOut'],
  })
  .openapi('CreateCorrection');

export const reviewSchema = z
  .object({ decision: z.enum(['APPROVED', 'REJECTED']) })
  .openapi('ReviewDecision');

export const teamCorrectionsQuerySchema = z.object({
  status: z.enum(['APPLIED', 'PENDING', 'APPROVED', 'REJECTED']).optional(),
  kind: z.enum(['SELF', 'REQUEST']).optional().openapi({ description: 'SELF = יומן תיקונים עצמיים · REQUEST = בקשות' }),
});

export const correctionSchema = z
  .object({
    id: z.number().int(),
    user: userSummarySchema,
    workDate: z.string(),
    sessionId: z.number().int().nullable(),
    newClockIn: z.string().nullable(),
    newClockInTime: z.string().nullable().openapi({ example: '09:00' }),
    newClockOut: z.string().nullable(),
    newClockOutTime: z.string().nullable().openapi({ example: '17:00' }),
    location: z.enum(['OFFICE', 'HOME']).nullable(),
    reason: z.string(),
    kind: z.enum(['SELF', 'REQUEST']).openapi({ description: 'SELF = תיקון עצמי שנכנס מיד · REQUEST = בקשה לאישור' }),
    status: z.enum(['APPLIED', 'PENDING', 'APPROVED', 'REJECTED']),
    units: z.number().int().openapi({ description: 'כמה תיקונים זה צורך מהמכסה השבועית' }),
    reviewedBy: userSummarySchema.nullable(),
    reviewedAt: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi('TimeCorrection');

export const quotaSchema = z
  .object({
    unlimited: z.boolean().openapi({ description: 'ראש צוות — ללא הגבלה' }),
    limit: z.number().int().openapi({ example: 2 }),
    used: z.number().int().openapi({ example: 1 }),
    remaining: z.number().int().openapi({ example: 1 }),
    weekStart: z.string().openapi({ example: '2026-10-11' }),
  })
  .openapi('CorrectionQuota');
