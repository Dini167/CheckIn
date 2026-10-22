import type { AttendanceSession } from '@prisma/client';
import { rules } from '../../config/rules';
import { minutesByDay } from '../../common/worktime';

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface PaySummary {
  salary: number | null;
  salaryMissing: boolean;
  workedDays: number;
  regularHours: number;
  overtimeHours: number;
  basePay: number | null;
  overtimePay: number | null;
  bonus: number | null;
  total: number | null;
}

/**
 * Monthly pay from attendance sessions:
 *  regular hours (up to 8 per day) × rate  +  overtime hours × rate × 1.25  (+ leader bonus).
 * When the hourly rate was not set yet, hours are still counted but money is null.
 */
export function calculatePay(sessions: AttendanceSession[], hourlyRate: number | null, bonus = 0): PaySummary {
  let regularMinutes = 0;
  let overtimeMinutes = 0;
  let workedDays = 0;
  for (const minutes of minutesByDay(sessions).values()) {
    if (minutes <= 0) continue;
    workedDays++;
    regularMinutes += Math.min(minutes, rules.regularMinutesPerDay);
    overtimeMinutes += Math.max(0, minutes - rules.regularMinutesPerDay);
  }

  const regularHours = round2(regularMinutes / 60);
  const overtimeHours = round2(overtimeMinutes / 60);

  if (hourlyRate === null) {
    return {
      salary: null,
      salaryMissing: true,
      workedDays,
      regularHours,
      overtimeHours,
      basePay: null,
      overtimePay: null,
      bonus: null,
      total: null,
    };
  }

  const basePay = round2((regularMinutes / 60) * hourlyRate);
  const overtimePay = round2((overtimeMinutes / 60) * hourlyRate * rules.overtimeMultiplier);
  const roundedBonus = round2(bonus);
  return {
    salary: hourlyRate,
    salaryMissing: false,
    workedDays,
    regularHours,
    overtimeHours,
    basePay,
    overtimePay,
    bonus: roundedBonus,
    total: round2(basePay + overtimePay + roundedBonus),
  };
}

export function leaderBonus(employeeTotals: (number | null)[]): number {
  const sum = employeeTotals.reduce<number>((acc, t) => acc + (t ?? 0), 0);
  return round2(sum * rules.teamLeaderBonusRate);
}
