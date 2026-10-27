# אפיון מערכת — "נוכחות+" : תיקוף נוכחות, משימות ושכר

> גרסה 1 · **אושר ונבנה** (13.10.2026). התיעוד המדויק והמעודכן של כל Endpoint נמצא ב-Swagger (`/api-docs`), ב-`docs/openapi.json` וב-`FRONTEND-API-GUIDE.md`.

---

## א. תיאור הפרויקט

**שם:** נוכחות+ — מערכת לתיקוף נוכחות, ניהול משימות אישיות וחישוב שכר.

**מטרה:** לאפשר לעובדים במשרד או מהבית לדווח נוכחות אמינה לפי **שעון השרת** (בלי שעון נוכחות פיזי), לנהל משימות יומיות אישיות, ולקבל חישוב שכר אוטומטי. ראש הצוות מקבל תמונת נוכחות אמיתית של הצוות — גם בעבודה מהבית — בלי מעקב פולשני.

**משתמשים:**

| תפקיד | מי זה |
|---|---|
| עובד (`EMPLOYEE`) | מדווח נוכחות, מנהל משימות פרטיות, עונה ל"דופק", מעלה אישורי מחלה, רואה את השכר שלו. |
| ראש צוות (`TEAM_LEADER`) | גם מדווח נוכחות ומקבל שכר כמו עובד (בלי דופק), ובנוסף מנהל את הצוות שלו: נוכחות, אישורים, שכר שעתי, ימים מיוחדים, הודעות, נעילת חודש. |

**כללים עסקיים מרכזיים** (כולם מוגדרים בקובץ הגדרות אחד וקל לשנות):

| כלל | ערך |
|---|---|
| ימי עבודה | ראשון–חמישי. שישי–שבת לא נבדקים. |
| אזור זמן | ישראל (`Asia/Jerusalem`) |
| שעות נוספות | כל שעה מעבר ל־8 ביום → 125% |
| בונוס ראש צוות | 5% מסך שכר העובדים בצוות שלו |
| דופק | 2 בדיקות ביום, זמן מענה 3 דקות. רק בעבודה מהבית — עבודה מהמשרד לא נבדקת |
| נקודה אדומה | רק אם **שתי** הבדיקות באותו יום לא נענו |
| תיקון עצמי | עד 2 בשבוע (ראשון–שבת). תיקון = שינוי שעת כניסה **או** שעת יציאה. |
| ימי מחלה | לא בתשלום, אבל היום מסומן "מחלה מאושרת" ואינו נחשב חור |
| קובץ אישור מחלה | תמונה (JPG/PNG) או PDF, עד 5MB |
| תוקף התחברות (JWT) | 12 שעות |

---

## ב. מסכים

סימון שלב: **①** חובה · **②** אם יש זמן · **③** תוספות.
(השרת נבנה מלא לכל השלבים.)

### מסכי גישה

| # | מסך | מה מוצג / מה עושים | שלב |
|---|---|---|---|
| 1 | כניסה | אימייל + סיסמה → קבלת טוקן. | ① |
| 2 | הרשמה | שם, אימייל, סיסמה, בחירת תפקיד. **ראש צוות:** שם צוות + שכר שעתי שלו → מקבל **קוד צוות**. **עובד:** קוד צוות → מצטרף לצוות. לעובד אין שדה שכר. | ① |

### עובד (ראש צוות רואה גם את מסכים 3–7 עבור עצמו)

