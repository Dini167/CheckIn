import { useState } from 'react';
import { pauseAttendance } from '../../api/attendanceApi';
export default function PauseButton({ onSuccess }: PauseButtonProps) {
    
        const [error,setError] = useState<string | null>(null);
        const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const handlePause = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await pauseAttendance();
            await onSuccess();
        } catch {
            setError("שגיאה בעת יציאה להפסקה");
        } finally {
            setIsLoading(false);
        }
    };
    return (<>
        <button className="btn btn-outline-secondary btn-lg clock-btn" type="button" onClick={handlePause} disabled={isLoading}>
            {isLoading ? 'טוען...' : 'הפסקה'}
        </button>
        {error && <p className="alert alert-danger py-2" style={{ color: 'red' }}>{error}</p>}  
    </>
    );
}

export interface PauseButtonProps {
    onSuccess: () => Promise<void>;
}