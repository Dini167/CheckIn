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
            <h3 className="section-title">עדכון שכר</h3>
            <input className="form-control salary-input" type="number" value={salary ?? ""} onChange={(e) => setSalary(e.target.value ? parseFloat(e.target.value) : null)} />
            <button className="btn btn-primary btn-sm" disabled={isSaving} type="button" onClick={handleSubmit}> {isSaving ? "שומר..." : "שמור שכר"}
            </button>
            {error && <p className="alert alert-danger py-2" style={{ color: 'red' }}>{error}</p>}

        </>
    );




}