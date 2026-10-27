import { getMySalary } from '../../api/salaryApi';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';

export default function MySalaryPage() {
    const { data: salaryData, isLoading, error } = useFetch(getMySalary, "שגיאה בטעינת נתוני השכר");
    const {user} = useAuth();
    return (<div>
        <h1>
            נתוני השכר שלי :
        </h1>
        {isLoading && <p>טוען נתוני שכר...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {(salaryData && !isLoading && !error) && (salaryData.salaryMissing ? ("נתוני השכר עדיין לא זמינים") : (
            <div>
                <p>חודש: {salaryData.month}</p>
                <p> ימי עבודה: {salaryData.workedDays}</p>
                <p>שעות רגילות: {salaryData.regularHours}</p>
                <p>שעות נוספות: {salaryData.overtimeHours}</p>
                <p>שכר בסיס: {salaryData.basePay ?? "-"}</p>
                <p>תשלום עבור שעות נוספות: {salaryData.overtimePay ?? "-"}</p>
                {user?.role === "TEAM_LEADER" && <p>בונוס: {salaryData.bonus ?? "-"}</p>}
                <p>שכר כולל: {salaryData.total ?? "-"}</p>
            </div>
        ))}
    </div>);
}