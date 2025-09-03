import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'node-appwrite';
import { DatabaseCharacter } from '@/types/database';
import { calculateBaseCombatStats } from '@/utils/combatCalculations';
import {
    getRealmByLevel,
    getRealmStage,
    canBreakthrough,
    getRealmDisplayName
} from '@/data/realms';

// GET - Check breakthrough requirements and current realm info
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const characterId = searchParams.get('characterId');

        if (!characterId) {
            return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
        }

        // Get character data
        const character = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.CHARACTERS,
            characterId
        );

        const currentLevel = character.level;
        const currentQi = character.qi;
        const spiritStones = character.spiritStones;

        const currentRealm = getRealmByLevel(currentLevel);
        const currentStage = getRealmStage(currentLevel);
        const realmDisplayName = getRealmDisplayName(currentLevel);

        // Check breakthrough requirements
        const breakthroughInfo = canBreakthrough(currentLevel, currentQi, spiritStones);

        // Get combat stats for health info
        let healthInfo = { health: 100, maxHealth: 100 };
        try {
            const combatStatsResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMBAT_STATS,
                [Query.equal('characterId', characterId)]
            );
            if (combatStatsResponse.documents.length > 0) {
                const combatStats = combatStatsResponse.documents[0];
                healthInfo = {
                    health: combatStats.currentHealth,
                    maxHealth: combatStats.maxHealth
                };
            }
        } catch (error) {
            console.warn('Failed to fetch combat stats for health info:', error);
        }

        return NextResponse.json({
            success: true,
            characterId,
            currentLevel,
            currentRealm: {
                name: currentRealm?.name || 'Unknown',
                stage: currentStage,
                displayName: realmDisplayName,
                description: currentRealm?.description || '',
                dangerLevel: currentRealm?.dangerLevel || 'Low',
                bonuses: currentRealm?.realmBonuses || null
            },
            breakthrough: {
                canBreakthrough: breakthroughInfo.canBreak,
                requirements: breakthroughInfo.requirements,
                nextRealmName: breakthroughInfo.requirements ?
                    getRealmDisplayName(breakthroughInfo.requirements.level) : null
            },
            resources: {
                currentQi,
                spiritStones,
                health: healthInfo.health,
                maxHealth: healthInfo.maxHealth
            }
        });

    } catch (error) {
        console.error('Error getting breakthrough info:', error);
        return NextResponse.json({ error: 'Failed to get breakthrough info' }, { status: 500 });
    }
}

