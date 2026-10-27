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
export interface CalenderDay{
    date: string;
    dayOfWeek: number;
    status: "PAUSED" | "IN" | "NOT_STARTED" | "ENDED" | "OTHER1" | "OTHER2" | "OTHER3" | "OTHER4" | "OTHER5" | "OTHER6";
    isGap: boolean;



    workedMinutes: number;



    dailySummary: string | null;


    sessions: AttendanceSession[];

    nonWorkingDay: { type: string; note: string } | null;
    sickNote: { id: number; status: string } | null;
}


