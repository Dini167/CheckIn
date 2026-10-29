import { useState } from 'react';
import { clockOut } from '../../api/attendanceApi';
export default function ClockOutForm({ onSuccess }: ClockOutFormProps) {
    const [dailySummary, setDailySummary] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const handleClockOut = async () => {
        setError(null);
        if (dailySummary.trim() === "") {
            setError("יש לכתוב סיכום יומי קצר");
            return;
        }
        try {
            setIsLoading(true);
            await clockOut(dailySummary);
            await onSuccess();
        } catch {
            setError("שגיאה בעת דיווח יציאה");
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <>
            <label className="form-label w-100">
                סיכום יום העבודה:
                <textarea className="form-control mt-1" value={dailySummary} onChange={(e) => setDailySummary(e.target.value)} placeholder="סיכום יום העבודה" />
            </label>
            <button className="btn btn-primary btn-lg clock-btn" type="button" onClick={handleClockOut} disabled={isLoading}>
                {isLoading ? 'טוען...' : "סיום יום עבודה"}
            </button>
            {error && <p className="alert alert-danger py-2" style={{ color: 'red' }}>{error}</p>}
        </>
    );
}

export interface ClockOutFormProps {
    onSuccess: () => Promise<void>;
}


