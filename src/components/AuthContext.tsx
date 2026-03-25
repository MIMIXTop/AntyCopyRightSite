import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type GoogleUser } from '../types/auth';
import { TokenStorage } from "../services/TokenStore" // Исправь опечатку в названии если надо

interface AuthContextType {
    user: GoogleUser | null;
    token: string | null;
    login: (tokenResponse: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Функция для получения данных пользователя по Access Token
    const fetchUserInfo = async (accessToken: string) => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                return {
                    name: data.name,
                    picture: data.picture,
                    email: data.email,
                    sub: data.sub
                } as GoogleUser;
            }
        } catch (error) {
            console.error("Ошибка при получении профиля Google:", error);
        }
        return null;
    };

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = TokenStorage.getToken();
            if (savedToken) {
                setToken(savedToken);
                const userData = await fetchUserInfo(savedToken);
                if (userData) {
                    setUser(userData);
                } else {
                    // Если токен протух (UserInfo вернул ошибку)
                    logout();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (tokenResponse: any) => {
        const accessToken = tokenResponse.access_token;

        if (!accessToken) {
            console.error("Access Token не найден в ответе");
            return;
        }

        TokenStorage.setToken(accessToken);
        setToken(accessToken);

        const userData = await fetchUserInfo(accessToken);
        if (userData) {
            setUser(userData);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        TokenStorage.removeToken();
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};