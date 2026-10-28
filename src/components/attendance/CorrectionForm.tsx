
import {  useForm } from "react-hook-form";
import { useState } from "react";
import type { CalendarDay } from "../../types/attendance";
import MyInput from "../common/MyInput";
import type { Correction, CorrectionResult } from "../../types/correction";
import { createCorrection } from "../../api/correctionsApi";
import { ApiError } from "../../api/ApiError";

export default function CorrectionForm({ day, onSuccess }: { day: CalendarDay, onSuccess: () => void }) {
    const { setError, register, handleSubmit, formState: { errors } } = useForm<{ reason: string, newClockIn?: string, newClockOut: string, location?: string }>();
    const [res, setRes] = useState<CorrectionResult | null>(null);
    const submitCorrection = async (data: { reason: string, newClockIn?: string, newClockOut: string, location?: string }) => {
        const correction: Correction = {
            ...(day.status == "MISSING" ? {
            workDate: day.date,
            reason: data.reason,
            newClockIn: data.newClockIn,
            newClockOut: data.newClockOut,
            location: data.location,
            ...(day.status == "MISSING" ? {} : { sessionId: day.sessions[day.sessions.length - 1].id })
        } : {
            workDate: day.date,
            reason: data.reason,
            newClockIn: data.newClockIn,
            newClockOut: data.newClockOut,
            location: data.location,
            ...(day.status == "MISSING" ? {} : { sessionId: day.sessions[day.sessions.length - 1].id })
        })
        try {
            const response = await createCorrection(correction);
            setRes(response);
            onSuccess();
        } catch (error) {
            if (error instanceof ApiError) {
                setError("root", { type: "server", message: error.message });
            } else {
                setError("root", { type: "server", message:"אירעה תקלה. יש לנסות שוב." });
            }
        }
    }
    return (
        <div>
            <h2>טופס תיקון</h2>
            {!res && <form onSubmit={handleSubmit(submitCorrection)}>
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

                <button type="submit" disabled={res?true:false}>שלח תיקון</button>
                {errors.root && <span>{errors.root.message}</span>}
            </form>}
            {
                res && (res.status === "APPLIED" ? (
                    <p>התיקון נשמר</p>
                ) : <p>המכסה השבועית נגמרה, והבקשה נשלחה לאישור ראש הצוות</p>)
            }
        </div>
    )
}






