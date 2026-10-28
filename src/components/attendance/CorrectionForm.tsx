
import { useForm } from "react-hook-form";
import type { CalendarDay } from "../../types/attendance";
import MyInput from "../common/MyInput";
import type{ Correction } from "../../types/correction";

export default function CorrectionForm({ day, onSuccess }: { day: CalendarDay, onSuccess: () => void }) {
    const {setError, register, handleSubmit, formState: { errors } } = useForm<{ reason: string, newClockIn?: string, newClockOut: string, location?: string }>();
    const submitCorrection = async (data: { reason: string, newClockIn?: string, newClockOut: string, location?: string }) => {
        const correction: Correction = {
            workDate: day.date,
            reason: data.reason,
            newClockIn: data.newClockIn,
            newClockOut: data.newClockOut,
            location: data.location,
            ...(day.status=="MISSING" ? { idSession:0 } : { idSession: day.sessions[-1].id })
        };
       try{
            
       }
    }
    return (
        <div>
            <h2>טופס תיקון</h2>
            <form onSubmit={handleSubmit(onSuccess)}>
                <MyInput label="סיבה" type="text" {...register("reason", { required: true })} />
                {day.status == "MISSING" && (<>
                    <MyInput label="כניסה חדשה" type="time" {...register("newClockIn")} />
                    <label>
                        מיקום:
                        <select {...register("location")}>
                            <option value="OFFICE">משרד</option>
                            <option value="HOME">בית</option>
                        </select>
                    </label></>)}
                <MyInput label="יציאה חדשה" type="time" {...register("newClockOut", { required: true })} />

                <button type="submit">שלח תיקון</button>
            </form>
        </div>
    )
}






