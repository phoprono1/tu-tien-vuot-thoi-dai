import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases } from 'node-appwrite'
import { AppwriteException, Query, ID } from 'node-appwrite'

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// GET - Lấy danh sách guild
export async function GET() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'guilds'
            // Không dùng Query để tránh syntax error với Turbopack
        )

        return NextResponse.json({
            success: true,
            guilds: response.documents
        })
    } catch (error) {
        console.error('Error fetching guilds:', error)
        return NextResponse.json(
            { error: 'Không thể tải danh sách bang phái' },
            { status: 500 }
        )
    }
}

// POST - Tạo guild mới
export async function POST(request: NextRequest) {
    try {
        const {
            name,
            description = '',
            characterId,
            characterLevel,
            spiritStones
        } = await request.json()

        // Validate input
        if (!name || !characterId) {
            return NextResponse.json(
                { error: 'Thiếu thông tin tên guild hoặc character ID' },
                { status: 400 }
            )
        }

        if (characterLevel < 31) {
            return NextResponse.json(
                { error: 'Cần đạt ít nhất cấp 31 để tạo bang phái' },
                { status: 400 }
            )
        }

        if (spiritStones < 10000) {
            return NextResponse.json(
                { error: 'Cần ít nhất 10,000 linh thạch để tạo bang phái' },
                { status: 400 }
            )
        }

        // Kiểm tra xem character đã có guild chưa
        const existingMembership = await databases.listDocuments(
            DATABASE_ID,
            'guild_members',
            [Query.equal('characterId', characterId)]
        )

        if (existingMembership.documents.length > 0) {
            return NextResponse.json(
                { error: 'Bạn đã gia nhập một bang phái khác' },
                { status: 400 }
            )
        }

        // Kiểm tra tên guild có trùng không
        const existingGuild = await databases.listDocuments(
            DATABASE_ID,
            'guilds',
            [Query.equal('name', name)]
        )

        if (existingGuild.documents.length > 0) {
            return NextResponse.json(
                { error: 'Tên bang phái đã tồn tại' },
                { status: 400 }
            )
        }

        // Tạo guild
        const guildId = ID.unique()
        const newGuild = await databases.createDocument(
            DATABASE_ID,
            'guilds',
            guildId,
            {
                name: name.trim(),
                description: description.trim(),
                leaderId: characterId,
                memberCount: 1,
                maxMembers: 20, // Cấp 1 có 20 slot
                level: 1,
                treasuryFunds: 0,
                cultivationBonus: 1.1, // 10% bonus tu vi
                dailyReward: 1000,
                createdAt: new Date().toISOString()
            }
        )

        // Thêm founder vào guild members
        await databases.createDocument(
            DATABASE_ID,
            'guild_members',
            ID.unique(),
            {
                guildId: guildId,
                characterId: characterId,
                role: 'master',
                joinedAt: new Date().toISOString(),
                contribution: 0
            }
        )

        // Cập nhật guildId cho character
        await databases.updateDocument(
            DATABASE_ID,
            'characters',
            characterId,
            {
                guildId: guildId,
                spiritStones: spiritStones - 10000
            }
        )

        return NextResponse.json({
            success: true,
            guild: newGuild,
            message: 'Tạo bang phái thành công!'
        })

    } catch (error) {
        console.error('Error creating guild:', error)

        if (error instanceof AppwriteException) {
            return NextResponse.json(
                { error: 'Lỗi cơ sở dữ liệu: ' + error.message },
                { status: error.code || 500 }
            )
        }

        return NextResponse.json(
            { error: 'Đã xảy ra lỗi không mong muốn' },
            { status: 500 }
        )
    }
}
