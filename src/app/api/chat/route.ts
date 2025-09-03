import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const MAX_MESSAGES = 20; // Chỉ giữ lại 20 tin nhắn mới nhất

export async function GET() {
    try {
        // Lấy 20 tin nhắn mới nhất với cache headers
        const messages = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'chat_messages',
            [
                Query.orderDesc('timestamp'),
                Query.limit(MAX_MESSAGES),
                Query.select(['$id', 'userId', 'characterName', 'message', 'timestamp'])
            ]
        );

        // Reverse để hiển thị từ cũ đến mới
        const sortedMessages = messages.documents.reverse();

        const response = NextResponse.json({
            success: true,
            messages: sortedMessages
        });

        // Add cache headers to reduce server load
        response.headers.set('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
        return response;
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy tin nhắn chat' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId, characterName, message } = await request.json();

        if (!userId || !characterName || !message) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        // Kiểm tra độ dài message
        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Tin nhắn không được để trống' },
                { status: 400 }
            );
        }

        if (trimmedMessage.length > 500) {
            return NextResponse.json(
                { success: false, error: 'Tin nhắn quá dài (tối đa 500 ký tự)' },
                { status: 400 }
            );
        }

        // Tạo tin nhắn mới
        const newMessage = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'chat_messages',
            'unique()',
            {
                userId,
                characterName,
                message: trimmedMessage,
                timestamp: new Date().toISOString()
            }
        );

        // Asynchronously cleanup old messages (don't wait for it)
        setImmediate(async () => {
            try {
                const allMessages = await databases.listDocuments(
                    process.env.APPWRITE_DATABASE_ID!,
                    'chat_messages',
                    [
                        Query.orderDesc('timestamp'),
                        Query.limit(MAX_MESSAGES + 10) // Get a few extra to check
                    ]
                );

                if (allMessages.documents.length > MAX_MESSAGES) {
                    const messagesToDelete = allMessages.documents.slice(MAX_MESSAGES);

                    // Delete in batches to avoid overwhelming the database
                    const deletePromises = messagesToDelete.map(msg =>
                        databases.deleteDocument(
                            process.env.APPWRITE_DATABASE_ID!,
                            'chat_messages',
                            msg.$id
                        ).catch(error => {
                            console.error('Error deleting old message:', error);
                        })
                    );

                    await Promise.allSettled(deletePromises);
                }
            } catch (cleanupError) {
                console.error('Error in async cleanup:', cleanupError);
            }
        });

        return NextResponse.json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error('Error creating chat message:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể gửi tin nhắn' },
            { status: 500 }
        );
    }
}
