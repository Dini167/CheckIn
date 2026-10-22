import { beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/common/prisma';
import { MON, SUN, TUE, WED, addSession, api, createEmployee, createLeader, resetDb, travelTo, type TestUser } from './helpers';

let leader: TestUser;
let employee: TestUser;

beforeEach(async () => {
  await resetDb();
  leader = await createLeader();
  employee = await createEmployee(leader.joinCode!);
  travelTo(WED, '10:00');
});

const correct = (user: TestUser, body: object) => api().post('/api/corrections').set(user.auth).send(body);

describe('corrections — weekly self-service quota', () => {
  it('two self-corrections apply immediately; the third becomes a request', async () => {
    const s1 = await addSession(employee.id, SUN, '09:00', null);
    const s2 = await addSession(employee.id, MON, '09:30', '17:00');

    const first = await correct(employee, { workDate: SUN, sessionId: s1.id, newClockOut: '17:00', reason: 'שכחתי' }).expect(201);
    expect(first.body).toMatchObject({ kind: 'SELF', status: 'APPLIED', units: 1, newClockOutTime: '17:00' });

    await correct(employee, { workDate: MON, sessionId: s2.id, newClockIn: '09:00', reason: 'איחור שגוי' }).expect(201);
    const quota = await api().get('/api/corrections/quota').set(employee.auth).expect(200);
    expect(quota.body).toMatchObject({ limit: 2, used: 2, remaining: 0, weekStart: SUN });

    const third = await correct(employee, { workDate: MON, sessionId: s2.id, newClockOut: '18:00', reason: 'נשארתי' }).expect(201);
    expect(third.body).toMatchObject({ kind: 'REQUEST', status: 'PENDING' });

    const sunday = await prisma.attendanceSession.findUniqueOrThrow({ where: { id: s1.id } });
    expect(sunday.isManual).toBe(true);
    expect(sunday.endType).toBe('END_OF_DAY');
    const monday = await prisma.attendanceSession.findUniqueOrThrow({ where: { id: s2.id } });
    expect(monday.clockOut?.toISOString()).toBe('2030-01-07T15:00:00.000Z'); // still 17:00 — request not applied yet
  });

  it('adding a missing day needs both times and costs 2', async () => {
    await correct(employee, { workDate: MON, newClockIn: '09:00', reason: 'חסר' }).expect(400);
    const res = await correct(employee, { workDate: MON, newClockIn: '09:00', newClockOut: '17:00', location: 'HOME', reason: 'חסר' }).expect(201);
    expect(res.body).toMatchObject({ kind: 'SELF', units: 2 });
    const session = await prisma.attendanceSession.findFirstOrThrow({ where: { userId: employee.id } });
    expect(session).toMatchObject({ location: 'HOME', isManual: true });
  });

  it('rejects future times, reversed times and overlaps', async () => {
    await correct(employee, { workDate: '2030-01-20', newClockIn: '09:00', newClockOut: '17:00', reason: 'עתיד' }).expect(400);
    await correct(employee, { workDate: MON, newClockIn: '17:00', newClockOut: '09:00', reason: 'הפוך' }).expect(400);
    await addSession(employee.id, MON, '09:00', '12:00');
    const overlap = await correct(employee, { workDate: MON, newClockIn: '11:00', newClockOut: '13:00', reason: 'חפיפה' }).expect(409);
    expect(overlap.body.error.code).toBe('OVERLAP');
  });

  it("cannot correct someone else's session", async () => {
    const other = await createEmployee(leader.joinCode!);
    const s = await addSession(other.id, MON, '09:00', null);
    await correct(employee, { workDate: MON, sessionId: s.id, newClockOut: '17:00', reason: 'ניסיון' }).expect(404);
  });

  it('team leaders have no limit', async () => {
    for (const day of [SUN, MON, TUE]) {
      const res = await correct(leader, { workDate: day, newClockIn: '09:00', newClockOut: '17:00', reason: 'השלמה' }).expect(201);
      expect(res.body.status).toBe('APPLIED');
    }
  });
});

describe('corrections — leader review', () => {
  async function makePendingRequest() {
    const s = await addSession(employee.id, MON, '09:00', null);
    await correct(employee, { workDate: SUN, newClockIn: '09:00', newClockOut: '17:00', reason: 'השלמה' }); // uses 2
    const res = await correct(employee, { workDate: MON, sessionId: s.id, newClockOut: '17:30', reason: 'שכחתי' }).expect(201);
    return { session: s, request: res.body };
  }

  it('approval applies the change; a second review is rejected', async () => {
    const { session, request } = await makePendingRequest();

    const pending = await api().get('/api/corrections/team?status=PENDING').set(leader.auth).expect(200);
    expect(pending.body.map((c: { id: number }) => c.id)).toEqual([request.id]);

    const res = await api().patch(`/api/corrections/${request.id}/review`).set(leader.auth).send({ decision: 'APPROVED' }).expect(200);
    expect(res.body).toMatchObject({ status: 'APPROVED', reviewedBy: { id: leader.id } });
    const updated = await prisma.attendanceSession.findUniqueOrThrow({ where: { id: session.id } });
    expect(updated.clockOut?.toISOString()).toBe('2030-01-07T15:30:00.000Z');

    await api().patch(`/api/corrections/${request.id}/review`).set(leader.auth).send({ decision: 'REJECTED' }).expect(409);
  });

  it('employees cannot review (403) and other team leaders cannot see the request (404)', async () => {
    const { request } = await makePendingRequest();
    await api().patch(`/api/corrections/${request.id}/review`).set(employee.auth).send({ decision: 'APPROVED' }).expect(403);
    const otherLeader = await createLeader(70, 'אחר');
    await api().patch(`/api/corrections/${request.id}/review`).set(otherLeader.auth).send({ decision: 'APPROVED' }).expect(404);
  });

  it('a locked month cannot be corrected', async () => {
    await prisma.monthLock.create({ data: { teamId: leader.teamId, year: 2030, month: 1, lockedById: leader.id } });
    const res = await correct(employee, { workDate: MON, newClockIn: '09:00', newClockOut: '17:00', reason: 'נעול' }).expect(409);
    expect(res.body.error.code).toBe('MONTH_LOCKED');
  });
});
