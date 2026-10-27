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