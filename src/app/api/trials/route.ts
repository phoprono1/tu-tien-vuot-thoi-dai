import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import { Trial } from '@/types/combat-extended';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'tu-tien-database';
const TRIALS_COLLECTION = 'trials';

export async function GET() {
    try {
        const result = await databases.listDocuments(
            DATABASE_ID,
            TRIALS_COLLECTION,
            [Query.orderAsc('minLevel'), Query.limit(50)]
        );

        // Parse JSON string fields
        const parsedTrials = result.documents.map((trial) => {
            const trialData = trial as unknown as {
                $id: string;
                name: string;
                description: string;
                difficulty: string;
                minLevel: number;
                maxLevel: number;
                minRealm: string;
                maxRealm: string;
                enemyStats: string;
                rewards: string;
            };

            return {
                ...trialData,
                enemyStats: JSON.parse(trialData.enemyStats),
                rewards: JSON.parse(trialData.rewards)
            };
        });

        return NextResponse.json({
            success: true,
            trials: parsedTrials
        });

    } catch (error) {
        console.error('Error fetching trials:', error);
        return NextResponse.json({
            error: 'Failed to fetch trials',
            trials: []
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json() as Omit<Trial, '$id'>;

        // Validate required fields
        if (!data.name || !data.difficulty || !data.minLevel || !data.maxLevel) {
            return NextResponse.json({
                error: 'Missing required fields: name, difficulty, minLevel, maxLevel'
            }, { status: 400 });
        }

        // Validate level range
        if (data.minLevel < 1 || data.maxLevel > 999 || data.minLevel > data.maxLevel) {
            return NextResponse.json({
                error: 'Invalid level range. Must be 1-999 and minLevel <= maxLevel'
            }, { status: 400 });
        }

        // Validate cooldown
        if (data.cooldownMinutes < 0 || data.cooldownMinutes > 1440) { // Max 24 hours
            return NextResponse.json({
                error: 'Invalid cooldown. Must be 0-1440 minutes'
            }, { status: 400 });
        }

        const result = await databases.createDocument(
            DATABASE_ID,
            TRIALS_COLLECTION,
            'unique()',
            {
                ...data,
                enemyStats: JSON.stringify(data.enemyStats),
                rewards: JSON.stringify(data.rewards)
            }
        );

        return NextResponse.json({
            success: true,
            message: `Trial "${data.name}" created successfully`,
            trial: {
                ...result,
                enemyStats: JSON.parse(result.enemyStats),
                rewards: JSON.parse(result.rewards)
            }
        });

    } catch (error) {
        console.error('Error creating trial:', error);
        return NextResponse.json({
            error: 'Failed to create trial',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data = await request.json() as Trial;

        if (!data.$id) {
            return NextResponse.json({ error: 'Trial ID is required' }, { status: 400 });
        }

        const { $id, ...updateData } = data;

        const result = await databases.updateDocument(
            DATABASE_ID,
            TRIALS_COLLECTION,
            $id,
            {
                ...updateData,
                enemyStats: JSON.stringify(updateData.enemyStats),
                rewards: JSON.stringify(updateData.rewards)
            }
        );

        return NextResponse.json({
            success: true,
            message: `Trial "${updateData.name}" updated successfully`,
            trial: {
                ...result,
                enemyStats: JSON.parse(result.enemyStats),
                rewards: JSON.parse(result.rewards)
            }
        });

    } catch (error) {
        console.error('Error updating trial:', error);
        return NextResponse.json({
            error: 'Failed to update trial',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const trialId = searchParams.get('id');

        if (!trialId) {
            return NextResponse.json({ error: 'Trial ID is required' }, { status: 400 });
        }

        await databases.deleteDocument(
            DATABASE_ID,
            TRIALS_COLLECTION,
            trialId
        );

        return NextResponse.json({
            success: true,
            message: 'Trial deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting trial:', error);
        return NextResponse.json({
            error: 'Failed to delete trial',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
