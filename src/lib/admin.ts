// Admin authentication utilities

// Secret admin key - change this to your own secret
export const ADMIN_SECRET_KEY = "TuTienVuotThoiDai_Admin_2025_Secret_Key_PhoPro";

// Session duration (24 hours)
export const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000;

export interface AdminSession {
    authenticated: boolean;
    timestamp: number;
}

// Client-side utilities
export function setClientAdminSession(): void {
    const session: AdminSession = {
        authenticated: true,
        timestamp: Date.now()
    };

    if (typeof window !== 'undefined') {
        localStorage.setItem('admin_session', JSON.stringify(session));
    }
}

export function getClientAdminSession(): AdminSession | null {
    if (typeof window === 'undefined') return null;

    try {
        const sessionStr = localStorage.getItem('admin_session');
        if (!sessionStr) return null;

        const session: AdminSession = JSON.parse(sessionStr);

        // Check if session is expired
        if (Date.now() - session.timestamp > ADMIN_SESSION_DURATION) {
            localStorage.removeItem('admin_session');
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

export function clearClientAdminSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_session');
    }
}

export function isClientAdminAuthenticated(): boolean {
    const session = getClientAdminSession();
    return session?.authenticated === true;
}