| # | מסך | מה מוצג / מה עושים | שלב |
|---|---|---|---|
| 3 | דף הבית | כפתור **כניסה** (בחירת משרד/בית) · כפתור **יציאה** (חובה למלא סיכום יומי עד 2 שורות) · כפתורי **עצירה זמנית / חזרה** · חלון **דופק** ("על מה את/ה עובד/ת עכשיו?") · **הודעות צוות** פעילות · הערה אישית לדיווח חריג. | ① (דופק ②, עצירה והודעות ③) |
| 4 | משימות היום (פרטי) | רשימה, הוספה (כותרת, עדיפות, זמן משוער), עריכה, שינוי סטטוס, מחיקה, **העברה למחר**, חיפוש/סינון/מיון, **אזהרת עומס** (סך זמן משוער מול הזמן שנשאר במשמרת). | ① |
| 5 | הנוכחות שלי | לוח שנה / רשימת ימים בחודש עם סטטוס צבעוני (דווח, חסר, חסרה יציאה, מחלה, יום מיוחד) · **תיקון שעות** (2 בשבוע חופשי, אחר כך בקשה) · מונה תיקונים שנשארו השבוע. | ① (תיקון ②, לוח שנה אמיתי ③) |
| 6 | אישורי מחלה | העלאת קובץ + טווח תאריכים + הערה · רשימת האישורים שלי עם סטטוס. | ② |
| 7 | השכר שלי | חודש נוכחי: שכר שעתי, שעות רגילות, שעות נוספות, שכר, (לראש צוות: בונוס) · היסטוריית חודשים. | ① |

### ראש צוות

| # | מסך | מה מוצג / מה עושים | שלב |
|---|---|---|---|
| 8 | לוח צוות | מי במשמרת עכשיו (משרד/בית/בעצירה) · נקודות אדומות של היום · מספר אישורים ממתינים · עובדים בלי שכר שעתי. | ① (נקודות אדומות ②) |
| 9 | נוכחות צוותית | דוח לפי תאריך/טווח: כניסות, יציאות, עצירות, מיקום, הערות, **סיכומים יומיים**. סינון לפי עובד/מיקום/תאריכים, חיפוש לפי שם, מיון לפי שם/שעת כניסה/סה"כ שעות. | ① |
| 10 | אישורים | בקשות תיקון שעות + אישורי מחלה ממתינים (צפייה בקובץ) → אישור/דחייה · יומן תיקונים עצמיים. | ② |
| 11 | עובדי הצוות | קוד הצוות · רשימת עובדים (חדשים בלי שכר — ראשונים ומסומנים) · שדה אחד לעריכה: **שכר שעתי**. | ① |
| 12 | ימים מיוחדים והודעות | סימון חג/חופשה/יום עיון לצוות + הערה · הודעות לצוות (כותרת, תוכן, תוקף). | ③ |
| 13 | שכר צוותי | לכל עובד: שעות, שעות נוספות, שכר · סה"כ צוות · הבונוס שלי · **נעילת חודש**. | ② (נעילה ③) |

---

## ג. הרשאות

✅ = מותר · 👥 = רק לגבי הצוות שלו · 🙋 = רק לגבי עצמו · ❌ = אסור

| פעולה | עובד | ראש צוות |
|---|---|---|
| הרשמה / התחברות / פרטי עצמי | ✅ | ✅ |
| כניסה, יציאה, עצירה, חזרה | 🙋 | 🙋 |
| צפייה בנוכחות | 🙋 | 🙋 + 👥 |
| תיקון שעות עצמי | 🙋 (2 בשבוע) | 🙋 (ללא הגבלה, נרשם ביומן) |
| בקשת תיקון (מעבר למכסה) | 🙋 | — |
| אישור/דחיית בקשת תיקון | ❌ | 👥 |
| משימות | 🙋 | 🙋 (רק שלו! לא של העובדים) |
| מענה לדופק | 🙋 | — (לראש צוות אין דופק) |
| צפייה בתשובות דופק | 🙋 | ❌ |
| צפייה בנקודות אדומות | ❌ | 👥 |
| העלאת אישור מחלה / צפייה בקובץ | 🙋 | 🙋 + 👥 |
| אישור/דחיית אישור מחלה | ❌ | 👥 |
| צפייה בשכר ובשכר שעתי | 🙋 | 🙋 + 👥 |
| עדכון שכר שעתי | ❌ | 👥 + עצמו |
| ימים מיוחדים, הודעות — צפייה | ✅ (הצוות שלו) | ✅ |
| ימים מיוחדים, הודעות — ניהול | ❌ | 👥 |
| נעילת חודש | ❌ | 👥 |

