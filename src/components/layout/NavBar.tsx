import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { getHomePath } from '../../utils/getHomePath';
export default function NavBar() {
    const { user, logout } = useAuth();
    if (!user) return null;
    return (
        <>
            <nav>
                <h1>סרגל הניווט שלי</h1>
                <Link to={getHomePath()}>בית</Link>
                <Link to="/MyAttendance">נוכחות שלי</Link>
                <Link to="/my-salary">השכר שלי</Link>
                {user.role == "TEAM_LEADER" && (
                    <>
                        <Link to="/team-members">חברי הצוות</Link>
                        <Link to="/team-attendance">נוכחות הצוות</Link>
                        <Link to="/team-reports">דוחות הצוות</Link>
                    </>
                )}



            </nav>
        </>
    );
}