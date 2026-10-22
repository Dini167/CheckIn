import { dateKeySchema, userSummarySchema, z } from '../../common/zod';

export const createSickNoteSchema = z
  .object({
    fromDate: dateKeySchema,
    toDate: dateKeySchema,
    note: z.string().trim().max(300).optional().openapi({ example: 'שפעת' }),
  })
  .refine((v) => v.toDate >= v.fromDate, { message: 'תאריך הסיום לפני תאריך ההתחלה', path: ['toDate'] });

/** For Swagger only: the multipart form, including the file. */
export const sickNoteUploadDocSchema = z
  .object({
    file: z.string().openapi({ type: 'string', format: 'binary', description: 'JPG / PNG / PDF עד 5MB' }),
    fromDate: z.string().openapi({ example: '2026-10-11' }),
    toDate: z.string().openapi({ example: '2026-10-12' }),
    note: z.string().optional().openapi({ example: 'שפעת' }),
  })
  .openapi('SickNoteUpload');

export const reviewSchema = z.object({ decision: z.enum(['APPROVED', 'REJECTED']) }).openapi('SickNoteReview');

export const teamQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export const sickNoteSchema = z
  .object({
    id: z.number().int(),
    user: userSummarySchema,
    fromDate: z.string().openapi({ example: '2026-10-11' }),
    toDate: z.string().openapi({ example: '2026-10-12' }),
    days: z.number().int().openapi({ example: 2 }),
    note: z.string().nullable(),
    fileName: z.string().openapi({ example: 'sick-note.pdf' }),
    mimeType: z.string().openapi({ example: 'application/pdf' }),
    fileSize: z.number().int(),
    fileUrl: z.string().openapi({ example: '/api/sick-notes/3/file', description: 'צפייה בקובץ — דורש Bearer Token' }),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    reviewedBy: userSummarySchema.nullable(),
    reviewedAt: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi('SickNote');
