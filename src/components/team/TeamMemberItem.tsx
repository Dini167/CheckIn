import type { TeamMember } from "../../types/team";
import EditSalaryForm from "./EditSalaryForm";
import { useState } from "react";

export default function TeamMemberItem({ member, onSalaryUpdated }: { member: TeamMember; onSalaryUpdated: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const handleSalaryUpdated = () => {
        setIsEditing(false);
        onSalaryUpdated();
    };
    return (

        <li>{member.name} ({member.email})  {member.salaryMissing ? "טרם הוגדר שכר" : member.salary + "₪ לשעה"}
            {isEditing && (
                <EditSalaryForm memberId={member.id} currentSalary={member.salary} onSuccess={handleSalaryUpdated} />
            )}

            <button type="button" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "ביטול" : "ערוך שכר"}
            </button>
        </li>

    );
}