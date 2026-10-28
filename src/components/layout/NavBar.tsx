import { Link } from 'react-router';
import {NavLink} from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { getHomePath } from '../../utils/getHomePath';
export default function NavBar() {
    const { user, logout, token } = useAuth();
    if (!user) return null;
    return (
        <>
            <nav>
                <h1>סרגל הניווט שלי</h1>
                <NavLink to={getHomePath(user,token)}>בית</NavLink>
                <NavLink to="/employee/attendance">נוכחות שלי</NavLink>
                <NavLink to="/employee/salary">השכר שלי</NavLink>
                {user.role == "TEAM_LEADER" && (
                    <>
                        <NavLink to="/team-leader/members">חברי הצוות</NavLink>
                        <NavLink to="/team-leader/attendance">נוכחות הצוות</NavLink>
                        <NavLink to="/team-leader/report">דוחות הצוות</NavLink>
                    </>
                )}
                <p>{user.name}</p>
                <button onClick={logout}>התנתק</button>
            </nav>
        </>
    );
}