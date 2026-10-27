
import type { TeamAttendanceMember } from "../../types/attendance";

export default function TeamAttendanceList({ members }: { members: TeamAttendanceMember[] }) {
    return (
        <ul>
            {members.map(member => (
                <li key={member.user.id}>
                    {member.user.name} - {member.state} - {member.location ?? "-"} - {member.workedMinutesToday} דקות
                </li>
            ))}
        </ul>
    );
}