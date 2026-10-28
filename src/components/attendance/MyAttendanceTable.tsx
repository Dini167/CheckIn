import type { CalendarDay } from "../../types/attendance";
import { formatMinutes } from "../../utils/formatMinutes";

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
export default function MyAttendanceTable({ days }: { days: CalendarDay[] }) {

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
                </tr>
            </thead>
            <tbody>
                {days.map((day) => (
                    <tr key={day.date}>
                        <td>{day.date} תאריך</td>
                        <td>{weekDays[new Date(day.date).getDay()]} יום</td>
                        <td>{day.sessions[0]?.clockInTime ?? "-"}</td>
                        <td>{day.sessions[0]?.clockOutTime ?? "-"}</td>      
                        <td>{formatMinutes(day.workedMinutes)}</td>
                        <td>{statusLabels[day.status]}</td>
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