
export interface MySalary {
    month: string;
    salaryMissing: boolean;
    workedDays: number;
    regularHours: number;
    overtimeHours: number;
    isLocked: boolean;
    salary: number | null;
    basePay: number | null;
    overtimePay: number | null;
    bonus: number | null;
    total: number | null;
}
