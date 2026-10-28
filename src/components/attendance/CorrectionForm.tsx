
import { useForm } from "react-hook-form";
import type { CalendarDay } from "../../types/attendance";
import MyInput from "../common/MyInput";

export default function CorrectionForm({ day, onSuccess }: { day: CalendarDay, onSuccess: () => void }) {
    const {setError, register, handleSubmit, formState: { errors } } = useForm<{ reason: string, newClockIn?: string, newClockOut: string, location?: string }>();

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






