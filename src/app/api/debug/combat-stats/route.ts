import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const characterId = searchParams.get('characterId');

        if (!characterId) {
            return NextResponse.json(
                { error: 'Character ID is required' },
                { status: 400 }
            );
        }

        console.log('Debug: Looking for combat stats with characterId:', characterId);

        // Check if character exists first
        try {
            const character = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.CHARACTERS,
                characterId
            );
            console.log('Debug: Character found:', character.name, 'Level:', character.level);
        } catch (charError) {
            console.log('Debug: Character not found:', charError);
            return NextResponse.json({
                error: 'Character not found',
                characterId,
                details: charError
            }, { status: 404 });
        }

        // Get combat stats for specific character
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMBAT_STATS,
            [Query.equal('characterId', characterId)]
        );

        console.log('Debug: Combat stats query result:', {
            total: result.total,
            documents: result.documents.length,
            firstDoc: result.documents[0] ? {
                id: result.documents[0].$id,
                characterId: result.documents[0].characterId,
                maxHealth: result.documents[0].maxHealth,
                attack: result.documents[0].attack
            } : null
        });

        return NextResponse.json({
            characterId,
            total: result.total,
            found: result.documents.length > 0,
            combatStats: result.documents[0] || null,
            debugInfo: {
                databaseId: DATABASE_ID,
                collectionId: COLLECTIONS.COMBAT_STATS,
                query: 'Query.equal("characterId", "' + characterId + '")'
            }
        });

    } catch (error) {
        console.error('Debug: Error in combat stats lookup:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
