# נוכחות+ — שרת (Backend)

שרת למערכת תיקוף נוכחות, משימות אישיות וחישוב שכר.
**Node.js + Express + TypeScript + PostgreSQL + Prisma + JWT + Swagger.**

> 👋 **פעם ראשונה? התחילי מהקובץ [START-HERE.md](START-HERE.md)** — הוראות צעד-אחר-צעד להעלאה לאינטרנט.
> 📘 **כותבת את ה-React?** כל מה שצריך נמצא ב-[FRONTEND-API-GUIDE.md](FRONTEND-API-GUIDE.md).

---

## הרצה על המחשב (פיתוח)

צריך רק **Node.js 20 ומעלה** (https://nodejs.org — גרסת LTS). לא צריך להתקין PostgreSQL.

```bash
# 1. התקנת ספריות (פעם אחת)
npm install

# 2. יצירת קובץ הגדרות
copy .env.example .env        # ב-Windows (ב-Mac/Linux: cp .env.example .env)
#    ואז לפתוח את .env ולשנות את JWT_SECRET למחרוזת ארוכה ואקראית

# 3. הפעלת מסד נתונים מקומי — בחלון טרמינל נפרד, להשאיר פתוח
npm run db:local

# 4. יצירת הטבלאות + נתוני הדגמה
npm run db:migrate
npm run db:seed

# 5. הפעלת השרת
npm run dev
```

- השרת: http://localhost:3000
- Swagger: http://localhost:3000/api-docs
- בדיקת בריאות: http://localhost:3000/api/health

### משתמשי הדגמה (רק בסביבת פיתוח)

| תפקיד | אימייל | סיסמה |
|---|---|---|
| ראש צוות (צוות פיתוח, קוד `TEAM-DEMO1`) | `dana@example.com` | `Password123` |
| עובד | `yossi@example.com` | `Password123` |
| עובדת | `noa@example.com` | `Password123` |
| עובדת חדשה בלי שכר שעתי | `michal@example.com` | `Password123` |
| ראש צוות אחר (צוות שיווק, `TEAM-DEMO2`) | `avi@example.com` | `Password123` |
| עובדת בצוות האחר | `roni@example.com` | `Password123` |

בנתוני ההדגמה יש: חור בנוכחות, יציאה חסרה, נקודה אדומה (יוסי פספס 2 בדיקות דופק), יום מחלה מאושר ובקשה ממתינה, חג, הודעות, ומשימות עם עומס.

---

## פקודות

| פקודה | מה עושה |
|---|---|
| `npm run dev` | הרצה בפיתוח (מתעדכן אוטומטית כששומרים קובץ) |
| `npm run build` | בנייה לפרודקשן לתיקייה `dist` |
| `npm start` | מריץ Migrations ואז את השרת הבנוי (זה מה ש-Render מריץ) |
| `npm test` | כל הבדיקות האוטומטיות (מפעיל PostgreSQL זמני משלו) |
| `npm run typecheck` | בדיקת TypeScript |
| `npm run db:local` | מסד נתונים PostgreSQL מקומי בלי התקנה |
| `npm run db:migrate` | יצירת/עדכון הטבלאות לפי ה-Migrations |
| `npm run db:seed` | נתוני הדגמה (**בפיתוח מוחק את כל הנתונים!**) |
| `npm run db:studio` | ממשק גרפי לצפייה בטבלאות |
| `npm run openapi:export` | עדכון הקובץ `docs/openapi.json` |

---

## מבנה הפרויקט

```
prisma/
  schema.prisma          ← הגדרת הטבלאות
  migrations/            ← יצירת הטבלאות במסד
  seed.ts                ← נתוני הדגמה
src/
  server.ts              ← הפעלת השרת
  app.ts                 ← הגדרת Express, CORS, Swagger, שגיאות
  config/
    env.ts               ← משתני סביבה (נבדקים בהפעלה)
    rules.ts             ← ⭐ כללים עסקיים: 8 שעות, 125%, 5%, דופק, מכסת תיקונים...
  common/                ← קוד משותף: אימות JWT, הרשאות, שגיאות, תאריכים, Swagger
  modules/
    index.ts             ← ⭐ רשימת המודולים הפעילים
    auth/ team/ attendance/ tasks/ pulses/ corrections/
    sick-notes/ salary/ non-working-days/ announcements/ health/
      *.routes.ts        ← כתובות (Routes)
      *.controller.ts    ← קבלת הבקשה והחזרת תשובה
      *.service.ts       ← הלוגיקה העסקית
      *.schemas.ts       ← ולידציה (Zod) — משמשת גם ל-Swagger
      *.openapi.ts       ← תיעוד Swagger של המודול
tests/                   ← בדיקות אוטומטיות (Vitest + Supertest)
docs/                    ← אפיון, openapi.json
scripts/                 ← מסד מקומי, ייצוא OpenAPI
```

### להוסיף או להוריד יכולת

כל יכולת היא מודול עצמאי בתיקייה משלו.

- **להוריד יכולת:** למחוק את השורה שלה ב-`src/modules/index.ts` (ואם רוצים — גם את התיקייה).
  לדוגמה: מחיקת `pulsesModule` מבטלת את כל מנגנון הדופק, והשאר ממשיך לעבוד.
- **להוסיף יכולת:** ליצור תיקייה חדשה ב-`src/modules` עם `index.ts` שמייצא `AppModule`, ולהוסיף שורה ב-`index.ts`.
- **לשנות כלל עסקי** (למשל 9 שעות במקום 8): רק ב-`src/config/rules.ts`.

### הוספת AI ליועץ המשימות (בעתיד)

`src/modules/tasks/tasks.planner.ts` בנוי עם "שקע" ל-AI: מממשים `TaskPlanner` וקוראים ל-`setAiPlanner(...)`.
אם ה-AI לא זמין או נחסם — המערכת חוזרת אוטומטית לחישוב הרגיל.

---

## אבטחה

- סיסמאות נשמרות כ-Hash (bcrypt) ולעולם לא מוחזרות ב-API.
- JWT חתום עם `JWT_SECRET`, תוקף 12 שעות. השרת לא יעלה אם הסוד קצר מ-32 תווים.
- המשתמש נקבע **רק** לפי הטוקן. בלי טוקן → 401, בלי הרשאה → 403, רשומה של מישהו אחר → 404.
- כל השעות נלקחות משעון השרת.
- קבצים: רק JPG/PNG/PDF עד 5MB, ונבדק גם התוכן האמיתי של הקובץ.
- CORS ניתן להגדרה ב-`CORS_ORIGINS`.

### הערה על `npm audit`

נשארו התראות בשתי ספריות שלא רצות על בקשות מהאינטרנט:
`@vitest/mocker` (כלי הבדיקות בלבד) ו-`deepmerge-ts` (בתוך כלי השורת-פקודה של Prisma, לקריאת קובץ הגדרות).
התיקון שלהן דורש מעבר לגרסאות ראשיות חדשות (Prisma 7, Vitest 4) שעדיין לא נבדקו עם הפרויקט.
