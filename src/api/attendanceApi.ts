
import type { TeamAttendanceMember, TodayAttendance } from "../types/attendance";
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


