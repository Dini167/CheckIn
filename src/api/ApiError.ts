
export class ApiError extends Error {
    constructor(message: string,code: string,details: ApiErrorDetail[],status: number) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.details = details;
        this.status = status;
    }
    code:string;
    details: ApiErrorDetail[];
    status: number;
}
export interface ApiErrorDetail{
    field: string;
    message: string;
}