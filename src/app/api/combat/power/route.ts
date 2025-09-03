import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { DatabaseCharacter } from '@/types/database';
import { CombatStats } from '@/types/combat';

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
        ) as unknown as DatabaseCharacter;

        // Get combat stats
        const combatStatsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMBAT_STATS,
            [`characterId=${characterId}`]
        );

        if (combatStatsResponse.documents.length === 0) {
            return NextResponse.json({
                error: 'Combat stats not found. Please recalculate combat stats first.'
            }, { status: 404 });
        }

        const combatStats = combatStatsResponse.documents[0] as unknown as CombatStats;

        // Calculate combat power based on multiple factors
        const combatPower = calculateCombatPower(character, combatStats);

        return NextResponse.json({
            success: true,
            characterId,
            characterName: character.name,
            level: character.level,
            realm: character.realm,
            cultivationPath: character.cultivationPath,
            combatPower,
            breakdown: {
                baseStats: {
                    health: combatStats.maxHealth,
                    attack: combatStats.attack,
                    defense: combatStats.defense,
                    agility: combatStats.agility
                },
                specialStats: {
                    criticalRate: combatStats.criticalRate,
                    counterAttackRate: combatStats.counterAttackRate,
                    multiStrikeRate: combatStats.multiStrikeRate,
                    lifeStealRate: combatStats.lifeStealRate,
                    healthRegenRate: combatStats.healthRegenRate
                },
                calculations: {
                    healthScore: Math.floor(combatStats.maxHealth * 0.5),
                    attackScore: Math.floor(combatStats.attack * 3),
                    defenseScore: Math.floor(combatStats.defense * 2),
                    agilityScore: Math.floor(combatStats.agility * 2.5),
                    specialStatsScore: Math.floor(
                        (combatStats.criticalRate + combatStats.counterAttackRate +
                            combatStats.multiStrikeRate + combatStats.lifeStealRate) * 10
                    ),
                    levelBonus: character.level * 50,
                    realmBonus: getRealmBonus(character.level),
                    pathBonus: getPathBonus(character.cultivationPath)
                }
            }
        });

    } catch (error) {
        console.error('Error calculating combat power:', error);
        return NextResponse.json({
            error: 'Failed to calculate combat power',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

function calculateCombatPower(character: DatabaseCharacter, combatStats: CombatStats): number {
    // Base combat power from stats
    const healthScore = combatStats.maxHealth * 0.5;
    const attackScore = combatStats.attack * 3;
    const defenseScore = combatStats.defense * 2;
    const agilityScore = combatStats.agility * 2.5;

    // Special abilities score
    const specialStatsScore = (
        combatStats.criticalRate +
        combatStats.counterAttackRate +
        combatStats.multiStrikeRate +
        combatStats.lifeStealRate +
        combatStats.healthRegenRate * 0.5
    ) * 10;

    // Level and realm bonuses
    const levelBonus = character.level * 50;
    const realmBonus = getRealmBonus(character.level);
    const pathBonus = getPathBonus(character.cultivationPath);

    const totalCombatPower = Math.floor(
        healthScore + attackScore + defenseScore + agilityScore +
        specialStatsScore + levelBonus + realmBonus + pathBonus
    );

    return Math.max(100, totalCombatPower); // Minimum 100 combat power
}

function getRealmBonus(level: number): number {
    // Bonus based on cultivation realm
    if (level >= 900) return 50000; // Đế realm
    if (level >= 800) return 30000; // Tiên realm  
    if (level >= 700) return 15000; // Thánh realm
    if (level >= 600) return 8000;  // Vương realm
    if (level >= 500) return 4000;  // Hoàng realm
    if (level >= 400) return 2000;  // Đế Hoàng realm
    if (level >= 300) return 1000;  // Tam Thiên realm
    if (level >= 200) return 500;   // Nguyên Anh realm
    if (level >= 100) return 200;   // Kim Đan realm
    if (level >= 50) return 100;    // Trúc Cơ realm
    if (level >= 20) return 50;     // Luyện Thể realm
    return 0;
}

function getPathBonus(cultivationPath: string): number {
    // Path-specific combat power bonuses
    switch (cultivationPath) {
        case 'body':
            return 500; // Thể Tu - Highest combat power
        case 'demon':
            return 300; // Ma Tu - Medium combat power  
        case 'qi':
            return 200; // Khí Tu - Lowest combat power
        default:
            return 0;
    }
}
