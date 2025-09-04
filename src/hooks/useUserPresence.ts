import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';

export function useUserPresence() {
    const { user, character } = useAuthStore();
    const { setOnlineUsers, updateOnlineCount } = useChatStore();
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const isActiveRef = useRef(true);

    const sendPresence = useCallback(async (action: 'online' | 'offline' | 'heartbeat') => {
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
                setOnlineUsers(data.onlineUsers);
                updateOnlineCount(data.onlineCount);
            }
        } catch (error) {
            console.error('❌ Error sending presence:', error);
        }
    }, [user, character, setOnlineUsers, updateOnlineCount]);

    const fetchOnlineUsers = useCallback(async () => {
        try {
            const response = await fetch('/api/chat/presence');
            const data = await response.json();
            if (data.success) {
                setOnlineUsers(data.onlineUsers);
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
            if (document.hidden) {
                console.log('🌙 Tab hidden - reducing presence activity');
            } else {
                console.log('☀️ Tab visible - resuming normal presence');
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

    // Main presence management
    useEffect(() => {
        if (!user || !character) return;

        console.log('🟢 Starting user presence for:', character.name);

        // Send initial online status
        sendPresence('online');

        // Set up heartbeat (every 30 seconds)
        const startHeartbeat = () => {
            heartbeatRef.current = setInterval(() => {
                if (isActiveRef.current) {
                    sendPresence('heartbeat');
                }
            }, 30000); // 30 seconds
        };

        startHeartbeat();

        // Also fetch current online users on mount
        fetchOnlineUsers();

        // Cleanup function
        return () => {
            console.log('🔴 Stopping user presence for:', character.name);
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
            }
            sendPresence('offline');
        };
    }, [user, character, sendPresence, fetchOnlineUsers]);

    return {
        sendPresence,
        fetchOnlineUsers
    };
}