**כללי אבטחה:** המשתמש המחובר נקבע **רק** לפי הטוקן. בלי טוקן תקין → `401`. בלי הרשאה → `403`. ניסיון לגשת לרשומה של משתמש אחר (שלא בצוות שלך) → `404` (כדי לא לחשוף שהיא קיימת).

---

## ד. מסד הנתונים (PostgreSQL + Prisma)

> השוואה לאפיון שלך: שמרתי את כל הטבלאות שלך והרחבתי לפי מה שסיכמנו. השינויים העיקריים:
> - **Team** חדשה — במקום `teamLeaderId` אצל כל עובד, יש צוות עם קוד הצטרפות (מאפשר הרשמה עצמית).
> - **Attendance** הפכה ל־**AttendanceSession** — כמה "קטעי עבודה" ביום, כדי לתמוך בעצירה זמנית והשלמה בערב.
> - **Requests** פוצלה ל־**TimeCorrection** ו־**SickNote** — כי לכל אחת שדות שונים, וכך אפשר להסיר אחת בלי לגעת בשנייה.
> - **CompanyDays** → **NonWorkingDay** (לפי צוות) + **Announcement** נפרדת להודעות.
> - **MonthLock** + **PayrollSnapshot** חדשות — נעילת חודש ושמירת שכר היסטורי.
> - `ADMIN` ירד.

כל טבלה: `id` מספר אוטומטי (**PK**), `createdAt` אוטומטי.

### 1. User — משתמשים

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| name | String(2–80) | ✅ | |
| email | String | ✅ | **ייחודי**, נשמר באותיות קטנות |
| passwordHash | String | ✅ | bcrypt. **לעולם לא מוחזר ב־API** |
| role | Enum `EMPLOYEE` / `TEAM_LEADER` | ✅ | |
| hourlyRate | Decimal(8,2) | ❌ | שכר שעתי. ריק לעובד חדש עד שראש הצוות קובע. ≥ 0. **ב-API השדה נקרא `salary`** |
| teamId | Int | ✅ | **FK → Team** |

### 2. Team — צוותים

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| name | String(2–80) | ✅ | |
| joinCode | String | ✅ | **ייחודי**, נוצר אוטומטית, למשל `TEAM-4821` |
| leaderId | Int | ✅ | **FK → User**, **ייחודי** (ראש צוות מוביל צוות אחד) |

### 3. AttendanceSession — קטעי נוכחות

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| userId | Int | ✅ | **FK → User** |
| workDate | Date | ✅ | היום (לפי שעון ישראל) |
| clockIn | DateTime | ✅ | שעון שרת |
| clockOut | DateTime | ❌ | ריק = במשמרת כרגע. חייב להיות אחרי clockIn |
| location | Enum `OFFICE` / `HOME` | ✅ | |
| endType | Enum `END_OF_DAY` / `PAUSE` | ❌ | יציאה רגילה או עצירה זמנית |
| dailySummary | String(עד 300, עד 2 שורות) | ❌ | חובה ביציאה רגילה |
| remarks | String(עד 300) | ❌ | הערה אישית |
| isManual | Boolean | ✅ | האם נוצר/תוקן ידנית |

### 4. Pulse — בדיקות דופק

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| userId | Int | ✅ | **FK → User** |
| workDate | Date | ✅ | |
| scheduledAt | DateTime | ✅ | זמן אקראי שנקבע בכניסה הראשונה של היום |
| answeredAt | DateTime | ❌ | |
| responseText | String(1–150) | ❌ | |

**סטטוס מחושב:** `PENDING` (מחכה / פתוח לתשובה) · `ANSWERED` · `MISSED` (לא נענה תוך 3 דקות בזמן שהעובד במשמרת) · `CANCELLED` (העובד לא היה במשמרת באותו רגע — למשל בעצירה או אחרי יציאה; לא נחשב פספוס).

