import {NavLink} from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { getHomePath } from '../../utils/getHomePath';
export default function NavBar() {
    const { user, logout, token } = useAuth();
    if (!user) return null;
    return (
        <>
            <nav className="app-sidebar">
                <NavLink className="sidebar-link" to={getHomePath(user,token)}>דף הבית</NavLink>
                <NavLink className="sidebar-link" to="/employee/attendance">הנוכחות שלי</NavLink>
                <NavLink className="sidebar-link" to="/employee/salary">השכר שלי</NavLink>
                {user.role == "TEAM_LEADER" && (
                    <>
                        <NavLink className="sidebar-link" to="/team-leader/members">ניהול עובדים</NavLink>
                        <NavLink className="sidebar-link" to="/team-leader/attendance">מי במשמרת</NavLink>
                        <NavLink className="sidebar-link" to="/team-leader/report">דוח נוכחות</NavLink>
                        <NavLink className="sidebar-link" to="/team-leader/correction-requests">בקשות לתיקון שעות</NavLink>
                        <NavLink className="sidebar-link" to="/team-leader/sick-notes">אישורי מחלה</NavLink>
                    </>
                )}
                <p className="sidebar-user">{user.name}</p>
                <button className="btn sidebar-logout" onClick={logout}>התנתקות</button>
            </nav>
        </>
    );
}