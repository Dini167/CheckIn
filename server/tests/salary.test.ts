import { beforeEach, describe, expect, it } from 'vitest';
import { MON, SUN, addSession, api, createEmployee, createLeader, resetDb, setRate, travelTo, type TestUser } from './helpers';

let leader: TestUser;
let employee: TestUser;

beforeEach(async () => {
  await resetDb();
  leader = await createLeader(100);
  employee = await createEmployee(leader.joinCode!, 'יוסי');
});

describe('salary — calculation', () => {
  it('pays regular hours and overtime at 125% above 8 hours a day', async () => {
    await setRate(employee.id, 40);
    await addSession(employee.id, SUN, '08:00', '18:00'); // 10h → 8 regular + 2 overtime
    await addSession(employee.id, MON, '09:00', '13:00'); // 4h regular
    travelTo('2030-01-15', '10:00');

    const res = await api().get('/api/salary/me?month=2030-01').set(employee.auth).expect(200);
    expect(res.body).toMatchObject({
      salary: 40,
      salaryMissing: false,
      workedDays: 2,
      regularHours: 12,
      overtimeHours: 2,
      basePay: 480,
      overtimePay: 100,
      bonus: 0,
      total: 580,
      isLocked: false,
      isCurrentMonth: true,
    });
  });

  it('counts hours but hides money while the hourly rate is not set', async () => {
    await addSession(employee.id, SUN, '09:00', '17:00');
    travelTo('2030-01-15', '10:00');
    const res = await api().get('/api/salary/me?month=2030-01').set(employee.auth).expect(200);
    expect(res.body).toMatchObject({ salaryMissing: true, salary: null, regularHours: 8, total: null });
  });

  it('an open session (missing exit) is not paid until corrected', async () => {
    await setRate(employee.id, 40);
    await addSession(employee.id, SUN, '09:00', null);
    travelTo('2030-01-15', '10:00');
    const res = await api().get('/api/salary/me?month=2030-01').set(employee.auth).expect(200);
    expect(res.body.total).toBe(0);
  });

  it('the team leader gets 5% of the employees’ total as a bonus', async () => {
    await setRate(employee.id, 50);
    const noa = await createEmployee(leader.joinCode!, 'נועה');
    await setRate(noa.id, 50);
    await addSession(employee.id, SUN, '09:00', '17:00'); // 400
    await addSession(noa.id, SUN, '09:00', '17:00'); // 400
    await addSession(leader.id, SUN, '09:00', '17:00'); // 800
    travelTo('2030-01-15', '10:00');

    const mine = await api().get('/api/salary/me?month=2030-01').set(leader.auth).expect(200);
    expect(mine.body).toMatchObject({ basePay: 800, bonus: 40, total: 840 });

    const team = await api().get('/api/salary/team?month=2030-01').set(leader.auth).expect(200);
    expect(team.body).toMatchObject({ employeesTotal: 800, leaderBonus: 40, teamTotal: 1640, membersMissingSalary: 0 });
    expect(team.body.members).toHaveLength(3);

    await api().get('/api/salary/team').set(employee.auth).expect(403);
  });
});

describe('salary — month lock and history', () => {
  it('locks a finished month and keeps the amounts even if the rate changes later', async () => {
    await setRate(employee.id, 50);
    await addSession(employee.id, SUN, '09:00', '17:00');
    travelTo('2030-02-03', '10:00');

    await api().post('/api/salary/locks').set(leader.auth).send({ month: '2030-02' }).expect(400); // not finished
    const locked = await api().post('/api/salary/locks').set(leader.auth).send({ month: '2030-01' }).expect(201);
    expect(locked.body.isLocked).toBe(true);
    await api().post('/api/salary/locks').set(leader.auth).send({ month: '2030-01' }).expect(409);

    await setRate(employee.id, 999);
    const after = await api().get('/api/salary/me?month=2030-01').set(employee.auth).expect(200);
    expect(after.body).toMatchObject({ isLocked: true, salary: 50, total: 400 });

    const locks = await api().get('/api/salary/locks').set(leader.auth).expect(200);
    expect(locks.body[0]).toMatchObject({ month: '2030-01', lockedBy: { id: leader.id } });
    await api().post('/api/salary/locks').set(employee.auth).send({ month: '2029-12' }).expect(403);
  });

  it('history lists months from newest to oldest', async () => {
    await setRate(employee.id, 50);
    await addSession(employee.id, SUN, '09:00', '17:00');
    travelTo('2030-03-10', '10:00');
    const res = await api().get('/api/salary/me/history').set(employee.auth).expect(200);
    const months = res.body.map((m: { month: string }) => m.month);
    expect(months.slice(0, 3)).toEqual(['2030-03', '2030-02', '2030-01']);
    expect(res.body[2].total).toBe(400);
  });
});
