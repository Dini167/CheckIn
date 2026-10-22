import { beforeEach, describe, expect, it } from 'vitest';
import { MON, SUN, THU, api, createEmployee, createLeader, resetDb, travelTo, type TestUser } from './helpers';

let leader: TestUser;
let employee: TestUser;
let other: TestUser;

beforeEach(async () => {
  await resetDb();
  leader = await createLeader();
  employee = await createEmployee(leader.joinCode!);
  other = await createEmployee(leader.joinCode!);
  travelTo(MON, '09:00');
});

const create = (user: TestUser, body: object) => api().post('/api/tasks').set(user.auth).send(body);

describe('tasks — CRUD', () => {
  it('creates a task for today with defaults', async () => {
    const res = await create(employee, { title: 'משימה', estimatedMinutes: 60 }).expect(201);
    expect(res.body).toMatchObject({ title: 'משימה', taskDate: MON, status: 'TODO', priority: 'MEDIUM', carriedOverCount: 0 });
  });

  it('updates, completes and deletes', async () => {
    const { body: task } = await create(employee, { title: 'משימה', estimatedMinutes: 60 });
    const updated = await api()
      .patch(`/api/tasks/${task.id}`)
      .set(employee.auth)
      .send({ status: 'DONE', priority: 'HIGH' })
      .expect(200);
    expect(updated.body).toMatchObject({ status: 'DONE', priority: 'HIGH' });

    await api().delete(`/api/tasks/${task.id}`).set(employee.auth).expect(204);
    await api().patch(`/api/tasks/${task.id}`).set(employee.auth).send({ status: 'TODO' }).expect(404);
  });

  it('validates input', async () => {
    const res = await create(employee, { title: '', estimatedMinutes: 1, priority: 'URGENT' }).expect(400);
    expect(res.body.error.details.map((d: { field: string }) => d.field).sort()).toEqual(['estimatedMinutes', 'priority', 'title']);
    await api().patch('/api/tasks/abc').set(employee.auth).send({ status: 'DONE' }).expect(400);
    await api().patch('/api/tasks/1').set(employee.auth).send({}).expect(400);
  });
});

describe('tasks — privacy', () => {
  it('nobody else can read or change my tasks — not even the team leader', async () => {
    const { body: task } = await create(employee, { title: 'פרטי', estimatedMinutes: 30 });

    await api().patch(`/api/tasks/${task.id}`).set(other.auth).send({ status: 'DONE' }).expect(404);
    await api().delete(`/api/tasks/${task.id}`).set(leader.auth).expect(404);
    await api().post(`/api/tasks/${task.id}/carry-over`).set(other.auth).expect(404);

    const otherList = await api().get('/api/tasks').set(other.auth).expect(200);
    const leaderList = await api().get('/api/tasks').set(leader.auth).expect(200);
    expect(otherList.body).toEqual([]);
    expect(leaderList.body).toEqual([]);
  });
});

describe('tasks — search, filter, sort', () => {
  beforeEach(async () => {
    await create(employee, { title: 'דוח לקוח', estimatedMinutes: 60, priority: 'LOW' });
    await create(employee, { title: 'באג בדוח', estimatedMinutes: 30, priority: 'HIGH' });
    await create(employee, { title: 'פגישה', estimatedMinutes: 90, priority: 'MEDIUM' });
  });

  it('sorts by priority (high first) by default', async () => {
    const res = await api().get('/api/tasks').set(employee.auth).expect(200);
    expect(res.body.map((t: { priority: string }) => t.priority)).toEqual(['HIGH', 'MEDIUM', 'LOW']);
  });

  it('searches by title and filters by priority and status', async () => {
    const search = await api().get(`/api/tasks?search=${encodeURIComponent('דוח')}`).set(employee.auth).expect(200);
    expect(search.body).toHaveLength(2);

    const high = await api().get('/api/tasks?priority=HIGH').set(employee.auth).expect(200);
    expect(high.body.map((t: { title: string }) => t.title)).toEqual(['באג בדוח']);

    const done = await api().get('/api/tasks?status=DONE').set(employee.auth).expect(200);
    expect(done.body).toEqual([]);
  });

  it('sorts by estimated time', async () => {
    const res = await api().get('/api/tasks?sort=estimatedMinutes&order=asc').set(employee.auth).expect(200);
    expect(res.body.map((t: { estimatedMinutes: number }) => t.estimatedMinutes)).toEqual([30, 60, 90]);
  });
});

describe('tasks — carry over and planning', () => {
  it('carry-over moves to the next work day, skipping Friday and Saturday', async () => {
    travelTo(THU, '16:00');
    const { body: task } = await create(employee, { title: 'לא הספקתי', estimatedMinutes: 60 });
    const res = await api().post(`/api/tasks/${task.id}/carry-over`).set(employee.auth).expect(200);
    expect(res.body.taskDate).toBe('2030-01-13'); // next Sunday
    expect(res.body.carriedOverCount).toBe(1);
  });

  it('a completed task cannot be carried over', async () => {
    const { body: task } = await create(employee, { title: 'הושלמה', estimatedMinutes: 60 });
    await api().patch(`/api/tasks/${task.id}`).set(employee.auth).send({ status: 'DONE' });
    await api().post(`/api/tasks/${task.id}/carry-over`).set(employee.auth).expect(409);
  });

  it('plan warns about overload and suggests low-priority tasks to move', async () => {
    await create(employee, { title: 'גדולה', estimatedMinutes: 300, priority: 'HIGH' });
    await create(employee, { title: 'בינונית', estimatedMinutes: 120, priority: 'MEDIUM' });
    const { body: low } = await create(employee, { title: 'נמוכה', estimatedMinutes: 180, priority: 'LOW' });

    const res = await api().get('/api/tasks/plan').set(employee.auth).expect(200);
    expect(res.body).toMatchObject({ totalMinutes: 600, availableMinutes: 480, overloaded: true, overloadMinutes: 120 });
    expect(res.body.suggestedToMove).toEqual([low.id]);
    expect(res.body.tasks[0].title).toBe('גדולה');
    expect(res.body.message).toContain('משימה אחת');
  });

  it('available time shrinks with hours already worked today', async () => {
    travelTo(SUN, '09:00');
    await api().post('/api/attendance/clock-in').set(employee.auth).send({ location: 'OFFICE' });
    travelTo(SUN, '12:00');
    const res = await api().get('/api/tasks/plan').set(employee.auth).expect(200);
    expect(res.body.availableMinutes).toBe(300);
    expect(res.body.overloaded).toBe(false);
  });
});
