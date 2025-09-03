import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

const COMBAT_COOLDOWN_MINUTES = 5; // 5 phút cooldown

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
        return NextResponse.json(
            { error: 'Character ID là bắt buộc' },
            { status: 400 }
        );
    }

    try {
        // Lấy tất cả combat history của character này
        const historyResponse = await databases.listDocuments(
            'tu-tien-database',
            'combat_history',
            [
                Query.equal('characterId', characterId),
                Query.orderDesc('lastCombatTime')
            ]
        );

        const cooldownMap: { [trialId: string]: { canCombat: boolean; cooldownRemaining: number; lastCombatTime?: string } } = {};
        const currentTime = new Date();

        // Tạo map cooldown cho mỗi trial
        historyResponse.documents.forEach((history) => {
            const trialId = history.trialId;

            // Chỉ lấy record đầu tiên (mới nhất) cho mỗi trial
            if (!cooldownMap[trialId]) {
                const lastCombatTime = new Date(history.lastCombatTime);
                const timeDiff = currentTime.getTime() - lastCombatTime.getTime();
                const minutesPassed = Math.floor(timeDiff / (1000 * 60));

                if (minutesPassed >= COMBAT_COOLDOWN_MINUTES) {
                    cooldownMap[trialId] = {
                        canCombat: true,
                        cooldownRemaining: 0
                    };
                } else {
                    cooldownMap[trialId] = {
                        canCombat: false,
                        cooldownRemaining: COMBAT_COOLDOWN_MINUTES - minutesPassed,
                        lastCombatTime: history.lastCombatTime
                    };
                }
            }
        });

        return NextResponse.json({
            success: true,
            cooldowns: cooldownMap
        });
    } catch (error) {
        console.error('Lỗi khi lấy cooldown data:', error);
        return NextResponse.json(
            { error: 'Không thể lấy thông tin cooldown' },
            { status: 500 }
        );
    }
}
