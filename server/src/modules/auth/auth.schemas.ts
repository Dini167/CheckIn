import { z } from '../../common/zod';

const name = z.string().trim().min(2, 'שם חייב להכיל לפחות 2 תווים').max(80).openapi({ example: 'נועה כהן' });
const email = z
  .email('כתובת אימייל לא תקינה')
  .trim()
  .toLowerCase()
  .max(120)
  .openapi({ example: 'noa@example.com' });
const password = z
  .string()
  .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
  .max(72)
  .regex(/[A-Za-z]/, 'סיסמה חייבת להכיל לפחות אות אחת באנגלית')
  .regex(/\d/, 'סיסמה חייבת להכיל לפחות ספרה אחת')
  .openapi({ example: 'Password123' });

export const registerLeaderSchema = z
  .object({
    role: z.literal('TEAM_LEADER'),
    name,
    email,
    password,
    teamName: z.string().trim().min(2).max(80).openapi({ example: 'צוות פיתוח' }),
    salary: z.number().min(0).max(10000).openapi({ example: 75, description: 'שכר שעתי' }),
  })
  .openapi('RegisterTeamLeader');

export const registerEmployeeSchema = z
  .object({
    role: z.literal('EMPLOYEE'),
    name,
    email,
    password,
    joinCode: z.string().trim().toUpperCase().min(4).max(20).openapi({ example: 'TEAM-DEMO1' }),
  })
  .openapi('RegisterEmployee', {
    description: 'לעובד אין שדה שכר — כל salary שיישלח יתעלם.',
  });

export const registerSchema = z.discriminatedUnion('role', [registerLeaderSchema, registerEmployeeSchema]);

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, 'יש להזין סיסמה').openapi({ example: 'Password123' }),
  })
  .openapi('LoginRequest');

export const teamInfoSchema = z
  .object({
    id: z.number().int().openapi({ example: 1 }),
    name: z.string().openapi({ example: 'צוות פיתוח' }),
    joinCode: z.string().optional().openapi({ example: 'TEAM-DEMO1', description: 'מוחזר רק לראש הצוות' }),
  })
  .openapi('TeamInfo');

export const publicUserSchema = z
  .object({
    id: z.number().int().openapi({ example: 2 }),
    name: z.string().openapi({ example: 'יוסי לוי' }),
    email: z.string().openapi({ example: 'yossi@example.com' }),
    role: z.enum(['EMPLOYEE', 'TEAM_LEADER']),
    salary: z.number().nullable().openapi({ example: 55, description: 'שכר שעתי. null = טרם נקבע ע"י ראש הצוות' }),
    team: teamInfoSchema.nullable(),
  })
  .openapi('User');

export const authResponseSchema = z
  .object({
    token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    user: publicUserSchema,
  })
  .openapi('AuthResponse');

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
