import {NavLink} from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { getHomePath } from '../../utils/getHomePath';
export default function NavBar() {
    const { user, logout, token } = useAuth();
    if (!user) return null;
    return (
        <>
            <nav>
                <NavLink to={getHomePath(user,token)}>דף הבית</NavLink>
                <NavLink to="/employee/attendance">הנוכחות שלי</NavLink>
                <NavLink to="/employee/salary">השכר שלי</NavLink>
                {user.role == "TEAM_LEADER" && (
                    <>
                        <NavLink to="/team-leader/members">ניהול עובדים</NavLink>
                        <NavLink to="/team-leader/attendance">מי במשמרת</NavLink>
                        <NavLink to="/team-leader/report">דוח נוכחות</NavLink>
                        <NavLink to="/team-leader/correction-requests">בקשות לתיקון שעות</NavLink>
                    </>
                )}
                <p>{user.name}</p>
                <button onClick={logout}>התנתקות</button>
            </nav>
        </>
    );
}