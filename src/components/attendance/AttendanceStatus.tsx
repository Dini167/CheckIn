import type { AttendanceState } from '../../types/attendance';

export default function AttendanceStatus({ state }: { state: AttendanceState }) {
    return (
        <span>
            {state === "IN" ? "נוכח" : ""}
            {state === "PAUSED" ? "בהפסקה" : ""}
            {state === "NOT_STARTED" ? "לא התחיל" : ""}
            {state === "ENDED" ? "יום העבודה הסתיים. אפשר לחזור לעבוד בכל עת."

 : ""}
        </span>
    );
}