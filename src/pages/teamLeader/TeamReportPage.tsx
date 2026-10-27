import { useState } from "react";
import type { TeamAttendanceFilters } from "../../types/attendance";
import useFetch from "../../hooks/useFetch";
import { getTeamAttendance } from "../../api/attendanceApi";

export default function TeamReportPage() {
    const [filter, setFilter] = useState<TeamAttendanceFilters>({})
    const {data, isLoading , error} = useFetch(()=>getTeamAttendance(filter), "שגיאה בטעינת דוח צוות",["teamAttendance", filter]);
    return (
        <div>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && data.map((row) => (
                <div key={`${row.user.id} - ${row.date}`}>
                    <p>{row.user.name}</p>
                    <p>{row.status}</p>
                </div>
            ))}
        </div>
    );          
}