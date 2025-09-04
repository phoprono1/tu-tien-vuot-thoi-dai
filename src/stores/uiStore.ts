import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

interface UIState {
    showModal: string | null;
    isLoading: Record<string, boolean>;
    notifications: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
        timestamp: number;
        duration?: number;
    }>;
    theme: 'dark' | 'light';
    sidebarCollapsed: boolean;
}

interface UIActions {
    setModal: (modal: string | null) => void;
    setLoading: (key: string, loading: boolean) => void;
    addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    setTheme: (theme: 'dark' | 'light') => void;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
    devtools(
        immer((set) => ({
            // Initial state
            showModal: null,
            isLoading: {},
            notifications: [],
            theme: 'dark',
            sidebarCollapsed: false,

            // Actions
            setModal: (modal) =>
                set((state) => {
                    state.showModal = modal;
                }),

            setLoading: (key, loading) =>
                set((state) => {
                    if (loading) {
                        state.isLoading[key] = true;
                    } else {
                        delete state.isLoading[key];
                    }
                }),

            addNotification: (notification) =>
                set((state) => {
                    const id = `notification-${Date.now()}-${Math.random()}`;
                    state.notifications.push({
                        ...notification,
                        id,
                        timestamp: Date.now(),
                        duration: notification.duration || 5000,
                    });

                    // Auto-remove after duration
                    setTimeout(() => {
                        set((state) => {
                            state.notifications = state.notifications.filter(n => n.id !== id);
                        });
                    }, notification.duration || 5000);
                }),

            removeNotification: (id) =>
                set((state) => {
                    state.notifications = state.notifications.filter(n => n.id !== id);
                }),

            clearNotifications: () =>
                set((state) => {
                    state.notifications = [];
                }),

            setTheme: (theme) =>
                set((state) => {
                    state.theme = theme;
                }),

            toggleSidebar: () =>
                set((state) => {
                    state.sidebarCollapsed = !state.sidebarCollapsed;
                }),

            setSidebarCollapsed: (collapsed) =>
                set((state) => {
                    state.sidebarCollapsed = collapsed;
                }),
        })),
        { name: 'ui-store' }
    )
);
