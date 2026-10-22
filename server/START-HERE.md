# 🚀 מתחילים כאן — העלאת השרת לאינטרנט

המדריך הזה מיועד למי שמעולם לא העלתה שרת לאינטרנט. עובדים לפי הסדר.

**מה נעשה:**
1. **GitHub** — שומרים את הקוד באינטרנט.
2. **Neon** — מקבלים מסד נתונים PostgreSQL חינמי.
3. **Render** — מריצים את השרת באינטרנט.
4. **בדיקה** — מוודאים שהכול עובד.

> ⚠️ **חשוב לדעת:** אתרים משנים מדי פעם את העיצוב ואת שמות הכפתורים. כתבתי את השמות כפי שהכרתי אותם,
> אבל לא יכולתי לבדוק את האתרים בזמן אמת. אם כפתור נקרא קצת אחרת — חפשי משהו דומה.
> גם תנאי המסלולים החינמיים יכולים להשתנות — כדאי לבדוק אותם באתר לפני שמתחילים.

> 🔒 **כלל זהב:** הקובץ `.env` וכל סיסמה / Connection String / JWT_SECRET — **לעולם לא עולים ל-GitHub**.
> הם נכנסים רק להגדרות של Render. (הקובץ `.gitignore` כבר מונע את העלאת `.env`.)

---

## חלק א — GitHub

### 1. פתיחת חשבון
1. נכנסים ל-https://github.com ולוחצים **Sign up**.
2. מזינים אימייל, סיסמה ושם משתמש, ומאשרים את האימייל.

### 2. יצירת Repository (מאגר)
1. אחרי ההתחברות לוחצים על **+** בפינה העליונה ← **New repository**.
2. **Repository name:** `attendance-backend`
3. בוחרים **Private** (מומלץ) או Public.
4. **לא** מסמנים "Add a README file" (כבר יש לנו).
5. לוחצים **Create repository**.

### 3. חילוץ ה-ZIP
1. לוחצים קליק ימני על קובץ ה-ZIP ← **חלץ הכל** (Extract All).
2. נוצרת תיקייה בשם `server`. בתוכה הקבצים: `src`, `prisma`, `package.json`, `README.md` וכו'.

### 4. העלאת הקבצים דרך הדפדפן
1. בעמוד ה-Repository הריק לוחצים על הקישור **uploading an existing file**.
2. פותחים את התיקייה `server` (נכנסים **לתוכה**), מסמנים את **כל** מה שבתוכה (Ctrl+A) וגוררים לחלון הדפדפן.
   - חשוב: גוררים את **התוכן** של התיקייה, לא את התיקייה עצמה — כדי ש-`package.json` יהיה בשורש המאגר.
   - קבצים שמתחילים בנקודה (`.gitignore`, `.env.example`) — לוודא שגם הם עלו. אם Windows מסתיר אותם:
     בסייר הקבצים ← **תצוגה** ← **הצג** ← **פריטים מוסתרים**.
3. למטה, בתיבה **Commit changes**, לוחצים **Commit changes**.

### 5. בדיקה שהקבצים ב-GitHub
בעמוד הראשי של ה-Repository צריך לראות בשורש: `package.json`, `package-lock.json`, `render.yaml`, תיקיות `src`, `prisma`, `tests`, `docs`, `scripts`.
- אם רואים רק תיקייה אחת בשם `server` — הקבצים עלו בתוך תיקייה. אפשר להשאיר כך, ואז ב-Render צריך לכתוב `server` בשדה **Root Directory**.
- **אסור** לראות קובץ `.env` או תיקייה `node_modules`.

---

## חלק ב — מסד נתונים (Neon, PostgreSQL חינמי)

> אפשר גם Supabase או כל ספק PostgreSQL אחר — השרת צריך רק Connection String אחד.
> **לא מומלץ** להשתמש ב-PostgreSQL החינמי של Render עצמו: לפי מה שידוע לי, הוא נמחק אחרי תקופה קצרה (בדקי באתר).

### 1. פתיחת חשבון
1. נכנסים ל-https://neon.tech ← **Sign up** (אפשר להתחבר עם חשבון GitHub).

### 2. יצירת מסד נתונים
1. יוצרים **Project** חדש:
   - **Project name:** `attendance`
   - **Postgres version:** ברירת המחדל
   - **Region:** הקרוב לאירופה (למשל Frankfurt) — כדאי לבחור אזור קרוב לאזור שתבחרי ב-Render.
2. לוחצים **Create project**.

