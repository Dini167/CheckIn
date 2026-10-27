import useFetch from '../../hooks/useFetch';
import { getTeamMembers } from '../../api/teamApi';
import TeamMembersList from '../../components/team/TeamMembersList';
import { useAuth } from '../../hooks/useAuth';

export default function TeamMembersPage() {
    const { data, isLoading, error, refetch } = useFetch(getTeamMembers, "שגיאה בטעינת עובדי הצוות");
    const teamMembers = data ?? [];
    const { user } = useAuth();
    return (
        <div>
            <h1>עובדי הצוות</h1>
            {isLoading && <p>טוען עובדים...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!isLoading && !error && teamMembers.length === 0 && (
                <p>לא נמצאו עובדים בצוות זה</p>
            )}
            <p>{user?.team.joinCode}</p>

            {!isLoading && !error && teamMembers.length > 0 && (
                <TeamMembersList members={teamMembers} onSalaryUpdated={refetch} />
            )}
        </div>
    );
}



