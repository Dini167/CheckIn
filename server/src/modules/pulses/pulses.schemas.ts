import { dateKeySchema, userSummarySchema, z } from '../../common/zod';

export const PULSE_QUESTION = 'על מה את/ה עובד/ת עכשיו?';

export const pulseStatusSchema = z.enum(['OPEN', 'ANSWERED', 'MISSED', 'CANCELLED']).openapi({
  description:
    'OPEN = פתוחה לתשובה · ANSWERED = נענתה · MISSED = לא נענתה בזמן · CANCELLED = בוטלה (לא היית במשמרת באותו רגע)',
});

export const respondSchema = z
  .object({
    responseText: z
      .string()
      .trim()
      .min(1, 'יש לכתוב משפט קצר או נושא')
      .max(150)
      .openapi({ example: 'מתקנת באג במסך הנוכחות' }),
  })
  .openapi('PulseResponse');

export const currentPulseSchema = z
  .object({
    pulse: z
      .object({
        id: z.number().int(),
        question: z.string().openapi({ example: PULSE_QUESTION }),
        openedAt: z.string(),
        expiresAt: z.string(),
        secondsLeft: z.number().int().openapi({ example: 154 }),
      })
      .nullable()
      .openapi({ description: 'null = אין בדיקה פתוחה כרגע' }),
  })
  .openapi('CurrentPulse');

export const myPulseSchema = z
  .object({
    id: z.number().int(),
    scheduledAt: z.string(),
    status: pulseStatusSchema,
    answeredAt: z.string().nullable(),
    responseText: z.string().nullable(),
  })
  .openapi('Pulse');

export const myPulsesQuerySchema = z.object({
  date: dateKeySchema.optional().openapi({ description: 'ברירת מחדל: היום' }),
});

export const redDotsQuerySchema = z.object({
  from: dateKeySchema.optional().openapi({ description: 'ברירת מחדל: היום' }),
  to: dateKeySchema.optional().openapi({ description: 'ברירת מחדל: כמו from' }),
});

export const redDotSchema = z
  .object({
    date: z.string().openapi({ example: '2026-10-12' }),
    user: userSummarySchema,
    missedCount: z.number().int().openapi({ example: 2 }),
  })
  .openapi('RedDot');
