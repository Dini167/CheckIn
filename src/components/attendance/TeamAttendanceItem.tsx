

import type { TeamAttendanceMember } from "../../types/attendance";
export default function TeamAttendanceItem({ member }: { member: TeamAttendanceMember }) {
    return (
        <li >
            {member.user.name} - {member.state} - {member.location ?? "-"} - {member.workedMinutesToday} דקות
        </li>
    );

}