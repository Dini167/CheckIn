import { queryBoolean, userSummarySchema, z } from '../../common/zod';

export const teamSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    name: z.string().openapi({ example: 'צוות פיתוח' }),
    leader: userSummarySchema,
    memberCount: z.number().int().openapi({ example: 4 }),
    joinCode: z.string().optional().openapi({ example: 'TEAM-DEMO1', description: 'מוחזר רק לראש הצוות' }),
  })
  .openapi('Team');

export const teamMemberSchema = z
  .object({
    id: z.number().int().openapi({ example: 2 }),
    name: z.string().openapi({ example: 'יוסי לוי' }),
    email: z.string().openapi({ example: 'yossi@example.com' }),
    role: z.enum(['EMPLOYEE', 'TEAM_LEADER']),
    salary: z.number().nullable().openapi({ example: 55 }),
    salaryMissing: z.boolean().openapi({ example: false, description: 'true = עובד חדש שעדיין לא נקבע לו שכר' }),
    joinedAt: z.string().openapi({ example: '2026-09-01T08:00:00.000Z' }),
  })
  .openapi('TeamMember');

export const membersQuerySchema = z.object({
  missingSalary: queryBoolean.optional().openapi({ description: 'true = רק עובדים בלי שכר שעתי' }),
});

export const salarySchema = z
  .object({
    salary: z.number().min(0, 'שכר לא יכול להיות שלילי').max(10000).openapi({ example: 60 }),
  })
  .openapi('UpdateSalary');
