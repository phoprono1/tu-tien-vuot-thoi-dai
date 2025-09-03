import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

const COMBAT_COOLDOWN_MINUTES = 5; // 5 phút cooldown

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    const trialId = searchParams.get('trialId');

    if (!characterId || !trialId) {
        return NextResponse.json(
            { error: 'Character ID và Trial ID là bắt buộc' },
            { status: 400 }
        );
    }

    try {
        // Tìm combat history gần nhất của character với trial này
        const historyResponse = await databases.listDocuments(
            'tu-tien-database',
            'combat_history',
            [
                Query.equal('characterId', characterId),
                Query.equal('trialId', trialId),
                Query.orderDesc('lastCombatTime'),
                Query.limit(1)
            ]
        );

        if (historyResponse.documents.length === 0) {
            // Chưa từng combat với trial này
            return NextResponse.json({
                success: true,
                canCombat: true,
                cooldownRemaining: 0
            });
        }

        const lastCombat = historyResponse.documents[0];
        const lastCombatTime = new Date(lastCombat.lastCombatTime);
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - lastCombatTime.getTime();
        const minutesPassed = Math.floor(timeDiff / (1000 * 60));

        if (minutesPassed >= COMBAT_COOLDOWN_MINUTES) {
            return NextResponse.json({
                success: true,
                canCombat: true,
                cooldownRemaining: 0
            });
        } else {
            const remainingMinutes = COMBAT_COOLDOWN_MINUTES - minutesPassed;
            return NextResponse.json({
                success: true,
                canCombat: false,
                cooldownRemaining: remainingMinutes,
                message: `Cần chờ ${remainingMinutes} phút nữa mới có thể thí luyện lại`
            });
        }

    } catch (error) {
        console.error('Lỗi khi check combat cooldown:', error);
        return NextResponse.json(
            { error: 'Không thể kiểm tra thời gian cooldown' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { characterId, trialId, result } = data;

        if (!characterId || !trialId || !result) {
            return NextResponse.json(
                { error: 'Thiếu thông tin combat history' },
                { status: 400 }
            );
        }

        // Tạo combat history record
        const historyRecord = await databases.createDocument(
            'tu-tien-database',
            'combat_history',
            'unique()',
            {
                characterId,
                trialId,
                result,
                lastCombatTime: new Date().toISOString()
            }
        );

        return NextResponse.json({
            success: true,
            historyRecord
        });

    } catch (error) {
        console.error('Lỗi khi tạo combat history:', error);
        return NextResponse.json(
            { error: 'Không thể tạo combat history' },
            { status: 500 }
        );
    }
}
