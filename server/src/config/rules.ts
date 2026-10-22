/**
 * Business rules — every number the organization might want to change lives here.
 */
export const rules = {
  /** Days of week that are work days (0 = Sunday ... 6 = Saturday). */
  workDays: [0, 1, 2, 3, 4] as readonly number[],

  /** Daily minutes paid at the regular rate; anything above is overtime. */
  regularMinutesPerDay: 8 * 60,
  /** Overtime pay multiplier (1.25 = 125%). */
  overtimeMultiplier: 1.25,
  /** Team leader bonus as a fraction of the team employees' total pay. */
  teamLeaderBonusRate: 0.05,

  /** Random availability checks per employee per day. */
  pulsesPerDay: 2,
  /** Minutes an employee has to answer a pulse. */
  pulseResponseMinutes: 3,
  /** Pulses are scheduled inside this window, counted from the first clock-in of the day. */
  pulseWindowStartMinutes: 15,
  pulseWindowEndMinutes: 7 * 60,

  /** Self-service time corrections allowed per week without approval. */
  selfCorrectionsPerWeek: 2,

  /** Sick note upload limits. */
  sickNoteMaxBytes: 5 * 1024 * 1024,
  sickNoteMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'] as readonly string[],
  sickNoteMaxDays: 31,

  /** Maximum days in one non-working-days range. */
  nonWorkingDaysMaxRange: 31,
} as const;
