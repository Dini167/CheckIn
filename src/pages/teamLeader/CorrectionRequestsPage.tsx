import CorrectionRequestItem from "../../components/attendance/CorrectionRequestItem";
import type { TeamCorrection } from "../../types/correction";
import useFetch from "../../hooks/useFetch";
import { getTeamCorrectionRequests } from "../../api/correctionsApi";

export default function CorrectionRequestsPage() {
    const { data: requests, error, isLoading } = useFetch<TeamCorrection[]>(getTeamCorrectionRequests , ["correctionRequests"]);
    return (
        <div>
            <h1>בקשות לתיקון שעות</h1>
            {isLoading && <p>טוען...</p>}
            {error && <p>{error}</p>}
            {requests? requests.map((request) => (
                <CorrectionRequestItem key={request.id} request={request} onReviewed={() => {}} />
            )) : <p>אין בקשות שממתינות לאישור</p>}
        </div>
    );
}
