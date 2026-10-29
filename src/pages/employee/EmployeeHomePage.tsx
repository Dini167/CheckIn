
import { useAuth } from '../../hooks/useAuth';
import LiveClock from '../../components/attendance/LiveClock';
import MyAttendance from '../../components/attendance/MyAttendance';

export default function EmployeeHomePage() {
    const { user } = useAuth();
    return (
        <div className="page">
            <h1 className="page-title">דף הבית</h1>
            <h2 className="greeting">שלום, {user?.name}</h2>
            <LiveClock />
            <MyAttendance />
        </div>
    );
}