import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { idParamSchema, z } from '../../common/zod';
import {
  createTaskSchema,
  listTasksQuerySchema,
  planQuerySchema,
  planSchema,
  taskSchema,
  updateTaskSchema,
} from './tasks.schemas';

export function registerTasksDocs(registry: OpenAPIRegistry) {
  const tag = 'Tasks — משימות (פרטי)';
  const privacy = 'המשימות **פרטיות** — כל משתמש רואה רק את שלו. גם ראש הצוות לא רואה משימות של עובדים.';

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/tasks',
    tag,
    summary: 'רשימת המשימות שלי — חיפוש, סינון ומיון',
    description: privacy,
    access: 'user',
    query: listTasksQuerySchema,
    success: { status: 200, description: 'המשימות', schema: z.array(taskSchema) },
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/tasks',
    tag,
    summary: 'הוספת משימה',
    description: 'אם לא נשלח `taskDate` — המשימה נוספת להיום.',
    access: 'user',
    body: createTaskSchema,
    success: { status: 201, description: 'המשימה נוצרה', schema: taskSchema },
  });

  documentEndpoint(registry, {
    method: 'patch',
    path: '/api/tasks/{id}',
    tag,
    summary: 'עריכת משימה / שינוי סטטוס',
    access: 'user',
    params: idParamSchema,
    body: updateTaskSchema,
    success: { status: 200, description: 'המשימה עודכנה', schema: taskSchema },
    errors: [404],
  });

  documentEndpoint(registry, {
    method: 'delete',
    path: '/api/tasks/{id}',
    tag,
    summary: 'מחיקת משימה',
    access: 'user',
    params: idParamSchema,
    success: { status: 204, description: 'נמחקה' },
    errors: [404],
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/tasks/{id}/carry-over',
    tag,
    summary: 'העברת משימה ליום העבודה הבא',
    description: 'מדלג על שישי-שבת. מעלה את `carriedOverCount` ב-1.',
    access: 'user',
    params: idParamSchema,
    success: { status: 200, description: 'המשימה הועברה', schema: taskSchema },
    errors: [404, 409],
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/tasks/plan',
    tag,
    summary: 'יועץ משימות — סדר מומלץ ואזהרת עומס',
    description:
      'ממיין את המשימות הפתוחות לפי עדיפות, מחשב את סך הזמן המשוער מול הזמן שנשאר ביום (8 שעות פחות מה שכבר עבדת), ' +
      'וממליץ אילו משימות להעביר למחר.',
    access: 'user',
    query: planQuerySchema,
    success: { status: 200, description: 'תכנון היום', schema: planSchema },
  });
}
