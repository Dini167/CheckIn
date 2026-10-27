import type { AttendanceSession } from "../../types/attendance";

export default function AttendanceSessions({ sessions }: { sessions: AttendanceSession[] }) {
    return (<>
        <h1>זמני העבודה של היום</h1>
        <ul>
            {sessions.map((session) => (
                <li key={session.id}>
                    {session.clockInTime} - {session.clockOutTime ??'עדיין לא יצא'}
                </li>
            ))}
        </ul>
</>
    )
}