import type { TeamMember } from '../types/team';
import axiosInstance from './axiosInstance';
export const getTeamMembers = async (): Promise<TeamMember[]> => {
    const response = await axiosInstance.get('/team/members');
    return response.data;
};
export const updateMemberSalary=async(memberId: number, salary: number): Promise<void> => {
    await axiosInstance.patch(`/team/members/${memberId}/salary`, { salary });
}