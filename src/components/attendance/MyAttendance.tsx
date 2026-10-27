import { useState, useEffect } from "react";
import type { MonthCalendar } from "../../types/attendance";
import AttendanceStatus from "./AttendanceStatus";
import ClockInForm from "./ClockInForm";
import ClockOutForm from "./ClockOutForm";
import PauseButton from "./PauseButton";
import AttendanceSessions from "./AttendanceSessions";
import DailyWorkSummary from "./DailyWorkSummary";
import type { TodayAttendance } from "../../types/attendance";
import { getTodayAttendance } from "../../api/attendanceApi";

export default function MyAttendance() {
    const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
    useEffect(() => {
        const loadAttendance = async () => {
            const attendance = await getTodayAttendance();
            setTodayAttendance(attendance);
        };
        loadAttendance();
    }, []);
    const refreshAttendance = async () => {
        const attendance = await getTodayAttendance();
        setTodayAttendance(attendance);
    };
    return (
        <div>
            {todayAttendance && <AttendanceStatus state={todayAttendance.state} />}
            {todayAttendance && (todayAttendance.state === "NOT_STARTED" || todayAttendance.state === "PAUSED"|| todayAttendance.state === "ENDED") && <ClockInForm  onSuccess={refreshAttendance} />}
            {todayAttendance && (todayAttendance.state === "IN"|| todayAttendance.state === "PAUSED") && <ClockOutForm onSuccess={refreshAttendance} />}
            {todayAttendance && todayAttendance.state === "IN" && <PauseButton onSuccess={refreshAttendance} />}
            {todayAttendance &&  <AttendanceSessions sessions={todayAttendance.sessions} />}
            {todayAttendance &&  <DailyWorkSummary workedMinutes={todayAttendance.workedMinutes} />}
        </div>
    );
}
   