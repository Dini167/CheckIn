import { useForm } from "react-hook-form";
import { useState } from "react";
import type { CalendarDay } from "../../types/attendance"
import MyInput from "../MyInput";
import uploadSickNote from "../../api/uploadSickNote";
import ApiError from "../../api/ApiError";


export default function SickNoteForm({ day, onSuccess }: { day: CalendarDay, onSuccess: () => void }) {
    const { setError, register, handleSubmit, formState: { errors } } = useForm<{ note: string, file: FileList }>();
    const [sent, setSent] = useState(false);
    const form ad
    const onSubmit = async (data: { note: string, file: FileList }) => {
        try {
            await uploadSickNote(day, data.note, data.file[0]);
            setSent(true);
            onSuccess();
        } catch (error) {
            if (error instanceof ApiError) {
                setError("file", { message: error.message });
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input type="file" {...register("file")} />
            <button type="submit">Upload Sick Note</button>
        </form>
    );
}