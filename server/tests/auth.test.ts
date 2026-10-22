import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it } from 'vitest';
import { PASSWORD, api, createEmployee, createLeader, resetDb } from './helpers';

beforeEach(resetDb);

describe('auth — register', () => {
  it('team leader registration creates a team with a join code', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ role: 'TEAM_LEADER', name: 'דנה', email: 'Dana@Test.com', password: PASSWORD, teamName: 'פיתוח', salary: 80 })
      .expect(201);

    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: 'dana@test.com', role: 'TEAM_LEADER', salary: 80 });
    expect(res.body.user.team.joinCode).toMatch(/^TEAM-[A-Z0-9]{5}$/);
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('employee joins with the code; a salary sent by the employee is ignored', async () => {
    const leader = await createLeader();
    const res = await api()
      .post('/api/auth/register')
      .send({ role: 'EMPLOYEE', name: 'יוסי', email: 'yossi@test.com', password: PASSWORD, joinCode: leader.joinCode, salary: 999 })
      .expect(201);

    expect(res.body.user.salary).toBeNull();
    expect(res.body.user.team.id).toBe(leader.teamId);
    expect(res.body.user.team).not.toHaveProperty('joinCode');
  });

  it('rejects an unknown join code (404) and a duplicate email (409)', async () => {
    await api()
      .post('/api/auth/register')
      .send({ role: 'EMPLOYEE', name: 'יוסי', email: 'a@test.com', password: PASSWORD, joinCode: 'TEAM-NOPE1' })
      .expect(404);

    const leader = await createLeader();
    await api()
      .post('/api/auth/register')
      .send({ role: 'EMPLOYEE', name: 'יוסי', email: 'dup@test.com', password: PASSWORD, joinCode: leader.joinCode })
      .expect(201);
    const dup = await api()
      .post('/api/auth/register')
      .send({ role: 'EMPLOYEE', name: 'יוסי', email: 'dup@test.com', password: PASSWORD, joinCode: leader.joinCode })
      .expect(409);
    expect(dup.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('validates input and returns field details', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ role: 'EMPLOYEE', name: 'י', email: 'not-an-email', password: 'short', joinCode: 'X' })
      .expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });
});

describe('auth — login and tokens', () => {
  it('logs in with correct credentials', async () => {
    await api()
      .post('/api/auth/register')
      .send({ role: 'TEAM_LEADER', name: 'דנה', email: 'dana@test.com', password: PASSWORD, teamName: 'פיתוח', salary: 80 });

    const res = await api().post('/api/auth/login').send({ email: 'dana@test.com', password: PASSWORD }).expect(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe('dana@test.com');
  });

  it('rejects a wrong password and an unknown email with the same 401', async () => {
    await createLeader();
    const wrong = await api().post('/api/auth/login').send({ email: 'leader1@test.com', password: 'Wrong12345' });
    const unknown = await api().post('/api/auth/login').send({ email: 'nobody@test.com', password: PASSWORD });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(unknown.body.error.message).toBe(wrong.body.error.message);
  });

  it('GET /me requires a token (401) and never returns the password hash', async () => {
    const missing = await api().get('/api/auth/me').expect(401);
    expect(missing.body.error.code).toBe('TOKEN_MISSING');

    const leader = await createLeader();
    const me = await api().get('/api/auth/me').set(leader.auth).expect(200);
    expect(me.body.id).toBe(leader.id);
    expect(JSON.stringify(me.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });

  it('rejects an invalid token and an expired token', async () => {
    const bad = await api().get('/api/auth/me').set({ Authorization: 'Bearer not.a.token' }).expect(401);
    expect(bad.body.error.code).toBe('TOKEN_INVALID');

    const leader = await createLeader();
    const forged = jwt.sign({ role: 'TEAM_LEADER' }, 'some-other-secret-that-is-long-enough-123', { subject: String(leader.id) });
    await api().get('/api/auth/me').set({ Authorization: `Bearer ${forged}` }).expect(401);

    const expired = jwt.sign({ role: 'TEAM_LEADER' }, process.env.JWT_SECRET!, {
      subject: String(leader.id),
      expiresIn: -10,
    });
    const res = await api().get('/api/auth/me').set({ Authorization: `Bearer ${expired}` }).expect(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  it('the user is taken from the token, not from the client', async () => {
    const leader = await createLeader();
    const employee = await createEmployee(leader.joinCode!);
    const res = await api().get(`/api/auth/me?id=${leader.id}`).set(employee.auth).send({ id: leader.id }).expect(200);
    expect(res.body.id).toBe(employee.id);
  });
});
