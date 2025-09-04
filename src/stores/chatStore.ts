import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

export interface ChatMessage {
    $id: string;
    userId: string;
    characterName: string;
    message: string;
    timestamp: string;
}

export interface OnlineUser {
    userId: string;
    characterName: string;
    lastSeen: string;
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    isConnected: boolean;
    lastMessageId: string | null;
    activeTab: 'activity' | 'chat';
    onlineUsers: OnlineUser[];
    onlineCount: number;
}

interface ChatActions {
    addMessage: (message: ChatMessage) => void;
    addMessages: (messages: ChatMessage[]) => void;
    removeMessage: (messageId: string) => void;
    clearMessages: () => void;
    setLoading: (loading: boolean) => void;
    setConnected: (connected: boolean) => void;
    setActiveTab: (tab: 'activity' | 'chat') => void;
    setOnlineUsers: (users: OnlineUser[]) => void;
    updateOnlineCount: (count: number) => void;
    addOnlineUser: (user: OnlineUser) => void;
    removeOnlineUser: (userId: string) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()(
    devtools(
        immer((set) => ({
            // Initial state
            messages: [],
            isLoading: false,
            isConnected: false,
            lastMessageId: null,
            activeTab: 'activity',
            onlineUsers: [],
            onlineCount: 0,

            // Actions
            addMessage: (message) =>
                set((state) => {
                    // Check for duplicates
                    const exists = state.messages.some(m => m.$id === message.$id);
                    if (!exists) {
                        state.messages.push(message);

                        // Keep only last 20 messages
                        if (state.messages.length > 20) {
                            state.messages = state.messages.slice(-20);
                        }

                        state.lastMessageId = message.$id;
                    }
                }),

            addMessages: (messages) =>
                set((state) => {
                    const existingIds = new Set(state.messages.map(m => m.$id));
                    const newMessages = messages.filter(m => !existingIds.has(m.$id));

                    state.messages.push(...newMessages);

                    // Sort by timestamp and keep last 20
                    state.messages.sort((a, b) =>
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );

                    if (state.messages.length > 20) {
                        state.messages = state.messages.slice(-20);
                    }

                    if (newMessages.length > 0) {
                        state.lastMessageId = state.messages[state.messages.length - 1].$id;
                    }
                }),

            removeMessage: (messageId) =>
                set((state) => {
                    state.messages = state.messages.filter(m => m.$id !== messageId);
                }),

            clearMessages: () =>
                set((state) => {
                    state.messages = [];
                    state.lastMessageId = null;
                }),

            setLoading: (loading) =>
                set((state) => {
                    state.isLoading = loading;
                }),

            setConnected: (connected) =>
                set((state) => {
                    state.isConnected = connected;
                }),

            setActiveTab: (tab) =>
                set((state) => {
                    state.activeTab = tab;
                }),

            // Online users actions
            setOnlineUsers: (users) =>
                set((state) => {
                    state.onlineUsers = users;
                    state.onlineCount = users.length;
                }),

            updateOnlineCount: (count) =>
                set((state) => {
                    state.onlineCount = count;
                }),

            addOnlineUser: (user) =>
                set((state) => {
                    const exists = state.onlineUsers.some(u => u.userId === user.userId);
                    if (!exists) {
                        state.onlineUsers.push(user);
                        state.onlineCount = state.onlineUsers.length;
                    }
                }),

            removeOnlineUser: (userId) =>
                set((state) => {
                    state.onlineUsers = state.onlineUsers.filter(u => u.userId !== userId);
                    state.onlineCount = state.onlineUsers.length;
                }),
        })),
        { name: 'chat-store' }
    )
);
