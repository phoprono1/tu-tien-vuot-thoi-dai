import { useState, useEffect, useRef, useCallback } from 'react';
import { client, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

interface ChatMessage {
    $id: string;
    userId: string;
    characterName: string;
    message: string;
    timestamp: string;
}

export function useOptimizedChat(isActive: boolean) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isInitialLoadedRef = useRef(false);
    const pendingScrollRef = useRef<number | null>(null);

    // Optimized scroll function with debouncing
    const scrollToBottom = useCallback(() => {
        if (pendingScrollRef.current) {
            cancelAnimationFrame(pendingScrollRef.current);
        }

        pendingScrollRef.current = requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        });
    }, []);

    // Load initial messages only once
    const loadMessages = useCallback(async () => {
        if (isInitialLoadedRef.current || isLoading) return;

        try {
            setIsLoading(true);
            isInitialLoadedRef.current = true;

            const response = await fetch("/api/chat", {
                method: 'GET',
                cache: 'no-cache'
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
                // Scroll after a brief delay to ensure DOM is updated
                setTimeout(scrollToBottom, 50);
            }
        } catch (error) {
            console.error("Error loading chat messages:", error);
            isInitialLoadedRef.current = false; // Allow retry
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, scrollToBottom]);

    // Send message function
    const sendMessage = useCallback(async (
        userId: string,
        characterName: string,
        message: string
    ): Promise<boolean> => {
        if (!message.trim()) return false;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    characterName,
                    message: message.trim(),
                }),
            });

            return response.ok;
        } catch (error) {
            console.error("Error sending message:", error);
            return false;
        }
    }, []);

    // Load messages when chat becomes active
    useEffect(() => {
        if (isActive) {
            loadMessages();
        }
    }, [isActive, loadMessages]);

    // Optimized realtime subscription
    useEffect(() => {
        if (!isActive) return;

        const unsubscribe = client.subscribe(
            `databases.${DATABASE_ID}.collections.${COLLECTIONS.CHAT_MESSAGES}.documents`,
            (response) => {
                // Only handle create events
                if (response.events.some(event => event.endsWith('.create'))) {
                    const newMessage = response.payload as ChatMessage;

                    setMessages(prev => {
                        // Fast duplicate check using Set
                        const messageIds = new Set(prev.map(msg => msg.$id));
                        if (messageIds.has(newMessage.$id)) {
                            return prev;
                        }

                        // Add new message and maintain max 20 messages
                        const updated = [...prev, newMessage];
                        if (updated.length > 20) {
                            return updated.slice(-20);
                        }
                        return updated;
                    });

                    // Smooth scroll with slight delay
                    setTimeout(scrollToBottom, 100);
                }
            }
        );

        return () => {
            unsubscribe();
        };
    }, [isActive, scrollToBottom]);

    // Cleanup pending scroll on unmount
    useEffect(() => {
        return () => {
            if (pendingScrollRef.current) {
                cancelAnimationFrame(pendingScrollRef.current);
            }
        };
    }, []);

    return {
        messages,
        isLoading,
        messagesEndRef,
        sendMessage,
        scrollToBottom
    };
}
