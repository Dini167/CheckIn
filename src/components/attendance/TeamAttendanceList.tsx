
import type { TeamAttendanceMember } from "../../types/attendance";
import TeamAttendanceItem from "./TeamAttendanceItem";
export default function TeamAttendanceList({ members }: { members: TeamAttendanceMember[] }) {
    return (
        <ul className="team-board">
            {members.map(member => (
                <TeamAttendanceItem key={member.user.id} member={member} />
            ))}
        </ul>
    );
}