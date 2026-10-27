
import type { User } from '../types/user';

export const getHomePath = (user: User | null, token: string | null) =>
    !user || !token ? '/login' : user.role === 'TEAM_LEADER' ? '/team-leader' : '/employee';

