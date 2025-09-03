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
            'characters',
            id,
            data
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating character:', error);
        return NextResponse.json({ error: 'Failed to update character' }, { status: 500 });
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const result = await databases.getDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'characters',
            id
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error getting character:', error);
        return NextResponse.json({ error: 'Failed to get character' }, { status: 500 });
    }
}
