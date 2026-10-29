
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { CalendarDay } from "../../types/attendance"
import MyInput from "../common/MyInput";
import { uploadSickNote } from "../../api/sickNotesApi";
import { ApiError } from "../../api/ApiError";


export default function SickNoteForm({ day, onSuccess }: { day: CalendarDay, onSuccess: () => void }) {
    const { setError, register, handleSubmit, formState: { errors } } = useForm<{ note: string, file: FileList }>();
    const [sent, setSent] = useState(false);
    const onSubmit = async (data: { note: string, file: FileList }) => {
        const formdata = new FormData();
        formdata.append("note", data.note);
        formdata.append("file", data.file[0]);
        formdata.append("fromDate", day.date);
        formdata.append("toDate", day.date);   
        try {
            await uploadSickNote(formdata);
            setSent(true);
            onSuccess();
        } catch (error) {
            if (error instanceof ApiError) {
                setError("file", { message: error.message });
            } else {
                setError("file", { message: "אירעה תקלה. יש לנסות שוב." });
            }
        }
    };

    return (
        <div>
            {sent ? <p className="alert alert-success">האישור נשלח לראש הצוות</p> : ""}
            {!sent && (
            <form onSubmit={handleSubmit(onSubmit)}>
            <MyInput label="סיבת ההיעדרות" {...register("note", { required: "יש לכתוב סיבה" })} />
            <input className="form-control mb-3" type="file" accept=".pdf,.png,.jpg,.jpeg" {...register("file", { required: "יש לצרף קובץ" })} />
            <button className="btn btn-primary w-100" type="submit">שליחת אישור מחלה</button>
            {errors.file && <p className="invalid-feedback d-block">{errors.file.message}</p>}
            {errors.note && <p className="invalid-feedback d-block">{errors.note.message}</p>}
            </form>
            )}

        </div>
    );
}