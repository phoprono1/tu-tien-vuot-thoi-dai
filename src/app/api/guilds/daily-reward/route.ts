import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite'
import { AppwriteException, Query } from 'node-appwrite'

export async function POST(request: NextRequest) {
    try {
        const { characterId } = await request.json()

        if (!characterId) {
            return NextResponse.json(
                { error: 'Thiếu thông tin character ID' },
                { status: 400 }
            )
        }

        // Lấy membership của character
        const membershipResponse = await databases.listDocuments(
            'tu-tien-database',
            'guild_members',
            [Query.equal('characterId', characterId)]
        )

        if (membershipResponse.documents.length === 0) {
            return NextResponse.json(
                { error: 'Bạn chưa gia nhập bang phái nào' },
                { status: 400 }
            )
        }

        const membership = membershipResponse.documents[0]

        // Kiểm tra có thể claim reward không (24h cooldown)
        const now = new Date()
        const lastClaim = membership.lastDailyRewardClaim ? new Date(membership.lastDailyRewardClaim) : null

        if (lastClaim && now.getTime() - lastClaim.getTime() < 24 * 60 * 60 * 1000) {
            return NextResponse.json(
                { error: 'Bạn đã nhận bổng lộc hôm nay rồi' },
                { status: 400 }
            )
        }

        // Lấy thông tin guild để biết reward amount
        const guild = await databases.getDocument(
            'tu-tien-database',
            'guilds',
            membership.guildId
        )

        // Lấy thông tin character để cập nhật spiritStones
        const character = await databases.getDocument(
            'tu-tien-database',
            'characters',
            characterId
        )

        // Cập nhật lastDailyRewardClaim
        await databases.updateDocument(
            'tu-tien-database',
            'guild_members',
            membership.$id,
            {
                lastDailyRewardClaim: now.toISOString()
            }
        )

        // Cập nhật spiritStones cho character
        await databases.updateDocument(
            'tu-tien-database',
            'characters',
            characterId,
            {
                spiritStones: character.spiritStones + guild.dailyReward
            }
        )

        return NextResponse.json({
            success: true,
            reward: guild.dailyReward,
            newSpiritStones: character.spiritStones + guild.dailyReward,
            message: `Đã nhận ${guild.dailyReward.toLocaleString()} linh thạch!`
        })

    } catch (error) {
        console.error('Error claiming daily reward:', error)

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
