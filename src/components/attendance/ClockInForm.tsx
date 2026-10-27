import { useState } from 'react';
import { clockIn } from '../../api/attendanceApi';
export default function ClockInForm({ onSuccess }: ClockInFormProps) {
    const [error,setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const handleClockIn  = async (location: "OFFICE" | "HOME") => {
        setError(null);
        try {
            setIsLoading(true);
            await clockIn(location);
            await onSuccess();
        } catch {
            setError("שגיאה בעת דיווח כניסה");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<>
            <button disabled={isLoading} onClick={() => handleClockIn("OFFICE")}>כניסה מהמשרד
</button>
            <button disabled={isLoading} onClick={() => handleClockIn("HOME")}>כניסה מהבית
</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
   </> );
}
export interface ClockInFormProps {
    onSuccess: () => Promise<void>;
}
