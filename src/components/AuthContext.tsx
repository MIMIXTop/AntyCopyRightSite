import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { type GoogleUser } from '../types/auth';
import { env } from '../config/env';

interface AuthContextType {
    user: GoogleUser | null;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type BackendGoogleUser = Partial<GoogleUser> & {
    sub?: string;
    picture_url?: string;
};

type AuthMeResponse = { user?: BackendGoogleUser | null } | BackendGoogleUser;

const hasUserProperty = (data: AuthMeResponse): data is { user?: BackendGoogleUser | null } => {
    return Object.prototype.hasOwnProperty.call(data, 'user');
};

const normalizeUser = (user: BackendGoogleUser): GoogleUser => {
    const googleSub = user.googleSub ?? user.sub ?? '';

    return {
        id: user.id ?? googleSub ?? user.email ?? '',
        googleSub,
        email: user.email ?? '',
        name: user.name ?? '',
        picture: user.picture ?? user.picture_url ?? '',
    };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const refreshUser = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${env.apiBaseUrl}/api/auth/me`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.status === 401) {
                setUser(null);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load current user');
            }

            const data = await response.json() as AuthMeResponse;
            const nextUser = hasUserProperty(data) ? data.user : data;
            if (!nextUser) {
                setUser(null);
                return;
            }

            setUser(normalizeUser(nextUser));
        } catch (error) {
            console.error('Ошибка при получении текущей сессии:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch(`${env.apiBaseUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Ошибка при выходе из аккаунта:', error);
        } finally {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    return (
        <AuthContext.Provider value={{ user, logout, refreshUser, isAuthenticated: !!user, isLoading }}>
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
