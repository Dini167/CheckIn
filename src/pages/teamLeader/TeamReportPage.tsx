import { useState } from "react";
import type { TeamAttendanceFilters } from "../../types/attendance";
import useFetch from "../../hooks/useFetch";
import { getTeamAttendance } from "../../api/attendanceApi";
import TeamReportTable from "../../components/attendance/TeamReportTable";

export default function TeamReportPage() {
    const [filter, setFilter] = useState<TeamAttendanceFilters>({})
    const {data, isLoading , error} = useFetch(()=>getTeamAttendance(filter), "שגיאה בטעינת דוח צוות",["teamAttendance", filter]);
    return (
        <div>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {
              !error && !isLoading && data && <TeamReportTable data={data} />
            }
        </div>
    );          
}