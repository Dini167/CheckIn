import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { authResponseSchema, loginSchema, publicUserSchema, registerSchema } from './auth.schemas';

export function registerAuthDocs(registry: OpenAPIRegistry) {
  const tag = 'Auth — התחברות';

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/auth/register',
    tag,
    summary: 'הרשמה',
    description:
      'ראש צוות: `role: "TEAM_LEADER"` + `teamName` + `salary` (שכר שעתי) → נוצר צוות חדש עם קוד הצטרפות.\n\n' +
      'עובד: `role: "EMPLOYEE"` + `joinCode` → מצטרף לצוות. לעובד אין שדה שכר.',
    access: 'public',
    body: registerSchema,
    success: { status: 201, description: 'נרשם בהצלחה — מוחזר טוקן', schema: authResponseSchema },
    errors: [404, 409],
  });

  documentEndpoint(registry, {
    method: 'post',
    path: '/api/auth/login',
    tag,
    summary: 'התחברות וקבלת JWT',
    description: 'מחזיר `token` — יש להדביק אותו בכפתור **Authorize**.',
    access: 'public',
    body: loginSchema,
    success: { status: 200, description: 'התחברות הצליחה', schema: authResponseSchema },
    errors: [401],
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/auth/me',
    tag,
    summary: 'פרטי המשתמש המחובר',
    access: 'user',
    success: { status: 200, description: 'פרטי המשתמש והצוות', schema: publicUserSchema },
  });
}
