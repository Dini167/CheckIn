import type { TeamCorrection } from "../../types/correction";
import { reviewCorrection } from "../../api/correction";
export default function CorrectionRequestItem({request,onReviewed}: {request: TeamCorrection,onReviewed:()=> void}) {
    return (
        <div>
            <p>{request.user.name? request.user.name : "-"}</p>
            <p>{request.workDate? request.workDate : "-"}</p>
            <p>{request.newClockInTime? request.newClockInTime : "-"}</p>
            <p>{request.newClockOutTime? request.newClockOutTime : "-"}</p>
            <p>{request.reason? request.reason : "-"}</p>

            <button disabled={request.status !== "PENDING"} onClick={() => reviewCorrection(request.id, "APPROVED").then(onReviewed)}>אישור</button>
            <button disabled={request.status !== "PENDING"} onClick={() => reviewCorrection(request.id, "REJECTED").then(onReviewed)}>דחייה</button>
            
        </div>
    );
}