import type { CalendarDay } from "../../types/attendance";
import { formatMinutes } from "../../utils/formatMinutes";
import { useState } from "react";

const weekDays = [
    "ראשון",
    "שני",
    "שלישי",
    "רביעי",
    "חמישי",
    "שישי",
    "שבת"
];
const statusLabels: Record<CalendarDay["status"], string> = {
    "WORKED": "נוכח",
    "IN_PROGRESS": "בתהליך",
    "MISSING": "נעדר",
    "MISSING_EXIT": "יציאה חסרה",
    "SICK": "חולה",
    "NON_WORKING": "לא עובד",
    "WEEKEND": "סוף שבוע",
    "NOT_STARTED": "לא התחיל",
    "FUTURE": "עתידי",
    "BEFORE_JOIN": "לפני הצטרפות"
};
export default function MyAttendanceTable({ days, onCorrected }: { days: CalendarDay[]; onCorrected: () => void }) {
const [selectedDay, setSelectedDay] = useState<string | null>(null);
    return (
        <table>
            <thead>
                <tr>
                    <th>תאריך</th>
                    <th>יום</th>
                    <th>כניסה</th>
                    <th>יציאה</th>
                    <th>סך כל שעות העבודה</th>
                    <th>סטטוס</th>
                    <th>תיקון</th>
                </tr>
            </thead>
            <tbody>
                {days.map((day) => (
                    <tr key={day.date} style={{ backgroundColor: day.isGap ? '#ffe5e5' : undefined }}>
                        <td>{day.date}</td>
                        <td>{weekDays[new Date(day.date).getDay()]}</td>
                        <td>{day.sessions[0]?.clockInTime ?? "-"}</td>
                        <td>{day.sessions[day.sessions.length - 1]?.clockOutTime ?? "-"}</td>      
                        <td>{formatMinutes(day.workedMinutes)}</td>
                        <td>{statusLabels[day.status]}</td>
                        <td>
                            {day.isGap && (
                                <button onClick={() => setSelectedDay(day.date)}>תיקון</button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}









// <table>
//     <thead>
//         <tr>
//             <th>תאריך</th>
//             <th>דקות עבודה</th>
//         </tr>
//     </thead>
//     <tbody>
//         {days.map((day) => (
//             <tr key={day.date}>
//                 <td>{day.date}</td>
//                 <td>{day.workedMinutes}</td>
//             </tr>
//         ))}
//     </tbody>
// </table>