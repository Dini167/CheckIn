
// תוקן: useEffect הוסר מה-import — הוא לא בשימוש בדף
import { useState } from "react";
import { getCalendar } from "../../api/attendanceApi";
import { getMyCorrections, getQuota } from "../../api/correctionsApi";
import { formatDate } from "../../utils/formatDate";
import useFetch from "../../hooks/useFetch";
import MyAttendanceTable from "../../components/attendance/MyAttendanceTable";
import { formatMinutes } from "../../utils/formatMinutes";
export default function MyAttendancePage() {
    const changeMonth=(number: number)=>{
        setDayCalendar(formatDate(new Date(new Date(dayCalendar).setMonth(new Date(dayCalendar).getMonth() + number))).slice(0, 7));
    }
    const { data,refetch:refetchQuota } = useFetch(getQuota, "שגיאה בטעינת מכסת התיקונים", ["correctionQuota"]);
    const { data: myCorrections,isLoading: myCorrectionsLoading, error: myCorrectionsError, refetch: refetchMyCorrections } = useFetch(getMyCorrections, "שגיאה בטעינת תיקוני השעות שלי", ["myCorrections"]);
    const [dayCalendar, setDayCalendar] = useState<string>(formatDate(new Date()).slice(0, 7));
    const { data: myCalendar, isLoading, error,refetch: refetchCalendar } = useFetch(() => getCalendar({ month: dayCalendar }), "שגיאה בטעינת לוח חודשי", ["monthCalendar", dayCalendar]);
    const resMyCalender = myCalendar ?? undefined;
    const quota = data ?? undefined;
    const monthCorrections = myCorrections?.filter(correction => correction.workDate.startsWith(dayCalendar)) ?? [];
    return (
        <div className="page">
            <h1 className="page-title">הנוכחות שלי בחודש {new Date(dayCalendar).toLocaleString("default", { month: "long" })}</h1>
            { quota &&
                (quota?.unlimited ? <p className="quota-note">מכסת התיקונים בלתי מוגבלת</p> : <p className="quota-note">נשארו לך {quota.remaining} תיקונים השבוע</p>)
            }
        {isLoading && <p className="loading">טוען...</p>}
        {error && <p className="alert alert-danger py-2" style={{ color: 'red' }}>{error}</p>}
        {!resMyCalender && !isLoading && !error && <p className="empty-state">אין נתונים לחודש זה</p>}
        <button className="btn btn-outline-primary btn-sm month-nav" onClick={()=> changeMonth(-1)}>לנתונים של החודש הקודם</button>
        <button className="btn btn-outline-primary btn-sm month-nav" onClick={()=> changeMonth(1)}>לנתונים של החודש הבא</button>
        {resMyCalender && <>
            <MyAttendanceTable days={resMyCalender.days} onCorrected={() => {refetchCalendar(),refetchQuota(),refetchMyCorrections()}} />
            <p className="month-stat">{formatMinutes(resMyCalender.totalWorkedMinutes)} סך כל שעות העבודה בחודש</p>
            <p className="month-stat">{resMyCalender.gapCount} ימים עם חסר בדיווח</p>
        </>}
        <h2 className="section-title">הבקשות לתיקון שעות שלי</h2>
        {myCorrectionsLoading && <p className="loading">טוען...</p>}
        {myCorrectionsError && <p className="alert alert-danger py-2" style={{ color: 'red' }}>{myCorrectionsError}</p>}
        {!myCorrectionsLoading && !myCorrectionsError && myCorrections && monthCorrections.length === 0 && <p className="empty-state">אין בקשות לתיקון שעות</p>}
        {!myCorrectionsLoading && !myCorrectionsError && myCorrections && monthCorrections.length > 0 && (
            <ul className="list-group requests-list">
                {monthCorrections.map(correction => (
                    <li className="list-group-item" key={correction.id}>
                        {correction.workDate} - {correction.reason} - {correction.status === "PENDING" ? "ממתין" : correction.status === "APPROVED" ? "מאושר" : correction.status === "REJECTED" ? "נדחה" : "הוחל"}
                    </li>
                ))}
            </ul>
        )}
        </div>
    );
}


