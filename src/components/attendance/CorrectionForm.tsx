
import { useForm } from "react-hook-form";
import type { CalendarDay } from "../../types/attendance";

export default function CorrectionForm({ day, onSuccess }: { day: CalendarDay, onSuccess: () => void }) {
    const { reason, newClockIn, newClockOut, location } = useForm();

    return (
        <div>
            <h2>טופס תיקון</h2>
            <form>
                <label>
                    סיבה:
                    <input type="text" {...reason} />
                </label>
                {day.status == "MISSING" && (<>
                    <label>
                        כניסה חדשה:
                        <input type="time" {...newClockIn} />
                    </label>
                    <label>
                        מיקום:
                        <select {...location}>
                            <option value="office">משרד</option>
                            <option value="remote">מרחוק</option>
                        </select>
                    </label></>)}
                <label>
                    יציאה חדשה:
                    <input type="time" {...newClockOut} />
                </label>

                <button type="submit">שלח תיקון</button>
            </form>
        </div>
    )
}






