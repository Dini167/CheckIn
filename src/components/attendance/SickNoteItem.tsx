import { useState } from "react";
import type { SickNote } from "../../types/sickNote";
import { openSickNoteFile, reviewSickNote } from "../../api/sickNotesApi";
import { ApiError } from "../../api/ApiError";

export default function SickNoteItem({ sickNote, onReviewed }: { sickNote: SickNote, onReviewed: () => void }) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleReview = async (decision: "APPROVED" | "REJECTED") => {
        setError(null);
        setIsSaving(true);
        try {
            await reviewSickNote(sickNote.id, decision);
            onReviewed();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "אירעה תקלה. יש לנסות שוב.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenFile = async () => {
        setError(null);
        try {
            await openSickNoteFile(sickNote.id);
        } catch {
            setError("לא ניתן לפתוח את המסמך");
        }
    };

    return (
        <div className="request-card">
            <p>שם: {sickNote.user.name}</p>
            <p>תאריך: {sickNote.fromDate}</p>
            <p>סיבה: {sickNote.note ?? "-"}</p>
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleOpenFile}>צפייה במסמך ({sickNote.fileName})</button>
            <button className="btn btn-success btn-sm" type="button" disabled={isSaving} onClick={() => handleReview("APPROVED")}>אישור</button>
            <button className="btn btn-outline-danger btn-sm" type="button" disabled={isSaving} onClick={() => handleReview("REJECTED")}>דחייה</button>
            {error && <p className="alert alert-danger py-2 mt-2">{error}</p>}
        </div>
    );
}
