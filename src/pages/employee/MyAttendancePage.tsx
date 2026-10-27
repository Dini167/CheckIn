
import MyAttendance from "../../components/attendance/MyAttendance";
import { useState, useEffect } from "react";
import { getCalendar } from "../../api/attendanceApi";
import { formatDate } from "../../utils/formatDate";
import useFetch from "../../hooks/useFetch";
export default function MyAttendancePage() {
    const [dayCalendar, setDayCalendar] = useState<string | null>(formatDate(new Date()));
    const { data: myCalendar, isLoading, error } = useFetch(() => getCalendar({ month: new Date().getMonth() + 1 }), "שגיאה בטעינת לוח חודשי", ["monthCalendar"]);
    const rows = myCalendar ?? [];

    return (
        <div>
            <h1>My Attendance in {}</h1>

            <MyAttendance />
        </div>
    );
}