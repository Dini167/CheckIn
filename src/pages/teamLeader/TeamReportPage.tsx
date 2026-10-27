import { useState } from "react";
import type { TeamAttendanceFilters } from "../../types/attendance";
import useFetch from "../../hooks/useFetch";
import { getTeamAttendance } from "../../api/attendanceApi";
import TeamReportTable from "../../components/attendance/TeamReportTable";
import TeamReportFilters from "../../components/attendance/TeamReportFilters";

export default function TeamReportPage() {
    const [filter, setFilter] = useState<TeamAttendanceFilters>({})
    const { data, isLoading, error } = useFetch(() => getTeamAttendance(filter), "שגיאה בטעינת דוח צוות", ["teamAttendance", filter]);
    const rows = data ?? [];
    return (
        <div>
            <h1>דוח נוכחות צוותית</h1>
            <TeamReportFilters filter={filter} setFilter={setFilter} />
            {isLoading && <p>טוען דוח נוכחות...</p>}
            {error && <p style={{ color: 'red' }}>{error.message}</p>}
            {!isLoading && !error && rows.length === 0 && <p>לא נמצאו דיווחי נוכחות</p>}
            {!isLoading && !error && rows.length > 0 && <TeamReportTable data={rows} />}
        </div>
    );
}
