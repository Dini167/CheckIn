import type { AttendanceSession } from "../../types/attendance";

export default function AttendanceSessions({ sessions }: { sessions: AttendanceSession[] }) {
    return (<>
        <h1 className="section-title">זמני העבודה של היום</h1>
        <ul className="list-group sessions-list">
            {sessions.map((session) => (
                <li className="list-group-item" key={session.id}>
                    {session.clockInTime} - {session.clockOutTime ??'עדיין לא יצא'}
                </li>
            ))}
        </ul>
</>
    )
}