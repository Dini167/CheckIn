import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { idParamSchema, z } from '../../common/zod';
import { createDaysSchema, dayDtoSchema, listQuerySchema, updateDaySchema } from './non-working-days.schemas';

export function registerNonWorkingDaysDocs(registry: OpenAPIRegistry) {
  const tag = 'Non-working days — ימים מיוחדים';

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/non-working-days',
    tag,
    summary: 'ימים בלי חובת עבודה בצוות שלי (חגים, חופשות, ימי עיון)',
    access: 'user',
    query: listQuerySchema,
    success: { status: 200, description: 'רשימה', schema: z.array(dayDtoSchema) },
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/non-working-days',
    tag,
    summary: 'סימון יום או טווח ימים',
    description: 'ימים אלה לא נחשבים חור בנוכחות. אם יום כבר מסומן — הוא מתעדכן.',
    access: 'leader',
    body: createDaysSchema,
    success: { status: 201, description: 'הימים שנשמרו', schema: z.array(dayDtoSchema) },
  });

  documentEndpoint(registry, {
    method: 'patch',
    path: '/api/non-working-days/{id}',
    tag,
    summary: 'עריכת יום מיוחד',
    access: 'leader',
    params: idParamSchema,
    body: updateDaySchema,
    success: { status: 200, description: 'עודכן', schema: dayDtoSchema },
    errors: [404],
  });

  documentEndpoint(registry, {
    method: 'delete',
    path: '/api/non-working-days/{id}',
    tag,
    summary: 'מחיקת יום מיוחד',
    access: 'leader',
    params: idParamSchema,
    success: { status: 204, description: 'נמחק' },
    errors: [404],
  });
}
