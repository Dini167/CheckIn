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
        <button type="button" onClick={handlePause} disabled={isLoading}>
            {isLoading ? 'טוען...' : 'הפסקה'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}  
    </>
    );
}

export interface PauseButtonProps {
    onSuccess: () => Promise<void>;
}