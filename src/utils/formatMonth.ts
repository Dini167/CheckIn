
export function formatMonth(monthKey : string): string {
    const [year, month] = monthKey .split("-");
    return `${month}/${year}`;
}