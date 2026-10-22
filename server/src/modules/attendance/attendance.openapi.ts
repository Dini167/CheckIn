import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { z } from '../../common/zod';
import {
  calendarSchema,
  clockInSchema,
  clockOutSchema,
  dayStatusSchema,
  monthQuerySchema,
  pauseSchema,
  sessionSchema,
  teamAttendanceQuerySchema,
  teamNowSchema,
  teamRowSchema,
  todaySchema,
} from './attendance.schemas';

export function registerAttendanceDocs(registry: OpenAPIRegistry) {
  const tag = 'Attendance — נוכחות';
  const timeNote = 'השעה נלקחת **משעון השרת בלבד** — הלקוח לא שולח שעה.';

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/attendance/today',
    tag,
    summary: 'מצב הנוכחות שלי היום (לכפתורי כניסה/יציאה)',
    access: 'user',
    success: { status: 200, description: 'מצב נוכחי', schema: todaySchema },
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/attendance/clock-in',
    tag,
    summary: 'כניסה (גם "חזרה" אחרי עצירה זמנית או השלמה בערב)',
    description: timeNote,
    access: 'user',
    body: clockInSchema,
    success: { status: 201, description: 'נרשמה כניסה', schema: sessionSchema },
    errors: [409],
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/attendance/pause',
    tag,
    summary: 'עצירה זמנית (זמינות חלקית) — עוצר את ספירת השעות',
    description: `${timeNote} לחזרה — שולחים שוב clock-in.`,
    access: 'user',
    body: pauseSchema,
    success: { status: 200, description: 'נרשמה עצירה', schema: sessionSchema },
    errors: [409],
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/attendance/clock-out',
    tag,
    summary: 'יציאה + סיכום יומי (עד 2 שורות)',
    description: `${timeNote} אפשר לצאת גם ממצב עצירה זמנית.`,
    access: 'user',
    body: clockOutSchema,
    success: { status: 200, description: 'נרשמה יציאה', schema: sessionSchema },
    errors: [409],
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/attendance/calendar',
    tag,
    summary: 'לוח שנה חודשי — סטטוס לכל יום',
    description:
      'מתאים ללוח שנה (react-calendar) או לרשימה. סטטוסים: ' +
      'WORKED דווח · IN_PROGRESS במשמרת עכשיו · MISSING חסר · MISSING_EXIT חסרה יציאה · SICK מחלה מאושרת · ' +
      'NON_WORKING חג/חופשה/יום עיון · WEEKEND שישי-שבת · FUTURE עתידי · NOT_STARTED היום, עוד לא נכנס · BEFORE_JOIN לפני ההרשמה.',
    access: 'user',
    query: monthQuerySchema,
    success: { status: 200, description: 'ימי החודש', schema: calendarSchema },
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/attendance/missing',
    tag,
    summary: 'חורים בדיווח בחודש (התרעה חכמה)',
    access: 'user',
    query: monthQuerySchema,
    success: {
      status: 200,
      description: 'ימים עם חור',
      schema: z.array(z.object({ date: z.string(), status: dayStatusSchema })),
    },
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/attendance/team',
    tag,
    summary: 'נוכחות צוותית — חיפוש, סינון ומיון',
    description:
      'שורה לכל עובד ולכל יום עבודה בטווח (כולל ימים חסרים). כולל סיכומים יומיים. ' +
      'ראש הצוות רואה רק את הצוות שלו. טווח מקסימלי: 62 ימים.',
    access: 'leader',
    query: teamAttendanceQuerySchema,
    success: { status: 200, description: 'שורות נוכחות', schema: z.array(teamRowSchema) },
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/attendance/team/now',
    tag,
    summary: 'מי במשמרת עכשיו',
    access: 'leader',
    success: { status: 200, description: 'מצב כל עובד', schema: z.array(teamNowSchema) },
  });
}
