
import { createContext, useState } from 'react';
import type { AuthResponse, User } from '../types/user';
import type { ReactNode } from 'react';
export type AuthContextType = {
    user:User | null,
    token: string | null,
    login: (response: AuthResponse) => void,
    logout: () => void
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem('token');
    });

    const login=(response: AuthResponse) => {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };
    return (<AuthContext.Provider value={{ user, token, login, logout }}>
        {children}
    </AuthContext.Provider>);
}




