export interface RegisterFormValues {
    name: string;
    email: string;
    password: string;
    role: "EMPLOYEE" | "TEAM_LEADER" | "";
    teamName: string;
    salary?: number;
    joinCode?: string;
}