### 3. קבלת Connection String
1. בלוח הבקרה של הפרויקט לוחצים **Connect** (או מחפשים "Connection string").
2. מעתיקים כתובת שנראית בערך כך:
   ```
   postgresql://neondb_owner:XXXXXXXX@ep-something-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
3. ודאי שבסוף מופיע `?sslmode=require`.

### 4. שמירה בטוחה
- שומרים את הכתובת **רק** במקום פרטי (למשל מנהל סיסמאות או קובץ פרטי במחשב).
- **לא** מדביקים אותה ב-GitHub, בקוד, או בצ'אטים.
- אם היא דלפה — ב-Neon אפשר לאפס את הסיסמה ולקבל כתובת חדשה.

### 5. קישור השרת למסד
הכתובת הזו תיכנס ב-Render למשתנה **`DATABASE_URL`** (בחלק ג, שלב 6). הטבלאות ייווצרו אוטומטית בהפעלה הראשונה.

### (רשות) Supabase במקום Neon
אם בוחרים Supabase: ב-**Connect** בוחרים את ה-Connection String מסוג **Session pooler** (פורט 5432) —
הוא מתאים גם ל-Prisma Migrations וגם לשרתים שעובדים ב-IPv4 כמו Render. מחליפים את `[YOUR-PASSWORD]` בסיסמה שבחרת.

---

## חלק ג — Render (הרצת השרת)

### 1. פתיחת חשבון
1. נכנסים ל-https://render.com ← **Get Started** / **Sign up**.
2. נרשמים **עם חשבון GitHub** — זה הכי פשוט.

### 2. חיבור GitHub
בהרשמה עם GitHub, Render יבקש הרשאה לגשת ל-Repositories. אפשר לבחור **Only select repositories** ולסמן את `attendance-backend`.

### 3. יצירת Web Service
1. בלוח הבקרה לוחצים **New +** ← **Web Service**.
2. בוחרים **Build and deploy from a Git repository** (אם נשאל).

### 4. בחירת ה-Repository
בוחרים את `attendance-backend` ולוחצים **Connect**.

### 5. הגדרות Build ו-Start

| שדה | ערך |
|---|---|
| **Name** | `attendance-backend` (יהפוך לחלק מהכתובת) |
| **Region** | Frankfurt (EU Central) — או הקרוב ל-Neon |
| **Branch** | `main` |
| **Root Directory** | ריק (או `server` אם הקבצים עלו בתוך תיקייה) |
| **Runtime / Language** | `Node` |
| **Build Command** | `npm ci --include=dev && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

> 💡 במסלול החינמי של Render, לפי מה שידוע לי, השרת "נרדם" אחרי זמן בלי שימוש,
> והבקשה הראשונה אחרי זה יכולה לקחת עד כדקה. זה תקין.

### 6. משתני סביבה (Environment Variables)
באותו עמוד, באזור **Environment Variables** (או אחר כך: לשונית **Environment**), מוסיפים עם **Add Environment Variable**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `DATABASE_URL` | ה-Connection String מ-Neon |
| `JWT_SECRET` | מחרוזת אקראית ארוכה — לוחצים **Generate** אם יש, או מדביקים 64 תווים אקראיים |
| `JWT_EXPIRES_IN` | `12h` |
| `CORS_ORIGINS` | כתובת אתר ה-React. בינתיים אפשר `*`. דוגמה: `http://localhost:5173,https://my-site.netlify.app` |
| `APP_TIMEZONE` | `Asia/Jerusalem` |

> איך יוצרים JWT_SECRET אקראי? בטרמינל במחשב:
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### 7. Prisma Migrations
לא צריך לעשות כלום! פקודת ה-Start (`npm start`) מריצה קודם `prisma migrate deploy`,
שיוצרת את כל הטבלאות במסד הנתונים, ורק אחר כך מפעילה את השרת.

### 8. Deploy
1. לוחצים **Create Web Service** (או **Deploy Web Service**).
2. עוברים ללשונית **Logs** ומחכים (כמה דקות). בסוף אמורה להופיע השורה:
   ```
   ✅ Server running on port 10000
   ```
3. למעלה מופיעה כתובת השרת, בערך: `https://attendance-backend-xxxx.onrender.com`

> 💡 דרך חלופית: **New +** ← **Blueprint** ← בוחרים את ה-Repository. Render יקרא את הקובץ `render.yaml`
> וימלא את רוב ההגדרות לבד; תתבקשי להזין רק `DATABASE_URL` ו-`CORS_ORIGINS`.

### 9. בדיקה שהשרת פעיל
פותחים בדפדפן: `https://<הכתובת-שלך>.onrender.com/api/health`
אמור להופיע:
```json
{ "status": "ok", "database": "up", ... }
```

### אם Render לא מתאים
אם בזמן הפריסה אין ל-Render מסלול חינמי מתאים — אפשר להשתמש ב-**Koyeb** או **Railway** (בדקי את תנאי המסלול שלהם).
ההגדרות זהות: Build Command, Start Command ואותם משתני סביבה.

---

## חלק ד — בדיקה שהכול עובד

### 1. בריאות השרת
`https://<הכתובת-שלך>.onrender.com/api/health` ← `"status": "ok"` ו-`"database": "up"`.

### 2. פתיחת Swagger
`https://<הכתובת-שלך>.onrender.com/api-docs`

### 3. יצירת משתמש (במסד החדש אין משתמשים)
1. ב-Swagger פותחים **POST /api/auth/register** ← **Try it out**.
2. מדביקים ולוחצים **Execute**:
   ```json
   {
     "role": "TEAM_LEADER",
     "name": "דנה ישראלי",
     "email": "dana@my-team.com",
     "password": "MyPassword123",
     "teamName": "צוות פיתוח",
     "salary": 80
   }
   ```
