import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { idParamSchema, z } from '../../common/zod';
import {
  currentPulseSchema,
  myPulseSchema,
  myPulsesQuerySchema,
  redDotSchema,
  redDotsQuerySchema,
  respondSchema,
} from './pulses.schemas';

export function registerPulsesDocs(registry: OpenAPIRegistry) {
  const tag = 'Pulses — דופק';

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/pulses/current',
    tag,
    summary: 'האם יש בדיקת דופק פתוחה עכשיו?',
    description:
      'אתר ה-React שואל את הכתובת הזו כל 30–60 שניות בזמן שהעובד במשמרת. ' +
      'אם `pulse` אינו null — מציגים חלון עם השאלה וטיימר. ' +
      'בכל יום נקבעות 2 בדיקות בזמנים אקראיים בכניסה הראשונה (רק לעובדים, לא לראש צוות).',
    access: 'user',
    success: { status: 200, description: 'בדיקה פתוחה או null', schema: currentPulseSchema },
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/pulses/{id}/respond',
    tag,
    summary: 'מענה לבדיקת דופק (תוך 3 דקות)',
    access: 'user',
    params: idParamSchema,
    body: respondSchema,
    success: {
      status: 200,
      description: 'נענה בהצלחה',
      schema: z.object({ id: z.number(), status: z.literal('ANSWERED'), answeredAt: z.string() }),
    },
    errors: [404, 409, 410],
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/pulses/mine',
    tag,
    summary: 'הבדיקות שלי והתשובות שלי ביום מסוים',
    description: 'בדיקות עתידיות לא מוצגות (כדי שהזמן יישאר אקראי). התשובות גלויות רק לעובד עצמו.',
    access: 'user',
    query: myPulsesQuerySchema,
    success: { status: 200, description: 'הבדיקות', schema: z.array(myPulseSchema) },
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/pulses/red-dots',
    tag,
    summary: 'נקודות אדומות — עובדים שפספסו את שתי הבדיקות ביום',
    description: 'ראש הצוות **לא** רואה תשובות ולא רואה פספוס בודד — רק ימים שבהם כל הבדיקות פוספסו.',
    access: 'leader',
    query: redDotsQuerySchema,
    success: { status: 200, description: 'נקודות אדומות', schema: z.array(redDotSchema) },
  });
}