// POST - Attempt breakthrough
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, skipTribulation = false } = body;

        if (!characterId) {
            return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
        }

        // Get character data
        const character = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.CHARACTERS,
            characterId
        );

        const currentLevel = character.level;
        const currentQi = character.qi;
        const spiritStones = character.spiritStones;

        // Check if breakthrough is possible
        const breakthroughInfo = canBreakthrough(currentLevel, currentQi, spiritStones);

        if (!breakthroughInfo.canBreak || !breakthroughInfo.requirements) {
            return NextResponse.json({
                error: 'Breakthrough requirements not met',
                requirements: breakthroughInfo.requirements
            }, { status: 400 });
        }

        const requirements = breakthroughInfo.requirements;

        // Handle tribulation if required
        let tribulationSuccess = true;
        let tribulationDamage = 0;

        if (requirements.tribulationRequired && !skipTribulation) {
            // Tribulation difficulty varies by cultivation path
            const pathDifficultyMultiplier = {
                qi: 0.7,    // 30% easier breakthrough (balanced path)
                body: 1.0,  // Normal difficulty (defensive path)  
                demon: 1.4, // 40% harder breakthrough (risky path)
            };

            const pathMultiplier = pathDifficultyMultiplier[character.cultivationPath as keyof typeof pathDifficultyMultiplier] || 1.0;

            // Base fail chance increases with level and path difficulty
            const baseFailChance = 0.1; // 10% base fail chance
            const levelMultiplier = Math.floor(requirements.level / 100) * 0.05; // +5% per 100 levels
            const tribulationResistance = (character.tribulationResistance || 0) * 0.02; // -2% per resistance point

            const failChance = Math.min(
                Math.max(
                    (baseFailChance + levelMultiplier) * pathMultiplier - tribulationResistance,
                    0.05 // Minimum 5% fail chance
                ),
                0.8 // Maximum 80% fail chance for demon path at high levels
            );

            tribulationSuccess = Math.random() > failChance;

            if (!tribulationSuccess) {
                // Failed tribulation - take damage and consume resources anyway
                // Get combat stats to calculate damage
                let maxHealthForDamage = 100;
                try {
                    const combatStatsResponse = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.COMBAT_STATS,
                        [Query.equal('characterId', characterId)]
                    );
                    if (combatStatsResponse.documents.length > 0) {
                        maxHealthForDamage = combatStatsResponse.documents[0].maxHealth;
                    }
                } catch (error) {
                    console.warn('Failed to fetch combat stats for tribulation damage:', error);
                }

                tribulationDamage = Math.floor(maxHealthForDamage * 0.3); // 30% max health damage

                // Update character and apply damage to combat stats
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.CHARACTERS,
                    characterId,
                    {
                        qi: Math.max(0, currentQi - Math.floor(requirements.qiRequired * 0.5)),
                        spiritStones: Math.max(0, spiritStones - Math.floor(requirements.spiritStonesRequired * 0.5)),
                        tribulationResistance: (character.tribulationResistance || 0) + 1 // Gain resistance for next attempt
                    }
                );

                // Apply damage to combat stats
                try {
                    const combatStatsResponse = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.COMBAT_STATS,
                        [Query.equal('characterId', characterId)]
                    );
                    if (combatStatsResponse.documents.length > 0) {
                        const combatStats = combatStatsResponse.documents[0];
                        await databases.updateDocument(
                            DATABASE_ID,
                            COLLECTIONS.COMBAT_STATS,
                            combatStats.$id,
                            {
                                currentHealth: Math.max(1, combatStats.currentHealth - tribulationDamage)
                            }
                        );
                    }
                } catch (error) {
                    console.warn('Failed to apply tribulation damage to combat stats:', error);
                }

                return NextResponse.json({
                    success: false,
                    tribulationFailed: true,
                    message: `Thiên kiếp thất bại! Bạn bị thương nặng và mất một phần tài nguyên. Kháng kiếp +1.`,
                    damage: tribulationDamage,
                    newStats: {
                        qi: Math.max(0, currentQi - Math.floor(requirements.qiRequired * 0.5)),
                        spiritStones: Math.max(0, spiritStones - Math.floor(requirements.spiritStonesRequired * 0.5)),
                        tribulationResistance: (character.tribulationResistance || 0) + 1
                    }
                });
            }
        }

        // Successful breakthrough
        const newLevel = requirements.level;
        const newRealm = getRealmByLevel(newLevel);
        const newRealmDisplayName = getRealmDisplayName(newLevel);

        // Calculate new stats based on realm bonuses
        const baseEnergy = 100;  // Base energy
        const newMaxEnergy = Math.floor(baseEnergy * (newRealm?.realmBonuses.energyMultiplier || 1));

        // Update character
        const updateData: Record<string, string | number> = {
            level: newLevel,
            realm: newRealm?.name || character.realm,
            qi: currentQi - requirements.qiRequired,
            spiritStones: spiritStones - requirements.spiritStonesRequired,
            maxEnergy: newMaxEnergy,
            energy: Math.min(character.energy, newMaxEnergy),
            experience: 0, // Reset experience for new realm
            cultivationProgress: 0,
            nextBreakthrough: requirements.isRealmBreakthrough ?
                Math.floor(requirements.qiRequired * 2.5) : Math.floor(requirements.qiRequired * 1.5)
        };

        // Add realm breakthrough bonuses with path-specific scaling
        if (requirements.isRealmBreakthrough && newRealm) {
            // Combat bonus scaling by cultivation path
            const combatBonusMultiplier = {
                qi: 0.6,    // Lowest combat bonus (60% of base)
                body: 1.4,  // Highest combat bonus (140% of base)
                demon: 1.0, // Medium combat bonus (100% of base)
            };

            const pathCombatMultiplier = combatBonusMultiplier[character.cultivationPath as keyof typeof combatBonusMultiplier] || 1.0;

            const attackBonus = Math.floor(newRealm.realmBonuses.baseAttackBonus * 0.1 * pathCombatMultiplier);
            const defenseBonus = Math.floor(newRealm.realmBonuses.baseDefenseBonus * 0.1 * pathCombatMultiplier);

            updateData.physicalPower = (character.physicalPower || 10) + attackBonus;
            updateData.mentalPower = (character.mentalPower || 10) + defenseBonus;
            updateData.spiritualPower = (character.spiritualPower || 0) + Math.floor(newLevel / 10) * 5;
        }

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.CHARACTERS,
            characterId,
            updateData
        );

        // Recalculate combat stats after level change
        try {
            const updatedCharacter = {
                ...character,
                level: newLevel,
                cultivationPath: character.cultivationPath
            } as unknown as DatabaseCharacter;

            const newCombatStats = calculateBaseCombatStats(updatedCharacter);

            // Check if combat stats exist
            const existingStatsResponse = await databases.listDocuments(
                DATABASE_ID,
                'combat_stats',
                [Query.equal('characterId', characterId)]
            );

            if (existingStatsResponse.documents.length > 0) {
                // Update existing combat stats
                const existingStats = existingStatsResponse.documents[0];
                await databases.updateDocument(
                    DATABASE_ID,
                    'combat_stats',
                    existingStats.$id,
                    {
                        maxHealth: newCombatStats.maxHealth,
                        maxStamina: newCombatStats.maxStamina,
                        attack: newCombatStats.attack,
                        defense: newCombatStats.defense,
                        agility: newCombatStats.agility,
                        // Keep current health proportional
                        currentHealth: Math.min(existingStats.currentHealth, newCombatStats.maxHealth),
                        currentStamina: Math.min(existingStats.currentStamina, newCombatStats.maxStamina),
                    }
                );
            }
        } catch (combatStatsError) {
            console.warn('Failed to update combat stats after breakthrough:', combatStatsError);
            // Don't fail the entire breakthrough if combat stats update fails
        }

        return NextResponse.json({
            success: true,
            breakthrough: true,
            tribulationRequired: requirements.tribulationRequired,
            tribulationSuccess,
            isRealmBreakthrough: requirements.isRealmBreakthrough,
            message: requirements.isRealmBreakthrough ?
                `🎉 Đột phá thành công! Đã tiến vào cảnh giới ${newRealmDisplayName}!` :
                `⚡ Đột phá thành công! Đã đạt ${newRealmDisplayName}!`,
            oldLevel: currentLevel,
            newLevel: newLevel,
            oldRealm: getRealmDisplayName(currentLevel),
            newRealm: newRealmDisplayName,
            newStats: {
                level: newLevel,
                realm: newRealm?.name,
                maxEnergy: newMaxEnergy,
                qi: currentQi - requirements.qiRequired,
                spiritStones: spiritStones - requirements.spiritStonesRequired,
                nextBreakthrough: updateData.nextBreakthrough
            },
            bonusGained: requirements.isRealmBreakthrough ? newRealm?.realmBonuses : null
        });

    } catch (error) {
        console.error('Error processing breakthrough:', error);
        return NextResponse.json({ error: 'Failed to process breakthrough' }, { status: 500 });
    }
}
