import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { CultivationTechnique } from '@/types/cultivation';
import { Query } from 'appwrite';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cultivationPath = searchParams.get('cultivationPath') || 'all';

        // Build queries for Appwrite
        const queries = [Query.limit(100)];

        if (cultivationPath !== 'all') {
            // Get techniques for specific path OR techniques available for all paths
            queries.push(Query.or([
                Query.equal('cultivationPath', cultivationPath),
                Query.equal('cultivationPath', 'all')
            ]));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CULTIVATION_TECHNIQUES,
            queries
        );

        // Transform Appwrite document format to our CultivationTechnique interface
        const techniques: CultivationTechnique[] = response.documents.map((doc) => {
            return {
                $id: doc.$id,
                name: doc.name || 'Unknown Technique',
                description: doc.description || 'No description available',
                category: doc.category || 'cultivation',
                rarity: doc.rarity || 'mortal',
                minLevel: Number(doc.minLevel) || 1,
                cultivationPath: doc.cultivationPath || 'all',
                costs: doc.costs || '{"qi": 0, "spiritStones": 0, "stamina": 0}',
                effects: doc.effects || '{}',
                $createdAt: doc.$createdAt,
                $updatedAt: doc.$updatedAt,
                $permissions: doc.$permissions,
                $databaseId: doc.$databaseId,
                $collectionId: doc.$collectionId
            };
        });

        return NextResponse.json({
            techniques,
            total: response.total
        });

    } catch (error) {
        console.error('Error fetching cultivation techniques:', error);
        return NextResponse.json({ error: 'Failed to fetch techniques' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, category, rarity, minLevel, cultivationPath, costs, effects } = body;

        // Validate required fields
        if (!name || !description || !category || !rarity || minLevel === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create the document in Appwrite
        const response = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.CULTIVATION_TECHNIQUES,
            'unique()', // Let Appwrite generate ID
            {
                name,
                description,
                category,
                rarity,
                minLevel,
                cultivationPath: cultivationPath || null,
                costs: typeof costs === 'string' ? costs : JSON.stringify(costs),
                effects: typeof effects === 'string' ? effects : JSON.stringify(effects)
            }
        );

        return NextResponse.json({ technique: response });

    } catch (error) {
        console.error('Error creating cultivation technique:', error);
        return NextResponse.json({ error: 'Failed to create technique' }, { status: 500 });
    }
}
