import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { z } from '../../common/zod';
import { lockMonthSchema, monthLockSchema, monthQuerySchema, paySummarySchema, teamPayrollSchema } from './salary.schemas';

export function registerSalaryDocs(registry: OpenAPIRegistry) {
  const tag = 'Salary — שכר';
  const formula =
    'חישוב: שעות רגילות (עד 8 ביום) × שכר שעתי + שעות נוספות × שכר שעתי × 125%. ' +
    'ראש צוות מקבל בנוסף בונוס של 5% מסך שכר העובדים בצוות. ימי מחלה אינם בתשלום.';

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/salary/me',
    tag,
    summary: 'השכר שלי לחודש',
    description: formula,
    access: 'user',
    query: monthQuerySchema,
    success: { status: 200, description: 'סיכום שכר', schema: paySummarySchema },
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/salary/me/history',
    tag,
    summary: 'היסטוריית השכר שלי (עד 24 חודשים)',
    access: 'user',
    success: { status: 200, description: 'חודש לחודש, מהחדש לישן', schema: z.array(paySummarySchema) },
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/salary/team',
    tag,
    summary: 'דוח שכר צוותי',
    description: formula,
    access: 'leader',
    query: monthQuerySchema,
    success: { status: 200, description: 'שכר כל העובדים וסיכומים', schema: teamPayrollSchema },
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/salary/locks',
    tag,
    summary: 'נעילת חודש (סגירת חודש קלנדרי)',
    description:
      'רק חודש שהסתיים. אחרי הנעילה אי אפשר לתקן שעות באותו חודש, והשכר נשמר קבוע גם אם השכר השעתי ישתנה.',
    access: 'leader',
    body: lockMonthSchema,
    success: { status: 201, description: 'החודש ננעל — מוחזר הדוח הסופי', schema: teamPayrollSchema },
    errors: [409],
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/salary/locks',
    tag,
    summary: 'חודשים נעולים',
    access: 'leader',
    success: { status: 200, description: 'רשימה', schema: z.array(monthLockSchema) },
  });
}
