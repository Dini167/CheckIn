import { useState } from 'react';
import { clockIn } from '../../api/attendanceApi';
import MyInput from '../common/MyInput';

export default function ClockInForm({ onSuccess }: ClockInFormProps) {
    const [remark,setRemark] = useState<string>('');
    const [error,setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const handleClockIn  = async (location: "OFFICE" | "HOME") => {
        setError(null);
        try {
            setIsLoading(true);
            await clockIn(location,remark);
            await onSuccess();
            setRemark('')
        } catch {
            setError("שגיאה בעת דיווח כניסה");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<>
    <MyInput 
    label="הערה לדיווח (לא חובה)"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="הערה לדיווח חריג (לא חובה)"
    />
            <button className="btn btn-primary btn-lg clock-btn" disabled={isLoading} onClick={() => handleClockIn("OFFICE")}>כניסה מהמשרד
</button>
            <button className="btn btn-outline-primary btn-lg clock-btn" disabled={isLoading} onClick={() => handleClockIn("HOME")}>כניסה מהבית
</button>
            {error && <p className="alert alert-danger py-2" style={{ color: 'red' }}>{error}</p>}
   </> );
}
export interface ClockInFormProps {
    onSuccess: () => Promise<void>;
}