### 5. Task — משימות (פרטיות)

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| userId | Int | ✅ | **FK → User** |
| title | String(1–120) | ✅ | |
| taskDate | Date | ✅ | השרת קובע = היום, אם לא נשלח |
| status | Enum `TODO` / `IN_PROGRESS` / `DONE` | ✅ | ברירת מחדל `TODO` |
| priority | Enum `LOW` / `MEDIUM` / `HIGH` | ✅ | ברירת מחדל `MEDIUM` |
| estimatedMinutes | Int (5–720) | ✅ | |
| carriedOverCount | Int | ✅ | כמה פעמים נדחתה, מתחיל ב־0 |

### 6. TimeCorrection — תיקוני שעות

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| userId | Int | ✅ | **FK → User** |
| sessionId | Int | ❌ | **FK → AttendanceSession** (ריק = הוספת יום חסר) |
| workDate | Date | ✅ | |
| newClockIn | DateTime | ❌ | לפחות אחד מהשניים חובה |
| newClockOut | DateTime | ❌ | |
| reason | String(2–300) | ✅ | |
| kind | Enum `SELF` / `REQUEST` | ✅ | עצמי (נכנס מיד) או בקשה לאישור |
| status | Enum `APPLIED` / `PENDING` / `APPROVED` / `REJECTED` | ✅ | |
| units | Int (1–2) | ✅ | כמה "תיקונים" זה צורך מהמכסה (כניסה=1, יציאה=1, שניהם=2) |
| reviewedById | Int | ❌ | **FK → User** (ראש הצוות) |
| reviewedAt | DateTime | ❌ | |

### 7. SickNote — אישורי מחלה

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| userId | Int | ✅ | **FK → User** |
| fromDate / toDate | Date | ✅ | toDate ≥ fromDate, טווח עד 30 יום |
| note | String(עד 300) | ❌ | |
| fileName / mimeType | String | ✅ | JPG / PNG / PDF בלבד |
| fileData | Bytes | ✅ | עד 5MB. נשמר **במסד הנתונים** (הסבר למטה) |
| status | Enum `PENDING` / `APPROVED` / `REJECTED` | ✅ | |
| reviewedById / reviewedAt | | ❌ | |

> למה הקובץ נשמר במסד ולא בתיקייה? בשרתים חינמיים (כמו Render) קבצים שנשמרים בדיסק **נמחקים** בכל הפעלה מחדש. שמירה במסד היא הדרך הפשוטה והחינמית שלא תאבד קבצים.

### 8. NonWorkingDay — ימים בלי חובת עבודה

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| teamId | Int | ✅ | **FK → Team** |
| date | Date | ✅ | **ייחודי לכל צוות** |
| type | Enum `HOLIDAY` / `VACATION` / `STUDY_DAY` | ✅ | |
| note | String(עד 200) | ❌ | |

### 9. Announcement — הודעות לצוות

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| teamId | Int | ✅ | **FK → Team** |
| authorId | Int | ✅ | **FK → User** |
| title | String(2–100) | ✅ | |
| content | String(2–1000) | ✅ | |
| expiresAt | Date | ❌ | אחרי התאריך לא מוצגת לעובדים |

### 10. MonthLock — נעילות חודש

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| teamId | Int | ✅ | **FK → Team** |
| year / month | Int | ✅ | **ייחודי** לצוות+שנה+חודש. רק חודש שהסתיים |
| lockedById | Int | ✅ | **FK → User** |

### 11. PayrollSnapshot — שכר חודשי שננעל

| שדה | טיפוס | חובה | הערות |
|---|---|---|---|
| id | Int | ✅ | PK |
| userId | Int | ✅ | **FK → User** |
| teamId | Int | ✅ | **FK → Team** |
| year / month | Int | ✅ | **ייחודי** למשתמש+שנה+חודש |
| hourlyRate, regularHours, overtimeHours, basePay, overtimePay, bonus, total | Decimal | ✅ | צילום מצב בזמן הנעילה |

### קשרים

```
Team 1 ──── N User           (עובדים בצוות)
Team 1 ──── 1 User           (ראש הצוות)
User 1 ──── N AttendanceSession, Pulse, Task, TimeCorrection, SickNote, PayrollSnapshot
AttendanceSession 1 ──── N TimeCorrection
Team 1 ──── N NonWorkingDay, Announcement, MonthLock
```

