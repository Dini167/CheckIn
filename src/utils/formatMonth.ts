
export function formatMonth(date: Date): string {
    return date.toLocaleDateString("he-IL", { month: "long", year: "numeric" });
}