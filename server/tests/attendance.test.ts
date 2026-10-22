import { beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '../src/common/prisma';
import {
  MON,
  SUN,
  THU,
  TUE,
  WED,
  addSession,
  api,
  backdateJoin,
  createEmployee,
  createLeader,
  resetDb,
  travelTo,
  type TestUser,
} from './helpers';

let leader: TestUser;
let employee: TestUser;

beforeEach(async () => {
  await resetDb();
  leader = await createLeader();
  employee = await createEmployee(leader.joinCode!, 'יוסי');
  await backdateJoin(employee.id);
});

describe('attendance — clock in / pause / clock out', () => {
  it('uses the server clock, not a time sent by the client', async () => {
    const serverTime = travelTo(MON, '09:00');
    const res = await api()
      .post('/api/attendance/clock-in')
      .set(employee.auth)
      .send({ location: 'HOME', clockIn: '2020-01-01T00:00:00Z' })
      .expect(201);
    expect(res.body.clockIn).toBe(serverTime.toISOString());
    expect(res.body.clockInTime).toBe('09:00');
    expect(res.body.location).toBe('HOME');
  });

  it('full day: in → pause → back in → out with a 2-line summary', async () => {
    travelTo(MON, '09:00');
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'OFFICE' }).expect(201);
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'OFFICE' }).expect(409);

    travelTo(MON, '12:00');
    await api().post('/api/attendance/pause').set(employee.auth).send({}).expect(200);
    let today = await api().get('/api/attendance/today').set(employee.auth).expect(200);
    expect(today.body.state).toBe('PAUSED');
    expect(today.body.workedMinutes).toBe(180);

    travelTo(MON, '19:00');
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'HOME' }).expect(201);
    travelTo(MON, '21:00');
    await api()
      .post('/api/attendance/clock-out')
      .set(employee.auth)
      .send({ dailySummary: 'שורה ראשונה\nשורה שנייה' })
      .expect(200);

    today = await api().get('/api/attendance/today').set(employee.auth).expect(200);
    expect(today.body.state).toBe('ENDED');
    expect(today.body.workedMinutes).toBe(300);
    expect(today.body.sessions).toHaveLength(2);
  });

  it('clock-out requires a summary of at most 2 lines, and an open shift', async () => {
    travelTo(MON, '17:00');
    await api().post('/api/attendance/clock-out').set(employee.auth).send({ dailySummary: 'סיכום' }).expect(409);

    travelTo(MON, '09:00');
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'OFFICE' });
    const empty = await api().post('/api/attendance/clock-out').set(employee.auth).send({}).expect(400);
    expect(empty.body.error.code).toBe('VALIDATION_ERROR');
    await api()
      .post('/api/attendance/clock-out')
      .set(employee.auth)
      .send({ dailySummary: 'א\nב\nג' })
      .expect(400);
  });

  it('rejects an invalid location', async () => {
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'BEACH' }).expect(400);
  });
});

describe('attendance — calendar and gaps', () => {
  it('marks worked, missing, missing-exit, holiday, sick and weekend days', async () => {
    await addSession(employee.id, SUN, '09:00', '17:00');
    await addSession(employee.id, TUE, '09:00', null); // forgot to clock out
    await prisma.nonWorkingDay.create({ data: { teamId: leader.teamId, date: new Date(`${WED}T00:00:00Z`), type: 'HOLIDAY' } });
    await prisma.sickNote.create({
      data: {
        userId: employee.id,
        fromDate: new Date(`${THU}T00:00:00Z`),
        toDate: new Date(`${THU}T00:00:00Z`),
        fileName: 'a.pdf',
        mimeType: 'application/pdf',
        fileData: new Uint8Array(Buffer.from('%PDF-1.4')),
        status: 'APPROVED',
      },
    });

    travelTo('2030-01-14', '10:00');
    const res = await api().get('/api/attendance/calendar?month=2030-01').set(employee.auth).expect(200);
    const status = (d: string) => res.body.days.find((x: { date: string }) => x.date === d).status;

    expect(res.body.days).toHaveLength(31);
    expect(status(SUN)).toBe('WORKED');
    expect(status(MON)).toBe('MISSING');
    expect(status(TUE)).toBe('MISSING_EXIT');
    expect(status(WED)).toBe('NON_WORKING');
    expect(status(THU)).toBe('SICK');
    expect(status('2030-01-11')).toBe('WEEKEND');
    expect(status('2030-01-14')).toBe('NOT_STARTED');
    expect(status('2030-01-20')).toBe('FUTURE');

    const missing = await api().get('/api/attendance/missing?month=2030-01').set(employee.auth).expect(200);
    const missingDays = missing.body.map((m: { date: string }) => m.date);
    expect(missingDays).toContain(MON);
    expect(missingDays).toContain(TUE);
    expect(missingDays).not.toContain(WED);
    expect(missingDays).not.toContain(THU);
  });

  it('rejects a malformed month', async () => {
    await api().get('/api/attendance/calendar?month=2030-13').set(employee.auth).expect(400);
  });
});

describe('attendance — team view (leader only)', () => {
  it('employees get 403', async () => {
    await api().get('/api/attendance/team').set(employee.auth).expect(403);
    await api().get('/api/attendance/team/now').set(employee.auth).expect(403);
  });

  it('shows summaries, supports search, location filter and sorting', async () => {
    const noa = await createEmployee(leader.joinCode!, 'נועה');
    await backdateJoin(noa.id);
    await addSession(employee.id, MON, '10:00', '18:00', 'HOME');
    await addSession(noa.id, MON, '08:00', '17:30', 'OFFICE');

    travelTo(TUE, '10:00');
    const all = await api().get(`/api/attendance/team?from=${MON}&to=${MON}&sort=clockIn`).set(leader.auth).expect(200);
    expect(all.body.map((r: { user: { name: string } }) => r.user.name)).toEqual(['נועה', 'יוסי']);
    expect(all.body[0].dailySummary).toBe('סיכום');

    const home = await api().get(`/api/attendance/team?from=${MON}&location=HOME`).set(leader.auth).expect(200);
    expect(home.body).toHaveLength(1);
    expect(home.body[0].user.name).toBe('יוסי');

    const search = await api().get(`/api/attendance/team?from=${MON}&search=נוע`).set(leader.auth).expect(200);
    expect(search.body).toHaveLength(1);
    expect(search.body[0].user.id).toBe(noa.id);

    const byHours = await api()
      .get(`/api/attendance/team?from=${MON}&sort=workedMinutes&order=desc`)
      .set(leader.auth)
      .expect(200);
    expect(byHours.body[0].workedMinutes).toBe(570);
  });

  it('a leader never sees another team', async () => {
    const otherLeader = await createLeader(70, 'צוות אחר');
    await addSession(employee.id, MON, '09:00', '17:00');
    travelTo(TUE, '10:00');
    const res = await api().get(`/api/attendance/team?from=${MON}`).set(otherLeader.auth).expect(200);
    expect(res.body).toEqual([]);
  });

  it('team/now shows who is clocked in and where', async () => {
    travelTo(MON, '09:00');
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'HOME' }).expect(201);
    travelTo(MON, '10:30');
    const res = await api().get('/api/attendance/team/now').set(leader.auth).expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ state: 'IN', location: 'HOME', workedMinutesToday: 90 });
  });
});
