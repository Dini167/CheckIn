import { OpenAPIRegistry, OpenApiGeneratorV3, type RouteConfig } from '@asteasolutions/zod-to-openapi';
import type { ZodObject, ZodType } from 'zod';
import type { AppModule } from './module';
import { errorSchema } from './zod';

export const BEARER = 'bearerAuth';

type Access = 'public' | 'user' | 'leader';

const errorText: Record<number, string> = {
  400: 'נתונים לא תקינים (VALIDATION_ERROR) או פעולה לא חוקית',
  401: 'אין טוקן / טוקן לא תקין / פג תוקף (TOKEN_MISSING, TOKEN_INVALID, TOKEN_EXPIRED)',
  403: 'אין הרשאה — הפעולה מיועדת לראש צוות בלבד (FORBIDDEN)',
  404: 'לא נמצא, או שייך למשתמש אחר',
  409: 'התנגשות עם המצב הקיים',
  410: 'פג הזמן לביצוע הפעולה',
  413: 'הקובץ גדול מדי',
};

interface EndpointDoc {
  method: RouteConfig['method'];
  path: string;
  tag: string;
  summary: string;
  description?: string;
  access: Access;
  params?: ZodObject;
  query?: ZodObject;
  body?: ZodType;
  /** Multipart (file upload) body instead of JSON. */
  multipartBody?: ZodType;
  success: { status: number; description: string; schema?: ZodType; contentType?: string };
  errors?: number[];
}

/** Registers one endpoint with consistent auth notes and error responses. */
export function documentEndpoint(registry: OpenAPIRegistry, doc: EndpointDoc): void {
  const accessNote =
    doc.access === 'public'
      ? '🔓 פתוח — לא נדרש טוקן.'
      : doc.access === 'user'
        ? '🔑 נדרש Bearer Token של כל משתמש מחובר.'
        : '👑 נדרש Bearer Token של **ראש צוות**. עובד יקבל 403.';

  const errors = new Set(doc.errors ?? []);
  if (doc.body || doc.query || doc.params || doc.multipartBody) errors.add(400);
  if (doc.access !== 'public') errors.add(401);
  if (doc.access === 'leader') errors.add(403);

  const responses: RouteConfig['responses'] = {
    [doc.success.status]: {
      description: doc.success.description,
      ...(doc.success.schema
        ? { content: { [doc.success.contentType ?? 'application/json']: { schema: doc.success.schema } } }
        : {}),
    },
  };
  for (const status of [...errors].sort()) {
    responses[status] = {
      description: errorText[status] ?? 'שגיאה',
      content: { 'application/json': { schema: errorSchema } },
    };
  }

  registry.registerPath({
    method: doc.method,
    path: doc.path,
    tags: [doc.tag],
    summary: doc.summary,
    description: [accessNote, doc.description].filter(Boolean).join('\n\n'),
    ...(doc.access !== 'public' ? { security: [{ [BEARER]: [] }] } : {}),
    request: {
      ...(doc.params ? { params: doc.params } : {}),
      ...(doc.query ? { query: doc.query } : {}),
      ...(doc.body ? { body: { required: true, content: { 'application/json': { schema: doc.body } } } } : {}),
      ...(doc.multipartBody
        ? { body: { required: true, content: { 'multipart/form-data': { schema: doc.multipartBody } } } }
        : {}),
    },
    responses,
  });
}

export function buildOpenApiDocument(modules: AppModule[]) {
  const registry = new OpenAPIRegistry();
  registry.registerComponent('securitySchemes', BEARER, {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'הדביקו כאן את ה-token שהתקבל מ-POST /api/auth/login (בלי המילה Bearer).',
  });
  registry.register('Error', errorSchema);

  for (const m of modules) m.registerDocs?.(registry);

  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'נוכחות+ — API',
      version: '1.0.0',
      description: [
        'שרת למערכת תיקוף נוכחות, משימות אישיות וחישוב שכר.',
        '',
        '**איך מתחילים:** הריצו `POST /api/auth/login` עם משתמש הדגמה, העתיקו את `token`,',
        'לחצו על **Authorize** למעלה והדביקו אותו. מעכשיו כל הקריאות נשלחות עם הטוקן.',
        '',
        'משתמשי הדגמה (בסביבת פיתוח): `dana@example.com` (ראש צוות), `yossi@example.com` (עובד) — סיסמה `Password123`.',
      ].join('\n'),
    },
    servers: [{ url: '/', description: 'השרת הנוכחי' }],
  });
}
