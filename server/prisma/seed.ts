/**
 * Demo data (all invented). Run with: npm run db:seed
 *
 * Development: wipes the database and creates demo users with the password "Password123".
 * Production:  only runs on an EMPTY database, and passwords must come from
 *              SEED_LEADER_PASSWORD / SEED_EMPLOYEE_PASSWORD — never a known default.
 */
import { PrismaClient, type WorkLocation } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, isWorkDay, keyToDb, todayKey, weekStartKey, zonedTimeToUtc } from '../src/common/dates';

const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';
const DEV_PASSWORD = 'Password123';

function passwords() {
  const leader = process.env.SEED_LEADER_PASSWORD;
  const employee = process.env.SEED_EMPLOYEE_PASSWORD;
  if (isProduction && (!leader || !employee || leader.length < 10 || employee.length < 10)) {
    throw new Error('In production set SEED_LEADER_PASSWORD and SEED_EMPLOYEE_PASSWORD (10+ chars) before seeding.');
  }
  return { leader: leader || DEV_PASSWORD, employee: employee || DEV_PASSWORD };
}

const at = (day: string, time: string) => zonedTimeToUtc(day, time);

async function wipe() {
  // Order matters because of foreign keys.
  await prisma.payrollSnapshot.deleteMany();
  await prisma.monthLock.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.nonWorkingDay.deleteMany();
  await prisma.sickNote.deleteMany();
  await prisma.timeCorrection.deleteMany();
  await prisma.task.deleteMany();
  await prisma.pulse.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.user.updateMany({ data: { teamId: null } });
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
}

async function createTeam(name: string, joinCode: string, leader: { name: string; email: string; rate: number }, hash: string, joinedAt: Date) {
  const user = await prisma.user.create({
    data: { name: leader.name, email: leader.email, passwordHash: hash, role: 'TEAM_LEADER', hourlyRate: leader.rate, createdAt: joinedAt },
  });
  const team = await prisma.team.create({ data: { name, joinCode, leaderId: user.id } });
  await prisma.user.update({ where: { id: user.id }, data: { teamId: team.id } });
  return { team, leader: user };
}

async function createEmployee(teamId: number, name: string, email: string, rate: number | null, hash: string, joinedAt: Date) {
  return prisma.user.create({
    data: { name, email, passwordHash: hash, role: 'EMPLOYEE', hourlyRate: rate, teamId, createdAt: joinedAt },
  });
}

async function addDay(userId: number, day: string, start: string, end: string | null, location: WorkLocation, summary?: string) {
  return prisma.attendanceSession.create({
    data: {
      userId,
      workDate: keyToDb(day),
      clockIn: at(day, start),
      clockOut: end ? at(day, end) : null,
      location,
      endType: end ? 'END_OF_DAY' : null,
      dailySummary: end ? (summary ?? 'עבדתי על המשימות השוטפות.\nאין חסמים.') : null,
    },
  });
}

/** A tiny but valid PDF used as the demo sick-note file. */
function demoPdf(): Uint8Array<ArrayBuffer> {
  const pdf =
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 100]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n';
  return Uint8Array.from(Buffer.from(pdf, 'latin1'));
}

