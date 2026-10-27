import axiosInstance from './axiosInstance';
import type {MySalary} from '../types/salary';

export const getMySalary = async (): Promise<MySalary> => {
    const response = await axiosInstance.get('/salary/me');
    return response.data;
};

