# CheckIn — צד לקוח (React)

## 📍 מצב העבודה — עודכן 27.10.2026, 02:50

**הגשה:** יום רביעי 28.10.2026 עד 12:00 · **התקדמות:** כ־35% מצד הלקוח (השרת גמור)

### איך מפעילים (3 טרמינלים, לפי הסדר)
1. `cd server` ← `npm run db:local` (מסד נתונים — להשאיר פתוח)
2. `cd server` ← `npm run dev` (שרת, פורט 3000)
3. בתיקייה הראשית ← `npm run dev` (אתר, http://localhost:5180)

### ✅ גמור
- **הרשמה** (עובד / ראש צוות) ו**התחברות**, כולל הצגת שגיאות מהשרת
- **axios** (`src/api/axiosInstance.ts`): טוקן אוטומטי בכל בקשה, התנתקות אוטומטית ב־401
- **AuthContext + useAuth**: המשתמש נשאר מחובר אחרי רענון
- **Router**: ‏`/login`, ‏`/register`, ‏`/employee`, ‏`/team-leader` · ‏`ProtectedRoute` עם `allowedRole` · ‏`getHomePath` (מעבר לדף הנכון לפי תפקיד)
- קישורים בין התחברות להרשמה · כפתור התנתקות
- **דף הבית של העובד** (`src/pages/employee/EmployeeHomePage.tsx`):
  סטטוס היום, כניסה (משרד / בית), עצירה זמנית, יציאה עם סיכום יומי, רשימת מקטעי היום, סך שעות היום
- **בשרת:** בדיקות דופק רק בעבודה מהבית (לא מהמשרד)

### 👣 מחר מתחילים כאן — תיקונים קטנים בדף הבית (20 דק')
1. להציג את `ClockOutForm` גם במצב `PAUSED` (עובד שבעצירה יכול לסיים את היום)
2. לחבר את `LiveClock` לדף הבית (הקומפוננטה כתובה, עוד לא מוצגת)
3. ליצור `src/utils/formatMinutes.ts` (המרת דקות ל־שעות:דקות — נצטרך בטבלה ובשכר)
4. בדיקה בדפדפן: כניסה ← עצירה ← חזרה ← יציאה

### ⬜ נשאר למחר (שלישי, ~9 שעות)
| # | מסך | Endpoint | זמן |
|---|---|---|---|
| 1 | **השכר שלי** (עובד) | `GET /api/salary/me?month=` | שעה |
| 2 | **הנוכחות שלי** (עובד) — טבלה חודשית | `GET /api/attendance/calendar?month=` | שעתיים |
| 3 | **עובדי הצוות** (ראש צוות) — קוד צוות, רשימה, עדכון שכר | `GET /api/team/members` · `PATCH /api/team/members/:id/salary` | שעתיים |
| 4 | **לוח צוות** (ראש צוות) — מי במשמרת עכשיו | `GET /api/attendance/team/now` | שעה וחצי |
| 5 | **נוכחות צוותית** (ראש צוות) — דוח עם סינון | `GET /api/attendance/team` | שעתיים |

פרטי כל Endpoint: `server/FRONTEND-API-GUIDE.md`, סעיף 6.

### 🎨 רביעי בבוקר (עד 12:00)
- תפריט ניווט ועיצוב (בהשראת "זמן אמת": תפריט צד כהה + טבלה חודשית) · `dir="rtl"` ב־`index.html`
- בדיקה מלאה כעובד וכראש צוות · הגשה
- אם יישאר זמן: משימות היום

### 💡 קיצורים שעוד לא יושמו
- `src/utils/handleFormError.ts` — פונקציה אחת במקום ה־catch שחוזר ב־`LoginForm` וב־`RegisterForm`
- `EmployeeHomePage`: למחוק את `loadAttendance` (זהה ל־`refreshAttendance`) · ‏`const state = todayAttendance?.state`
- `AttendanceStatus`: ‏`Record<AttendanceState, string>` במקום 4 תנאים
- `src/hooks/useFetch.ts` (custom hook) — במקום בלוק הטעינה/שגיאה שחוזר בכל דף (אחרי ההגשה)

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
