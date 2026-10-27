import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router';
import MyAttendance from '../../components/attendance/MyAttendance';

export default function TeamLeaderHomePage() {
    const { logout } = useAuth();
    return (
        <div>
            <h1>Team Leader Home Page</h1>
            <Link to="/team-leader/members">ניהול עובדי הצוות</Link>
            <MyAttendance />
            <Link to="/employee/salary">המשכורת שלי</Link>
            <Link to="/team-leader/attendance">מי במשמרת היום</Link>
            <Link to="/team-leader/report">דוח נוכחות</Link>
            <Link to="/employee/attendance">נוכחות שלי</Link>
            <button onClick={logout}>התנתקות</button>
        </div>
    );
}





