import { beforeEach, describe, expect, it } from 'vitest';
import { setClock } from '../src/common/clock';
import { prisma } from '../src/common/prisma';
import { MON, TUE, api, createEmployee, createLeader, resetDb, travelTo, type TestUser } from './helpers';

let leader: TestUser;
let employee: TestUser;

beforeEach(async () => {
  await resetDb();
  leader = await createLeader();
  employee = await createEmployee(leader.joinCode!, 'יוסי');
});

const at = (d: Date, plusMinutes: number) => setClock(() => new Date(d.getTime() + plusMinutes * 60_000));

async function clockInAndGetPulses(user: TestUser, day: string) {
  travelTo(day, '09:00');
  await api().post('/api/attendance/clock-in').set(user.auth).send({ location: 'HOME' }).expect(201);
  return prisma.pulse.findMany({ where: { userId: user.id }, orderBy: { scheduledAt: 'asc' } });
}

describe('pulses — scheduling', () => {
  it('schedules exactly 2 random checks inside the shift window on the first clock-in only', async () => {
    const pulses = await clockInAndGetPulses(employee, MON);
    expect(pulses).toHaveLength(2);
    const start = travelTo(MON, '09:00').getTime();
    for (const p of pulses) {
      const offset = (p.scheduledAt.getTime() - start) / 60_000;
      expect(offset).toBeGreaterThanOrEqual(15);
      expect(offset).toBeLessThanOrEqual(7 * 60);
    }

    // Pause and come back: no extra pulses.
    travelTo(MON, '09:05');
    await api().post('/api/attendance/pause').set(employee.auth).send({});
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'HOME' });
    expect(await prisma.pulse.count({ where: { userId: employee.id } })).toBe(2);
  });

  it('team leaders do not get pulses', async () => {
    const pulses = await clockInAndGetPulses(leader, MON);
    expect(pulses).toHaveLength(0);
  });

  it('office work gets no pulses; the first home clock-in of the day schedules them', async () => {
    travelTo(MON, '09:00');
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'OFFICE' }).expect(201);
    expect(await prisma.pulse.count({ where: { userId: employee.id } })).toBe(0);

    travelTo(MON, '12:00');
    await api().post('/api/attendance/pause').set(employee.auth).send({}).expect(200);
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'HOME' }).expect(201);
    expect(await prisma.pulse.count({ where: { userId: employee.id } })).toBe(2);
  });
});

describe('pulses — answering', () => {
  it('shows an open check for 3 minutes and accepts an answer', async () => {
    const [first] = await clockInAndGetPulses(employee, MON);

    at(first!.scheduledAt, -1);
    expect((await api().get('/api/pulses/current').set(employee.auth)).body.pulse).toBeNull();

    at(first!.scheduledAt, 1);
    const current = await api().get('/api/pulses/current').set(employee.auth).expect(200);
    expect(current.body.pulse).toMatchObject({ id: first!.id, secondsLeft: 120 });

    await api().post(`/api/pulses/${first!.id}/respond`).set(employee.auth).send({ responseText: 'מתקן באג' }).expect(200);
    await api().post(`/api/pulses/${first!.id}/respond`).set(employee.auth).send({ responseText: 'שוב' }).expect(409);

    const mine = await api().get(`/api/pulses/mine?date=${MON}`).set(employee.auth).expect(200);
    expect(mine.body).toHaveLength(1); // the second check is still in the future → hidden
    expect(mine.body[0]).toMatchObject({ status: 'ANSWERED', responseText: 'מתקן באג' });
  });

  it('returns 410 after 3 minutes, and 404 for someone else’s check', async () => {
    const [first] = await clockInAndGetPulses(employee, MON);
    const other = await createEmployee(leader.joinCode!);

    at(first!.scheduledAt, 1);
    await api().post(`/api/pulses/${first!.id}/respond`).set(other.auth).send({ responseText: 'x' }).expect(404);

    at(first!.scheduledAt, 4);
    const res = await api().post(`/api/pulses/${first!.id}/respond`).set(employee.auth).send({ responseText: 'מאוחר' }).expect(410);
    expect(res.body.error.code).toBe('PULSE_EXPIRED');
  });

  it('a check that fires during a pause is cancelled, not missed', async () => {
    const [first] = await clockInAndGetPulses(employee, MON);
    at(first!.scheduledAt, -2);
    await api().post('/api/attendance/pause').set(employee.auth).send({}).expect(200);

    at(first!.scheduledAt, 10);
    const mine = await api().get(`/api/pulses/mine?date=${MON}`).set(employee.auth).expect(200);
    expect(mine.body[0].status).toBe('CANCELLED');
  });

  it('a check that fires while working at the office is cancelled, not missed', async () => {
    const [first] = await clockInAndGetPulses(employee, MON);
    at(first!.scheduledAt, -2);
    await api().post('/api/attendance/pause').set(employee.auth).send({}).expect(200);
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'OFFICE' }).expect(201);

    at(first!.scheduledAt, 1);
    expect((await api().get('/api/pulses/current').set(employee.auth)).body.pulse).toBeNull();

    at(first!.scheduledAt, 10);
    const mine = await api().get(`/api/pulses/mine?date=${MON}`).set(employee.auth).expect(200);
    expect(mine.body[0].status).toBe('CANCELLED');
  });
});

describe('pulses — red dots for the team leader', () => {
  it('only when BOTH checks of a day were missed, and without answer texts', async () => {
    const other = await createEmployee(leader.joinCode!, 'נועה');

    // Yossi misses both on Monday.
    await clockInAndGetPulses(employee, MON);

    // Noa answers one of two.
    const noaPulses = await clockInAndGetPulses(other, MON);
    at(noaPulses[0]!.scheduledAt, 1);
    await api().post(`/api/pulses/${noaPulses[0]!.id}/respond`).set(other.auth).send({ responseText: 'סודי' });

    travelTo(MON, '18:00');
    const dots = await api().get(`/api/pulses/red-dots?from=${MON}&to=${TUE}`).set(leader.auth).expect(200);
    expect(dots.body).toEqual([{ date: MON, user: { id: employee.id, name: 'יוסי' }, missedCount: 2 }]);
    expect(JSON.stringify(dots.body)).not.toContain('סודי');

    await api().get('/api/pulses/red-dots').set(employee.auth).expect(403);
  });
});
