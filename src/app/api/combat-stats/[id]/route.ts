import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const data = await request.json();
        const { id } = await params;

        const result = await databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'combat_stats',
            id,
            data
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating combat stats:', error);
        return NextResponse.json({ error: 'Failed to update combat stats' }, { status: 500 });
    }
}
