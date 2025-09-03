import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query } from 'appwrite';

export async function POST(request: NextRequest) {
    try {
        const { characterId } = await request.json();

        if (!characterId) {
            return NextResponse.json(
                { error: 'Character ID is required' },
                { status: 400 }
            );
        }

        // Get all combat stats for this character
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMBAT_STATS,
            [Query.equal('characterId', characterId)]
        );

        if (result.documents.length <= 1) {
            return NextResponse.json({
                message: 'No duplicates found',
                characterId,
                count: result.documents.length
            });
        }

        // Keep the first document, delete the rest
        const toKeep = result.documents[0];
        const toDelete = result.documents.slice(1);

        const deletePromises = toDelete.map(doc =>
            databases.deleteDocument(DATABASE_ID, COLLECTIONS.COMBAT_STATS, doc.$id)
        );

        await Promise.all(deletePromises);

        return NextResponse.json({
            message: 'Duplicates cleaned up successfully',
            characterId,
            kept: toKeep.$id,
            deleted: toDelete.length,
            deletedIds: toDelete.map(doc => doc.$id)
        });

    } catch (error) {
        console.error('Error cleaning up combat stats:', error);
        return NextResponse.json({
            error: 'Failed to clean up combat stats',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
