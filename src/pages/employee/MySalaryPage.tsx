import { getMySalary } from '../../api/salaryApi';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';

export default function MySalaryPage() {
    const { data: salaryData, isLoading, error } = useFetch(getMySalary, "שגיאה בטעינת נתוני השכר", ["mySalary"]);
    const {user} = useAuth();
    return (<div className="page">
        <h1 className="page-title">
            נתוני השכר שלי :
        </h1>
        {isLoading && <p className="loading">טוען נתוני שכר...</p>}
        {error && <p className="alert alert-danger py-2" style={{ color: 'red' }}>{error}</p>}
        {salaryData && !isLoading && !error&& 
            <div>
                <p>חודש: {salaryData.month}</p>
                <p> ימי עבודה: {salaryData.workedDays}</p>
                <p>שעות רגילות: {salaryData.regularHours}</p>
                <p>שעות נוספות: {salaryData.overtimeHours}</p>
                {salaryData.salaryMissing ?? (<p>נתוני השכר עדיין לא זמינים</p>) }
                <p>שכר בסיס: {salaryData.basePay ? salaryData.basePay + " ₪" : "-"} </p>
                <p>תשלום עבור שעות נוספות: {salaryData.overtimePay ? salaryData.overtimePay + " ₪" : "-"} </p>
                {user?.role === "TEAM_LEADER" && <p>בונוס: {salaryData.bonus ? salaryData.bonus + " ₪" : "-"} </p>}
                <p>שכר כולל: {salaryData.total ? salaryData.total + " ₪" : "-"} </p>
            </div>
        }
    </div>);
}