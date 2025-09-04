import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite'
import { AppwriteException, Query, ID } from 'node-appwrite'

export async function POST(request: NextRequest) {
    try {
        console.log('🔗 Guild Join API - Starting request')
        const { guildId, characterId } = await request.json()
        console.log('📝 Request data:', { guildId, characterId })

        if (!guildId || !characterId) {
            console.log('❌ Missing required fields')
            return NextResponse.json(
                { error: 'Thiếu thông tin guild ID hoặc character ID' },
                { status: 400 }
            )
        }

        console.log('🔍 Checking existing membership...')
        // Kiểm tra xem character đã có guild chưa
        const existingMembership = await databases.listDocuments(
            'tu-tien-database',
            'guild_members',
            [Query.equal('characterId', characterId)]
        )
        console.log('👥 Existing membership check:', existingMembership.documents.length)

        if (existingMembership.documents.length > 0) {
            console.log('❌ Already in guild')
            return NextResponse.json(
                { error: 'Bạn đã gia nhập một bang phái khác' },
                { status: 400 }
            )
        }

        console.log('🏰 Getting guild info...')
        // Lấy thông tin guild
        const guild = await databases.getDocument(
            'tu-tien-database',
            'guilds',
            guildId
        )
        console.log('🏰 Guild info:', { memberCount: guild.memberCount, maxMembers: guild.maxMembers })

        if (guild.memberCount >= guild.maxMembers) {
            console.log('❌ Guild is full')
            return NextResponse.json(
                { error: 'Bang phái đã đầy thành viên' },
                { status: 400 }
            )
        }

        console.log('✅ Creating guild membership...')
        // Thêm vào guild members
        await databases.createDocument(
            'tu-tien-database',
            'guild_members',
            ID.unique(),
            {
                guildId: guildId,
                characterId: characterId,
                role: 'member',
                joinedAt: new Date().toISOString(),
                contribution: 0
            }
        )

        console.log('📈 Updating guild member count...')
        // Tăng memberCount
        await databases.updateDocument(
            'tu-tien-database',
            'guilds',
            guildId,
            {
                memberCount: guild.memberCount + 1
            }
        )

        console.log('👤 Updating character guildId...')
        // Cập nhật guildId cho character
        await databases.updateDocument(
            'tu-tien-database',
            'characters',
            characterId,
            {
                guildId: guildId
            }
        )

        console.log('✅ Guild join completed successfully')
        return NextResponse.json({
            success: true,
            message: 'Gia nhập bang phái thành công!'
        })

    } catch (error) {
        console.error('❌ Error joining guild:', error)
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
        })

        if (error instanceof AppwriteException) {
            console.error('Appwrite error details:', {
                code: error.code,
                type: error.type,
                message: error.message
            })
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
