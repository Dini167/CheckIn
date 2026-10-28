# CheckIn — מערכת נוכחות ושכר לצוותים

מערכת לניהול נוכחות עובדים: דיווח כניסה ויציאה מהמשרד או מהבית, דוחות לראש הצוות, תיקון שעות מבוקר וחישוב שכר אוטומטי.

## 🌐 האתר באוויר

| | קישור |
|---|---|
| **האתר** | https://checkin-client-tml7.onrender.com |
| **קוד הלקוח (React)** | https://github.com/Dini167/CheckIn-client |
| **קוד השרת (Node + PostgreSQL)** | https://github.com/Dini167/CheckIn-server |

> השרת רץ במסלול החינמי של Render ו"נרדם" אחרי זמן בלי שימוש — הכניסה הראשונה יכולה לקחת עד דקה.

## 👤 משתמשי דמו

| תפקיד | שם | אימייל | סיסמה |
|---|---|---|---|
| ראש צוות | דנה ישראלי | `dana@example.com` | `Dana-Demo-2026` |
| עובד | יוסי לוי | `yossi@example.com` | `Worker-Demo-2026` |
| עובדת | נועה כהן | `noa@example.com` | `Worker-Demo-2026` |

- **קוד הצוות:** `TEAM-DEMO1` (צוות פיתוח) — להרשמה של עובד חדש לצוות.
- במערכת יש היסטוריית נוכחות לדוגמה של כחודש, כולל ימים עם חסר בדיווח, יום מחלה וחג.
- כל הנתונים בדויים.

---

## 🎯 מטרת המערכת

בעסקים קטנים ובינוניים, דיווח השעות נעשה הרבה פעמים בטבלת אקסל, בכרטיס נייר או בהודעת וואטסאפ למנהל. כשחלק מהעובדים עובדים מהבית, המצב מסתבך עוד יותר: קשה לדעת מי עובד עכשיו, שעות נשכחות, ובסוף החודש מישהו צריך לשבת ולחשב שכר ידנית.

**CheckIn מרכזת את כל זה במקום אחד:** העובד מדווח בלחיצה, ראש הצוות רואה תמונה מלאה בזמן אמת, והשכר מחושב לבד מתוך השעות.

## 💼 איך זה מועיל לבעלי עסקים

| בעיה בעסק | הפתרון ב־CheckIn |
|---|---|
| לא יודעים מי עובד עכשיו, במיוחד מהבית | מסך **"מי במשמרת"** מתעדכן אוטומטית ומראה מי נכנס, מאיפה ומתי |
| עובדים שוכחים לדווח, ומגלים רק בסוף החודש | ימים עם **חסר בדיווח מסומנים באדום** — גם לעובד וגם לראש הצוות |
| תיקוני שעות "בדיעבד" בלי בקרה | **מכסת תיקונים שבועית** — מעבר לה, התיקון הופך לבקשה שראש הצוות צריך לאשר |
| חישוב שכר ידני, טעויות ומחלוקות | **שכר מחושב אוטומטית** מהשעות, כולל שעות נוספות ב־125% ובונוס לראש הצוות |
| שינוי שכר באמצע חודש יוצר בלבול | **שינוי שכר נכנס לתוקף מתחילת החודש הבא**, וראש הצוות רואה מראש את השכר העתידי ומאיזה חודש הוא חל |
| עובד חסר ולא ברור למה | **הערה לדיווח חריג** בכל כניסה, שמופיעה לראש הצוות בדוח |

**בשורה התחתונה:** פחות זמן על ניהול שעות, פחות טעויות בתלוש, ושקיפות מלאה בין העובד למנהל — בלי ציוד מיוחד, מכל מחשב או טלפון.

## 🧭 מה כל משתמש יכול לעשות

**עובד**
- כניסה מהמשרד או מהבית, הפסקה, וסיום יום עם סיכום יומי
- שעון חי ורשימת זמני העבודה של היום
- "הנוכחות שלי" — טבלה חודשית עם ניווט בין חודשים, סה"כ שעות וימים חסרים
- תיקון שעות ליום חסר או ליום בלי יציאה, לפי המכסה השבועית
- "השכר שלי" — שעות רגילות, שעות נוספות וסכום לתשלום

**ראש צוות** — כל מה שעובד יכול, ובנוסף:
- **ניהול עובדים** — רשימת עובדי הצוות, קוד הצטרפות, עדכון שכר שעתי ותצוגת שכר עתידי
- **מי במשמרת** — מצב הצוות כרגע, עם רענון אוטומטי
- **דוח נוכחות** — חיפוש לפי שם, סינון לפי תאריכים ומיקום, מיון, והערות העובדים לכל כניסה

---

## ✅ עמידה בדרישות הפרויקט

### דרישות המערכת

