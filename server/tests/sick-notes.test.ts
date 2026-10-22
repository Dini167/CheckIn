import { beforeEach, describe, expect, it } from 'vitest';
import { MON, TUE, api, backdateJoin, createEmployee, createLeader, resetDb, travelTo, type TestUser } from './helpers';

let leader: TestUser;
let employee: TestUser;

const PDF = Buffer.from('%PDF-1.4\n% test file\n%%EOF\n', 'latin1');
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

beforeEach(async () => {
  await resetDb();
  leader = await createLeader();
  employee = await createEmployee(leader.joinCode!);
  await backdateJoin(employee.id);
  travelTo(TUE, '10:00');
});

const upload = (user: TestUser, file: Buffer, filename: string, contentType: string, from = MON, to = MON) =>
  api()
    .post('/api/sick-notes')
    .set(user.auth)
    .field('fromDate', from)
    .field('toDate', to)
    .field('note', 'שפעת')
    .attach('file', file, { filename, contentType });

describe('sick notes', () => {
  it('uploads a PDF; the leader approves it and the day is no longer a gap', async () => {
    const created = await upload(employee, PDF, 'אישור.pdf', 'application/pdf').expect(201);
    expect(created.body).toMatchObject({ status: 'PENDING', days: 1, mimeType: 'application/pdf', fileName: 'אישור.pdf' });
    expect(created.body).not.toHaveProperty('fileData');

    let calendar = await api().get('/api/attendance/calendar?month=2030-01').set(employee.auth);
    expect(calendar.body.days.find((d: { date: string }) => d.date === MON).status).toBe('MISSING');

    const team = await api().get('/api/sick-notes/team?status=PENDING').set(leader.auth).expect(200);
    expect(team.body).toHaveLength(1);

    await api().patch(`/api/sick-notes/${created.body.id}/review`).set(leader.auth).send({ decision: 'APPROVED' }).expect(200);
    await api().patch(`/api/sick-notes/${created.body.id}/review`).set(leader.auth).send({ decision: 'REJECTED' }).expect(409);

    calendar = await api().get('/api/attendance/calendar?month=2030-01').set(employee.auth);
    expect(calendar.body.days.find((d: { date: string }) => d.date === MON).status).toBe('SICK');
  });

  it('accepts PNG and rejects other types or fake content', async () => {
    await upload(employee, PNG, 'scan.png', 'image/png').expect(201);
    await upload(employee, Buffer.from('hello'), 'note.txt', 'text/plain').expect(400);
    const fake = await upload(employee, Buffer.from('not really a pdf'), 'fake.pdf', 'application/pdf').expect(400);
    expect(fake.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('requires a file and a valid date range', async () => {
    await api().post('/api/sick-notes').set(employee.auth).field('fromDate', MON).field('toDate', MON).expect(400);
    await upload(employee, PDF, 'a.pdf', 'application/pdf', TUE, MON).expect(400);
  });

  it('rejects files over 5MB with 413', async () => {
    const big = Buffer.concat([PDF, Buffer.alloc(5 * 1024 * 1024 + 10)]);
    const res = await upload(employee, big, 'big.pdf', 'application/pdf').expect(413);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });

  it('only the owner and their team leader can open the file', async () => {
    const { body } = await upload(employee, PDF, 'a.pdf', 'application/pdf');
    const own = await api().get(`/api/sick-notes/${body.id}/file`).set(employee.auth).expect(200);
    expect(own.headers['content-type']).toContain('application/pdf');
    expect(Buffer.from(own.body).subarray(0, 5).toString()).toBe('%PDF-');

    await api().get(`/api/sick-notes/${body.id}/file`).set(leader.auth).expect(200);

    const colleague = await createEmployee(leader.joinCode!);
    await api().get(`/api/sick-notes/${body.id}/file`).set(colleague.auth).expect(404);
    const otherLeader = await createLeader(70, 'אחר');
    await api().get(`/api/sick-notes/${body.id}/file`).set(otherLeader.auth).expect(404);
    await api().patch(`/api/sick-notes/${body.id}/review`).set(otherLeader.auth).send({ decision: 'APPROVED' }).expect(404);
    await api().patch(`/api/sick-notes/${body.id}/review`).set(employee.auth).send({ decision: 'APPROVED' }).expect(403);
  });
});
