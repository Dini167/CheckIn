import useFetch from "../../hooks/useFetch"; // ה־hook המשותף לטעינת נתונים מהשרת (מבוסס React Query)
import { getTeamSickNotes } from "../../api/sickNotesApi"; // מביא מהשרת את אישורי המחלה שממתינים לאישור
import type { SickNote } from "../../types/sickNote"; // הטיפוס של אישור מחלה אחד
import SickNoteItem from "../../components/attendance/SickNoteItem"; // הקומפוננטה שמציגה אישור אחד עם הכפתורים

// דף לראש הצוות: רשימת אישורי המחלה של העובדים שמחכים להחלטה שלו
export default function SickNotesPage() {
    // טוענים את האישורים: הפונקציה, הודעת שגיאה, ומפתח (queryKey) ש־React Query מזהה בו את הנתונים.
    // refetch — פונקציה שטוענת שוב מהשרת. נשתמש בה אחרי אישור/דחייה, כדי שהאישור ייעלם מהרשימה.
    const { data: sickNotes, isLoading, error, refetch } = useFetch<SickNote[]>(getTeamSickNotes, "שגיאה בטעינת אישורי המחלה", ["teamSickNotes"]);

    return (
        <div className="page">
            <h1 className="page-title">אישורי מחלה</h1>
            {isLoading && <p className="loading">טוען...</p>} {/* בזמן הטעינה */}
            {error && <p className="alert alert-danger py-2">{error}</p>} {/* אם הטעינה נכשלה */}

            {/* רק אחרי שהטעינה הסתיימה בלי שגיאה: אם יש אישורים — מציגים אותם, ואם לא — הודעה */}
            {!isLoading && !error && (sickNotes && sickNotes.length > 0
                ? sickNotes.map((sickNote) => (
                    // key — המזהה הייחודי של כל אישור, כדי ש־React יידע לזהות כל פריט ברשימה
                    // onReviewed — אחרי אישור/דחייה טוענים מחדש, והאישור שטופל נעלם (השרת מחזיר רק ממתינים)
                    <SickNoteItem key={sickNote.id} sickNote={sickNote} onReviewed={() => { refetch(); }} />
                ))
                : <p className="empty-state">אין אישורי מחלה שממתינים לאישור</p>)}
        </div>
    );
}
