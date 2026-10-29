
import type { TeamAttendanceMember } from "../../types/attendance";
import { getTeamAttendanceNow } from "../../api/attendanceApi";
import useFetch from "../../hooks/useFetch";
import TeamAttendanceList from "../../components/attendance/TeamAttendanceList";
import { useEffect } from "react";

export default function TeamAttendancePage() {
    const teamAttendance=useFetch<TeamAttendanceMember[]>(getTeamAttendanceNow,"שגיאה בקריאת נוכחות הצוות", ["teamNow"]);
    useEffect(() => {
        const interval = setInterval(() => {
            teamAttendance.refetch();
        }, 30000); 
        return () => clearInterval(interval);
    }, [teamAttendance.refetch]);
    return (
        <div className="page">
            <h1 className="page-title">נוכחות הצוות</h1>
            {teamAttendance.isLoading && <p className="loading">טוען נתוני נוכחות הצוות...</p>}
            {teamAttendance.error && <p className="alert alert-danger py-2" style={{ color: 'red' }}>{teamAttendance.error}</p>}
            {teamAttendance.data && teamAttendance.data.length > 0&& !teamAttendance.isLoading&&!teamAttendance.error &&
            <TeamAttendanceList members={teamAttendance.data} />
            }
            {!teamAttendance.isLoading && !teamAttendance.error && (!teamAttendance.data || teamAttendance.data.length === 0) && (
                <p className="empty-state">אין עובדים בצוות</p>
            )}
        </div>
    );
    
}
