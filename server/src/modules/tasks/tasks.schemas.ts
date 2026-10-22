import { dateKeySchema, queryBoolean, z } from '../../common/zod';

export const taskStatusSchema = z
  .enum(['TODO', 'IN_PROGRESS', 'DONE'])
  .openapi({ description: 'TODO = לביצוע · IN_PROGRESS = בביצוע · DONE = הושלמה' });
export const taskPrioritySchema = z
  .enum(['LOW', 'MEDIUM', 'HIGH'])
  .openapi({ description: 'LOW = נמוכה · MEDIUM = בינונית · HIGH = גבוהה' });

const title = z.string().trim().min(1, 'יש להזין כותרת').max(120).openapi({ example: 'להכין דוח לקוח' });
const estimatedMinutes = z
  .number()
  .int('זמן משוער בדקות שלמות')
  .min(5, 'זמן משוער מינימלי: 5 דקות')
  .max(720, 'זמן משוער מקסימלי: 12 שעות')
  .openapi({ example: 60, description: 'זמן משוער בדקות' });

export const createTaskSchema = z
  .object({
    title,
    estimatedMinutes,
    priority: taskPrioritySchema.optional().openapi({ description: 'ברירת מחדל: MEDIUM' }),
    taskDate: dateKeySchema.optional().openapi({ description: 'ברירת מחדל: היום' }),
  })
  .openapi('CreateTask');

export const updateTaskSchema = z
  .object({
    title: title.optional(),
    estimatedMinutes: estimatedMinutes.optional(),
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'יש לשלוח לפחות שדה אחד לעדכון')
  .openapi('UpdateTask');

export const listTasksQuerySchema = z.object({
  date: dateKeySchema.optional().openapi({ description: 'ברירת מחדל: היום' }),
  allDates: queryBoolean.optional().openapi({ description: 'true = חיפוש בכל התאריכים (מתעלם מ-date)' }),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().trim().max(120).optional().openapi({ description: 'חיפוש בכותרת' }),
  sort: z.enum(['priority', 'createdAt', 'estimatedMinutes', 'title', 'taskDate']).default('priority'),
  order: z.enum(['asc', 'desc']).optional().openapi({ description: 'ברירת מחדל: desc לעדיפות, asc לשאר' }),
});

export const planQuerySchema = z.object({
  date: dateKeySchema.optional().openapi({ description: 'ברירת מחדל: היום' }),
});

export const taskSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    taskDate: z.string().openapi({ example: '2026-10-13' }),
    status: taskStatusSchema,
    priority: taskPrioritySchema,
    estimatedMinutes: z.number().int(),
    carriedOverCount: z.number().int().openapi({ description: 'כמה פעמים הועברה למחר' }),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('Task');

export const planSchema = z
  .object({
    date: z.string(),
    source: z.enum(['rules', 'ai']).openapi({ description: 'מי חישב את התכנון' }),
    tasks: z.array(taskSchema).openapi({ description: 'משימות פתוחות, ממוינות לפי סדר ביצוע מומלץ' }),
    totalMinutes: z.number().int(),
    availableMinutes: z.number().int().openapi({ description: 'הזמן שנשאר ביום העבודה' }),
    overloaded: z.boolean(),
    overloadMinutes: z.number().int(),
    suggestedToMove: z.array(z.number().int()).openapi({ description: 'מזהי משימות שמומלץ להעביר למחר' }),
    message: z.string().openapi({ example: 'יש לך 9.5 שעות משימות ונשארו 6 שעות. מומלץ להעביר 2 משימות בעדיפות נמוכה למחר.' }),
  })
  .openapi('TaskPlan');
