import { monthKeySchema, userSummarySchema, z } from '../../common/zod';

export const monthQuerySchema = z.object({
  month: monthKeySchema.optional().openapi({ description: 'ברירת מחדל: החודש הנוכחי' }),
});

export const lockMonthSchema = z.object({ month: monthKeySchema }).openapi('LockMonthRequest');

const money = (example: number) => z.number().nullable().openapi({ example, description: 'null = השכר השעתי עוד לא נקבע' });

export const paySummarySchema = z
  .object({
    month: z.string().openapi({ example: '2026-10' }),
    salary: z.number().nullable().openapi({ example: 55, description: 'שכר שעתי' }),
    salaryMissing: z.boolean().openapi({ description: 'true = להציג "נתוני השכר עדיין לא זמינים"' }),
    workedDays: z.number().int().openapi({ example: 9 }),
    regularHours: z.number().openapi({ example: 70.5 }),
    overtimeHours: z.number().openapi({ example: 3.25 }),
    basePay: money(3877.5),
    overtimePay: money(223.44),
    bonus: money(0).openapi({ description: 'בונוס ראש צוות (5% משכר העובדים). לעובד תמיד 0' }),
    total: money(4100.94),
    isLocked: z.boolean().openapi({ description: 'true = חודש נעול, הסכום סופי' }),
    isCurrentMonth: z.boolean(),
  })
  .openapi('PaySummary');

export const teamPayrollSchema = z
  .object({
    month: z.string(),
    isLocked: z.boolean(),
    members: z.array(paySummarySchema.extend({ user: userSummarySchema, role: z.enum(['EMPLOYEE', 'TEAM_LEADER']) })),
    employeesTotal: z.number().openapi({ description: 'סה"כ שכר העובדים' }),
    leaderBonus: z.number().openapi({ description: '5% מסה"כ שכר העובדים' }),
    teamTotal: z.number().openapi({ description: 'סה"כ כולל ראש הצוות' }),
    membersMissingSalary: z.number().int(),
  })
  .openapi('TeamPayroll');

export const monthLockSchema = z
  .object({
    month: z.string().openapi({ example: '2026-09' }),
    lockedAt: z.string(),
    lockedBy: userSummarySchema,
  })
  .openapi('MonthLock');
