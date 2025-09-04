import { NextRequest, NextResponse } from 'next/server';

// In-memory store for online users (for demo - in production use Redis)
const onlineUsers = new Map<string, {
    userId: string;
    characterName: string;
    lastSeen: Date;
}>();

// Clean up offline users every 30 seconds
setInterval(() => {
    const now = new Date();
    const offlineThreshold = 60000; // 1 minute

    for (const [userId, user] of onlineUsers.entries()) {
        if (now.getTime() - user.lastSeen.getTime() > offlineThreshold) {
            onlineUsers.delete(userId);
            console.log(`🔴 User ${user.characterName} went offline`);
        }
    }
}, 30000);

export async function POST(request: NextRequest) {
    try {
        const { userId, characterName, action } = await request.json();

        if (!userId || !characterName) {
            return NextResponse.json(
                { error: 'User ID và Character Name là bắt buộc' },
                { status: 400 }
            );
        }

        const now = new Date();

        if (action === 'online') {
            // User is online
            onlineUsers.set(userId, {
                userId,
                characterName,
                lastSeen: now
            });
            console.log(`🟢 User ${characterName} is online`);
        } else if (action === 'offline') {
            // User going offline
            onlineUsers.delete(userId);
            console.log(`🔴 User ${characterName} went offline`);
        } else {
            // Heartbeat - update last seen
            const user = onlineUsers.get(userId);
            if (user) {
                user.lastSeen = now;
            } else {
                // User not found, add them
                onlineUsers.set(userId, {
                    userId,
                    characterName,
                    lastSeen: now
                });
            }
        }

        // Return current online count and users list
        const onlineUsersList = Array.from(onlineUsers.values()).map(user => ({
            userId: user.userId,
            characterName: user.characterName,
            lastSeen: user.lastSeen.toISOString()
        }));

        return NextResponse.json({
            success: true,
            onlineCount: onlineUsers.size,
            onlineUsers: onlineUsersList
        });

    } catch (error) {
        console.error('❌ Error handling user presence:', error);
        return NextResponse.json(
            { error: 'Không thể xử lý presence' },
            { status: 500 }
        );
    }
}

// Get current online users
export async function GET() {
    try {
        const onlineUsersList = Array.from(onlineUsers.values()).map(user => ({
            userId: user.userId,
            characterName: user.characterName,
            lastSeen: user.lastSeen.toISOString()
        }));

        return NextResponse.json({
            success: true,
            onlineCount: onlineUsers.size,
            onlineUsers: onlineUsersList
        });

    } catch (error) {
        console.error('❌ Error getting online users:', error);
        return NextResponse.json(
            { error: 'Không thể lấy danh sách online users' },
            { status: 500 }
        );
    }
}
