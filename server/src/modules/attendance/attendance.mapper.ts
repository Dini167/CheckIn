import type { AttendanceSession } from '@prisma/client';
import { dbToKey, timeOfDay } from '../../common/dates';
import { liveSessionMinutes } from '../../common/worktime';

export function toSessionDto(s: AttendanceSession) {
  return {
    id: s.id,
    workDate: dbToKey(s.workDate),
    clockIn: s.clockIn.toISOString(),
    clockOut: s.clockOut?.toISOString() ?? null,
    clockInTime: timeOfDay(s.clockIn),
    clockOutTime: s.clockOut ? timeOfDay(s.clockOut) : null,
    location: s.location,
    endType: s.endType,
    dailySummary: s.dailySummary,
    remarks: s.remarks,
    isManual: s.isManual,
    minutes: liveSessionMinutes(s),
  };
}
