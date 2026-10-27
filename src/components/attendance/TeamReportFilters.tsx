

import type { TeamAttendanceFilters } from "../../types/attendance";
import MyInput from "../common/MyInput";
export default function TeamReportFilters({ filter, setFilter }: { filter: TeamAttendanceFilters, setFilter: (filter: TeamAttendanceFilters) => void }) {

    return (
        <div>
            <MyInput
                label="חיפוש עובד"
                type="text"
                placeholder="חפש לפי שם עובד"
                value={filter.search ?? ""}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
            <select
                value={filter.location ?? ""}
                onChange={(e) => setFilter({ ...filter, location: e.target.value?(e.target.value as "OFFICE" | "HOME")
            : undefined })}
            >
                <option value="">כל המיקומים</option>
                <option value="OFFICE">משרד</option>
                <option value="HOME">בית</option>
            </select>
            <MyInput
                label="מתאריך"
                type="date"
                value={filter.from ?? ""}
                onChange={(e) => setFilter({ ...filter, from: e.target.value? e.target.value : undefined })}
            />
            <MyInput
                label="עד תאריך"
                type="date"
                value={filter.to ?? ""}
                onChange={(e) => setFilter({ ...filter, to: e.target.value? e.target.value : undefined })}
            />
            <select value={filter.sort??}>

            </select>
        </div>
    );
}

