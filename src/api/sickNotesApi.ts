import type { SickNote } from "../types/sickNote";
import axiosInstance from "./axiosInstance";
export async function uploadSickNote(formData: FormData): Promise<SickNote> {
    const response = await axiosInstance.post('/sick-notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
}
export async function getTeamSickNotes(): Promise<SickNote[]> {
    const response = await axiosInstance.get('/sick-notes/team?status=PENDING');
    return response.data;
}
export async function reviewSickNote(id: number, decision: "APPROVED" | "REJECTED"): Promise<void> {
    await axiosInstance.patch(`/sick-notes/${id}/review`, { decision });
}
export async function openSickNoteFile(id: number): Promise<void> {
    const response = await axiosInstance.get(`/sick-notes/${id}/file`,{ responseType: 'blob' });
    const fileURL = URL.createObjectURL(response.data);
    window.open(fileURL);
}