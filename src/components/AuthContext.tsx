import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { type GoogleUser, type GoogleTokenResponse } from '../types/auth';
import { TokenStorage } from "../services/TokenStore";

interface AuthContextType {
    user: GoogleUser | null;
    token: string | null;
    login: (tokenResponse: GoogleTokenResponse) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        TokenStorage.removeToken();
    }, []);

    const fetchUserInfo = useCallback(async (accessToken: string): Promise<GoogleUser | null> => {
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
                };
            }
        } catch (error) {
            console.error("Ошибка при получении профиля Google:", error);
        }
        return null;
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = TokenStorage.getToken();
            if (savedToken) {
                setToken(savedToken);
                const userData = await fetchUserInfo(savedToken);
                if (userData) {
                    setUser(userData);
                } else {
                    logout();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [fetchUserInfo, logout]);

    const login = async (tokenResponse: GoogleTokenResponse) => {
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

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isLoading }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};