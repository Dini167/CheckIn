import request from 'supertest';
import { createApp } from '../src/app';
import { setClock } from '../src/common/clock';
import { zonedTimeToUtc } from '../src/common/dates';
import { prisma } from '../src/common/prisma';

export const app = createApp();
export const api = () => request(app);

export async function resetDb() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE "PayrollSnapshot", "MonthLock", "Announcement", "NonWorkingDay", "SickNote",
             "TimeCorrection", "Task", "Pulse", "AttendanceSession", "Team", "User"
    RESTART IDENTITY CASCADE`);
}

/** Freezes the server clock at a wall-clock time in Israel. */
export function travelTo(day: string, time: string) {
  const instant = zonedTimeToUtc(day, time);
  setClock(() => new Date(instant));
  return instant;
}

export const PASSWORD = 'Password123';

export interface TestUser {
  id: number;
  token: string;
  auth: { Authorization: string };
  teamId: number;
  joinCode?: string;
}

let counter = 0;
const uniqueEmail = (prefix: string) => `${prefix}${++counter}@test.com`;

export async function createLeader(salary = 80, teamName = 'צוות בדיקות'): Promise<TestUser> {
  const res = await api()
    .post('/api/auth/register')
    .send({ role: 'TEAM_LEADER', name: 'ראש צוות', email: uniqueEmail('leader'), password: PASSWORD, teamName, salary })
    .expect(201);
  return {
    id: res.body.user.id,
    token: res.body.token,
    auth: { Authorization: `Bearer ${res.body.token}` },
    teamId: res.body.user.team.id,
    joinCode: res.body.user.team.joinCode,
  };
}

export async function createEmployee(joinCode: string, name = 'עובד'): Promise<TestUser> {
  const res = await api()
    .post('/api/auth/register')
    .send({ role: 'EMPLOYEE', name, email: uniqueEmail('emp'), password: PASSWORD, joinCode })
    .expect(201);
  return {
    id: res.body.user.id,
    token: res.body.token,
    auth: { Authorization: `Bearer ${res.body.token}` },
    teamId: res.body.user.team.id,
  };
}

/** Moves a user's registration date back so past days count as real work days. */
export async function backdateJoin(userId: number, day = '2025-01-01') {
  await prisma.user.update({ where: { id: userId }, data: { createdAt: new Date(`${day}T00:00:00Z`) } });
}

export async function setRate(userId: number, hourlyRate: number | null) {
  await prisma.user.update({ where: { id: userId }, data: { hourlyRate } });
}

/** Creates a closed attendance session directly in the database. */
export async function addSession(userId: number, day: string, from: string, to: string | null, location: 'OFFICE' | 'HOME' = 'OFFICE') {
  return prisma.attendanceSession.create({
    data: {
      userId,
      workDate: new Date(`${day}T00:00:00Z`),
      clockIn: zonedTimeToUtc(day, from),
      clockOut: to ? zonedTimeToUtc(day, to) : null,
      location,
      endType: to ? 'END_OF_DAY' : null,
      dailySummary: to ? 'סיכום' : null,
    },
  });
}

// A fixed week used by the tests (2030-01-06 is a Sunday; Israel is UTC+2 in January).
export const SUN = '2030-01-06';
export const MON = '2030-01-07';
export const TUE = '2030-01-08';
export const WED = '2030-01-09';
export const THU = '2030-01-10';
export const FRI = '2030-01-11';
export const SAT = '2030-01-12';
export const NEXT_SUN = '2030-01-13';
