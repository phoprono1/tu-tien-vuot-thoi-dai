import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { DatabaseCharacter } from '@/types/database';

interface User {
    $id: string;
    name?: string;
    email: string;
}

interface AuthState {
    user: User | null;
    character: DatabaseCharacter | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    setUser: (user: User | null) => void;
    setCharacter: (character: DatabaseCharacter | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    logout: () => void;
    updateCharacter: (updates: Partial<DatabaseCharacter>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    devtools(
        immer((set) => ({
            // Initial state
            user: null,
            character: null,
            isAuthenticated: false,
            isLoading: true,
            error: null,

            // Actions
            setUser: (user) =>
                set((state) => {
                    state.user = user;
                    state.isAuthenticated = !!user;
                    state.error = null;
                }),

            setCharacter: (character) =>
                set((state) => {
                    state.character = character;
                }),

            setLoading: (loading) =>
                set((state) => {
                    state.isLoading = loading;
                }),

            setError: (error) =>
                set((state) => {
                    state.error = error;
                }),

            logout: () =>
                set((state) => {
                    state.user = null;
                    state.character = null;
                    state.isAuthenticated = false;
                    state.error = null;
                }),

            updateCharacter: (updates) =>
                set((state) => {
                    if (state.character) {
                        Object.assign(state.character, updates);
                    }
                }),
        })),
        { name: 'auth-store' }
    )
);
