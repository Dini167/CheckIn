import { useState } from 'react';
import { updateMemberSalary } from '../../api/teamApi';


export default function EditSalaryForm({ memberId, currentSalary, onSuccess }: { memberId: number, currentSalary: number | null, onSuccess: () => void }) {
    const [salary, setSalary] = useState<number | null>(currentSalary ?? null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = async () => {
        if (salary === null || !Number.isFinite(salary)) { return; }
        setError(null);
        try {
            setIsSaving(true);
            await updateMemberSalary(memberId, salary);
            onSuccess();
        } catch {
            setError("שגיאה בעדכון השכר");
        } finally {
            setIsSaving(false);
        }

    }

    return (
        <>
            <h3>עדכון שכר</h3>
            <input type="number" value={salary ?? ""} onChange={(e) => setSalary(e.target.value ? parseFloat(e.target.value) : null)} />
            <button disabled={isSaving} type="button" onClick={handleSubmit}> {isSaving ? "שומר..." : "שמור שכר"}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}

        </>
    );




}