import type { TeamAttendanceRow } from "../../types/attendance";

export default function TeamReportTable({data}: {data:TeamAttendanceRow[]}) {
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>עובד</th>
                        <th>תאריך</th>
                        <th>כניסה</th>
                        <th>יציאה</th>
                        <th>סה"כ שעות</th>
                        <th>סיכום יומי</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={`${row.user.id} - ${row.date}`}>
                            <td>{row.user.name}</td>
                            <td>{row.date}</td>
                            <td>{row.checkIn}</td>
                            <td>{row.checkOut}</td>
                            <td>{row.totalHours}</td>
                            <td>{row.dailySummary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}