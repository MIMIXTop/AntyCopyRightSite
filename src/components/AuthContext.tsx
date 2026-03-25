// AuthContext.tsx
import React, {createContext, useContext, useState, type ReactNode, useEffect} from 'react';
import { type GoogleUser } from '../types/auth'
import Cookies from 'js-cookie'

interface AuthContextType {
    user: GoogleUser | null;
    token: string | null;
    login: (credentialResponse: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_METHOD: 'cookie' | 'localStorage' = 'cookie'; // или 'localStorage'
const TOKEN_KEY = 'accessToken';

const tokenStorage = {
    set: (token: string) => {
        if (STORAGE_METHOD === 'cookie') {
            Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
        } else {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },
    get: () : string | undefined | null => {
        return STORAGE_METHOD === 'cookie' ? Cookies.get(TOKEN_KEY) : localStorage.getItem(TOKEN_KEY);
    },
    remove: () => {
        if (STORAGE_METHOD === 'cookie') {
            Cookies.remove(TOKEN_KEY);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }
};

const decodeJwt = (token: string) : GoogleUser | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const userData = JSON.parse(jsonPayload);
        return {
            name: userData.name,
            picture: userData.picture,
            email: userData.email,
            sub: userData.sub
        };
    } catch (e) {
        console.error("Ошибка декодирования токена", e);
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const savedToken = tokenStorage.get();
        if (savedToken) {
            const decodedUser = decodeJwt(savedToken);
            setUser(decodedUser);
            setToken(savedToken);
        } else {
            tokenStorage.remove();
        }
        setIsLoading(false);
    }, []);

    const login = (credentialResponse: any) => {
        const { credential } = credentialResponse;

        if (!credential) return;

        const decodedUser = decodeJwt(credential);
        if (decodedUser) {
            setUser(decodedUser);
            setToken(credential);
            tokenStorage.set(credential);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('accessToken');
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