3. בתשובה (201) מופיע `"joinCode": "TEAM-XXXXX"` — שמרי אותו, איתו עובדים מצטרפים לצוות.

### 4. התחברות וקבלת JWT
1. **POST /api/auth/login** ← **Try it out**:
   ```json
   { "email": "dana@my-team.com", "password": "MyPassword123" }
   ```
2. **Execute** ← מעתיקים את הערך של `"token"` (בלי המרכאות).

### 5. Authorize
1. למעלה בדף לוחצים על הכפתור **Authorize** 🔓.
2. מדביקים את הטוקן (בלי המילה Bearer) ← **Authorize** ← **Close**.

### 6. קריאה ל-Endpoint מוגן
**GET /api/auth/me** ← **Try it out** ← **Execute** ← אמור לחזור 200 עם הפרטים שלך.
(לבדיקה: לחצי **Logout** ב-Authorize ונסי שוב — יחזור **401**.)

### 7. הוספת רשומה
**POST /api/tasks**:
```json
{ "title": "משימה ראשונה", "estimatedMinutes": 30, "priority": "HIGH" }
```
אמור לחזור **201**.

### 8. שליפת הרשומה ממסד הנתונים
**GET /api/tasks** ← **Execute** ← המשימה מופיעה ברשימה. 🎉

### בדיקת 403
הירשמי כעובד (`"role": "EMPLOYEE"` עם `"joinCode"` שקיבלת), התחברי איתו, ונסי **GET /api/attendance/team** ← יחזור **403**.

### (רשות) נתוני הדגמה בענן
אם רוצים את נתוני ההדגמה גם בענן — מהמחשב, בתיקיית הפרויקט, כשמסד הנתונים בענן **ריק**:
```bash
# PowerShell
$env:DATABASE_URL="<ה-Connection String מ-Neon>"; $env:NODE_ENV="production"; $env:SEED_LEADER_PASSWORD="סיסמה-ארוכה-1"; $env:SEED_EMPLOYEE_PASSWORD="סיסמה-ארוכה-2"; npm run db:seed
```
בפרודקשן ה-Seed לא ירוץ אם כבר יש משתמשים, ומחייב סיסמאות משלך (לא את סיסמת ההדגמה הידועה).

---

## חלק ה — פתרון תקלות

| תקלה | מה רואים | פתרון |
|---|---|---|
| **Build Failed** | ב-Logs: `npm ERR!` או `tsc` error | ודאי שה-Build Command הוא בדיוק `npm ci --include=dev && npm run build`. ודאי ש-`package-lock.json` עלה ל-GitHub. אם הקבצים בתוך תיקייה — הגדירי **Root Directory**. |
| **DATABASE_URL שגוי** | `P1001: Can't reach database server` או `P1000: Authentication failed` | העתיקי שוב את ה-Connection String מ-Neon, בלי רווחים, עם `?sslmode=require` בסוף. ב-Supabase — השתמשי ב-Session pooler. |
| **בעיית Prisma** | `P3009 migrate found failed migrations` / `relation does not exist` | ודאי שתיקיית `prisma/migrations` עלתה ל-GitHub. אם מסד חדש ונתקע — אפשר למחוק את ה-Database ב-Neon, ליצור חדש ולעדכן את `DATABASE_URL`. |
| **JWT_SECRET חסר** | `Invalid environment variables: JWT_SECRET` | הוסיפי `JWT_SECRET` ב-Environment, באורך 32 תווים לפחות, ועשי **Manual Deploy**. |
| **שגיאת CORS** | בדפדפן (Console): `blocked by CORS policy` | הוסיפי את כתובת אתר ה-React בדיוק (כולל `https://`, בלי `/` בסוף) ל-`CORS_ORIGINS`. כמה כתובות — מופרדות בפסיק. |
| **401** | `TOKEN_MISSING` / `TOKEN_INVALID` / `TOKEN_EXPIRED` | חסר `Authorization: Bearer <token>`, או שהטוקן פג (12 שעות) — התחברי מחדש. ב-Swagger: לחצי **Authorize** שוב. |
| **403** | `FORBIDDEN` | הפעולה מיועדת לראש צוות. התחברי עם משתמש מתאים. |
| **Swagger לא נפתח** | דף ריק / 404 | הכתובת היא `/api-docs` (עם מקף). בפעם הראשונה אחרי "שינה" — חכי דקה ורענני. |
| **השרת לא עולה** | `Exited with status 1` ב-Logs | קראי את השורות האחרונות ב-Logs — בדרך כלל זה משתנה סביבה חסר (`DATABASE_URL` / `JWT_SECRET`). ודאי ש-`NODE_VERSION` הוא 20 ומעלה. |
| **איטי מאוד בפעם הראשונה** | הבקשה לוקחת ~דקה | במסלול החינמי השרת "נרדם". זה תקין. |
