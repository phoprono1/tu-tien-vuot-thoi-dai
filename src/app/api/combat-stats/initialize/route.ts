import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { characterId } = data;

        console.log('🚀 Initializing combat stats for character:', characterId);

        if (!characterId) {
            return NextResponse.json(
                { error: 'Character ID là bắt buộc' },
                { status: 400 }
            );
        }

        // First, check if combat stats already exist
        const existingStats = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            [Query.equal('characterId', characterId)]
        );

        if (existingStats.documents.length > 0) {
            console.log('✅ Combat stats already exist for character:', characterId);
            return NextResponse.json({
                success: true,
                message: 'Combat stats đã tồn tại cho character này',
                combatStats: existingStats.documents[0]
            });
        }

        // Get character information to determine cultivation path
        const character = await databases.getDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'characters',
            characterId
        );

        console.log('📋 Character data:', {
            name: character.name,
            level: character.level,
            cultivationPath: character.cultivationPath,
            energy: character.energy
        });

        // Calculate initial combat stats based on cultivation path
        const getInitialCombatStats = (cultivationPath: string, energy: number) => {
            const baseStats = {
                maxHealth: 100,
                currentHealth: 100,
                maxStamina: energy || 100,
                currentStamina: energy || 100,
                attack: 10,
                defense: 10,
                agility: 10,
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
                baseStats.spiritualQi = 50;
                baseStats.criticalRate = 8.0;
            } else if (cultivationPath === "body") {
                baseStats.maxHealth = 150;
                baseStats.currentHealth = 150;
                baseStats.attack = 15;
                baseStats.defense = 15;
            } else if (cultivationPath === "demon") {
                baseStats.attack = 12;
                baseStats.criticalRate = 10.0;
                baseStats.lifeStealRate = 3.0;
            }

            return baseStats;
        };

        // Create combat stats
        const combatStatsData = {
            characterId: characterId,
            ...getInitialCombatStats(character.cultivationPath, character.energy)
        };

        console.log('💪 Creating combat stats with data:', combatStatsData);

        const newCombatStats = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            'unique()',
            combatStatsData
        );

        console.log('✅ Combat stats created successfully:', newCombatStats.$id);

        return NextResponse.json({
            success: true,
            message: 'Combat stats được tạo thành công',
            combatStats: newCombatStats
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error initializing combat stats:', error);
        return NextResponse.json({
            error: 'Không thể khởi tạo combat stats',
            details: errorMessage
        }, { status: 500 });
    }
}
