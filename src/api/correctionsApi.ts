import axiosInstance from "./axiosInstance";
import type { CorrectionQuota } from "../types/correction";
export async function getQuota(): Promise<CorrectionQuota> {
    const response =await axiosInstance.get("/corrections/quota");
    return response.data;
}