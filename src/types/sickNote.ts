
export interface SickNote {
    id: number;
    user: { id: number; name: string };
    fromDate: string;
    toDate: string;
    days: number;
    note: string | null;
    fileName: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
}
