import { useState } from "react"; // useState — לשמירת מצב "שומר..." והודעת שגיאה
import type { SickNote } from "../../types/sickNote"; // הטיפוס של אישור מחלה אחד, כמו שהשרת מחזיר
import { openSickNoteFile, reviewSickNote } from "../../api/sickNotesApi"; // פתיחת הקובץ + אישור/דחייה מול השרת
import { ApiError } from "../../api/ApiError"; // כדי לזהות שגיאה שהגיעה מהשרת ולהציג את ההודעה שלה

export default function SickNoteItem({ sickNote, onReviewed }: { sickNote: SickNote, onReviewed: () => void }) {
    const [isSaving, setIsSaving] = useState(false); 
    const [error, setError] = useState<string | null>(null); 
    const handleReview = async (decision: "APPROVED" | "REJECTED") => {
        setError(null); 
        setIsSaving(true); 
        try {
            await reviewSickNote(sickNote.id, decision); // שולחים לשרת את ההחלטה על האישור הזה
            onReviewed(); // הצליח — הדף טוען מחדש את הרשימה, והאישור נעלם ממנה
        } catch (err) {
            // אם השרת החזיר שגיאה — מציגים את ההודעה שלו; אחרת (למשל אין אינטרנט) — הודעה כללית
            setError(err instanceof ApiError ? err.message : "אירעה תקלה. יש לנסות שוב.");
        } finally {
            setIsSaving(false); // בכל מקרה (הצלחה או שגיאה) — מחזירים את הכפתורים לפעולה
        }
    };

    // פתיחת המסמך בלשונית חדשה. בנפרד מ־handleReview, כי זו רק צפייה ולא משנה כלום בשרת
    const handleOpenFile = async () => {
        setError(null);
        try {
            await openSickNoteFile(sickNote.id); // מבקש את הקובץ עם הטוקן ופותח אותו בלשונית חדשה
        } catch {
            setError("לא ניתן לפתוח את המסמך"); // למשל אם הקובץ לא נמצא בשרת
        }
    };

    return (
        <div>
            <p>שם: {sickNote.user.name}</p> {/* שם העובד ששלח את האישור */}
            <p>תאריך: {sickNote.fromDate}</p> {/* היום שעליו האישור (העובד מעלה אישור ליום אחד) */}
            <p>סיבה: {sickNote.note ?? "-"}</p> {/* ההסבר של העובד. note יכול להיות null — אז מציגים "-" */}

            {/* כפתור צפייה במסמך, עם שם הקובץ כדי שראש הצוות יידע מה הוא פותח */}
            <button type="button" onClick={handleOpenFile}>צפייה במסמך ({sickNote.fileName})</button>

            {/* שני כפתורי ההחלטה קוראים לאותה פונקציה, כל אחד עם החלטה אחרת. מושבתים בזמן ההמתנה לשרת */}
            <button type="button" disabled={isSaving} onClick={() => handleReview("APPROVED")}>אישור</button>
            <button type="button" disabled={isSaving} onClick={() => handleReview("REJECTED")}>דחייה</button>

            {error && <p>{error}</p>} {/* מוצג רק אם יש שגיאה */}
        </div>
    );
}