### חישובים (לא נשמרים — מחושבים בכל פעם)

- **סטטוס יום** (ללוח השנה): `WORKED` דווח · `MISSING` חסר · `MISSING_EXIT` חסרה יציאה · `SICK` מחלה מאושרת · `NON_WORKING` יום מיוחד · `WEEKEND` שישי–שבת · `FUTURE` עתידי · `IN_PROGRESS` היום, במשמרת.
- **שעות ביום** = סכום כל הקטעים הסגורים. קטע בלי יציאה לא נספר עד שמתקנים.
- **שכר** = שעות רגילות (עד 8 ביום) × שכר שעתי + שעות נוספות × שכר שעתי × 1.25. ראש צוות: + 5% מסך שכר העובדים בצוות.
- **חודש נעול** → השכר נקרא מ־PayrollSnapshot ולא מחושב מחדש.

---

## ה. Endpoints

כל הכתובות מתחילות ב־`/api`. 🔓 = פתוח · 🔑 = כל משתמש מחובר · 👑 = ראש צוות בלבד.
פירוט מלא של כל שדה ודוגמאות JSON יהיה ב־Swagger (`/api-docs`) וב־`FRONTEND-API-GUIDE.md`.

### מערכת

| Method | URL | תיאור | הרשאה |
|---|---|---|---|
| GET | `/health` | בדיקת בריאות שרת + חיבור למסד | 🔓 |

### Auth — התחברות והרשמה ①

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| POST | `/auth/register` | הרשמה | 🔓 | `{name, email, password, role, teamName?, salary?, joinCode?}` → `201 {token, user}` |
| POST | `/auth/login` | התחברות | 🔓 | `{email, password}` → `200 {token, user}` / `401` |
| GET | `/auth/me` | פרטי המשתמש המחובר + הצוות | 🔑 | → `{id, name, email, role, salary, team}` |

### Team — צוות ①

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| GET | `/team` | פרטי הצוות שלי (לראש צוות כולל joinCode) | 🔑 | → `{id, name, leader, joinCode?}` |
| GET | `/team/members` | רשימת עובדי הצוות. `?missingSalary=true` לסינון | 👑 | → `[{id, name, email, role, salary}]` (חסרי שכר ראשונים) |
| PATCH | `/team/members/:id/salary` | עדכון שכר שעתי | 👑 | `{salary}` → `{id, salary}` |

### Attendance — נוכחות ① (עצירה ③)

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| GET | `/attendance/today` | מצב נוכחי: `OUT` / `IN` / `PAUSED`, קטעי היום, סה"כ דקות | 🔑 | → `{state, sessions[], workedMinutes}` |
| POST | `/attendance/clock-in` | כניסה (גם "חזרה" אחרי עצירה) | 🔑 | `{location, remarks?}` → `201 session` / `409` אם כבר במשמרת |
| POST | `/attendance/pause` | עצירה זמנית | 🔑 | `{remarks?}` → `session` / `409` אם לא במשמרת |
| POST | `/attendance/clock-out` | יציאה + סיכום יומי | 🔑 | `{dailySummary, remarks?}` → `session` |
| GET | `/attendance/calendar?month=2026-10` | סטטוס לכל יום בחודש (ללוח שנה) | 🔑 | → `{month, days:[{date, status, workedMinutes, sessions[]}]}` |
| GET | `/attendance/missing?month=` | רק ימים עם חור | 🔑 | → `[{date, status}]` |
| GET | `/attendance/team` | נוכחות צוותית. `?from&to&userId&location&search&sort&order` | 👑 | → `[{date, user, sessions[], workedMinutes, dailySummary}]` |
| GET | `/attendance/team/now` | מי במשמרת עכשיו | 👑 | → `[{user, state, location, since}]` |

