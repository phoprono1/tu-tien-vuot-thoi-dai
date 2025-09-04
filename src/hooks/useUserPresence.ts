import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';

export function useUserPresence() {
    const { user, character } = useAuthStore();
    const { setOnlineUsers, updateOnlineCount } = useChatStore();
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const isActiveRef = useRef(true);
    const lastFetchRef = useRef<number>(0);
    const presenceInitializedRef = useRef(false); // Track if presence was initialized

    const lastPresenceCallRef = useRef(0);
    const PRESENCE_DEBOUNCE_MS = 10000; // Increase to 10 seconds debounce

    const sendPresence = useCallback(async (action: 'online' | 'offline' | 'heartbeat') => {
        // Debounce presence calls to prevent spam
        const now = Date.now();
        if (now - lastPresenceCallRef.current < PRESENCE_DEBOUNCE_MS) {
            return;
        }
        lastPresenceCallRef.current = now;

        if (!user || !character) return;

        try {
            const response = await fetch('/api/chat/presence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.$id,
                    characterName: character.name,
                    action
                })
            });

            const data = await response.json();
            if (data.success) {
                // Only update count, not full user list for efficiency
                updateOnlineCount(data.onlineCount);
                if (data.onlineUsers && data.onlineUsers.length > 0) {
                    setOnlineUsers(data.onlineUsers);
                }
            }
        } catch (error) {
            console.error('❌ Error sending presence:', error);
        }
    }, [user, character, setOnlineUsers, updateOnlineCount]);

    const fetchOnlineCount = useCallback(async () => {
        // Cache for 30 seconds to avoid excessive requests
        const now = Date.now();
        if (now - lastFetchRef.current < 30000) {
            return; // Skip if fetched recently
        }
        lastFetchRef.current = now;

        try {
            // Use lightweight endpoint for just getting count
            const response = await fetch('/api/chat/online-count');
            const data = await response.json();
            if (data.success) {
                updateOnlineCount(data.count);
            }
        } catch (error) {
            console.error('❌ Error fetching online count:', error);
        }
    }, [updateOnlineCount]);

    const fetchOnlineUsers = useCallback(async () => {
        try {
            const response = await fetch('/api/chat/presence');
            const data = await response.json();
            if (data.success) {
                setOnlineUsers(data.onlineUsers || []);
                updateOnlineCount(data.onlineCount);
            }
        } catch (error) {
            console.error('❌ Error fetching online users:', error);
        }
    }, [setOnlineUsers, updateOnlineCount]);

    // Track window visibility and activity
    useEffect(() => {
        const handleVisibilityChange = () => {
            isActiveRef.current = !document.hidden;
            if (!document.hidden) {
                sendPresence('heartbeat'); // Send heartbeat when tab becomes visible
            }
        };

        const handleBeforeUnload = () => {
            sendPresence('offline');
        };

        const handleFocus = () => {
            isActiveRef.current = true;
            sendPresence('heartbeat');
        };

        const handleBlur = () => {
            isActiveRef.current = false;
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [sendPresence]);

    // Main presence management - chỉ chạy 1 lần khi có user và character
    useEffect(() => {
        if (!user || !character) {
            presenceInitializedRef.current = false;
            return;
        }

        // Chỉ initialize một lần để tránh spam API calls
        if (presenceInitializedRef.current) {
            return;
        }

        presenceInitializedRef.current = true;

        // Send initial online status
        sendPresence('online');

        // Set up heartbeat (every 3 minutes for efficiency)
        const startHeartbeat = () => {
            heartbeatRef.current = setInterval(() => {
                // Only send heartbeat if tab is active and visible
                if (isActiveRef.current && !document.hidden) {
                    sendPresence('heartbeat');
                }
            }, 180000); // 3 minutes instead of 2 minutes
        };

        startHeartbeat();

        // Only fetch count initially (lightweight)
        fetchOnlineCount();

        // Cleanup function
        return () => {
            presenceInitializedRef.current = false;
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
            }
            sendPresence('offline');
        };
    }, [user, character, sendPresence, fetchOnlineCount]);

    return {
        sendPresence,
        fetchOnlineUsers,
        fetchOnlineCount
    };
}
