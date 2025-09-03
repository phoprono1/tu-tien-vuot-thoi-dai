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
        // Lấy 20 tin nhắn mới nhất
        const messages = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'chat_messages',
            [
                Query.orderDesc('timestamp'),
                Query.limit(MAX_MESSAGES)
            ]
        );

        // Reverse để hiển thị từ cũ đến mới
        const sortedMessages = messages.documents.reverse();

        return NextResponse.json({
            success: true,
            messages: sortedMessages
        });
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
        if (message.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Tin nhắn không được để trống' },
                { status: 400 }
            );
        }

        if (message.length > 500) {
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
                message: message.trim(),
                timestamp: new Date().toISOString()
            }
        );

        // Kiểm tra và xóa tin nhắn cũ nếu có quá 20 tin
        const allMessages = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'chat_messages',
            [
                Query.orderDesc('timestamp')
            ]
        );

        // Nếu có quá 20 tin nhắn, xóa những tin cũ nhất
        if (allMessages.documents.length > MAX_MESSAGES) {
            const messagesToDelete = allMessages.documents.slice(MAX_MESSAGES);

            for (const msg of messagesToDelete) {
                try {
                    await databases.deleteDocument(
                        process.env.APPWRITE_DATABASE_ID!,
                        'chat_messages',
                        msg.$id
                    );
                } catch (deleteError) {
                    console.error('Error deleting old message:', deleteError);
                }
            }
        }

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
