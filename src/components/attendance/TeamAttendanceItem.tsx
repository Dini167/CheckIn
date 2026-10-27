

import type { TeamAttendanceMember } from "../../types/attendance";
import AttendanceStatus from "./AttendanceStatus";

export default function TeamAttendanceItem({ member }: { member: TeamAttendanceMember }) {
    return (
        <li >
            {member.user.name} - <AttendanceStatus state={member.state} /> - {member.location=="HOME" ? "מהבית" : member.location=="OFFICE" ? "מהמשרד":"-"} - {member.workedMinutesToday}
             דקות -{member.since ? `מאז ${new Date(member.since).toLocaleTimeString("he-IL")}` : "-"}
        </li>
    );
    
}
