import { dateKeySchema, queryBoolean, userSummarySchema, z } from '../../common/zod';

const title = z.string().trim().min(2, 'כותרת קצרה מדי').max(100).openapi({ example: 'ישיבת צוות' });
const content = z.string().trim().min(2, 'תוכן קצר מדי').max(1000).openapi({ example: 'מחר ישיבת צוות ב-10:00 בחדר הישיבות.' });
const expiresAt = dateKeySchema.openapi({ description: 'אחרי התאריך הזה ההודעה לא מוצגת לעובדים' });

export const createAnnouncementSchema = z
  .object({ title, content, expiresAt: expiresAt.optional() })
  .openapi('CreateAnnouncement');

export const updateAnnouncementSchema = z
  .object({ title: title.optional(), content: content.optional(), expiresAt: expiresAt.nullable().optional() })
  .refine((v) => Object.keys(v).length > 0, 'יש לשלוח לפחות שדה אחד לעדכון')
  .openapi('UpdateAnnouncement');

export const listQuerySchema = z.object({
  all: queryBoolean.optional().openapi({ description: 'ראש צוות בלבד: true = גם הודעות שפג תוקפן' }),
});

export const announcementSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    content: z.string(),
    expiresAt: z.string().nullable(),
    isActive: z.boolean(),
    author: userSummarySchema,
    createdAt: z.string(),
  })
  .openapi('Announcement');
