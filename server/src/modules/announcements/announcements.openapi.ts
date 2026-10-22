import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { idParamSchema, z } from '../../common/zod';
import {
  announcementSchema,
  createAnnouncementSchema,
  listQuerySchema,
  updateAnnouncementSchema,
} from './announcements.schemas';

export function registerAnnouncementsDocs(registry: OpenAPIRegistry) {
  const tag = 'Announcements — הודעות לצוות';

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/announcements',
    tag,
    summary: 'הודעות פעילות לצוות שלי (לדף הבית)',
    access: 'user',
    query: listQuerySchema,
    success: { status: 200, description: 'הודעות, מהחדשה לישנה', schema: z.array(announcementSchema) },
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/announcements',
    tag,
    summary: 'הודעה חדשה לצוות',
    access: 'leader',
    body: createAnnouncementSchema,
    success: { status: 201, description: 'נוצרה', schema: announcementSchema },
  });

  documentEndpoint(registry, {
    method: 'patch',
    path: '/api/announcements/{id}',
    tag,
    summary: 'עריכת הודעה',
    access: 'leader',
    params: idParamSchema,
    body: updateAnnouncementSchema,
    success: { status: 200, description: 'עודכנה', schema: announcementSchema },
    errors: [404],
  });

  documentEndpoint(registry, {
    method: 'delete',
    path: '/api/announcements/{id}',
    tag,
    summary: 'מחיקת הודעה',
    access: 'leader',
    params: idParamSchema,
    success: { status: 204, description: 'נמחקה' },
    errors: [404],
  });
}
