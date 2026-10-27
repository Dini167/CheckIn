
import { Route, Routes, Navigate } from 'react-router';
import TeamLeaderHomePage from '../pages/teamLeader/TeamLeaderHomePage';
import TeamAttendancePage from '../pages/teamLeader/TeamAttendancePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import EmployeeHomePage from '../pages/employee/EmployeeHomePage';
import ProtectedRoute from '../routes/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { getHomePath } from '../utils/getHomePath';
import MySalaryPage from '../pages/employee/MySalaryPage';
import TeamMembersPage from '../pages/teamLeader/TeamMembersPage';
import TeamReportPage from '../pages/teamLeader/TeamReportPage';

export default function AppRoutes() {
    const { user, token } = useAuth();
    const defaultPath = getHomePath(user, token);
    return (
        <Routes>
            <Route path="/login" element={user && token ? <Navigate replace to={defaultPath} /> : <LoginPage />} />
            <Route path="/register" element={user && token ? <Navigate replace to={defaultPath} /> : <RegisterPage />} />
            <Route path="/" element={<Navigate replace to={defaultPath} />} />
            <Route path="/employee" element={<ProtectedRoute allowedRole={["EMPLOYEE"]}>
                <EmployeeHomePage /></ProtectedRoute>} />
            <Route path="/team-leader" element={<ProtectedRoute allowedRole={["TEAM_LEADER"]}>
                <TeamLeaderHomePage /></ProtectedRoute>} />
            <Route path="/team-leader/members" element={<ProtectedRoute allowedRole={["TEAM_LEADER"]}>
                <TeamMembersPage /></ProtectedRoute>} />
            <Route path="/employee/salary" element={<ProtectedRoute allowedRole={["EMPLOYEE","TEAM_LEADER"]}>
                <MySalaryPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate replace to="/" />} />
            <Route path="/team-leader/attendance" element={<ProtectedRoute allowedRole={["TEAM_LEADER"]}>
                <TeamAttendancePage /></ProtectedRoute>} />
            <Route path="/team-leader/report" element={<ProtectedRoute allowedRole={["TEAM_LEADER"]}>
                <TeamReportPage /></ProtectedRoute>} />
        </Routes>
    );
}




