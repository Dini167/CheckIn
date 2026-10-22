import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { idParamSchema, z } from '../../common/zod';
import { reviewSchema, sickNoteSchema, sickNoteUploadDocSchema, teamQuerySchema } from './sick-notes.schemas';

export function registerSickNotesDocs(registry: OpenAPIRegistry) {
  const tag = 'Sick notes — אישורי מחלה';

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/sick-notes',
    tag,
    summary: 'העלאת אישור מחלה',
    description:
      'נשלח כ-`multipart/form-data` (ב-React: `FormData`). שדה הקובץ נקרא `file`. ' +
      'ימי מחלה מאושרים לא נחשבים חור, ואינם בתשלום.',
    access: 'user',
    multipartBody: sickNoteUploadDocSchema,
    success: { status: 201, description: 'האישור הועלה וממתין לראש הצוות', schema: sickNoteSchema },
    errors: [413],
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/sick-notes/mine',
    tag,
    summary: 'אישורי המחלה שלי',
    access: 'user',
    success: { status: 200, description: 'רשימה (בלי תוכן הקובץ)', schema: z.array(sickNoteSchema) },
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/sick-notes/team',
    tag,
    summary: 'אישורי המחלה של הצוות',
    description: 'ממתינים ראשונים.',
    access: 'leader',
    query: teamQuerySchema,
    success: { status: 200, description: 'רשימה', schema: z.array(sickNoteSchema) },
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/sick-notes/{id}/file',
    tag,
    summary: 'צפייה בקובץ האישור',
    description: 'מותר לבעל האישור ולראש הצוות שלו בלבד.',
    access: 'user',
    params: idParamSchema,
    success: {
      status: 200,
      description: 'הקובץ עצמו',
      schema: z.string().openapi({ type: 'string', format: 'binary' }),
      contentType: 'application/octet-stream',
    },
    errors: [404],
  });

  documentEndpoint(registry, {
    method: 'patch',
    path: '/api/sick-notes/{id}/review',
    tag,
    summary: 'אישור או דחייה של אישור מחלה',
    access: 'leader',
    params: idParamSchema,
    body: reviewSchema,
    success: { status: 200, description: 'טופל', schema: sickNoteSchema },
    errors: [404, 409],
  });
}
