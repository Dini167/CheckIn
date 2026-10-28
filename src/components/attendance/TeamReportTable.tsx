import type { TeamAttendanceRow } from "../../types/attendance";
import { formatMinutes } from "../../utils/formatMinutes";
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
                        <th>הערות</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={`${row.user.id} - ${row.date}`} style={{ backgroundColor: row.isGap ? '#ffe5e5' : undefined }}>
                            <td>{row.user.name}</td>
                            <td>{row.date}</td>
                            <td>{row?.firstClockIn ? new Date(row.firstClockIn).toLocaleTimeString("he-IL") : "-"}</td>
                            <td>{row.lastClockOut ? new Date(row.lastClockOut).toLocaleTimeString("he-IL") : "-"}</td>
                            <td>{formatMinutes(row.workedMinutes)}</td>
                            <td>{row.dailySummary}</td>
                            <td>{row.sessions.length==0?'-':row.sessions.map((session) => (
                                session.remarks?<><div>{session.clockInTime} - {session.clockOutTime}</div>
                                <div key={session.id }>{session.remarks}</div></>  : '-'
                            ))}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}



