import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const characterId = searchParams.get('characterId');

        if (!characterId) {
            return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LEARNED_TECHNIQUES,
            [
                Query.equal('characterId', characterId),
                Query.limit(100)
            ]
        );

        return NextResponse.json({
            learnedTechniques: response.documents,
            total: response.total
        });

    } catch (error) {
        console.error('Error fetching learned techniques:', error);
        return NextResponse.json({ error: 'Failed to fetch learned techniques' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, techniqueId } = body;

        if (!characterId || !techniqueId) {
            return NextResponse.json({ error: 'Character ID and Technique ID are required' }, { status: 400 });
        }

        // Check if technique is already learned
        const existingLearned = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.LEARNED_TECHNIQUES,
            [
                Query.equal('characterId', characterId),
                Query.equal('techniqueId', techniqueId),
                Query.limit(1)
            ]
        );

        if (existingLearned.total > 0) {
            return NextResponse.json({ error: 'Technique already learned' }, { status: 400 });
        }

        // Create new learned technique
        const newLearnedTechnique = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.LEARNED_TECHNIQUES,
            ID.unique(),
            {
                characterId,
                techniqueId,
                level: 1,
                experience: 0,
                maxExperience: 100,
                learnedAt: new Date().toISOString(),
                currentEffectiveness: 0.3 // Starting effectiveness at 30%
            }
        );

        return NextResponse.json({
            learnedTechnique: newLearnedTechnique,
            message: 'Technique learned successfully!'
        });

        // TODO: Implement resource deduction from character
        // This would require updating character's qi, spiritStones, stamina
        // based on the cost parameter

    } catch (error) {
        console.error('Error learning technique:', error);
        return NextResponse.json({ error: 'Failed to learn technique' }, { status: 500 });
    }
}