async function main() {
  const pw = passwords();
  if (isProduction) {
    if ((await prisma.user.count()) > 0) {
      console.log('Database already has users — production seed skipped (nothing was changed).');
      return;
    }
  } else {
    await wipe();
  }

  const leaderHash = await bcrypt.hash(pw.leader, 10);
  const employeeHash = await bcrypt.hash(pw.employee, 10);

  const today = todayKey();
  const start = addDays(today, -35);
  const joined = at(start, '08:00');

  // ── Team A: development ──────────────────────────────────────────
  const { team: dev, leader: dana } = await createTeam(
    'צוות פיתוח',
    'TEAM-DEMO1',
    { name: 'דנה ישראלי', email: 'dana@example.com', rate: 80 },
    leaderHash,
    joined,
  );
  const yossi = await createEmployee(dev.id, 'יוסי לוי', 'yossi@example.com', 55, employeeHash, joined);
  const noa = await createEmployee(dev.id, 'נועה כהן', 'noa@example.com', 60, employeeHash, joined);
  // New employee whose hourly rate the leader has not set yet.
  await createEmployee(dev.id, 'מיכל אברהם', 'michal@example.com', null, employeeHash, at(addDays(today, -1), '08:00'));

  // ── Team B: marketing (used to check that leaders can't see other teams) ──
  const { team: mkt, leader: avi } = await createTeam(
    'צוות שיווק',
    'TEAM-DEMO2',
    { name: 'אבי מזרחי', email: 'avi@example.com', rate: 75 },
    leaderHash,
    joined,
  );
  const roni = await createEmployee(mkt.id, 'רוני שמש', 'roni@example.com', 50, employeeHash, joined);

  // ── Attendance history ───────────────────────────────────────────
  const pastWorkDays: string[] = [];
  for (let d = start; d < today; d = addDays(d, 1)) if (isWorkDay(d)) pastWorkDays.push(d);

  const holiday = pastWorkDays[pastWorkDays.length - 8]!;
  const yossiGap = pastWorkDays[pastWorkDays.length - 5]!;
  const yossiMissingExit = pastWorkDays[pastWorkDays.length - 3]!;
  const yossiRedDot = pastWorkDays[pastWorkDays.length - 2]!;
  const noaSick = pastWorkDays[pastWorkDays.length - 4]!;
  const noaPaused = pastWorkDays[pastWorkDays.length - 1]!;

  for (const [i, day] of pastWorkDays.entries()) {
    if (day === holiday) continue;
    const loc: WorkLocation = i % 3 === 0 ? 'HOME' : 'OFFICE';

    // Yossi: regular days, one gap, one missing exit, one overtime day.
    if (day === yossiMissingExit) await addDay(yossi.id, day, '09:05', null, loc);
    else if (day !== yossiGap) await addDay(yossi.id, day, '09:00', i % 5 === 0 ? '19:30' : '17:10', loc, 'סיימתי את דוח הלקוח.\nעברתי על באגים פתוחים.');

    // Noa: one approved sick day, one day with a pause and an evening completion.
    if (day === noaPaused) {
      const morning = await addDay(noa.id, day, '08:30', '12:00', 'HOME');
      await prisma.attendanceSession.update({ where: { id: morning.id }, data: { endType: 'PAUSE', dailySummary: null } });
      await addDay(noa.id, day, '19:00', '22:00', 'HOME', 'השלמתי בערב את בדיקות הממשק.\nהכול עובד.');
    } else if (day !== noaSick) {
      await addDay(noa.id, day, '08:30', '16:45', loc, 'עבדתי על עיצוב מסך ההגדרות.\nפגישה עם הלקוח.');
    }

    await addDay(dana.id, day, '08:00', '17:00', 'OFFICE', 'ישיבות צוות ותכנון ספרינט.\nאישרתי בקשות.');
    await addDay(roni.id, day, '10:00', '18:00', loc, 'הכנתי קמפיין.\nשלחתי ניוזלטר.');
  }

  // Random pulses: Yossi missed BOTH checks on one day → red dot. Noa answered hers.
  await prisma.pulse.createMany({
    data: [
      { userId: yossi.id, workDate: keyToDb(yossiRedDot), scheduledAt: at(yossiRedDot, '10:40') },
      { userId: yossi.id, workDate: keyToDb(yossiRedDot), scheduledAt: at(yossiRedDot, '14:15') },
      {
        userId: noa.id,
        workDate: keyToDb(yossiRedDot),
        scheduledAt: at(yossiRedDot, '11:20'),
        answeredAt: at(yossiRedDot, '11:21'),
        responseText: 'מעצבת את מסך ההגדרות',
      },
      { userId: noa.id, workDate: keyToDb(yossiRedDot), scheduledAt: at(yossiRedDot, '15:05') },
    ],
  });

  // Sick notes: Noa approved, Yossi pending (for his gap day).
  await prisma.sickNote.create({
    data: {
      userId: noa.id,
      fromDate: keyToDb(noaSick),
      toDate: keyToDb(noaSick),
      note: 'חום גבוה',
      fileName: 'sick-note-noa.pdf',
      mimeType: 'application/pdf',
      fileData: demoPdf(),
      status: 'APPROVED',
      reviewedById: dana.id,
      reviewedAt: at(noaSick, '18:00'),
    },
  });
  await prisma.sickNote.create({
    data: {
      userId: yossi.id,
      fromDate: keyToDb(yossiGap),
      toDate: keyToDb(yossiGap),
      note: 'כאב ראש',
      fileName: 'sick-note-yossi.pdf',
      mimeType: 'application/pdf',
      fileData: demoPdf(),
    },
  });

  // Corrections: Yossi asked to fix his missing exit (pending); Noa used one self-correction earlier.
  const openSession = await prisma.attendanceSession.findFirstOrThrow({
    where: { userId: yossi.id, workDate: keyToDb(yossiMissingExit) },
  });
  await prisma.timeCorrection.create({
    data: {
      userId: yossi.id,
      sessionId: openSession.id,
      workDate: keyToDb(yossiMissingExit),
      newClockOut: at(yossiMissingExit, '17:00'),
      reason: 'שכחתי ללחוץ יציאה',
      kind: 'REQUEST',
      status: 'PENDING',
      units: 1,
    },
  });
  const lastWeek = addDays(weekStartKey(today), -3);
  await prisma.timeCorrection.create({
    data: {
      userId: noa.id,
      workDate: keyToDb(lastWeek),
      newClockIn: at(lastWeek, '08:30'),
      reason: 'השעון של המחשב נתקע',
      kind: 'SELF',
      status: 'APPLIED',
      units: 1,
      createdAt: at(lastWeek, '17:00'),
    },
  });

  // Tasks (private to each employee).
  const tasks: [number, string, 'LOW' | 'MEDIUM' | 'HIGH', number, 'TODO' | 'IN_PROGRESS' | 'DONE', string][] = [
    [yossi.id, 'לתקן באג בדוח הנוכחות', 'HIGH', 120, 'IN_PROGRESS', today],
    [yossi.id, 'לכתוב תיעוד ל-API', 'MEDIUM', 90, 'TODO', today],
    [yossi.id, 'פגישת סנכרון עם QA', 'MEDIUM', 30, 'TODO', today],
    [yossi.id, 'לעדכן ספריות בפרויקט', 'LOW', 240, 'TODO', today],
    [yossi.id, 'לסדר את התיקיות בשרת', 'LOW', 180, 'TODO', today],
    [yossi.id, 'סקירת קוד לנועה', 'HIGH', 45, 'DONE', addDays(today, -1)],
    [noa.id, 'עיצוב מסך הגדרות', 'HIGH', 180, 'IN_PROGRESS', today],
    [noa.id, 'לבדוק תאימות למובייל', 'MEDIUM', 60, 'TODO', today],
    [dana.id, 'לאשר בקשות תיקון', 'HIGH', 20, 'TODO', today],
  ];
  for (const [userId, title, priority, estimatedMinutes, status, day] of tasks) {
    await prisma.task.create({ data: { userId, title, priority, estimatedMinutes, status, taskDate: keyToDb(day) } });
  }

  // Team calendar and announcements.
  await prisma.nonWorkingDay.create({ data: { teamId: dev.id, date: keyToDb(holiday), type: 'HOLIDAY', note: 'חג (הדגמה)' } });
  await prisma.nonWorkingDay.create({
    data: { teamId: dev.id, date: keyToDb(addDays(today, 10)), type: 'STUDY_DAY', note: 'יום עיון — אבטחת מידע' },
  });
  await prisma.announcement.create({
    data: { teamId: dev.id, authorId: dana.id, title: 'ישיבת צוות', content: 'מחר ישיבת צוות ב-10:00 בחדר הישיבות.', expiresAt: keyToDb(addDays(today, 1)) },
  });
  await prisma.announcement.create({
    data: { teamId: dev.id, authorId: dana.id, title: 'הודעה ישנה', content: 'הודעה שפג תוקפה (הדגמה).', expiresAt: keyToDb(addDays(today, -5)) },
  });
  await prisma.announcement.create({
    data: { teamId: mkt.id, authorId: avi.id, title: 'השקת קמפיין', content: 'הקמפיין עולה ביום ראשון.' },
  });

  console.log('✅ Seed completed.');
  if (!isProduction) {
    console.log(`   Team leaders: dana@example.com (TEAM-DEMO1), avi@example.com (TEAM-DEMO2)`);
    console.log(`   Employees:    yossi@example.com, noa@example.com, michal@example.com, roni@example.com`);
    console.log(`   Password:     ${DEV_PASSWORD}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
