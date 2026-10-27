
import { useState, useEffect } from "react";
import { getCalendar } from "../../api/attendanceApi";
import { formatDate } from "../../utils/formatDate";
import useFetch from "../../hooks/useFetch";
export default function MyAttendancePage() {
    const [dayCalendar, setDayCalendar] = useState<string | null>(formatDate(new Date()));
    const { data: myCalendar, isLoading, error } = useFetch(() => getCalendar({ month: dayCalendar }), "שגיאה בטעינת לוח חודשי", ["monthCalendar"]);
    const resMyCalender = myCalendar ?? undefined;
    return (
        <div>
            <h1>My Attendance in {new Date().toLocaleString("default", { month: "long" })}</h1>
        {isLoading && <p>טוען...</p>}
        {error && <p>{error}</p>}
        {!resMyCalender &&!isLoading && !error ?<p>אין נתונים לחודש זה</p>:<><p>{resMyCalender?.days.length} - ימים</p><p>{resMyCalender?.totalWorkedMinutes} -סך הדקות</p></>}
        
        </div>
    );
}