### Corrections — תיקון שעות ②

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| GET | `/corrections/quota` | כמה תיקונים עצמיים נשארו השבוע | 🔑 | → `{limit:2, used, remaining, weekStart}` |
| POST | `/corrections` | תיקון: אם יש מכסה → נכנס מיד, אחרת → בקשה לאישור | 🔑 | `{workDate, sessionId?, newClockIn?, newClockOut?, reason}` → `201 {kind, status, ...}` |
| GET | `/corrections/mine` | התיקונים והבקשות שלי | 🔑 | → `[...]` |
| GET | `/corrections/team?status=PENDING` | בקשות/יומן הצוות | 👑 | → `[...]` |
| PATCH | `/corrections/:id/review` | אישור או דחייה | 👑 | `{decision: "APPROVED"/"REJECTED"}` → `{...}` |

### Pulses — דופק ②

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| GET | `/pulses/current` | יש בדיקה פתוחה עכשיו? (React שואל כל ~30–60 שניות) | 🔑 | → `{pulse: {id, expiresAt} \| null}` |
| POST | `/pulses/:id/respond` | מענה | 🔑 | `{responseText}` → `{status:"ANSWERED"}` / `410` אם עברו 3 דקות |
| GET | `/pulses/mine?date=` | הבדיקות שלי ותשובותיי | 🔑 | → `[...]` |
| GET | `/pulses/red-dots?from&to` | עובדים שפספסו את **שתי** הבדיקות ביום | 👑 | → `[{date, user}]` (בלי תוכן תשובות) |

### Tasks — משימות ①

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| GET | `/tasks` | `?date&status&priority&search&sort=priority\|createdAt\|estimatedMinutes&order` | 🔑 | → `[task]` |
| POST | `/tasks` | הוספה | 🔑 | `{title, priority?, estimatedMinutes, taskDate?}` → `201 task` |
| PATCH | `/tasks/:id` | עריכה (כל שדה) | 🔑 | `{title?, status?, priority?, estimatedMinutes?}` → `task` |
| DELETE | `/tasks/:id` | מחיקה | 🔑 | → `204` |
| POST | `/tasks/:id/carry-over` | העברה ליום הבא | 🔑 | → `task` (taskDate+1, carriedOverCount+1) |
| GET | `/tasks/plan?date=` | יועץ עומס: ממוין לפי עדיפות, סך זמן, זמן שנשאר, אזהרה והמלצה | 🔑 | → `{tasks[], totalMinutes, remainingShiftMinutes, overloaded, message, suggestedToMove[]}` |

> **יועץ המשימות** בנוי עם "שקע" ל־AI: כרגע הוא מחשב לפי חוקים. בעתיד אפשר להוסיף מפתח של שירות AI בהגדרות — ואם הוא לא זמין, חוזרים אוטומטית לחישוב הרגיל.

### Sick notes — אישורי מחלה ②

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| POST | `/sick-notes` | העלאה (`multipart/form-data`) | 🔑 | `file, fromDate, toDate, note?` → `201 {id, status:"PENDING"}` |
| GET | `/sick-notes/mine` | שלי | 🔑 | → `[...]` (בלי הקובץ עצמו) |
| GET | `/sick-notes/:id/file` | הורדת/צפייה בקובץ | 🔑 בעלים / 👑 הצוות | → הקובץ |
| GET | `/sick-notes/team?status=` | של הצוות | 👑 | → `[...]` |
| PATCH | `/sick-notes/:id/review` | אישור/דחייה | 👑 | `{decision}` → `{...}` |

### Salary — שכר ① (נעילה ③)

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| GET | `/salary/me?month=` | השכר שלי לחודש (ברירת מחדל: נוכחי) | 🔑 | → `{month, salary, regularHours, overtimeHours, basePay, overtimePay, bonus, total, isLocked, salaryMissing}` |
| GET | `/salary/me/history` | היסטוריית חודשים | 🔑 | → `[{month, total, ...}]` |
| GET | `/salary/team?month=` | שכר כל עובד + סה"כ צוות + הבונוס שלי | 👑 | → `{month, members[], teamTotal, leaderBonus, isLocked}` |
| POST | `/salary/locks` | נעילת חודש | 👑 | `{month:"2026-09"}` → `201` / `409` אם כבר נעול / `400` אם החודש לא הסתיים |
| GET | `/salary/locks` | חודשים נעולים | 👑 | → `[...]` |

