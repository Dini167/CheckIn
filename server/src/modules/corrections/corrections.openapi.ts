import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { idParamSchema, z } from '../../common/zod';
import {
  correctionSchema,
  createCorrectionSchema,
  quotaSchema,
  reviewSchema,
  teamCorrectionsQuerySchema,
} from './corrections.schemas';

export function registerCorrectionsDocs(registry: OpenAPIRegistry) {
  const tag = 'Corrections — תיקון שעות';

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/corrections/quota',
    tag,
    summary: 'כמה תיקונים עצמיים נשארו לי השבוע',
    description: 'עד 2 תיקונים בשבוע (ראשון–שבת). שינוי שעת כניסה = 1, שעת יציאה = 1.',
    access: 'user',
    success: { status: 200, description: 'מכסה', schema: quotaSchema },
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/corrections',
    tag,
    summary: 'תיקון שעות (עצמי או בקשה לאישור)',
    description:
      'אם נשארה מכסה — התיקון נכנס מיד (`kind: SELF, status: APPLIED`). ' +
      'אם לא — נוצרת בקשה לראש הצוות (`kind: REQUEST, status: PENDING`). ' +
      'לא ניתן לתקן חודש נעול (409 MONTH_LOCKED).',
    access: 'user',
    body: createCorrectionSchema,
    success: { status: 201, description: 'התיקון נקלט', schema: correctionSchema },
    errors: [404, 409],
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/corrections/mine',
    tag,
    summary: 'התיקונים והבקשות שלי',
    access: 'user',
    success: { status: 200, description: 'רשימה', schema: z.array(correctionSchema) },
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/corrections/team',
    tag,
    summary: 'בקשות ותיקונים של הצוות',
    description: '`?status=PENDING` = בקשות שממתינות לאישור. `?kind=SELF` = יומן תיקונים עצמיים.',
    access: 'leader',
    query: teamCorrectionsQuerySchema,
    success: { status: 200, description: 'רשימה', schema: z.array(correctionSchema) },
  });

  documentEndpoint(registry, {
    method: 'patch',
    path: '/api/corrections/{id}/review',
    tag,
    summary: 'אישור או דחייה של בקשת תיקון',
    access: 'leader',
    params: idParamSchema,
    body: reviewSchema,
    success: { status: 200, description: 'הבקשה טופלה', schema: correctionSchema },
    errors: [404, 409],
  });
}
