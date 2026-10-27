
import type { TeamAttendanceMember } from "../../types/attendance";
import { getTeamAttendanceNow } from "../../api/attendanceApi";
import useFetch from "../../hooks/useFetch";
import TeamAttendanceList from "../../components/attendance/TeamAttendanceList";
import { useEffect } from "react";

export default function TeamAttendancePage() {
    const teamAttendance=useFetch<TeamAttendanceMember[]>(getTeamAttendanceNow,"שגיאה בקריאת נוכחות הצוות");
    useEffect(() => {
        const interval = setInterval(() => {
            teamAttendance.refetch();
        }, 30000); 
        return () => clearInterval(interval);
    }, [teamAttendance.refetch]);
    return (
        <div>
            <h1>נוכחות הצוות</h1>
            {teamAttendance.isLoading && <p>טוען נתוני נוכחות הצוות...</p>}
            {teamAttendance.error && <p style={{ color: 'red' }}>{teamAttendance.error}</p>}
            {teamAttendance.data && teamAttendance.data.length > 0&& !teamAttendance.isLoading&&!teamAttendance.error &&
            <TeamAttendanceList members={teamAttendance.data} />
            }
            {!teamAttendance.isLoading && !teamAttendance.error && (!teamAttendance.data || teamAttendance.data.length === 0) && (
                <p>אין עובדים בצוות</p>
            )}
        </div>
    );
    
}
