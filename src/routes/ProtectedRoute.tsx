

import {useAuth} from '../hooks/useAuth';
import { Navigate } from 'react-router';
import type { ReactNode } from 'react';
import { getHomePath } from '../utils/getHomePath';

export default function ProtectedRoute({ allowedRole, children }: { allowedRole?: ("EMPLOYEE" | "TEAM_LEADER")[], children: ReactNode }) {
    const { user,token } = useAuth();
    const defaultPath = getHomePath(user, token);
    if (!user || !token) {
        return <Navigate replace to="/login" />;
    }
    if (allowedRole && (allowedRole.length > 0 && !allowedRole.includes(user?.role))) {
        return <Navigate replace to={defaultPath} />;
    }
    return children;
}



