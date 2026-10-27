
import type { User } from './user';

export type TeamMember = Pick<User, "id" | "name" | "email" | "role" | "salary"> & {
    salaryMissing: boolean;
    joinedAt: string;
};