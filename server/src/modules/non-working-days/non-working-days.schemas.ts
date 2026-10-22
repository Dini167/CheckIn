import { dateKeySchema, monthKeySchema, z } from '../../common/zod';

export const dayTypeSchema = z
  .enum(['HOLIDAY', 'VACATION', 'STUDY_DAY'])
  .openapi({ description: 'HOLIDAY = חג · VACATION = חופשה מרוכזת · STUDY_DAY = יום עיון' });

const note = z.string().trim().max(200).optional().openapi({ example: 'ראש השנה' });

export const createDaysSchema = z
  .object({
    fromDate: dateKeySchema,
    toDate: dateKeySchema.optional().openapi({ description: 'לטווח ימים. בלי toDate = יום אחד' }),
    type: dayTypeSchema,
    note,
  })
  .refine((v) => !v.toDate || v.toDate >= v.fromDate, { message: 'תאריך הסיום לפני תאריך ההתחלה', path: ['toDate'] })
  .openapi('CreateNonWorkingDays');

export const updateDaySchema = z
  .object({ type: dayTypeSchema.optional(), note: note.nullable() })
  .refine((v) => Object.keys(v).length > 0, 'יש לשלוח לפחות שדה אחד לעדכון')
  .openapi('UpdateNonWorkingDay');

export const listQuerySchema = z.object({
  month: monthKeySchema.optional().openapi({ description: 'ברירת מחדל: החודש הנוכחי' }),
});

export const dayDtoSchema = z
  .object({
    id: z.number().int(),
    date: z.string().openapi({ example: '2026-09-22' }),
    type: dayTypeSchema,
    note: z.string().nullable(),
  })
  .openapi('NonWorkingDay');
