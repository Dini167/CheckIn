
import { useAuth } from '../../hooks/useAuth';
import LiveClock from '../../components/attendance/LiveClock';
import MyAttendance from '../../components/attendance/MyAttendance';

export default function EmployeeHomePage() {
    const { user } = useAuth();
    return (
        <div>
            <h1>דף הבית</h1>
            <h2>שלום, {user?.name}</h2>
            <LiveClock />
            <MyAttendance />
        </div>
    );
}