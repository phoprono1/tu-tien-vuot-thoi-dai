import { NextRequest, NextResponse } from 'next/server'
import { databases } from '@/lib/appwrite'
import { AppwriteException } from 'node-appwrite'

export async function POST(request: NextRequest) {
    try {
        const { characterId, amount, reason = 'Unknown' } = await request.json()

        if (!characterId || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: 'Thiếu thông tin hoặc số lượng không hợp lệ' },
                { status: 400 }
            )
        }

        // Lấy thông tin character hiện tại
        const character = await databases.getDocument(
            'tu-tien-database',
            'characters',
            characterId
        )

        // Cập nhật số linh thạch
        const updatedCharacter = await databases.updateDocument(
            'tu-tien-database',
            'characters',
            characterId,
            {
                spiritStones: character.spiritStones + amount
            }
        )

        console.log(`Character ${characterId} received ${amount} spirit stones for: ${reason}`)

        return NextResponse.json({
            success: true,
            totalStones: updatedCharacter.spiritStones,
            message: `Đã nhận ${amount.toLocaleString()} linh thạch`
        })

    } catch (error) {
        console.error('Error adding spirit stones:', error)

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
