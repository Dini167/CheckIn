import useFetch from '../../hooks/useFetch';
import { getTeamMembers } from '../../api/teamApi';
import TeamMembersList from '../../components/team/TeamMembersList';
import { useAuth } from '../../hooks/useAuth';

export default function TeamMembersPage() {
    const { data, isLoading, error, refetch } = useFetch(getTeamMembers, "שגיאה בטעינת עובדי הצוות", ["teamMembers"]);
    const teamMembers = data ?? [];
    const { user } = useAuth();
    return (
        <div className="page">
            <h1 className="page-title">עובדי הצוות</h1>
            {isLoading && <p className="loading">טוען עובדים...</p>}
            {error && <p className="alert alert-danger py-2" style={{ color: 'red' }}>{error}</p>}
            {!isLoading && !error && teamMembers.length === 0 && (
                <p className="empty-state">לא נמצאו עובדים בצוות זה</p>
            )}
            <p className="join-code">{user?.team.joinCode}</p>

            {!isLoading && !error && teamMembers.length > 0 && (
                <TeamMembersList members={teamMembers} onSalaryUpdated={refetch} />
            )}
        </div>
    );
}



