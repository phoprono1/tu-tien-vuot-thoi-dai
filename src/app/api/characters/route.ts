import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        const queries = [];
        if (userId) {
            queries.push(Query.equal('userId', userId));
        }

        const result = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'characters',
            queries
        );

        // Calculate combat stats for each character
        const charactersWithStats = result.documents.map((char) => {
            const character = char as unknown as {
                $id: string;
                name: string;
                level: number;
                realm: string;
                cultivationPath: string;
                health: number;
                maxHealth: number;
                stamina: number;
                spiritualPower: number;
                physicalPower: number;
                mentalPower: number;
                qi: number;
                energy: number;
            };

            // Calculate basic combat stats based on cultivation path and level
            let attack = 0;
            let defense = 0;
            let agility = 0;

            const baseLevel = character.level || 1;

            if (character.cultivationPath === 'qi') {
                // Qi cultivators: balanced, spiritual power focused
                attack = Math.floor((character.spiritualPower || 100) * 0.8 + baseLevel * 2);
                defense = Math.floor((character.spiritualPower || 100) * 0.5 + baseLevel * 1.5);
                agility = Math.floor((character.qi || 50) * 0.3 + baseLevel * 1.2);
            } else if (character.cultivationPath === 'body') {
                // Body cultivators: high attack and defense
                attack = Math.floor((character.physicalPower || 100) * 1.2 + baseLevel * 3);
                defense = Math.floor((character.physicalPower || 100) * 1.0 + baseLevel * 2.5);
                agility = Math.floor((character.stamina || 50) * 0.4 + baseLevel * 0.8);
            } else if (character.cultivationPath === 'demon') {
                // Demon cultivators: high attack, mental power focused
                attack = Math.floor((character.mentalPower || 100) * 1.1 + baseLevel * 2.5);
                defense = Math.floor((character.mentalPower || 100) * 0.4 + baseLevel * 1.2);
                agility = Math.floor((character.energy || 50) * 0.5 + baseLevel * 1.5);
            }

            return {
                ...character,
                attack,
                defense,
                agility,
                maxStamina: character.stamina || 100
            };
        });

        return NextResponse.json({
            success: true,
            characters: charactersWithStats,
            total: result.total
        });
    } catch (error) {
        console.error('Error fetching characters:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch characters' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const result = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'characters',
            'unique()',
            data
        );

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error creating character:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create character' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();
        const { $id, ...updateData } = data;

        const result = await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'characters',
            $id,
            updateData
        );

        return NextResponse.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error updating character:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update character' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const data = await request.json();
        const { id } = data;

        await databases.deleteDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'characters',
            id
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting character:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete character' },
            { status: 500 }
        );
    }
}
