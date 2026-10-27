
export interface User {
    id: number;
    name: string;
    email: string;
    role: "EMPLOYEE" | "TEAM_LEADER";
    salary: number | null;
    team: Team;
}
export interface Team {
    id: number;
    name: string;
    joinCode?: string;
}
export interface AuthResponse {
    token: string;
    user: User;
}