# 📘 מדריך API לכתיבת צד ה-React

המסמך מסביר **מה לשלוח לשרת ומה חוזר** בכל מסך. הוא לא כולל קוד React — את זה את כותבת.
לפרטים מלאים ולניסוי חי של כל קריאה: **Swagger** בכתובת `/api-docs`.

---

## 1. כתובת השרת (Base URL)

| סביבה | Base URL |
|---|---|
| פיתוח (השרת על המחשב) | `http://localhost:3000` |
| ענן (Render) | `https://<שם-השירות>.onrender.com` |

כל הכתובות במסמך מתחילות ב-`/api`. לדוגמה: `http://localhost:3000/api/tasks`.

💡 מומלץ לשמור את ה-Base URL במשתנה סביבה של Vite (קובץ `.env` בפרויקט ה-React), למשל `VITE_API_URL`,
כדי להחליף בקלות בין פיתוח לענן.

> ⚠️ CORS: בפיתוח השרת מאשר את `http://localhost:5173` (הפורט של Vite).
> אם אתר ה-React רץ בכתובת אחרת — מוסיפים אותה ל-`CORS_ORIGINS` בקובץ `.env` של השרת.

---

## 2. התחברות (Authentication)

1. שולחים `POST /api/auth/login` עם אימייל וסיסמה.
2. מקבלים `token` (JWT) ו-`user`.
3. שומרים את הטוקן (למשל ב-`localStorage`) ואת פרטי המשתמש (במיוחד `role`).
4. **בכל** בקשה אחרת שולחים כותרת (Header):

```
Authorization: Bearer <token>
```

5. הטוקן תקף **12 שעות**. אם חוזר `401` — מוחקים את הטוקן ומעבירים למסך הכניסה.
6. בקשות עם גוף (POST / PATCH) נשלחות כ-JSON עם הכותרת `Content-Type: application/json`
   (חוץ מהעלאת אישור מחלה — ראו סעיף 6).

### לפי `user.role` מחליטים אילו מסכים להציג

| `role` | מסכים |
|---|---|
| `EMPLOYEE` | מסכי עובד |
| `TEAM_LEADER` | מסכי עובד (עבור עצמו, בלי דופק) + מסכי ראש צוות |

> השרת בודק הרשאות בעצמו — גם אם מסך מוצג בטעות, עובד יקבל `403` על פעולה של ראש צוות.

---

## 3. מבנה שגיאות וקודי HTTP

