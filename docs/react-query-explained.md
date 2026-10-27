# מעבר ל־React Query (TanStack Query) — מה זה ולמה

## 1. מה הבעיה ש־React Query פותרת?

כל דף שטוען נתונים מהשרת צריך לנהל **3 דברים**:

| מה | למה |
|---|---|
| `data` | הנתונים שהגיעו מהשרת |
| `isLoading` | כדי להציג "טוען..." |
| `error` | כדי להציג הודעת שגיאה |

את זה כבר פתרת בעצמך עם `useFetch`: שלושה `useState` + `useEffect` + `try/catch`.

**React Query היא ספרייה שעושה בדיוק את זה — ועוד:**

| יכולת | `useFetch` שלך | React Query |
|---|---|---|
| data / loading / error | ✅ | ✅ |
| רענון ידני (`refetch`) | ✅ | ✅ |
| **זיכרון (cache)** — חוזרים לדף שכבר נטען, הנתונים מוצגים מיד בלי "טוען..." | ❌ | ✅ |
| **רענון אוטומטי** כל X שניות (מתאים ללוח צוות) | ❌ | ✅ שורה אחת: `refetchInterval` |
| רענון כשחוזרים לחלון הדפדפן | ❌ | ✅ אוטומטי |
| מניעת בקשה כפולה לאותו מידע | ❌ | ✅ |

**ולמה עכשיו?** המרצה כתבה את React Query **ברשימת הטכנולוגיות** של הפרויקט.

---

## 2. המילים החדשות (רק 4)

| מושג | מה זה | איפה אצלך |
|---|---|---|
| `QueryClient` | ה"מחסן" שבו נשמרים כל הנתונים מהשרת | נוצר פעם אחת ב־`main.tsx` |
| `QueryClientProvider` | עוטף את האפליקציה כדי שכל דף יגיע למחסן — **בדיוק כמו `AuthProvider`** | `main.tsx` |
| `useQuery` | ה־hook שטוען נתונים. מקבל `queryFn` ו־`queryKey` | בתוך `useFetch` |
| `queryKey` | **השם** של הנתונים במחסן, למשל `["mySalary"]` | פרמטר שכל דף שולח |

### למה צריך `queryKey`?
המחסן הוא כמו ארון עם מגירות. `queryKey` הוא **השם על המגירה**.
- דף השכר שומר במגירה `["mySalary"]`.
- כשחוזרים לדף השכר — React Query פותח את המגירה, מציג מיד את מה שיש, ומרענן ברקע.
- לכן **כל דף צריך שם אחר** — אחרת נתוני השכר ונתוני העובדים יתערבבו.

---

## 3. לפני ואחרי — `useFetch.ts`

### לפני (מה שכתבת)
```ts
const [data, setData] = useState<T | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const load = useCallback(async () => {
    setError(null);
    try {
        setIsLoading(true);
        setData(await fetchFunction());
    } catch {
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
}, [fetchFunction, errorMessage]);
useEffect(() => { load(); }, [load]);
return { data, isLoading, error, refetch: load };
```

### אחרי
```ts
const { data, isLoading, error, refetch } = useQuery({
    queryKey,                 // השם של המגירה
    queryFn: fetchFunction,   // הפונקציה שקוראת לשרת — אותה פונקציה כמו קודם
    retry: false,             // בשגיאה — לא לנסות שוב 3 פעמים
});
return {
    data: data ?? null,                  // React Query מתחיל ב־undefined; הדפים שלך מצפים ל־null
    isLoading,
    error: error ? errorMessage : null,  // React Query מחזיר אובייקט שגיאה; הדפים שלך מציגים טקסט
    refetch,
};
```

**שימי לב:** ה־`return` מחזיר **בדיוק את אותם 4 שמות** כמו קודם.
לכן הדפים לא יודעים בכלל שמשהו השתנה בפנים — זה היתרון שבנית לעצמך כשהוצאת את הלוגיקה ל־hook.

---

## 4. מה משתנה בכל קובץ — ולמה

| קובץ | שינוי | למה |
|---|---|---|
| `package.json` | `npm install @tanstack/react-query` | בלי התקנה הספרייה לא קיימת |
| `src/main.tsx` | `new QueryClient()` + עטיפה ב־`<QueryClientProvider>` | ליצור את ה"מחסן" ולתת לכל הדפים גישה אליו |
| `src/hooks/useFetch.ts` | הפנים מוחלפים ב־`useQuery` (סעיף 3) | כאן נמצאת כל הלוגיקה — מחליפים במקום אחד |
| `MySalaryPage.tsx` | פרמטר שלישי: `["mySalary"]` | שם המגירה של השכר |
| `TeamMembersPage.tsx` | פרמטר שלישי: `["teamMembers"]` | שם המגירה של העובדים |
| `TeamAttendancePage.tsx` (לוח צוות) | פרמטר שלישי: `["teamNow"]` | שם המגירה של "מי במשמרת" |

**זהו.** שאר הדפים (`EmployeeHomePage`, `MyAttendance`, טפסים) לא משתמשים ב־`useFetch` ולא משתנים.

### בונוס ללוח הצוות (אופציונלי)
אם רוצים שהלוח יתעדכן לבד כל 30 שניות — מוסיפים ל־`useQuery` שורה אחת:
```ts
refetchInterval: 30000,
```
(כדי לאפשר את זה רק בלוח הצוות, `useFetch` יכול לקבל פרמטר רביעי אופציונלי.)

---

## 5. משפט אחד להסביר למרצה

> "בניתי בעצמי custom hook בשם `useFetch` שמנהל טעינה, שגיאה ונתונים. אחר כך החלפתי את המימוש שלו ב־`useQuery` של React Query, וקיבלתי cache ורענון אוטומטי — **בלי לשנות אף דף**, כי כל הדפים משתמשים רק ב־hook."
