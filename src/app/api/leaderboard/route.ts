import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { CULTIVATION_REALMS, getRealmByLevel } from '@/data/realms';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

interface LeaderboardEntry {
    characterId: string;
    name: string;
    level: number;
    realm: string;
    stage: number;
    cultivationPath: string;
    qi: number;
    spiritStones: number;
    // Combat stats
    maxHealth: number;
    attack: number;
    defense: number;
    agility: number;
    criticalRate: number;
    // Power score for ranking within same realm
    powerScore: number;
    rank: number;
}

function calculatePowerScore(character: Record<string, unknown>, combatStats: Record<string, unknown> | null): number {
    // Base score from level (most important)
    let score = (character.level as number) * 1000000;

    // Add qi component (second most important)
    score += (character.qi as number) * 100;

    // Add combat stats component
    if (combatStats) {
        score += (combatStats.attack as number) * 10;
        score += (combatStats.defense as number) * 8;
        score += (combatStats.maxHealth as number) * 5;
        score += (combatStats.agility as number) * 3;
        score += (combatStats.criticalRate as number) * 20; // Critical rate is percentage
    }

    // Add spirit stones (small factor)
    score += (character.spiritStones as number);

    return Math.floor(score);
}

function getRealm(level: number) {
    return getRealmByLevel(level);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const path = searchParams.get('path'); // Optional filter by cultivation path

        console.log('🏆 Leaderboard API - Fetching characters...');

        // Step 1: Get all characters
        const queries = [Query.orderDesc('level'), Query.limit(limit * 2)]; // Get more to account for missing combat stats
        if (path && ['qi', 'body', 'demon'].includes(path)) {
            queries.push(Query.equal('cultivationPath', path));
        }

        const charactersResult = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'characters',
            queries
        );

        console.log(`📊 Found ${charactersResult.documents.length} characters`);

        // Step 2: Get combat stats for all characters
        const combatStatsResult = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            [Query.limit(1000)] // Get all combat stats
        );

        console.log(`⚔️ Found ${combatStatsResult.documents.length} combat stats`);

        // Create a map for quick lookup of combat stats by characterId
        const combatStatsMap = new Map();
        combatStatsResult.documents.forEach(stats => {
            combatStatsMap.set(stats.characterId, stats);
        });

        // Step 3: Combine character data with combat stats and calculate power score
        const leaderboardData: LeaderboardEntry[] = [];

        for (const character of charactersResult.documents) {
            const combatStats = combatStatsMap.get(character.$id);

            // Skip characters without combat stats for now (they should be rare after our fix)
            if (!combatStats) {
                console.log(`⚠️ Character ${character.name} (${character.$id}) has no combat stats`);
                continue;
            }

            const realm = getRealm(character.level);
            const powerScore = calculatePowerScore(character, combatStats);

            leaderboardData.push({
                characterId: character.$id,
                name: character.name,
                level: character.level,
                realm: realm?.name || 'Unknown',
                stage: character.stage,
                cultivationPath: character.cultivationPath,
                qi: character.qi,
                spiritStones: character.spiritStones,
                maxHealth: combatStats.maxHealth,
                attack: combatStats.attack,
                defense: combatStats.defense,
                agility: combatStats.agility,
                criticalRate: combatStats.criticalRate,
                powerScore,
                rank: 0 // Will be set after sorting
            });
        }

        // Step 4: Sort by power score (descending) and assign ranks
        leaderboardData.sort((a, b) => b.powerScore - a.powerScore);
        leaderboardData.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        // Step 5: Limit results
        const finalResults = leaderboardData.slice(0, limit);

        console.log(`🎯 Returning top ${finalResults.length} characters for leaderboard`);

        return NextResponse.json({
            success: true,
            leaderboard: finalResults,
            total: finalResults.length,
            timestamp: new Date().toISOString()
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error creating leaderboard:', error);
        return NextResponse.json({
            error: 'Không thể tạo bảng xếp hạng',
            details: errorMessage
        }, { status: 500 });
    }
}

// Optional: Create a specific leaderboard by realm
export async function POST(request: NextRequest) {
    try {
        const { realmName, limit = 20 } = await request.json();

        console.log(`🏆 Realm Leaderboard API - Fetching for realm: ${realmName}`);

        // Find the realm
        const targetRealm = CULTIVATION_REALMS.find(r => r.name === realmName || r.id === realmName);
        if (!targetRealm) {
            return NextResponse.json({
                error: 'Cảnh giới không hợp lệ'
            }, { status: 400 });
        }

        // Get characters in this realm range
        const charactersResult = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'characters',
            [
                Query.greaterThanEqual('level', targetRealm.minLevel),
                Query.lessThanEqual('level', targetRealm.maxLevel),
                Query.orderDesc('level'),
                Query.limit(Math.min(limit, 100))
            ]
        );

        // Get combat stats for all characters
        const combatStatsResult = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            [Query.limit(1000)]
        );

        const combatStatsMap = new Map();
        combatStatsResult.documents.forEach(stats => {
            combatStatsMap.set(stats.characterId, stats);
        });

        // Create leaderboard for this realm
        const realmLeaderboard: LeaderboardEntry[] = [];

        for (const character of charactersResult.documents) {
            const combatStats = combatStatsMap.get(character.$id);
            if (!combatStats) continue;

            const powerScore = calculatePowerScore(character, combatStats);

            realmLeaderboard.push({
                characterId: character.$id,
                name: character.name,
                level: character.level,
                realm: targetRealm.name,
                stage: character.stage,
                cultivationPath: character.cultivationPath,
                qi: character.qi,
                spiritStones: character.spiritStones,
                maxHealth: combatStats.maxHealth,
                attack: combatStats.attack,
                defense: combatStats.defense,
                agility: combatStats.agility,
                criticalRate: combatStats.criticalRate,
                powerScore,
                rank: 0
            });
        }

        // Sort and rank
        realmLeaderboard.sort((a, b) => b.powerScore - a.powerScore);
        realmLeaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        return NextResponse.json({
            success: true,
            realm: targetRealm.name,
            leaderboard: realmLeaderboard,
            total: realmLeaderboard.length
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error creating realm leaderboard:', error);
        return NextResponse.json({
            error: 'Không thể tạo bảng xếp hạng cảnh giới',
            details: errorMessage
        }, { status: 500 });
    }
}
