import Cookies from 'js-cookie';

export class TokenStorage {
    private static readonly TOKEN_KEY = 'accessToken';
    private static readonly STORAGE_METHOD: 'cookie' | 'localStorage' = 'cookie';

    static setToken(token: string): void {
        if (this.STORAGE_METHOD === 'cookie') {
            Cookies.set(this.TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
        } else {
            localStorage.setItem(this.TOKEN_KEY, token);
        }
    }

    static getToken(): string | null {
        const token = this.STORAGE_METHOD === 'cookie'
            ? Cookies.get(this.TOKEN_KEY)
            : localStorage.getItem(this.TOKEN_KEY);
        return token || null;
    }

    static removeToken(): void {
        if (this.STORAGE_METHOD === 'cookie') {
            Cookies.remove(this.TOKEN_KEY);
        } else {
            localStorage.removeItem(this.TOKEN_KEY);
        }
    }
}