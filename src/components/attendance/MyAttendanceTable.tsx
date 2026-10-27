import type{ CalendarDay } from "../../types/attendance";
import 


export default function MyAttendanceTable({ days }: { days: { date: string; workedMinutes: number }[] }) {
    return (
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