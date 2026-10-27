import { useState } from "react";
import type { TeamAttendanceFilters } from "../../types/attendance";
import useFetch from "../../hooks/useFetch";
import type { TeamAttendanceRow } from "../../types/attendance";

export default function TeamReportPage() {
    const [filter, setFilter] = useState<TeamAttendanceFilters>({})
    const {data, isLoading , error, refetch} = useFetch<TeamAttendanceRow[]>(, "שגיאה בטעינת הנתונים");
    return (
        <div>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {data && data.map((row) => (
                <div key={row.user.id && row.data}>
                    <p>{row.user.name}</p>
                    <p>{row.status}</p>
                </div>
            ))}
        </div>
    );          
}