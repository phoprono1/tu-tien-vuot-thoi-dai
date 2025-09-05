import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

export async function POST() {
    try {
        console.log('🔧 Bulk initializing combat stats for characters without them...');

        // Get all characters
        const charactersResult = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'characters',
            [Query.limit(500)]
        );

        console.log(`📊 Found ${charactersResult.documents.length} characters`);

        // Get all combat stats
        const combatStatsResult = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            [Query.limit(500)]
        );

        console.log(`⚔️ Found ${combatStatsResult.documents.length} combat stats`);

        // Create a set of character IDs that already have combat stats
        const existingCombatStatsCharacterIds = new Set(
            combatStatsResult.documents.map(stats => stats.characterId)
        );

        // Find characters without combat stats
        const charactersWithoutStats = charactersResult.documents.filter(
            character => !existingCombatStatsCharacterIds.has(character.$id)
        );

        console.log(`🚀 Found ${charactersWithoutStats.length} characters without combat stats`);

        const results = [];

        // Initialize combat stats for each character without them
        for (const character of charactersWithoutStats) {
            try {
                console.log(`⚡ Creating combat stats for ${character.name} (${character.$id})`);

                // Calculate initial combat stats based on cultivation path and level
                const getInitialCombatStats = (cultivationPath: string, level: number, energy: number) => {
                    const levelMultiplier = Math.max(1, level / 10); // Level scaling

                    const baseStats = {
                        maxHealth: Math.floor(100 * levelMultiplier),
                        currentHealth: Math.floor(100 * levelMultiplier),
                        maxStamina: energy || 100,
                        currentStamina: energy || 100,
                        attack: Math.floor(10 * levelMultiplier),
                        defense: Math.floor(10 * levelMultiplier),
                        agility: Math.floor(10 * levelMultiplier),
                        criticalRate: 5.0,
                        counterAttackRate: 2.0,
                        multiStrikeRate: 1.0,
                        lifeStealRate: 0.0,
                        healthRegenRate: 1.0,
                        burnRate: 0.0,
                        poisonRate: 0.0,
                        freezeRate: 0.0,
                        stunRate: 0.0,
                        spiritualQi: 0,
                        stamina: energy || 100,
                    };

                    // Customize stats based on cultivation path
                    if (cultivationPath === "qi") {
                        baseStats.spiritualQi = Math.floor(50 * levelMultiplier);
                        baseStats.criticalRate = 8.0;
                    } else if (cultivationPath === "body") {
                        baseStats.maxHealth = Math.floor(150 * levelMultiplier);
                        baseStats.currentHealth = Math.floor(150 * levelMultiplier);
                        baseStats.attack = Math.floor(15 * levelMultiplier);
                        baseStats.defense = Math.floor(15 * levelMultiplier);
                    } else if (cultivationPath === "demon") {
                        baseStats.attack = Math.floor(12 * levelMultiplier);
                        baseStats.criticalRate = 10.0;
                        baseStats.lifeStealRate = 3.0;
                    }

                    return baseStats;
                };

                // Create combat stats
                const combatStatsData = {
                    characterId: character.$id,
                    ...getInitialCombatStats(character.cultivationPath, character.level, character.energy)
                };

                const newCombatStats = await databases.createDocument(
                    process.env.APPWRITE_DATABASE_ID!,
                    'combat_stats',
                    'unique()',
                    combatStatsData
                );

                results.push({
                    characterId: character.$id,
                    characterName: character.name,
                    combatStatsId: newCombatStats.$id,
                    success: true
                });

                console.log(`✅ Created combat stats for ${character.name}`);
            } catch (error) {
                console.error(`❌ Failed to create combat stats for ${character.name}:`, error);
                results.push({
                    characterId: character.$id,
                    characterName: character.name,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`🎯 Bulk initialization complete. Processed ${results.length} characters`);

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: true,
            message: `Bulk combat stats initialization complete`,
            processed: results.length,
            successful: successCount,
            failed: failureCount,
            results: results
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error in bulk combat stats initialization:', error);
        return NextResponse.json({
            error: 'Không thể khởi tạo hàng loạt combat stats',
            details: errorMessage
        }, { status: 500 });
    }
}
