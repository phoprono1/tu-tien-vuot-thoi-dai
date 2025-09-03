import { NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

export async function GET() {
    try {
        // Get PvP rankings with character info
        const rankingsResponse = await databases.listDocuments(
            DATABASE_ID,
            'pvp_rankings',
            [Query.orderDesc('rating'), Query.limit(100)]
        );

        const rankings = [];

        // Get character info for each ranking
        for (const rankingDoc of rankingsResponse.documents) {
            const ranking = rankingDoc as unknown as {
                $id: string;
                characterId: string;
                rating: number;
                wins: number;
                losses: number;
                totalMatches: number;
                winStreak: number;
                highestRating: number;
            };

            try {
                // Get character data
                const character = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.CHARACTERS,
                    ranking.characterId
                ) as unknown as {
                    name: string;
                    level: number;
                    realm: string;
                    cultivationPath: string;
                };

                // Get combat power
                let combatPower = 0;
                try {
                    const combatPowerResponse = await fetch(
                        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/combat/power?characterId=${ranking.characterId}`
                    );
                    const combatPowerData = await combatPowerResponse.json();
                    if (combatPowerData.success) {
                        combatPower = combatPowerData.combatPower;
                    }
                } catch {
                    console.warn('Could not fetch combat power for character:', ranking.characterId);
                }

                rankings.push({
                    $id: ranking.$id,
                    characterId: ranking.characterId,
                    characterName: character.name,
                    level: character.level,
                    realm: character.realm,
                    cultivationPath: character.cultivationPath,
                    rating: ranking.rating,
                    wins: ranking.wins,
                    losses: ranking.losses,
                    totalMatches: ranking.totalMatches,
                    winStreak: ranking.winStreak,
                    highestRating: ranking.highestRating,
                    combatPower
                });
            } catch (error) {
                console.error('Error fetching character data for ranking:', ranking.characterId, error);
                // Skip this ranking if character data is not found
                continue;
            }
        }

        // Sort by rating (in case some were added out of order)
        rankings.sort((a, b) => b.rating - a.rating);

        return NextResponse.json({
            success: true,
            rankings,
            total: rankings.length
        });

    } catch (error) {
        console.error('Error fetching PvP rankings:', error);
        return NextResponse.json({
            error: 'Failed to fetch PvP rankings',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
