import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';

interface ChatMessage {
    $id: string;
    userId: string;
    characterName: string;
    message: string;
    timestamp: string;
}

interface SendMessageData {
    userId: string;
    characterName: string;
    message: string;
}

// Fetch chat messages
export function useChatMessages() {
    const { addMessages, setLoading } = useChatStore();

    const query = useQuery({
        queryKey: queryKeys.chatMessages(),
        queryFn: async (): Promise<ChatMessage[]> => {
            setLoading(true);
            try {
                const response = await fetch('/api/chat', {
                    method: 'GET',
                    cache: 'no-cache',
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }

                const data = await response.json();
                const messages = data.messages || [];

                // Update store with fetched messages
                addMessages(messages);

                return messages;
            } finally {
                setLoading(false);
            }
        },
        staleTime: 30 * 1000, // 30 seconds for chat messages
        gcTime: 5 * 60 * 1000, // 5 minutes
    });

    return query;
}

// Send chat message (simple, no optimistic updates)
export function useSendMessage() {
    const { addNotification } = useUIStore();

    return useMutation({
        mutationFn: async (data: SendMessageData): Promise<ChatMessage> => {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send message');
            }

            const result = await response.json();
            return result.message;
        },
        onError: (error) => {
            // Show error notification
            addNotification({
                type: 'error',
                title: 'Gửi tin nhắn thất bại',
                message: error.message,
            });
            console.error('Failed to send message:', error);
        },
    });
}

// Subscribe to real-time chat updates
export function useRealtimeChat() {
    const { addMessage, setConnected } = useChatStore();

    const subscribeToRealtime = () => {
        try {
            // Import client only on client side
            return import('@/lib/appwrite').then(({ client, DATABASE_ID, COLLECTIONS }) => {
                const unsubscribe = client.subscribe(
                    `databases.${DATABASE_ID}.collections.${COLLECTIONS.CHAT_MESSAGES}.documents`,
                    (response) => {
                        if (response.events.some(event => event.endsWith('.create'))) {
                            const newMessage = response.payload as ChatMessage;
                            console.log("📡 Real-time message received:", newMessage);

                            // Only add to store - this will trigger re-render and auto-scroll
                            addMessage(newMessage);
                        }
                    }
                );

                setConnected(true);
                console.log("✅ Realtime subscription established");
                return unsubscribe;
            });
        } catch (error) {
            console.error('Failed to subscribe to realtime chat:', error);
            setConnected(false);
            return () => { }; // Return empty cleanup function
        }
    };

    return { subscribeToRealtime };
}
