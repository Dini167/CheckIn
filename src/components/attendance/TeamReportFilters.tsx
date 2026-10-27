

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
                /* שונה: חיפוש ריק הופך ל-undefined כדי שלא יישלח search= ריק לשרת */
                onChange={(e) => setFilter({ ...filter, search: e.target.value ? e.target.value : undefined })}
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
            <select value={filter.sort??""} onChange={(e) => setFilter({ ...filter, sort: e.target.value ? e.target.value as ("date" | "name" |"clockIn"|"workedMinutes") : undefined })}>
            <option value="">ללא מיון</option>
            <option value="date">מיון לפי תאריך</option>
            <option value="name">מיון לפי שם</option>
            <option value="clockIn">מיון לפי כניסה</option>
            <option value="workedMinutes">מיון לפי דקות עבודה</option>
            </select>
            {/* שונה: ASC/DESC הוחלפו ל-asc/desc באותיות קטנות — אלה הערכים שהשרת והטיפוס מקבלים */}
            <select value={filter.order??""} onChange={(e) => setFilter({ ...filter, order: e.target.value ? e.target.value as ("asc" | "desc") : undefined })}>
                <option value="">ללא סדר</option>
                <option value="asc">עולה</option>
                <option value="desc">יורד</option>
            </select>
        </div>
    );
}

