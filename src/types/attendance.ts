export type AttendanceState = "PAUSED" | "IN" | "NOT_STARTED" | "ENDED";

export interface TodayAttendance {
    date: string;
    state: AttendanceState;
    workedMinutes: number;
    currentSession: AttendanceSession | null;
    sessions: AttendanceSession[];
}

export interface AttendanceSession {
    id: number;
    workDate: string;
    clockIn: string;
    clockOut: string | null;
    clockInTime: string;
    clockOutTime: string | null;
    location: "OFFICE" | "HOME";
    endType: "END_OF_DAY" | "PAUSE" | null;
    dailySummary: string | null;
    remarks: string | null;
    isManual: boolean;
    minutes: number;
}
export interface TeamAttendanceMember {
    user: { id: number; name: string };
    state: AttendanceState;
    location: "OFFICE" | "HOME" | null;
    since: string | null;
    workedMinutesToday: number;
}
export interface CalendarDay {
    date: string;
    dayOfWeek: number;
    status:"WORKED"| "IN_PROGRESS"| "MISSING"| "MISSING_EXIT"| "SICK"| "NON_WORKING"
    | "WEEKEND" | "NOT_STARTED"| "FUTURE"| "BEFORE_JOIN";
    isGap: boolean;
    workedMinutes: number;
    dailySummary: string | null;
    sessions: AttendanceSession[];
    nonWorkingDay: { type: "HOLIDAY" | "VACATION" | "STUDY_DAY"; note: string } | null;
    sickNote: { id: number; status: "PENDING" | "APPROVED" | "REJECTED" } | null;
}
export interface MonthCalendar {
    month: string;
    days: CalendarDay[];
    gapCount: number;
    totalWorkedMinutes: number;
}
export type TeamAttendanceRow= CalendarDay & {
    user: { id: number; name: string };
    firstClockIn: string | null;
    lastClockOut: string | null;
}
export interface TeamAttendanceFilters {
from?: string;
to?: string;
userId?: number ;
location?: "OFFICE" | "HOME" ;
search?: string;
sort?: "date" | "name" | "clockIn" | "workedMinutes";
order?: "asc" | "desc";
}
