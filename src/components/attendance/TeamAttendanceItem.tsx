
import type { TeamAttendanceMember } from "../../types/attendance";
import { formatMinutes } from "../../utils/formatMinutes";
import AttendanceStatus from "./AttendanceStatus";

export default function TeamAttendanceItem({ member }: { member: TeamAttendanceMember }) {
    return (
        <li >
            <span>{member.user.name}</span>
            <AttendanceStatus state={member.state} />
            <span>{member.location=="HOME" ? "מהבית" : member.location=="OFFICE" ? "מהמשרד":"-"}</span>
            <span>{formatMinutes(member.workedMinutesToday)}</span>
            <span>{member.since ? `מאז ${new Date(member.since).toLocaleTimeString("he-IL")}` : "-"}</span>
        </li>
    );

}
