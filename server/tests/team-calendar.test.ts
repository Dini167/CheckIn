import { beforeEach, describe, expect, it } from 'vitest';
import { MON, TUE, WED, api, createEmployee, createLeader, resetDb, travelTo, type TestUser } from './helpers';

let leader: TestUser;
let employee: TestUser;

beforeEach(async () => {
  await resetDb();
  leader = await createLeader();
  employee = await createEmployee(leader.joinCode!, 'חדש');
  travelTo(MON, '10:00');
});

describe('team — members and hourly rate', () => {
  it('new employees without a rate are listed first; the leader sets the rate', async () => {
    const members = await api().get('/api/team/members').set(leader.auth).expect(200);
    expect(members.body[0]).toMatchObject({ id: employee.id, salaryMissing: true, salary: null });

    const missing = await api().get('/api/team/members?missingSalary=true').set(leader.auth).expect(200);
    expect(missing.body).toHaveLength(1);

    await api().patch(`/api/team/members/${employee.id}/salary`).set(leader.auth).send({ salary: 55.5 }).expect(200);
    const me = await api().get('/api/auth/me').set(employee.auth).expect(200);
    expect(me.body.salary).toBe(55.5); // the employee can see their own rate
  });

  it('employees cannot list members or change rates; leaders cannot touch other teams', async () => {
    await api().get('/api/team/members').set(employee.auth).expect(403);
    await api().patch(`/api/team/members/${employee.id}/salary`).set(employee.auth).send({ salary: 500 }).expect(403);

    const other = await createLeader(70, 'אחר');
    await api().patch(`/api/team/members/${employee.id}/salary`).set(other.auth).send({ salary: 1 }).expect(404);
    await api().patch(`/api/team/members/${employee.id}/salary`).set(leader.auth).send({ salary: -5 }).expect(400);
  });

  it('only the leader sees the join code', async () => {
    const asLeader = await api().get('/api/team').set(leader.auth).expect(200);
    const asEmployee = await api().get('/api/team').set(employee.auth).expect(200);
    expect(asLeader.body.joinCode).toBe(leader.joinCode);
    expect(asEmployee.body).not.toHaveProperty('joinCode');
    expect(asEmployee.body.memberCount).toBe(2);
  });
});

describe('non-working days', () => {
  it('leader marks a range; employees of the team can see it', async () => {
    const res = await api()
      .post('/api/non-working-days')
      .set(leader.auth)
      .send({ fromDate: MON, toDate: WED, type: 'VACATION', note: 'חופשה מרוכזת' })
      .expect(201);
    expect(res.body).toHaveLength(3);

    const list = await api().get('/api/non-working-days?month=2030-01').set(employee.auth).expect(200);
    expect(list.body.map((d: { date: string }) => d.date)).toEqual([MON, TUE, WED]);

    await api().patch(`/api/non-working-days/${res.body[0].id}`).set(leader.auth).send({ type: 'HOLIDAY' }).expect(200);
    await api().delete(`/api/non-working-days/${res.body[1].id}`).set(leader.auth).expect(204);
  });

  it('employees cannot manage days and other teams do not see them', async () => {
    await api().post('/api/non-working-days').set(employee.auth).send({ fromDate: MON, type: 'HOLIDAY' }).expect(403);
    const { body } = await api().post('/api/non-working-days').set(leader.auth).send({ fromDate: MON, type: 'HOLIDAY' });
    const other = await createLeader(70, 'אחר');
    expect((await api().get('/api/non-working-days?month=2030-01').set(other.auth)).body).toEqual([]);
    await api().delete(`/api/non-working-days/${body[0].id}`).set(other.auth).expect(404);
  });
});

describe('announcements', () => {
  it('active announcements are shown; expired ones only to the leader with all=true', async () => {
    await api().post('/api/announcements').set(leader.auth).send({ title: 'ישיבה', content: 'מחר ב-10', expiresAt: TUE }).expect(201);
    const { body: old } = await api()
      .post('/api/announcements')
      .set(leader.auth)
      .send({ title: 'ישנה', content: 'תפוגה מחר', expiresAt: MON })
      .expect(201);

    travelTo(WED, '09:00');
    const employeeView = await api().get('/api/announcements').set(employee.auth).expect(200);
    expect(employeeView.body).toEqual([]);
    const employeeAll = await api().get('/api/announcements?all=true').set(employee.auth).expect(200);
    expect(employeeAll.body).toEqual([]);
    const leaderAll = await api().get('/api/announcements?all=true').set(leader.auth).expect(200);
    expect(leaderAll.body).toHaveLength(2);

    await api().patch(`/api/announcements/${old.id}`).set(leader.auth).send({ expiresAt: null }).expect(200);
    expect((await api().get('/api/announcements').set(employee.auth)).body).toHaveLength(1);
  });

  it('only the team leader manages announcements of their own team', async () => {
    await api().post('/api/announcements').set(employee.auth).send({ title: 'שלום', content: 'אני עובד' }).expect(403);
    const { body } = await api().post('/api/announcements').set(leader.auth).send({ title: 'שלום', content: 'לכולם' });
    const other = await createLeader(70, 'אחר');
    await api().delete(`/api/announcements/${body.id}`).set(other.auth).expect(404);
    await api().delete(`/api/announcements/${body.id}`).set(leader.auth).expect(204);
  });
});