כל שגיאה חוזרת באותו מבנה:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "הנתונים שנשלחו אינם תקינים",
    "details": [
      { "field": "email", "message": "כתובת אימייל לא תקינה" }
    ]
  }
}
```

- `message` — טקסט בעברית שאפשר להציג למשתמש.
- `details` — רק בשגיאות ולידציה: איזה שדה בטופס שגוי (להציג ליד השדה).

| קוד | משמעות | מה לעשות ב-React |
|---|---|---|
| `200` / `201` | הצליח | |
| `204` | נמחק (אין גוף בתשובה) | |
| `400` | נתונים לא תקינים | להציג את `details` ליד השדות |
| `401` | לא מחובר / טוקן פג | למחוק טוקן ולעבור למסך כניסה |
| `403` | אין הרשאה | להציג "אין לך הרשאה" |
| `404` | לא נמצא | |
| `409` | התנגשות (כבר במשמרת, אימייל קיים, חודש נעול...) | להציג את `message` |
| `410` | עבר הזמן (בדיקת דופק) | לסגור את חלון הדופק |
| `413` | קובץ גדול מ-5MB | |

### קודי `error.code` שכדאי להכיר

| code | מתי |
|---|---|
| `INVALID_CREDENTIALS` | אימייל או סיסמה שגויים |
| `TOKEN_MISSING` / `TOKEN_INVALID` / `TOKEN_EXPIRED` | בעיית טוקן |
| `EMAIL_TAKEN` | האימייל כבר רשום |
| `ALREADY_CLOCKED_IN` / `NOT_CLOCKED_IN` | כניסה כפולה / יציאה בלי כניסה |
| `MONTH_LOCKED` | ניסיון לתקן שעות בחודש נעול |
| `OVERLAP` | תיקון שעות שחופף לקטע אחר |
| `PULSE_EXPIRED` | עברו 3 דקות |
| `INVALID_FILE_TYPE` / `FILE_TOO_LARGE` | קובץ מחלה לא תקין |

---

## 4. פורמטים

| מה | פורמט | דוגמה |
|---|---|---|
| תאריך | `YYYY-MM-DD` | `"2026-10-13"` |
| חודש | `YYYY-MM` | `"2026-10"` |
| שעה (בטפסים) | `HH:mm` | `"09:00"` |
| זמן מלא (בתשובות) | ISO, UTC | `"2026-10-13T06:02:11.000Z"` |
| דקות | מספר שלם | `493` = 8 שעות ו-13 דקות |

💡 בתשובות נוכחות יש גם `clockInTime` / `clockOutTime` — שעה מקומית מוכנה להצגה (`"09:02"`).
💡 שעון השרת קובע את שעת הכניסה/יציאה — **לא שולחים שעה** בכניסה ויציאה.

---

## 5. מבני נתונים עיקריים

### User
```json
{
  "id": 2,
  "name": "יוסי לוי",
  "email": "yossi@example.com",
  "role": "EMPLOYEE",
  "salary": 55,
  "team": { "id": 1, "name": "צוות פיתוח" }
}
```
- `salary` = **שכר שעתי** (₪ לשעה). `salary: null` = ראש הצוות עוד לא קבע שכר.
- `team.joinCode` מופיע **רק** לראש הצוות.

### AttendanceSession (קטע נוכחות)
```json
{
  "id": 15,
  "workDate": "2026-10-13",
  "clockIn": "2026-10-13T06:02:11.000Z",
  "clockOut": "2026-10-13T14:15:00.000Z",
  "clockInTime": "09:02",
  "clockOutTime": "17:15",
  "location": "OFFICE",
  "endType": "END_OF_DAY",
  "dailySummary": "סיימתי את מסך ההתחברות.\nהתחלתי את הדוח.",
  "remarks": null,
  "isManual": false,
  "minutes": 493
}
```
- `location`: `OFFICE` (משרד) / `HOME` (בית)
- `endType`: `END_OF_DAY` (יציאה) / `PAUSE` (עצירה זמנית) / `null` (עדיין במשמרת)
- `isManual: true` = תוקן ידנית

### Task
```json
{
  "id": 1,
  "title": "לתקן באג בדוח",
  "taskDate": "2026-10-13",
  "status": "TODO",
  "priority": "HIGH",
  "estimatedMinutes": 120,
  "carriedOverCount": 0,
  "createdAt": "...",
  "updatedAt": "..."
}
```
- `status`: `TODO` (לביצוע) / `IN_PROGRESS` (בביצוע) / `DONE` (הושלמה)
- `priority`: `LOW` (נמוכה) / `MEDIUM` (בינונית) / `HIGH` (גבוהה)

### CalendarDay (יום בלוח השנה)
```json
{
  "date": "2026-10-06",
  "dayOfWeek": 2,
  "status": "MISSING",
  "isGap": true,
  "workedMinutes": 0,
  "dailySummary": null,
  "sessions": [],
  "nonWorkingDay": null,
  "sickNote": { "id": 4, "status": "PENDING" }
}
```

| `status` | משמעות | צבע מוצע |
|---|---|---|
| `WORKED` | דווח | 🟢 ירוק |
| `IN_PROGRESS` | היום, במשמרת עכשיו | 🟢 ירוק בהיר |
| `MISSING` | חסר דיווח — **חור** | 🔴 אדום עדין + קישור להשלמה |
| `MISSING_EXIT` | נכנס ולא יצא — **חור** | 🟠 כתום + קישור לתיקון |
| `SICK` | מחלה מאושרת | 🔵 כחול |
| `NON_WORKING` | חג / חופשה / יום עיון (ראו `nonWorkingDay`) | ⚪ אפור |
| `WEEKEND` | שישי–שבת | ללא צבע |
| `NOT_STARTED` | היום, עוד לא נכנס | ללא צבע |
| `FUTURE` | עתידי | ללא צבע |
| `BEFORE_JOIN` | לפני שהמשתמש נרשם | ללא צבע |

💡 עם **react-calendar**: מקבלים את `days` מהשרת, ולכל יום בלוח מחפשים את ה-`date` המתאים ונותנים class לפי `status`.
`isGap: true` = לסמן באדום.

---

## 6. Endpoints לפי מסך

סימון: 🔓 פתוח · 🔑 כל משתמש מחובר · 👑 ראש צוות בלבד

---

### מסך 1 — כניסה 🔓

**`POST /api/auth/login`**

שדות חובה: `email`, `password`
```json
{ "email": "yossi@example.com", "password": "Password123" }
```
הצלחה `200`:
```json
{ "token": "eyJhbGciOi...", "user": { "id": 2, "name": "יוסי לוי", "role": "EMPLOYEE", "...": "..." } }
```
שגיאה: `401` אימייל או סיסמה שגויים.

---

### מסך 2 — הרשמה 🔓

**`POST /api/auth/register`** — הטופס משתנה לפי התפקיד שנבחר.

**ראש צוות** — שדות חובה: `role`, `name`, `email`, `password`, `teamName`, `salary`
```json
{
  "role": "TEAM_LEADER",
  "name": "דנה ישראלי",
  "email": "dana@example.com",
  "password": "Password123",
  "teamName": "צוות פיתוח",
  "salary": 80
}
```

**עובד** — שדות חובה: `role`, `name`, `email`, `password`, `joinCode` (**אין** שדה שכר!)
```json
{
  "role": "EMPLOYEE",
  "name": "יוסי לוי",
  "email": "yossi@example.com",
  "password": "Password123",
  "joinCode": "TEAM-DEMO1"
}
```

כללי ולידציה:
- `name`: 2–30 תווים
- `password`: לפחות 8 תווים, לפחות אות אחת באנגלית ולפחות ספרה אחת
- `salary`: מספר 0–1000 (שכר שעתי)

הצלחה `201` — כמו login (מחזיר `token` + `user`, כלומר המשתמש מחובר מיד).
לראש צוות: `user.team.joinCode` — להציג לו כדי שישלח לעובדים.
שגיאות: `400` ולידציה · `404` קוד צוות לא קיים · `409` אימייל קיים.

---

### מסך 3 — דף הבית (עובד) 🔑

| מה | Endpoint |
|---|---|
| מצב הכפתורים | `GET /api/attendance/today` |
| כניסה / חזרה מעצירה | `POST /api/attendance/clock-in` |
| עצירה זמנית | `POST /api/attendance/pause` |
| יציאה + סיכום | `POST /api/attendance/clock-out` |
| בדיקת דופק | `GET /api/pulses/current` + `POST /api/pulses/:id/respond` |
| הודעות צוות | `GET /api/announcements` |
| התרעת חורים | `GET /api/attendance/missing` |

**`GET /api/attendance/today`**
```json
{
  "date": "2026-10-13",
  "state": "IN",
  "workedMinutes": 135,
  "currentSession": { "id": 15, "clockInTime": "09:02", "location": "HOME", "...": "..." },
  "sessions": [ ]
}
```
| `state` | אילו כפתורים להציג |
|---|---|
| `NOT_STARTED` | "כניסה" (עם בחירת משרד/בית) |
| `IN` | "עצירה זמנית", "יציאה" |
| `PAUSED` | "חזרה" (= clock-in), "יציאה" |
| `ENDED` | "כניסה" (להשלמה בערב) |

**`POST /api/attendance/clock-in`** — חובה: `location`
```json
{ "location": "HOME", "remarks": "מתחילה מאוחר בגלל רופא" }
```
`201` מחזיר AttendanceSession · `409 ALREADY_CLOCKED_IN`

**`POST /api/attendance/pause`** — גוף ריק `{}` או `{ "remarks": "..." }` · `409 NOT_CLOCKED_IN`

**`POST /api/attendance/clock-out`** — חובה: `dailySummary` (2–300 תווים, **עד 2 שורות**)
```json
{ "dailySummary": "סיימתי את מסך ההתחברות.\nהתחלתי לעבוד על דוח הנוכחות." }
```
💡 בטופס: textarea עם 2 שורות. ירידת שורה נשלחת כ-`\n`.

#### דופק (רק לעובדים שעובדים מהבית — לא בעבודה מהמשרד ולא לראש צוות)
1. כל עוד `state` הוא `IN`, שואלים כל 30–60 שניות: **`GET /api/pulses/current`**
   ```json
   { "pulse": { "id": 7, "question": "על מה את/ה עובד/ת עכשיו?", "openedAt": "...", "expiresAt": "...", "secondsLeft": 154 } }
   ```
   או `{ "pulse": null }` כשאין בדיקה.
2. אם `pulse` לא null — פותחים חלון קטן עם השאלה, שדה טקסט וטיימר לפי `secondsLeft`.
3. שולחים **`POST /api/pulses/7/respond`**:
   ```json
   { "responseText": "מתקנת באג במסך הנוכחות" }
   ```
   `200` הצליח · `410` עבר הזמן (לסגור את החלון) · `409` כבר נענה.

**`GET /api/announcements`** — הודעות פעילות:
```json
[{ "id": 1, "title": "ישיבת צוות", "content": "מחר ב-10:00", "expiresAt": "2026-10-14", "isActive": true, "author": { "id": 1, "name": "דנה" }, "createdAt": "..." }]
```

---

### מסך 4 — המשימות שלי 🔑 (פרטי — רק המשתמש עצמו)

| פעולה | Endpoint |
|---|---|
| רשימה + חיפוש/סינון/מיון | `GET /api/tasks` |
| הוספה | `POST /api/tasks` |
| עריכה / שינוי סטטוס | `PATCH /api/tasks/:id` |
| מחיקה | `DELETE /api/tasks/:id` |
| העברה למחר | `POST /api/tasks/:id/carry-over` |
| יועץ עומס | `GET /api/tasks/plan` |

**`GET /api/tasks`** — כל הפרמטרים אופציונליים:

| פרמטר | ערכים | ברירת מחדל |
|---|---|---|
| `date` | `YYYY-MM-DD` | היום |
| `allDates` | `true` | — (חיפוש בכל הימים) |
| `status` | `TODO` / `IN_PROGRESS` / `DONE` | הכול |
| `priority` | `LOW` / `MEDIUM` / `HIGH` | הכול |
| `search` | טקסט | — (חיפוש בכותרת) |
| `sort` | `priority` / `createdAt` / `estimatedMinutes` / `title` / `taskDate` | `priority` |
| `order` | `asc` / `desc` | `desc` לעדיפות |

דוגמה: `GET /api/tasks?status=TODO&search=דוח&sort=estimatedMinutes&order=asc`

**`POST /api/tasks`** — חובה: `title` (1–120), `estimatedMinutes` (5–720)
```json
{ "title": "להכין דוח לקוח", "estimatedMinutes": 60, "priority": "HIGH" }
```
`priority` אופציונלי (ברירת מחדל `MEDIUM`). התאריך = היום אוטומטית.

**`PATCH /api/tasks/:id`** — שולחים רק את מה שמשתנה:
```json
{ "status": "DONE" }
```

**`POST /api/tasks/:id/carry-over`** — בלי גוף. מעביר ליום העבודה הבא (מדלג על שישי-שבת). `409` אם הושלמה.

**`GET /api/tasks/plan`** — לתצוגת אזהרת העומס:
```json
{
  "date": "2026-10-13",
  "source": "rules",
  "tasks": [ "…המשימות הפתוחות בסדר ביצוע מומלץ…" ],
  "totalMinutes": 660,
  "availableMinutes": 480,
  "overloaded": true,
  "overloadMinutes": 180,
  "suggestedToMove": [4],
  "message": "יש לך 11 שעות משימות ונשארו 8 שעות. מומלץ להעביר משימה אחת בעדיפות הנמוכה למחר."
}
```
💡 אם `overloaded` — להציג את `message` בצבע אזהרה, ולסמן את המשימות שב-`suggestedToMove` (עם כפתור "העבר למחר").
💡 כדאי לקרוא שוב ל-`plan` אחרי כל הוספה/עריכה של משימה.

---

### מסך 5 — הנוכחות שלי 🔑

| מה | Endpoint |
|---|---|
| לוח שנה חודשי | `GET /api/attendance/calendar?month=2026-10` |
| מכסת תיקונים | `GET /api/corrections/quota` |
| תיקון שעות | `POST /api/corrections` |
| התיקונים שלי | `GET /api/corrections/mine` |

**`GET /api/attendance/calendar?month=2026-10`**
```json
{ "month": "2026-10", "totalWorkedMinutes": 4120, "gapCount": 2, "days": [ "…CalendarDay לכל יום בחודש…" ] }
```

**`GET /api/corrections/quota`**
```json
{ "unlimited": false, "limit": 2, "used": 1, "remaining": 1, "weekStart": "2026-10-11" }
```
💡 להציג: "נשארו לך 1 תיקונים השבוע". כשנגמר — התיקון יישלח כבקשה לראש הצוות.

**`POST /api/corrections`** — חובה: `workDate`, `reason`, ולפחות אחת מהשעות.

תיקון יציאה שנשכחה (יש `sessionId` מתוך `sessions` של היום בלוח):
```json
{ "workDate": "2026-10-08", "sessionId": 42, "newClockOut": "17:00", "reason": "שכחתי ללחוץ יציאה" }
```
השלמת יום חסר (בלי `sessionId` — חובה שתי השעות, עולה 2 תיקונים):
```json
{ "workDate": "2026-10-06", "newClockIn": "09:00", "newClockOut": "17:00", "location": "OFFICE", "reason": "עבדתי ולא דיווחתי" }
```
תשובה `201`:
- `"kind": "SELF", "status": "APPLIED"` — נכנס מיד ✅
- `"kind": "REQUEST", "status": "PENDING"` — נשלח לאישור ראש הצוות ⏳

שגיאות: `400` שעה עתידית / יציאה לפני כניסה · `409 OVERLAP` · `409 MONTH_LOCKED`.

---

### מסך 6 — אישורי מחלה 🔑

**`POST /api/sick-notes`** — **לא JSON!** נשלח כ-`multipart/form-data` (אובייקט `FormData`):

| שדה | חובה | ערך |
|---|---|---|
| `file` | ✅ | קובץ JPG / PNG / PDF עד 5MB |
| `fromDate` | ✅ | `YYYY-MM-DD` |
| `toDate` | ✅ | `YYYY-MM-DD` (אותו יום = יום אחד) |
| `note` | ❌ | עד 300 תווים |

⚠️ כששולחים FormData **לא** מגדירים `Content-Type` בעצמך — הדפדפן מוסיף אותו לבד. רק `Authorization`.

תשובה `201`:
```json
{
  "id": 3, "user": { "id": 2, "name": "יוסי" }, "fromDate": "2026-10-11", "toDate": "2026-10-12", "days": 2,
  "note": "שפעת", "fileName": "אישור.pdf", "mimeType": "application/pdf", "fileSize": 48213,
  "fileUrl": "/api/sick-notes/3/file", "status": "PENDING", "reviewedBy": null, "reviewedAt": null, "createdAt": "..."
}
```
שגיאות: `400 FILE_REQUIRED` / `INVALID_FILE_TYPE` · `413 FILE_TOO_LARGE`

**`GET /api/sick-notes/mine`** — רשימה. `status`: `PENDING` ממתין · `APPROVED` אושר · `REJECTED` נדחה.

**צפייה בקובץ:** `GET /api/sick-notes/:id/file` — דורש טוקן, ולכן קישור רגיל (`<a href>`) לא יעבוד.
מבקשים את הקובץ עם הכותרת `Authorization`, מקבלים אותו כ-Blob, ופותחים אותו בחלון חדש (באמצעות Object URL).

---

### מסך 7 — השכר שלי 🔑

**`GET /api/salary/me?month=2026-10`** (בלי `month` = החודש הנוכחי)
```json
{
  "month": "2026-10",
  "salary": 55,
  "salaryMissing": false,
  "workedDays": 9,
  "regularHours": 70.5,
  "overtimeHours": 3.25,
  "basePay": 3877.5,
  "overtimePay": 223.44,
  "bonus": 0,
  "total": 4100.94,
  "isLocked": false,
  "isCurrentMonth": true
}
```
- `salaryMissing: true` → הסכומים `null` → להציג "נתוני השכר עדיין לא זמינים" (השעות כן מוצגות).
- `isLocked: true` → חודש סגור, הסכום סופי.
- `bonus` — רק לראש צוות.

**`GET /api/salary/me/history`** — מערך של אותו מבנה, מהחודש החדש לישן (עד 24 חודשים).

---

### מסך 8 — לוח צוות 👑

| מה | Endpoint |
|---|---|
| מי במשמרת עכשיו | `GET /api/attendance/team/now` |
| נקודות אדומות היום | `GET /api/pulses/red-dots` |
| בקשות תיקון ממתינות | `GET /api/corrections/team?status=PENDING` |
| אישורי מחלה ממתינים | `GET /api/sick-notes/team?status=PENDING` |
| עובדים בלי שכר | `GET /api/team/members?missingSalary=true` |

**`GET /api/attendance/team/now`**
```json
[{ "user": { "id": 2, "name": "יוסי" }, "state": "IN", "location": "HOME", "since": "2026-10-13T06:02:11.000Z", "workedMinutesToday": 135 }]
```
**`GET /api/pulses/red-dots?from=2026-10-01&to=2026-10-13`** (בלי פרמטרים = היום)
```json
[{ "date": "2026-10-12", "user": { "id": 2, "name": "יוסי" }, "missedCount": 2 }]
```
💡 מספר הפריטים בכל רשימה = מספר ההתראה להציג (למשל "3 ממתינים לאישור").

---

### מסך 9 — נוכחות צוותית 👑

**`GET /api/attendance/team`**

| פרמטר | ערכים | ברירת מחדל |
|---|---|---|
| `from` / `to` | `YYYY-MM-DD` (עד 62 ימים) | היום |
| `userId` | מזהה עובד | כולם |
| `location` | `OFFICE` / `HOME` | הכול |
| `search` | חלק משם העובד | — |
| `sort` | `date` / `name` / `clockIn` / `workedMinutes` | `date` |
| `order` | `asc` / `desc` | `desc` לתאריך |

תשובה: מערך של CalendarDay עם תוספות:
```json
[{
  "date": "2026-10-12", "status": "WORKED", "isGap": false, "workedMinutes": 490,
  "dailySummary": "סיימתי את דוח הלקוח.\nעברתי על באגים פתוחים.",
  "sessions": [ "…" ],
  "user": { "id": 2, "name": "יוסי לוי" },
  "firstClockIn": "2026-10-12T06:00:00.000Z",
  "lastClockOut": "2026-10-12T14:10:00.000Z",
  "nonWorkingDay": null, "sickNote": null, "dayOfWeek": 1
}]
```
כולל גם ימים חסרים (`status: "MISSING"`) — כדי שראש הצוות יראה מי לא דיווח.

---

### מסך 10 — אישורים 👑

**בקשות תיקון:** `GET /api/corrections/team?status=PENDING`
(יומן תיקונים עצמיים: `?kind=SELF`)

**אישור/דחייה:** `PATCH /api/corrections/:id/review`
```json
{ "decision": "APPROVED" }
```
או `"REJECTED"`. `409` אם כבר טופל.

**אישורי מחלה:** `GET /api/sick-notes/team?status=PENDING` · צפייה בקובץ: `GET /api/sick-notes/:id/file`
**אישור/דחייה:** `PATCH /api/sick-notes/:id/review` עם `{ "decision": "APPROVED" }`

---

### מסך 11 — עובדי הצוות 👑

**קוד הצוות:** `GET /api/team` → `{ "id": 1, "name": "צוות פיתוח", "leader": {...}, "memberCount": 4, "joinCode": "TEAM-DEMO1" }`

**רשימת עובדים:** `GET /api/team/members`
```json
[
  { "id": 4, "name": "מיכל אברהם", "email": "michal@example.com", "role": "EMPLOYEE", "salary": null, "salaryMissing": true, "joinedAt": "..." },
  { "id": 2, "name": "יוסי לוי", "email": "yossi@example.com", "role": "EMPLOYEE", "salary": 55, "salaryMissing": false, "joinedAt": "..." }
]
```
עובדים בלי שכר (`salaryMissing: true`) מגיעים ראשונים — לסמן אותם.

**עדכון שכר:** `PATCH /api/team/members/:id/salary` — חובה: `salary` (0–1000)
```json
{ "salary": 60 }
```

---

### מסך 12 — ימים מיוחדים והודעות 👑

**ימים מיוחדים**
- רשימה: `GET /api/non-working-days?month=2026-10` (גם עובדים יכולים לקרוא)
- הוספה (יום או טווח): `POST /api/non-working-days` — חובה: `fromDate`, `type`
  ```json
  { "fromDate": "2026-10-20", "toDate": "2026-10-22", "type": "VACATION", "note": "חופשה מרוכזת" }
  ```
  `type`: `HOLIDAY` חג · `VACATION` חופשה · `STUDY_DAY` יום עיון
- עריכה: `PATCH /api/non-working-days/:id` עם `{ "type": "HOLIDAY", "note": "..." }`
- מחיקה: `DELETE /api/non-working-days/:id` → `204`

**הודעות לצוות**
- רשימה: `GET /api/announcements` (ראש צוות: `?all=true` כולל הודעות שפג תוקפן)
- חדשה: `POST /api/announcements` — חובה: `title` (2–100), `content` (2–1000)
  ```json
  { "title": "ישיבת צוות", "content": "מחר ב-10:00 בחדר הישיבות", "expiresAt": "2026-10-14" }
  ```
- עריכה: `PATCH /api/announcements/:id` · מחיקה: `DELETE /api/announcements/:id`

---

### מסך 13 — שכר צוותי ונעילת חודש 👑

**`GET /api/salary/team?month=2026-09`**
```json
{
  "month": "2026-09",
  "isLocked": false,
  "members": [ { "user": { "id": 2, "name": "יוסי" }, "role": "EMPLOYEE", "salary": 55, "regularHours": 160, "overtimeHours": 4, "total": 9075, "...": "..." } ],
  "employeesTotal": 18500,
  "leaderBonus": 925,
  "teamTotal": 32325,
  "membersMissingSalary": 0
}
```

**נעילת חודש:** `POST /api/salary/locks`
```json
{ "month": "2026-09" }
```
`201` מחזיר את הדוח הסופי · `400 MONTH_NOT_ENDED` (רק חודש שהסתיים) · `409 ALREADY_LOCKED`.
💡 כדאי להציג חלון אישור ("אחרי נעילה אי אפשר לשנות שעות בחודש הזה").

**חודשים נעולים:** `GET /api/salary/locks` → `[{ "month": "2026-09", "lockedAt": "...", "lockedBy": { "id": 1, "name": "דנה" } }]`

---

## 7. טבלת הרשאות מלאה

| פעולה | עובד | ראש צוות |
|---|---|---|
| כניסה/יציאה/עצירה, הנוכחות שלי, השכר שלי | ✅ | ✅ |
| משימות (רק של עצמו) | ✅ | ✅ |
| דופק — מענה | ✅ | — (אין דופק) |
| תיקון שעות | ✅ עד 2 בשבוע, אחר כך בקשה | ✅ ללא הגבלה |
| העלאת אישור מחלה | ✅ | ✅ |
| צפייה בהודעות ובימים מיוחדים | ✅ | ✅ |
| נוכחות צוותית, מי במשמרת, נקודות אדומות | ❌ 403 | ✅ רק הצוות שלו |
| אישור תיקונים ואישורי מחלה | ❌ 403 | ✅ רק הצוות שלו |
| עובדי הצוות ושכר שעתי | ❌ 403 | ✅ |
| ניהול ימים מיוחדים והודעות | ❌ 403 | ✅ |
| דוח שכר צוותי ונעילת חודש | ❌ 403 | ✅ |
| צפייה במשימות או בתשובות דופק של אחרים | ❌ | ❌ |
