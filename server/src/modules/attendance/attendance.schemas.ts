import { dateKeySchema, monthKeySchema, userSummarySchema, z } from '../../common/zod';

export const locationSchema = z.enum(['OFFICE', 'HOME']).openapi({ description: 'OFFICE = משרד, HOME = בית' });
const remarks = z.string().trim().max(300).optional().openapi({ example: 'יצאתי מוקדם לרופא' });

export const clockInSchema = z
  .object({ location: locationSchema, remarks })
  .openapi('ClockInRequest');

export const pauseSchema = z.object({ remarks }).openapi('PauseRequest');

export const clockOutSchema = z
  .object({
    dailySummary: z
      .string()
      .trim()
      .min(2, 'יש לכתוב סיכום יומי קצר')
      .max(300)
      .refine((s) => s.split(/\r?\n/).length <= 2, 'הסיכום היומי מוגבל לשתי שורות')
      .openapi({ example: 'סיימתי את מסך ההתחברות.\nהתחלתי לעבוד על דוח הנוכחות.' }),
    remarks,
  })
  .openapi('ClockOutRequest');

export const monthQuerySchema = z.object({
  month: monthKeySchema.optional().openapi({ description: 'ברירת מחדל: החודש הנוכחי' }),
});

export const teamAttendanceQuerySchema = z.object({
  from: dateKeySchema.optional().openapi({ description: 'ברירת מחדל: היום' }),
  to: dateKeySchema.optional().openapi({ description: 'ברירת מחדל: כמו from' }),
  userId: z.coerce.number().int().positive().optional(),
  location: locationSchema.optional(),
  search: z.string().trim().max(80).optional().openapi({ description: 'חיפוש לפי שם עובד' }),
  sort: z.enum(['date', 'name', 'clockIn', 'workedMinutes']).default('date'),
  order: z.enum(['asc', 'desc']).optional().openapi({ description: 'ברירת מחדל: desc לתאריך, asc לשאר' }),
});

export const sessionSchema = z
  .object({
    id: z.number().int(),
    workDate: z.string().openapi({ example: '2026-10-13' }),
    clockIn: z.string().openapi({ example: '2026-10-13T06:02:11.000Z' }),
    clockOut: z.string().nullable(),
    clockInTime: z.string().openapi({ example: '09:02', description: 'שעה מקומית' }),
    clockOutTime: z.string().nullable().openapi({ example: '17:15' }),
    location: locationSchema,
    endType: z.enum(['END_OF_DAY', 'PAUSE']).nullable(),
    dailySummary: z.string().nullable(),
    remarks: z.string().nullable(),
    isManual: z.boolean(),
    minutes: z.number().int().openapi({ example: 493 }),
  })
  .openapi('AttendanceSession');

export const todaySchema = z
  .object({
    date: z.string().openapi({ example: '2026-10-13' }),
    state: z.enum(['NOT_STARTED', 'IN', 'PAUSED', 'ENDED']).openapi({
      description: 'NOT_STARTED = עוד לא נכנס היום · IN = במשמרת · PAUSED = בעצירה זמנית · ENDED = יצא',
    }),
    workedMinutes: z.number().int(),
    currentSession: sessionSchema.nullable(),
    sessions: z.array(sessionSchema),
  })
  .openapi('AttendanceToday');

export const dayStatusSchema = z.enum([
  'WORKED',
  'IN_PROGRESS',
  'MISSING',
  'MISSING_EXIT',
  'SICK',
  'NON_WORKING',
  'WEEKEND',
  'FUTURE',
  'NOT_STARTED',
  'BEFORE_JOIN',
]);

export const daySchema = z
  .object({
    date: z.string().openapi({ example: '2026-10-06' }),
    dayOfWeek: z.number().int().openapi({ description: '0 = ראשון ... 6 = שבת' }),
    status: dayStatusSchema,
    isGap: z.boolean().openapi({ description: 'true = חור בדיווח (MISSING / MISSING_EXIT) — לסמן באדום' }),
    workedMinutes: z.number().int(),
    dailySummary: z.string().nullable(),
    sessions: z.array(sessionSchema),
    nonWorkingDay: z
      .object({ type: z.enum(['HOLIDAY', 'VACATION', 'STUDY_DAY']), note: z.string().nullable() })
      .nullable(),
    sickNote: z.object({ id: z.number().int(), status: z.enum(['PENDING', 'APPROVED', 'REJECTED']) }).nullable(),
  })
  .openapi('CalendarDay');

export const calendarSchema = z
  .object({
    month: z.string().openapi({ example: '2026-10' }),
    totalWorkedMinutes: z.number().int(),
    gapCount: z.number().int(),
    days: z.array(daySchema),
  })
  .openapi('AttendanceCalendar');

export const teamRowSchema = daySchema
  .extend({ user: userSummarySchema, firstClockIn: z.string().nullable(), lastClockOut: z.string().nullable() })
  .openapi('TeamAttendanceRow');

export const teamNowSchema = z
  .object({
    user: userSummarySchema,
    state: z.enum(['NOT_STARTED', 'IN', 'PAUSED', 'ENDED']),
    location: locationSchema.nullable(),
    since: z.string().nullable().openapi({ description: 'מתי התחיל המצב הנוכחי' }),
    workedMinutesToday: z.number().int(),
  })
  .openapi('TeamMemberNow');
