
import type { TeamAttendanceMember } from "../../types/attendance";
import { getTeamAttendanceNow } from "../../api/attendanceApi";
import useFetch from "../../hooks/useFetch";
import TeamAttendanceList from "../../components/attendance/TeamAttendanceList";

export default function TeamAttendancePage() {
    const teamAttendance=useFetch<TeamAttendanceMember[]>(getTeamAttendanceNow,"שגיאה בקריאת נוכחות הצוות");
    return (
        <div>
            <h1>נוכחות הצוות</h1>
            {teamAttendance.isLoading && <p>טוען נתוני נוכחות הצוות...</p>}
            {teamAttendance.error && <p style={{ color: 'red' }}>{teamAttendance.error}</p>}
            {(teamAttendance.data && teamAttendance.data.length > 0) ?
            <TeamAttendanceList members={teamAttendance.data} />:<p>אין עובדים בצוות</p>
            }
        </div>
    );
    
}
