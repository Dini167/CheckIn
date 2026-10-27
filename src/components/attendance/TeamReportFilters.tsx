

import type { TeamAttendanceFilters } from "../../types/attendance";
import MyInput from "../common/MyInput";
export default function TeamReportFilters({ filter, setFilter }: { filter: TeamAttendanceFilters, setFilter: (filter: TeamAttendanceFilters) => void }) {

    return (
        <div>
            <MyInput
                label="חפש לפי שם עובד"
                type="text"
                placeholder="חפש לפי שם עובד"
                value={filter.search ?? ""}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
        </div>
    );
}

