
// תוקן: useEffect הוסר מה-import — הוא לא בשימוש בדף
import { useState } from "react";
import { getCalendar } from "../../api/attendanceApi";
import { getQuota } from "../../api/correctionsApi";
import { formatDate } from "../../utils/formatDate";
import useFetch from "../../hooks/useFetch";
import MyAttendanceTable from "../../components/attendance/MyAttendanceTable";
import { formatMinutes } from "../../utils/formatMinutes";

export default function MyAttendancePage() {
    const changeMonth=(number: number)=>{
        setDayCalendar(formatDate(new Date(new Date(dayCalendar).setMonth(new Date(dayCalendar).getMonth() + number))).slice(0, 7));
    }
    const { data,refetch:refetchQuota } = useFetch(getQuota, "שגיאה בטעינת מכסת התיקונים", ["correctionQuota"]);
    const [dayCalendar, setDayCalendar] = useState<string>(formatDate(new Date()).slice(0, 7));
    const { data: myCalendar, isLoading, error,refetch: refetchCalendar } = useFetch(() => getCalendar({ month: dayCalendar }), "שגיאה בטעינת לוח חודשי", ["monthCalendar", dayCalendar]);
    const resMyCalender = myCalendar ?? undefined;
    const quota = data ?? undefined;
    
    return (
        <div>
            <h1>הנוכחות שלי בחודש {new Date(dayCalendar).toLocaleString("default", { month: "long" })}</h1>
            { quota &&
                (quota?.unlimited ? <p>מכסת התיקונים בלתי מוגבלת</p> : <p>נשארו לך {quota.remaining} תיקונים השבוע</p>)
            }
        {isLoading && <p>טוען...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!resMyCalender && !isLoading && !error && <p>אין נתונים לחודש זה</p>}
        <button onClick={()=> changeMonth(-1)}>לנתונים של החודש הקודם</button>
        <button onClick={()=> changeMonth(1)}>לנתונים של החודש הבא</button>
        {resMyCalender && <>
            <MyAttendanceTable days={resMyCalender.days}  />
            <p>{formatMinutes(resMyCalender.totalWorkedMinutes)} סך כל שעות העבודה בחודש</p>
            <p>{resMyCalender.gapCount} ימים עם חסר בדיווח</p>
        </>}
        </div>
    );
}


