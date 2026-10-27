
import type { LoginFormValues } from '../types/login';
import type { RegisterFormValues } from '../types/register';
import type { AuthResponse } from '../types/user';
import api from './axiosInstance';

export async function registerUser(data: RegisterFormValues): Promise<AuthResponse> {
    const commonData = {
        name: data.name,
        role: data.role,
        email: data.email,
        password: data.password,
    };
    let requestData;
    if (data.role === "TEAM_LEADER") {
        requestData = {
            ...commonData,
            teamName: data.teamName,
            salary: data.salary
        };
    } else if (data.role === "EMPLOYEE") {
        requestData = {
            ...commonData,
            joinCode: data.joinCode
        };
    }
    else {
        throw new Error('תפקיד לא חוקי');
    }
    const response = await api.post<AuthResponse>('/auth/register', requestData);
    return response.data;
}
export async function loginUser(data: LoginFormValues): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
}






