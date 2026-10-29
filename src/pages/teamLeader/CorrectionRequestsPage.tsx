import CorrectionRequestItem from "../../components/attendance/CorrectionRequestItem";
import type { TeamCorrection } from "../../types/correction";
import useFetch from "../../hooks/useFetch";
import { getTeamCorrectionRequests } from "../../api/correctionsApi";

export default function CorrectionRequestsPage() {
    const { data: requests, error, isLoading,refetch: refetchRequests } = useFetch<TeamCorrection[]>(getTeamCorrectionRequests ,"שגיאה בקבלת הבקשות", ["correctionRequests"]);
    return (
        <div>
            <h1>בקשות לתיקון שעות</h1>
            {isLoading &&<p>טוען...</p>}
            {error && <p>{error}</p>}
            {!isLoading && !error && (requests && requests.length > 0 ? requests.map((request) => (
                <CorrectionRequestItem key={request.id} request={request} onReviewed={() => { refetchRequests(); }} />
            )) : <p>אין בקשות שממתינות לאישור</p>)}
        </div>
    );
}
