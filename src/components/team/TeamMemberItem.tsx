import type { TeamMember } from "../../types/team";
import EditSalaryForm from "./EditSalaryForm";
import { useState } from "react";
import { formatMonth } from "../../utils/formatMonth";

export default function TeamMemberItem({ member, onSalaryUpdated }: { member: TeamMember; onSalaryUpdated: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const handleSalaryUpdated = () => {
        setIsEditing(false);
        onSalaryUpdated();
    };
    return (

        <li className="list-group-item member-row">{member.name} ({member.email})  {member.salaryMissing ? "טרם הוגדר שכר" : member.salary + "₪ לשעה"}
            {isEditing && (
                <EditSalaryForm memberId={member.id} currentSalary={member.salary} onSuccess={handleSalaryUpdated} />
            )}
            <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "ביטול" : "ערוך שכר"}
            </button>
            {member.nextSalary && member.nextSalaryFrom && (
                <div className="next-salary">שכר עתידי: {member.nextSalary}₪ החל מ-{formatMonth(member.nextSalaryFrom)}</div>
            )}
        </li>

    );
}