import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

const COMBAT_COOLDOWN_MINUTES = 5;

// Helper function to check cooldown
async function checkCombatCooldown(characterId: string, trialId: string) {
    try {
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
            return { canCombat: true, cooldownRemaining: 0 };
        }

        const lastCombat = historyResponse.documents[0];
        const lastCombatTime = new Date(lastCombat.lastCombatTime);
        const currentTime = new Date();
        const timeDiff = currentTime.getTime() - lastCombatTime.getTime();
        const minutesPassed = Math.floor(timeDiff / (1000 * 60));

        if (minutesPassed >= COMBAT_COOLDOWN_MINUTES) {
            return { canCombat: true, cooldownRemaining: 0 };
        } else {
            return {
                canCombat: false,
                cooldownRemaining: COMBAT_COOLDOWN_MINUTES - minutesPassed,
                message: `Cần chờ ${COMBAT_COOLDOWN_MINUTES - minutesPassed} phút nữa để combat lại`
            };
        }
    } catch (error) {
        console.error('Lỗi khi check cooldown:', error);
        return { canCombat: true, cooldownRemaining: 0 };
    }
}

// Helper function to record combat
async function recordCombatHistory(characterId: string, trialId: string, result: string) {
    try {
        await databases.createDocument(
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
    } catch (error) {
        console.error('Lỗi khi ghi combat history:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { attackerId, defenderId, combatType } = await request.json();

        if (!attackerId || !defenderId || !combatType) {
            return NextResponse.json({
                error: 'Cần cung cấp attackerId, defenderId và combatType'
            }, { status: 400 });
        }

        // Check cooldown trước khi combat
        if (combatType === 'pve') {
            const cooldownCheck = await checkCombatCooldown(attackerId, defenderId);

            if (!cooldownCheck.canCombat) {
                return NextResponse.json({
                    success: false,
                    error: cooldownCheck.message || 'Chưa đến lúc có thể combat',
                    cooldownRemaining: cooldownCheck.cooldownRemaining
                }, { status: 429 });
            }
        }

        // Get character data (attacker)
        // Get attacker character and combat stats
        const attackerDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.CHARACTERS, attackerId);
        const attacker = attackerDoc as Record<string, unknown>;

        // Get combat stats for the attacker
        const combatStatsQuery = await databases.listDocuments(
            DATABASE_ID,
            'combat_stats',
            [Query.equal('characterId', attackerId), Query.limit(1)]
        );

        const attackerCombatStats = combatStatsQuery.documents[0] || null;
        if (!attackerCombatStats) {
            return NextResponse.json({
                error: 'Combat stats not found for character'
            }, { status: 400 });
        }

        let defender: Record<string, unknown>;
        let combatResult: Record<string, unknown>;

        if (combatType === 'pve') {
            // For PvE, defender is a trial
            const trialDoc = await databases.getDocument(DATABASE_ID, 'trials', defenderId);
            defender = trialDoc as Record<string, unknown>;

            // Simple combat simulation với nhiều turn using combat stats
            const attackerPower = (attackerCombatStats.attack as number);
            const attackerHP = (attackerCombatStats.maxHealth as number);
            const attackerDefense = (attackerCombatStats.defense as number);

            const enemyStats = JSON.parse(defender.enemyStats as string);
            const enemyName = enemyStats.name || defender.name || "Kẻ địch";
            const enemyPower = enemyStats.attack;
            const enemyHP = enemyStats.health;
            const enemyDefense = enemyStats.defense;

            // Simulate combat với multiple turns
            let currentAttackerHP = attackerHP;
            let currentEnemyHP = enemyHP;
            const combatLog = [];
            let turn = 1;
            const maxTurns = 10; // Giới hạn turns tránh infinite loop

            while (currentAttackerHP > 0 && currentEnemyHP > 0 && turn <= maxTurns) {
                // Attacker turn
                const attackerDamage = Math.max(1, attackerPower - enemyDefense + Math.floor(Math.random() * 20 - 10));
                currentEnemyHP = Math.max(0, currentEnemyHP - attackerDamage);

                combatLog.push({
                    turn: turn,
                    attacker: attacker.name,
                    defender: enemyName,
                    action: `${attacker.name} tấn công ${enemyName}`,
                    damage: attackerDamage,
                    effects: [],
                    attackerHealth: currentAttackerHP,
                    defenderHealth: currentEnemyHP
                });

                if (currentEnemyHP <= 0) break;

                // Enemy turn
                const enemyDamage = Math.max(1, enemyPower - attackerDefense + Math.floor(Math.random() * 20 - 10));
                currentAttackerHP = Math.max(0, currentAttackerHP - enemyDamage);

                combatLog.push({
                    turn: turn,
                    attacker: enemyName,
                    defender: attacker.name as string,
                    action: `${enemyName} phản công ${attacker.name}`,
                    damage: enemyDamage,
                    effects: [],
                    attackerHealth: currentEnemyHP,
                    defenderHealth: currentAttackerHP
                });

                turn++;
            }

            const attackerWins = currentAttackerHP > 0;

            combatResult = {
                success: true,
                winner: attackerWins ? 'attacker' : 'defender',
                combatLog: combatLog,
                rewards: attackerWins ? (() => {
                    try {
                        return JSON.parse(defender.rewards as string);
                    } catch (error) {
                        console.error('Error parsing rewards:', error);
                        return { experience: 0, spirit_stones: 0 };
                    }
                })() : undefined
            };

            // If attacker wins, update character with rewards
            if (attackerWins && combatResult.rewards) {
                const rewards = combatResult.rewards as Record<string, number>;
                const updates: Record<string, number> = {};
                if (rewards.experience) {
                    updates.experience = (attacker.experience as number) + rewards.experience;
                }
                if (rewards.spirit_stones) {
                    updates.spiritStones = (attacker.spiritStones as number) + rewards.spirit_stones;
                }

                if (Object.keys(updates).length > 0) {
                    await databases.updateDocument(DATABASE_ID, COLLECTIONS.CHARACTERS, attackerId, updates);
                }
            }
        } else {
            // PvP combat (simplified)
            return NextResponse.json({
                error: 'PvP combat chưa được triển khai'
            }, { status: 501 });
        }

        // Record combat history
        if (combatType === 'pve') {
            try {
                await recordCombatHistory(
                    attackerId,
                    defenderId,
                    combatResult.winner === 'attacker' ? 'win' : 'lose'
                );
            } catch (historyError) {
                console.error('Lỗi khi tạo combat history:', historyError);
                // Không fail combat nếu history thất bại
            }
        }

        return NextResponse.json(combatResult);

    } catch (error) {
        console.error('Combat execution error:', error);
        return NextResponse.json({
            error: 'Lỗi khi thực hiện combat',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
