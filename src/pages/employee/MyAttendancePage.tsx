
// תוקן: useEffect הוסר מה-import — הוא לא בשימוש בדף
import { useState } from "react";
import { getCalendar } from "../../api/attendanceApi";
import { formatDate } from "../../utils/formatDate";
import useFetch from "../../hooks/useFetch";
export default function MyAttendancePage() {
    // תוקן: הטיפוס string בלבד (בלי null), והערך ההתחלתי הוא החודש הנוכחי בפורמט "2026-10"
    // (7 התווים הראשונים של התאריך). setDayCalendar הוסר עד שיהיו כפתורי חודש קודם/הבא
    const [dayCalendar] = useState<string>(formatDate(new Date()).slice(0, 7));
    // תוקן: dayCalendar נוסף ל-queryKey — כל חודש נשמר ב"מגירה" משלו ונטען מחדש כשהוא משתנה
    const { data: myCalendar, isLoading, error } = useFetch(() => getCalendar({ month: dayCalendar }), "שגיאה בטעינת לוח חודשי", ["monthCalendar", dayCalendar]);
    const resMyCalender = myCalendar ?? undefined;
    return (
        <div>
            <h1>My Attendance in {new Date().toLocaleString("default", { month: "long" })}</h1>
        {isLoading && <p>טוען...</p>}
        {error && <p>{error}</p>}
        {/* תוקן: הנתונים מוצגים רק כשהם הגיעו — קודם בזמן טעינה הוצגו שורות ריקות */}
        {!resMyCalender && !isLoading && !error && <p>אין נתונים לחודש זה</p>}
        {resMyCalender && <><p>{resMyCalender.days.length} - ימים</p><p>{resMyCalender.totalWorkedMinutes} -סך הדקות</p></>}

        </div>
    );
}