### Calendar days — ימים מיוחדים ③

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| GET | `/non-working-days?month=` | ימי הצוות | 🔑 | → `[...]` |
| POST | `/non-working-days` | הוספה (יום אחד או טווח) | 👑 | `{fromDate, toDate?, type, note?}` → `201 [...]` |
| PATCH | `/non-working-days/:id` | עריכה | 👑 | `{type?, note?}` |
| DELETE | `/non-working-days/:id` | מחיקה | 👑 | → `204` |

### Announcements — הודעות ③

| Method | URL | תיאור | הרשאה | Request → Response |
|---|---|---|---|---|
| GET | `/announcements` | פעילות (ראש צוות: `?all=true` גם שפגו) | 🔑 | → `[...]` |
| POST | `/announcements` | חדשה | 👑 | `{title, content, expiresAt?}` → `201` |
| PATCH | `/announcements/:id` | עריכה | 👑 | |
| DELETE | `/announcements/:id` | מחיקה | 👑 | → `204` |

### קודי שגיאה אחידים

כל שגיאה חוזרת במבנה: `{ "error": { "code": "VALIDATION_ERROR", "message": "הסבר בעברית", "details": [...] } }`

| קוד | מתי |
|---|---|
| 400 | ולידציה נכשלה / פעולה לא חוקית (למשל נעילת חודש שלא הסתיים) |
| 401 | אין טוקן / טוקן לא תקין / פג תוקף / סיסמה שגויה |
| 403 | אין הרשאה לפעולה (עובד מנסה פעולה של ראש צוות) |
| 404 | לא נמצא (או שייך למישהו אחר) |
| 409 | התנגשות: אימייל קיים, כבר במשמרת, חודש נעול |
| 410 | בדיקת דופק שפג תוקפה |
| 413 | קובץ גדול מדי |
| 500 | שגיאת שרת |

---

## ו. מבנה מודולרי (לפי בקשתך)

```
src/
  app.ts                ← רשימת מודולים אחת. להסיר מודול = למחוק שורה
  config/               ← הגדרות וכללים עסקיים (8 שעות, 125%, 5%...)
  common/               ← middleware (אימות, הרשאות, שגיאות), עזרי תאריכים
  modules/
    auth/  team/  attendance/  corrections/  pulses/
    tasks/  sick-notes/  salary/  non-working-days/  announcements/
      ├─ *.routes.ts       (ניתוב)
      ├─ *.controller.ts   (קבלת בקשה והחזרת תשובה)
      ├─ *.service.ts      (לוגיקה)
      ├─ *.schemas.ts      (ולידציה ב־Zod)
      └─ *.openapi.ts      (תיעוד Swagger של המודול)
```

כל מודול עצמאי. הסרת מודול = מחיקת התיקייה + שורה אחת ב־`app.ts`. הוספת מודול = תיקייה חדשה + שורה אחת.

---

## ז. התאמה לדרישות החובה

| דרישה | איך מתקיים |
|---|---|
| התחברות | `POST /auth/login`, `GET /auth/me`, JWT, bcrypt |
| שני סוגי משתמשים עם הרשאות שונות | `EMPLOYEE` / `TEAM_LEADER` — טבלת הרשאות בסעיף ג |
| אובייקט מרכזי | **משימות** (וגם נוכחות) |
| 5+ שדות משמעותיים | Task: title, taskDate, status, priority, estimatedMinutes, carriedOverCount |
| רשימה | `GET /tasks`, `GET /attendance/team` ועוד |
| הוספה | `POST /tasks`, `POST /attendance/clock-in`, `POST /sick-notes` |
| עריכה | `PATCH /tasks/:id`, `PATCH /team/members/:id/salary` |
| שדה בחירה | status, priority, location, type, role |
| חיפוש / סינון / מיון | `GET /tasks?search&status&priority&sort`, `GET /attendance/team?search&location&sort` |
| מסד נתונים אמיתי | PostgreSQL + Prisma + Migrations |
