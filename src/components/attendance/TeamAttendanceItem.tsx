
import type { TeamAttendanceMember } from "../../types/attendance";
import { formatMinutes } from "../../utils/formatMinutes";
import AttendanceStatus from "./AttendanceStatus";

export default function TeamAttendanceItem({ member }: { member: TeamAttendanceMember }) {
    return (
        <li >
            {member.user.name} - <AttendanceStatus state={member.state} /> - {member.location=="HOME" ? "מהבית" : member.location=="OFFICE" ? "מהמשרד":"-"} - {formatMinutes(member.workedMinutesToday)}
            {member.since ? `מאז ${new Date(member.since).toLocaleTimeString("he-IL")}` : "-"}
        </li>
    );

}
