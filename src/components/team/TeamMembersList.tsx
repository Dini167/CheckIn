
import type { TeamMember } from '../../types/team';
import TeamMemberItem from './TeamMemberItem';

export default function TeamMembersList({ members,onSalaryUpdated }: { members: TeamMember[], onSalaryUpdated: () => void }) {
    return (<>
    <ul className="list-group members-list">
        {members.map(member => (
            <TeamMemberItem key={member.id} member={member} onSalaryUpdated={onSalaryUpdated} />
        ))}
    </ul>
    </>)
}