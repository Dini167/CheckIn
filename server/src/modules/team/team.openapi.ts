import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { documentEndpoint } from '../../common/openapi';
import { idParamSchema, z } from '../../common/zod';
import { salarySchema, membersQuerySchema, teamMemberSchema, teamSchema } from './team.schemas';

export function registerTeamDocs(registry: OpenAPIRegistry) {
  const tag = 'Team — צוות';

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/team',
    tag,
    summary: 'פרטי הצוות שלי',
    description: 'ראש הצוות מקבל גם את `joinCode` כדי לשלוח לעובדים חדשים.',
    access: 'user',
    success: { status: 200, description: 'פרטי הצוות', schema: teamSchema },
    errors: [404],
  });

  documentEndpoint(registry, {
    method: 'get',
    path: '/api/team/members',
    tag,
    summary: 'רשימת עובדי הצוות',
    description: 'עובדים בלי שכר שעתי מופיעים ראשונים (`salaryMissing: true`).',
    access: 'leader',
    query: membersQuerySchema,
    success: { status: 200, description: 'רשימת העובדים', schema: z.array(teamMemberSchema) },
  });

  documentEndpoint(registry, {
    method: 'patch',
    path: '/api/team/members/{id}/salary',
    tag,
    summary: 'עדכון שכר שעתי של עובד בצוות (או של ראש הצוות עצמו)',
    access: 'leader',
    params: idParamSchema,
    body: salarySchema,
    success: {
      status: 200,
      description: 'השכר עודכן',
      schema: z.object({ id: z.number(), name: z.string(), salary: z.number() }),
    },
    errors: [404],
  });
}
