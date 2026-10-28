
// תוקן: useEffect הוסר מה-import — הוא לא בשימוש בדף
import { useState } from "react";
import { getCalendar } from "../../api/attendanceApi";
import { formatDate } from "../../utils/formatDate";
import useFetch from "../../hooks/useFetch";
import MyAttendanceTable from "../../components/attendance/MyAttendanceTable";
import { formatMinutes } from "../../utils/formatMinutes";

export default function MyAttendancePage() {
    const [dayCalendar] = useState<string>(formatDate(new Date()).slice(0, 7));
    const { data: myCalendar, isLoading, error } = useFetch(() => getCalendar({ month: dayCalendar }), "שגיאה בטעינת לוח חודשי", ["monthCalendar", dayCalendar]);
    const resMyCalender = myCalendar ?? undefined;
    return (
        <div>
            <h1>הנוכחות שלי בחודש {new Date().toLocaleString("default", { month: "long" })}</h1>
        {isLoading && <p>טוען...</p>}
        {error && <p>{error}</p>}
        {!resMyCalender && !isLoading && !error && <p>אין נתונים לחודש זה</p>}
        {resMyCalender && <>
            <MyAttendanceTable days={resMyCalender.days}  />
            <p>{formatMinutes(resMyCalender.totalWorkedMinutes)} סך כל שעות העבודה בחודש</p>
            <p>{resMyCalender.gapCount} ימים עם חסר בדיווח</p>
        </>}
        </div>
    );
}


