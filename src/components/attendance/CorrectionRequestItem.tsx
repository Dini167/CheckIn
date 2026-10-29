import type { TeamCorrection } from "../../types/correction";
import { reviewCorrection } from "../../api/correctionsApi";
import { useState } from "react";
export default function CorrectionRequestItem({request,onReviewed}: {request: TeamCorrection,onReviewed:()=> void}) {
        const [isSaving, setIsSaving] = useState(false);
        const [error, setError] = useState<string | null>(null);
        
    return (
        <div>
            <p>{request.user.name? request.user.name : "-"}</p>
            <p>{request.workDate? request.workDate : "-"} תאריך עבודה:</p>
            <p>{request.newClockInTime? request.newClockInTime : "-"} שעת כניסה חדשה:</p>
            <p>{request.newClockOutTime? request.newClockOutTime : "-"} שעת יציאה חדשה:</p>
            <p>{request.reason? request.reason : "-"} סיבה:</p>
            
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