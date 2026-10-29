import axiosInstance from "./axiosInstance";
import type { CorrectionQuota,Correction, CorrectionResult, TeamCorrection } from "../types/correction";
export async function getQuota(): Promise<CorrectionQuota> {
    const response =await axiosInstance.get("/corrections/quota");
    return response.data;
}
export async function createCorrection(params: Correction): Promise<CorrectionResult>{
    const response = await axiosInstance.post("/corrections", params);
    return response.data;
}
export async function getTeamCorrectionRequests(): Promise<TeamCorrection[]> {
    const response = await axiosInstance.get("/corrections/team");
    return response.data;
}
export async function reviewCorrection(id: number, decision: "APPROVED" | "REJECTED"): Promise<void> {
    await axiosInstance.patch(`/corrections/${id}/review` ,{ decision });
}