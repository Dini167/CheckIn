import type { TeamCorrection } from "../../types/correction";
import { reviewCorrection } from "../../api/correctionsApi";
import { useState } from "react";
export default function CorrectionRequestItem({request,onReviewed}: {request: TeamCorrection,onReviewed:()=> void}) {
        const [isSaving, setIsSaving] = useState(false);
        const [error, setError] = useState<string | null>(null);
        
    return (
        <div>
            <p> שם:{request.user.name}</p>
            <p> תאריך עבודה:{request.workDate}</p>
            <p> שעת כניסה חדשה:{request.newClockInTime? request.newClockInTime : "-"}</p>
            <p> שעת יציאה חדשה:{request.newClockOutTime? request.newClockOutTime : "-"}</p>
            <p> סיבה:{request.reason}</p>
            
            <button disabled={isSaving || request.status !== "PENDING"} onClick={() => {
                setIsSaving(true);
                reviewCorrection(request.id, "APPROVED").then(onReviewed).catch((err) => setError(err.message)).finally(() => setIsSaving(false));
            }}>אישור</button>
            <button disabled={isSaving || request.status !== "PENDING"} onClick={() => {
                setIsSaving(true);
                reviewCorrection(request.id, "REJECTED").then(onReviewed).catch((err) => setError(err.message)).finally(() => setIsSaving(false));
            }}>דחייה</button>
            {error && <p>{error}</p>}
            
        </div>
    );
}