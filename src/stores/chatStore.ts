import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';

interface ChatMessage {
    $id: string;
    userId: string;
    characterName: string;
    message: string;
    timestamp: string;
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    isConnected: boolean;
    lastMessageId: string | null;
    unreadCount: number;
    activeTab: 'activity' | 'chat';
}

interface ChatActions {
    addMessage: (message: ChatMessage) => void;
    addMessages: (messages: ChatMessage[]) => void;
    removeMessage: (messageId: string) => void;
    clearMessages: () => void;
    setLoading: (loading: boolean) => void;
    setConnected: (connected: boolean) => void;
    setActiveTab: (tab: 'activity' | 'chat') => void;
    markAsRead: () => void;
    optimisticAddMessage: (tempMessage: Omit<ChatMessage, '$id'> & { tempId: string }) => void;
    updateOptimisticMessage: (tempId: string, realMessage: ChatMessage) => void;
    removeOptimisticMessage: (tempId: string) => void;
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
            unreadCount: 0,
            activeTab: 'activity',

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

                        // Increment unread if not on chat tab
                        if (state.activeTab !== 'chat') {
                            state.unreadCount++;
                        }
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
                    if (tab === 'chat') {
                        state.unreadCount = 0;
                    }
                }),

            markAsRead: () =>
                set((state) => {
                    state.unreadCount = 0;
                }),

            // Optimistic updates for better UX
            optimisticAddMessage: (tempMessage) =>
                set((state) => {
                    const optimisticMessage: ChatMessage = {
                        $id: tempMessage.tempId,
                        userId: tempMessage.userId,
                        characterName: tempMessage.characterName,
                        message: tempMessage.message,
                        timestamp: tempMessage.timestamp,
                    };

                    state.messages.push(optimisticMessage);

                    if (state.messages.length > 20) {
                        state.messages = state.messages.slice(-20);
                    }
                }),

            updateOptimisticMessage: (tempId, realMessage) =>
                set((state) => {
                    const index = state.messages.findIndex(m => m.$id === tempId);
                    if (index !== -1) {
                        state.messages[index] = realMessage;
                        state.lastMessageId = realMessage.$id;
                    }
                }),

            removeOptimisticMessage: (tempId) =>
                set((state) => {
                    state.messages = state.messages.filter(m => m.$id !== tempId);
                }),
        })),
        { name: 'chat-store' }
    )
);