| דרישה | איך זה מתקיים במערכת | איפה בקוד |
|---|---|---|
| כניסה למערכת | הרשמה והתחברות עם טוקן, שמירת המשתמש והתנתקות | [LoginPage](src/pages/auth/LoginPage.tsx), [RegisterPage](src/pages/auth/RegisterPage.tsx), [AuthContext](src/context/AuthContext.tsx) |
| שני סוגי משתמשים עם הרשאות שונות | עובד (`EMPLOYEE`) וראש צוות (`TEAM_LEADER`). כל נתיב מוגן לפי תפקיד, והתפריט משתנה לפי התפקיד | [ProtectedRoute](src/routes/ProtectedRoute.tsx), [AppRoutes](src/routes/AppRoutes.tsx), [NavBar](src/components/layout/NavBar.tsx) |
| אובייקט מרכזי | **דיווח נוכחות** (`AttendanceSession`) | [types/attendance.ts](src/types/attendance.ts) |
| לפחות 5 שדות משמעותיים | תאריך, שעת כניסה, שעת יציאה, מיקום, הערה, סיכום יומי, סוג סיום, דקות עבודה | [types/attendance.ts](src/types/attendance.ts) |
| קטגוריה / סוג / סטטוס | **מיקום** (משרד / בית) ו**סטטוס יום** (נוכח, חסר, יציאה חסרה, מחלה, חג ועוד) | [MyAttendanceTable](src/components/attendance/MyAttendanceTable.tsx) |
| רשימת אובייקטים | טבלת "הנוכחות שלי", דוח הצוות ורשימת זמני העבודה של היום | [MyAttendanceTable](src/components/attendance/MyAttendanceTable.tsx), [TeamReportTable](src/components/attendance/TeamReportTable.tsx), [AttendanceSessions](src/components/attendance/AttendanceSessions.tsx) |
| הוספה ועריכה | **הוספה:** כניסה לעבודה, והשלמת יום חסר. **עריכה:** תיקון שעת יציאה ועדכון שכר עובד | [ClockInForm](src/components/attendance/ClockInForm.tsx), [CorrectionForm](src/components/attendance/CorrectionForm.tsx), [EditSalaryForm](src/components/team/EditSalaryForm.tsx) |
| חיפוש, סינון או מיון | בדוח הצוות: **חיפוש** לפי שם, **סינון** לפי טווח תאריכים ומיקום, **מיון** לפי תאריך, שם, שעת כניסה או שעות, בסדר עולה או יורד | [TeamReportFilters](src/components/attendance/TeamReportFilters.tsx), [TeamReportPage](src/pages/teamLeader/TeamReportPage.tsx) |
| מידע שמגיע משרת ונשמר במסד נתונים | כל המידע מגיע מ־API של השרת ונשמר ב־PostgreSQL | [src/api](src/api), [ריפו השרת](https://github.com/Dini167/CheckIn-server) |

**לדוגמה:** ראש צוות רואה את כל עובדי הצוות שלו ואת הדוחות שלהם, ועובד רואה רק את הנוכחות והשכר שלו.

### חובה ב־React

| דרישה | איך זה מתקיים | איפה בקוד |
|---|---|---|
| React + TypeScript | כל הפרויקט ב־TypeScript, עם טיפוסים לכל מבנה נתונים שמגיע מהשרת | [src/types](src/types) |
| React Router | נתיבים לכל מסך, נתיבים מוגנים לפי תפקיד, הפניות (`Navigate`) וניווט עם `NavLink` | [AppRoutes](src/routes/AppRoutes.tsx), [ProtectedRoute](src/routes/ProtectedRoute.tsx), [NavBar](src/components/layout/NavBar.tsx) |
| React Hook Form | טפסי התחברות, הרשמה ותיקון שעות. טופס ההרשמה מחולק לקומפוננטות שדות לפי התפקיד | [LoginForm](src/components/auth/LoginForm.tsx), [RegisterForm](src/components/auth/RegisterForm.tsx), [CorrectionForm](src/components/attendance/CorrectionForm.tsx) |
| React Query | `QueryClientProvider` ברמת האפליקציה, ו־hook משותף מבוסס `useQuery`. ה־`queryKey` כולל את הסינון, כך שהדוח נטען מחדש כשמשנים סינון | [main.tsx](src/main.tsx), [useFetch](src/hooks/useFetch.ts) |
| Redux Toolkit / Context | **Context** למשתמש המחובר ולטוקן, עם hook ייעודי שמוודא שימוש בתוך ה־Provider | [AuthContext](src/context/AuthContext.tsx), [useAuth](src/hooks/useAuth.ts) |

### חשוב להקפיד על

| נושא | איך זה מתקיים | איפה בקוד |
|---|---|---|
| חלוקה נכונה לקומפוננטות | **`pages`** — מסכים מלאים עם נתיב. **`components`** — חלקים לשימוש חוזר, מחולקים לפי נושא (`auth`, `attendance`, `team`, `layout`, `common`) | [src/pages](src/pages), [src/components](src/components) |
| שימוש נכון ב־State וב־Props | לדוגמה, בדוח הצוות ה־state של הסינון נמצא בדף, ועובר כ־props גם לרכיב הסינון (`setFilter`) וגם לטבלה (`data`) | [TeamReportPage](src/pages/teamLeader/TeamReportPage.tsx) |
| שימוש ב־Hooks | `useState`, `useEffect`, `useId`, ו־hooks מותאמים: `useAuth` ו־`useFetch` | [src/hooks](src/hooks), [MyInput](src/components/common/MyInput.tsx), [LiveClock](src/components/attendance/LiveClock.tsx) |
| Routing בין עמודים | ניווט בין כל המסכים, הפניה אוטומטית לדף הבית לפי התפקיד, וחסימת נתיבים לא מורשים | [AppRoutes](src/routes/AppRoutes.tsx), [getHomePath](src/utils/getHomePath.ts) |
| טפסים עם Validation | שדות חובה, אימייל, סיסמה של 8 תווים לפחות, שכר בין 0 ל־1000. הודעות שגיאה מוצגות ליד כל שדה, ושגיאות מהשרת מוצגות בטופס | [UserFields](src/components/auth/UserFields.tsx), [TeamLeaderFields](src/components/auth/TeamLeaderFields.tsx), [MyInput](src/components/common/MyInput.tsx) |
| קריאות מסודרות לשרת | כל הקריאות בתיקיית `api`, קובץ לכל תחום. מופע `axios` אחד מוסיף טוקן לכל בקשה, ומטפל בשגיאות במקום אחד | [src/api](src/api), [axiosInstance](src/api/axiosInstance.ts) |
| הצגת Loading בזמן טעינה | הודעת טעינה בדפים שטוענים נתונים, וכפתורים מושבתים בזמן שליחה | [MyAttendancePage](src/pages/employee/MyAttendancePage.tsx), [TeamReportPage](src/pages/teamLeader/TeamReportPage.tsx), [ClockInForm](src/components/attendance/ClockInForm.tsx) |
| טיפול בשגיאות | מחלקת `ApiError` להודעות מהשרת, הודעות שגיאה למשתמש, והתנתקות אוטומטית כשהטוקן פג | [ApiError](src/api/ApiError.ts), [axiosInstance](src/api/axiosInstance.ts) |
| מניעת שכפול קוד | קומפוננטת קלט אחת לכל הטפסים, hook אחד לכל טעינות הנתונים, ופונקציות עזר משותפות | [MyInput](src/components/common/MyInput.tsx), [useFetch](src/hooks/useFetch.ts), [src/utils](src/utils) |
| בלי קומפוננטה אחת גדולה | המערכת מחולקת ל־9 דפים ול־24 קומפוננטות קטנות, כל אחת עם תפקיד אחד | [src/components](src/components) |

### הגשה

| דרישה | מצב |
|---|---|
| קוד בגיט, בלי `node_modules` | ✅ שני ריפואים: [לקוח](https://github.com/Dini167/CheckIn-client) ו[שרת](https://github.com/Dini167/CheckIn-server). `node_modules` מוחרג ב־`.gitignore` |
| העלאה לענן: שרת, לקוח ומסד נתונים | ✅ **לקוח** — Render (Static Site) · **שרת** — Render (Web Service) · **מסד נתונים** — PostgreSQL ב־Neon |

---

## 🗂️ מבנה הפרויקט

```
src/
├── api/          קריאות לשרת — קובץ לכל תחום (attendance, auth, corrections, salary, team)
├── components/   קומפוננטות לשימוש חוזר
│   ├── attendance/   כניסה ויציאה, טבלאות נוכחות, דוח צוות, טופס תיקון
│   ├── auth/         טפסי התחברות והרשמה
│   ├── common/       רכיבים כלליים (MyInput)
│   ├── layout/       תפריט עליון
│   └── team/         ניהול עובדים ושכר
├── context/      AuthContext — המשתמש המחובר
├── hooks/        useAuth, useFetch
├── pages/        מסכים מלאים — auth / employee / teamLeader
├── routes/       הגדרת הנתיבים והגנה לפי תפקיד
├── types/        טיפוסי TypeScript
└── utils/        פונקציות עזר (תאריכים, דקות, חודשים)
```

## 🛠️ טכנולוגיות

**לקוח:** React 19 · TypeScript · Vite · React Router · React Hook Form · TanStack React Query · Axios · CSS (RTL, מותאם לטלפון)

**שרת:** Node.js · Express · TypeScript · Prisma · PostgreSQL · JWT · Zod · Swagger

## 💻 הרצה מקומית

**השרת** (מתוך התיקייה של [CheckIn-server](https://github.com/Dini167/CheckIn-server)):
1. `npm install`
2. `npm run db:local` — מסד נתונים מקומי (להשאיר פתוח)
3. `npm run dev` — השרת, בפורט 3000

**הלקוח** (מתוך התיקייה הזו):
1. `npm install`
2. ליצור קובץ `.env` עם השורה `VITE_API_URL=http://localhost:3000`
3. `npm run dev` — האתר, בכתובת http://localhost:5180
