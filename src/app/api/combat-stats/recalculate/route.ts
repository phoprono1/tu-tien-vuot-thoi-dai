import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { DatabaseCharacter } from '@/types/database';
import { calculateBaseCombatStats } from '@/utils/combatCalculations';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTIONS = {
    CHARACTERS: 'characters',
    COMBAT_STATS: 'combat_stats'
};

export async function POST(request: NextRequest) {
    try {
        const { characterId } = await request.json();

        if (!characterId) {
            return NextResponse.json({ error: 'Character ID required' }, { status: 400 });
        }

        // Get character data
        const character = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.CHARACTERS,
            characterId
        ) as unknown as DatabaseCharacter;

        if (!character) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        // Calculate new combat stats based on current level and path
        const newCombatStats = calculateBaseCombatStats(character);

        // Check if combat stats exist for this character
        const existingStatsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMBAT_STATS,
            [Query.equal('characterId', characterId)]
        );

        let updatedStats;

        if (existingStatsResponse.documents.length > 0) {
            // Update existing combat stats
            const existingStats = existingStatsResponse.documents[0];
            updatedStats = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.COMBAT_STATS,
                existingStats.$id,
                {
                    maxHealth: newCombatStats.maxHealth,
                    maxStamina: newCombatStats.maxStamina,
                    attack: newCombatStats.attack,
                    defense: newCombatStats.defense,
                    agility: newCombatStats.agility,
                    // Keep current health and stamina proportional
                    currentHealth: Math.min(existingStats.currentHealth, newCombatStats.maxHealth),
                    currentStamina: Math.min(existingStats.currentStamina, newCombatStats.maxStamina),
                    // Update skill rates based on cultivation path
                    criticalRate: newCombatStats.criticalRate,
                    counterAttackRate: newCombatStats.counterAttackRate,
                    multiStrikeRate: newCombatStats.multiStrikeRate,
                    lifeStealRate: newCombatStats.lifeStealRate,
                    healthRegenRate: newCombatStats.healthRegenRate,
                    burnRate: newCombatStats.burnRate,
                    poisonRate: newCombatStats.poisonRate,
                    freezeRate: newCombatStats.freezeRate,
                    stunRate: newCombatStats.stunRate,
                }
            );
        } else {
            // Create new combat stats
            updatedStats = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.COMBAT_STATS,
                'unique()',
                newCombatStats
            );
        }

        return NextResponse.json({
            success: true,
            message: `Combat stats recalculated for ${character.name} (Level ${character.level})`,
            combatStats: updatedStats,
            character: {
                name: character.name,
                level: character.level,
                cultivationPath: character.cultivationPath,
                realm: character.realm
            },
            calculations: {
                baseHealthPerLevel: 50,
                baseAttackPerLevel: 8,
                baseDefensePerLevel: 6,
                baseAgilityPerLevel: 4,
                pathMultipliers: character.cultivationPath === 'qi' ?
                    { health: 1.0, attack: 1.0, defense: 1.0, agility: 1.1 } :
                    character.cultivationPath === 'body' ?
                        { health: 1.5, attack: 1.2, defense: 1.4, agility: 0.7 } :
                        { health: 0.8, attack: 1.4, defense: 0.8, agility: 1.3 }
            }
        });

    } catch (error) {
        console.error('Error recalculating combat stats:', error);
        return NextResponse.json({
            error: 'Failed to recalculate combat stats',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
