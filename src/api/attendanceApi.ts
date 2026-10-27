import type { MonthCalendar, TeamAttendanceFilters } from "../types/attendance";
import type { TeamAttendanceMember, TeamAttendanceRow, TodayAttendance } from "../types/attendance";
import axiosInstance from "./axiosInstance";

export async function getTodayAttendance(): Promise<TodayAttendance> {
    const response = await axiosInstance.get<TodayAttendance>("/attendance/today");
    return response.data;
}
export async function clockIn(location: "OFFICE" | "HOME") {
    const response = await axiosInstance.post("/attendance/clock-in", { location });
    return response.data;
}
export async function clockOut(dailySummary: string) {
    const response = await axiosInstance.post("/attendance/clock-out", { dailySummary });
    return response.data;
}


export async function pauseAttendance() {
    const response = await axiosInstance.post("/attendance/pause");
    return response.data;
}

export async function getTeamAttendanceNow(): Promise<TeamAttendanceMember[]> {
    const response = await axiosInstance.get<TeamAttendanceMember[]>("/attendance/team/now");
    return response.data;
}

export async function getTeamAttendance(filter: TeamAttendanceFilters): Promise<TeamAttendanceRow[]> {
    const response = await axiosInstance.get<TeamAttendanceRow[]>("/attendance/team", { params: filter });
    return response.data;
}
export async function getCalendar(): Promise<MonthCalendar> {
    const response = await axiosInstance.get<MonthCalendar>("/attendance/calendar",{params: {month: new Date().getMonth() + 1}});
    return response.data;
}
