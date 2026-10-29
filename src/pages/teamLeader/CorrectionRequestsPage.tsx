import CorrectionRequestItem from "../../components/attendance/CorrectionRequestItem";
import type { TeamCorrection } from "../../types/correction";
import useFetch from "../../hooks/useFetch";
import { getTeamCorrectionRequests } from "../../api/correctionsApi";

export default function CorrectionRequestsPage() {
    const { data: requests, error, isLoading,refetch: refetchRequests } = useFetch<TeamCorrection[]>(getTeamCorrectionRequests ,"שגיאה בקבלת הבקשות", ["correctionRequests"]);
    return (
        <div className="page">
            <h1 className="page-title">בקשות לתיקון שעות</h1>
            {isLoading &&<p className="loading">טוען...</p>}
            {error && <p className="alert alert-danger py-2">{error}</p>}
            {!isLoading && !error && (requests && requests.length > 0 ? requests.map((request) => (
                <CorrectionRequestItem key={request.id} request={request} onReviewed={() => { refetchRequests(); }} />
            )) : <p className="empty-state">אין בקשות שממתינות לאישור</p>)}
        </div>
    );
}
