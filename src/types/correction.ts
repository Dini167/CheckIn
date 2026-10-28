
export interface Correction {
    workDate: string;
    reason: string;
    newClockIn?: string;
    newClockOut?: string;
    location?: string;
    sessionId?:number;
}
export interface CorrectionQuota {
    unlimited: boolean;
    limit: number;
    used: number;
    remaining: number

}
export interface CorrectionResult {
    status: "APPLIED" | "PENDING";
}