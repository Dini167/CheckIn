# CheckIn — צד לקוח (React)

## 📍 מצב העבודה — עודכן 28.10.2026, 03:20

**הגשה:** היום 28.10.2026 עד 12:00

### איך מפעילים (3 טרמינלים, לפי הסדר)
1. `cd server` ← `npm run db:local` (מסד נתונים — להשאיר פתוח)
2. `cd server` ← `npm run dev` (שרת, פורט 3000)
3. בתיקייה הראשית ← `npm run dev` (אתר, http://localhost:5180)

### ✅ גמור
- הרשמה + התחברות · axios עם interceptors · AuthContext · Router + ProtectedRoute לפי תפקיד
- **React Query** (`useFetch` מבוסס `useQuery`)
- דף הבית (עובד + ראש צוות): כניסה/יציאה/עצירה, מקטעי היום, שעון חי, הערה אישית בכניסה
- השכר שלי · הנוכחות שלי (טבלה חודשית) · עובדי הצוות + עריכת שכר + קוד צוות
- מי במשמרת היום (רענון כל 30 שניות) · דוח נוכחות עם חיפוש, סינון, טווח תאריכים ומיון
- עיצוב מלא ב־CSS (`src/index.css`), RTL, מותאם לטלפון

### 👣 היום ב־08:00 — לפי הסדר
| שעה | משימה |
|---|---|
| 08:00 | תיקון קטן: `attendanceApi.ts:10` — לשלוח `remarks: remark` (השרת מצפה ל־remarks) |
| 08:00–09:15 | **תיקון שעות** (מסך 5, שלב ②): טיפוסים → `correctionsApi.ts` (`GET /corrections/quota`, `POST /corrections`) → מכסה בראש "הנוכחות שלי" → `CorrectionForm` עם react-hook-form → כפתור "תיקון" בשורות `isGap` |
| 09:15–10:45 | **העלאה ל־Render** — שרת + אתר + מסד נתונים (Neon). הוראות: `server/START-HERE.md` |
| 10:45–11:45 | **תיעוד AI** — דרישת המרצה: מה ביקשתי, מה קיבלתי, מה שיניתי ולמה, מה למדתי |
| 11:45–12:00 | בדיקה סופית במערכת שבאוויר + הגשה |

### ⬜ לא ייכנס להגשה (אחרי)
משימות היום · היסטוריית שכר · עובדים בלי שכר בלוח הצוות · אישורים לראש צוות · אישורי מחלה · חלון דופק עם צליל

### 💡 קיצורים שעוד לא יושמו
- `src/utils/handleFormError.ts` — פונקציה אחת במקום ה־catch שחוזר ב־`LoginForm` וב־`RegisterForm`
- `EmployeeHomePage`: למחוק את `loadAttendance` (זהה ל־`refreshAttendance`) · ‏`const state = todayAttendance?.state`
- `AttendanceStatus`: ‏`Record<AttendanceState, string>` במקום 4 תנאים
- ~~`src/hooks/useFetch.ts` (custom hook)~~ ✅ בוצע
- **TanStack Query — "דרך א" (מתוכנן ל־28.10 ב־02:00):** להחליף רק את הפנים של `useFetch` ב־`useQuery` + `QueryClientProvider` ב־`main.tsx`. אף דף לא משתנה

### 📝 אחרי ההגשה (לראיונות)
- העלאה לאינטרנט (Render + Neon — הוראות ב־`server/START-HERE.md`)
- README עם צילומי מסך ומשתמשי דמו
- חלון דופק עם צליל · משימות היום

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
