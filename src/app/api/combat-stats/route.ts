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
        const characterId = searchParams.get('characterId');

        if (!characterId) {
            return NextResponse.json(
                { error: 'Character ID là bắt buộc' },
                { status: 400 }
            );
        }

        // Get combat stats for specific character
        const result = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            [Query.equal('characterId', characterId)]
        );

        if (result.documents.length === 0) {
            return NextResponse.json(
                { error: 'Không tìm thấy combat stats cho character này' },
                { status: 404 }
            );
        }

        // If multiple documents exist for same character (shouldn't happen), use the first one
        if (result.documents.length > 1) {
            console.warn(`Multiple combat stats found for character ${characterId}:`, result.documents.length);
        }

        const combatStats = result.documents[0];

        return NextResponse.json({
            $id: combatStats.$id,
            characterId: combatStats.characterId,
            maxHealth: combatStats.maxHealth,
            currentHealth: combatStats.currentHealth,
            maxStamina: combatStats.maxStamina,
            currentStamina: combatStats.currentStamina,
            attack: combatStats.attack,
            defense: combatStats.defense,
            agility: combatStats.agility,
            criticalRate: combatStats.criticalRate,
            counterAttackRate: combatStats.counterAttackRate,
            multiStrikeRate: combatStats.multiStrikeRate,
            lifeStealRate: combatStats.lifeStealRate,
            healthRegenRate: combatStats.healthRegenRate,
            burnRate: combatStats.burnRate,
            poisonRate: combatStats.poisonRate,
            freezeRate: combatStats.freezeRate,
            stunRate: combatStats.stunRate,
        });
    } catch (error) {
        console.error('Lỗi khi lấy combat stats:', error);
        return NextResponse.json(
            { error: 'Không thể lấy dữ liệu combat stats' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const result = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            'unique()',
            data
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error creating combat stats:', error);
        return NextResponse.json({ error: 'Failed to create combat stats' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();
        const { $id, ...updateData } = data;

        const result = await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            $id,
            updateData
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating combat stats:', error);
        return NextResponse.json({ error: 'Failed to update combat stats' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const data = await request.json();
        const { id } = data;

        await databases.deleteDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            id
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting combat stats:', error);
        return NextResponse.json({ error: 'Failed to delete combat stats' }, { status: 500 });
    }
}
