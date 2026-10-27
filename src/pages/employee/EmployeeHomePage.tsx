
import { useAuth } from '../../hooks/useAuth';
import LiveClock from '../../components/attendance/LiveClock';
import { Link } from 'react-router';
import MyAttendance from '../../components/attendance/MyAttendance';

export default function EmployeeHomePage() {
    const { logout,user } = useAuth();
    return (
        <div>
            <h1>Employee Home Page</h1>
            <h2>שלום, {user?.name}</h2>
            <LiveClock />
            <MyAttendance />
            <Link to="/employee/salary">השכר שלי</Link>
            <Link to="/employee/attendance">נוכחות שלי</Link>
            <button onClick={logout}>התנתקות</button>
        </div>
    );
}