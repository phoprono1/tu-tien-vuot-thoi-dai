import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const characterId = searchParams.get('characterId');

        if (!characterId) {
            return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
        }

        // Get server settings for global cultivation speed multiplier
        let serverMultiplier = 5.0; // Default x5 boost
        try {
            const serverSettings = await databases.listDocuments(
                DATABASE_ID,
                'server_settings'
            );

            if (serverSettings.documents.length > 0) {
                const settings = serverSettings.documents[0];
                if (settings.eventActive) {
                    serverMultiplier = settings.cultivationSpeedMultiplier || 5.0;
                }
            }
        } catch (serverError) {
            console.warn('Could not fetch server settings, using default multiplier:', serverError);
        }

        // Get character to determine cultivation path
        const character = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.CHARACTERS,
            characterId
        );

        // Base cultivation rates by path (will scale with level)
        const baseCultivationRates = {
            qi: 1.0,      // Normal speed
            body: 0.8,    // Slowest but highest combat bonus
            demon: 1.2,   // Fastest but hardest breakthrough
        };

        // Level scaling: Each level increases cultivation rate
        const levelScaling = {
            qi: 0.05,     // +0.05/level (normal growth)
            body: 0.03,   // +0.03/level (slow growth, but high combat)
            demon: 0.08,  // +0.08/level (fast growth, risky breakthrough)
        };

        const pathMultiplier = baseCultivationRates[character.cultivationPath as keyof typeof baseCultivationRates] || 1.0;
        const levelBonus = levelScaling[character.cultivationPath as keyof typeof levelScaling] || 0.05;

        // Base rate scales with level: baseRate * (1 + levelBonus * level)
        const baseRate = pathMultiplier * (1 + levelBonus * character.level);

        // Get all learned techniques for this character
        const learnedTechniques = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LEARNED_TECHNIQUES,
            [Query.equal('characterId', characterId)]
        );

        let totalQiGainMultiplier = 0;

        // Calculate total cultivation speed bonus from learned techniques
        for (const learned of learnedTechniques.documents) {
            try {
                // Get technique details
                const technique = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.CULTIVATION_TECHNIQUES,
                    learned.techniqueId
                );

                // Parse effects
                const effects = JSON.parse(technique.effects || '{}');

                if (effects.qiGainMultiplier && effects.qiGainMultiplier > 0) {
                    // Apply effectiveness multiplier based on technique mastery
                    const effectiveBonus = effects.qiGainMultiplier * (learned.currentEffectiveness || 1.0);
                    totalQiGainMultiplier += effectiveBonus;
                }
            } catch (error) {
                console.error('Error processing learned technique:', learned.$id, error);
                // Continue with other techniques if one fails
            }
        }

        // Calculate final cultivation rate with server multiplier
        const bonusMultiplier = totalQiGainMultiplier / 100; // Convert percentage to decimal
        const finalRate = baseRate * (1 + bonusMultiplier) * serverMultiplier;

        return NextResponse.json({
            success: true,
            cultivationData: {
                characterId,
                cultivationPath: character.cultivationPath,
                baseRate,
                serverMultiplier,
                totalBonusPercentage: totalQiGainMultiplier,
                finalRate,
                learnedTechniquesCount: learnedTechniques.documents.length,
                breakdown: {
                    baseCultivationRate: baseRate,
                    techniqueBonus: bonusMultiplier,
                    serverBonus: serverMultiplier,
                    totalRate: finalRate
                }
            }
        });

    } catch (error) {
        console.error('Error calculating cultivation rate:', error);
        return NextResponse.json({
            error: 'Failed to calculate cultivation rate',
            cultivationData: {
                baseRate: 1.0,
                totalBonusPercentage: 0,
                finalRate: 1.0,
                breakdown: {
                    baseCultivationRate: 1.0,
                    techniqueBonus: 0,
                    totalRate: 1.0
                }
            }
        }, { status: 500 });
    }
}
