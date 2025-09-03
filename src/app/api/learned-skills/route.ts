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

        if (characterId) {
            // Get learned skills for specific character
            const result = await databases.listDocuments(
                process.env.APPWRITE_DATABASE_ID!,
                'learned_skills',
                [Query.equal('characterId', characterId)]
            );

            return NextResponse.json(result.documents);
        } else {
            // Get all learned skills
            const result = await databases.listDocuments(
                process.env.APPWRITE_DATABASE_ID!,
                'learned_skills'
            );

            return NextResponse.json(result.documents);
        }
    } catch (error) {
        console.error('Error fetching learned skills:', error);
        return NextResponse.json({ error: 'Failed to fetch learned skills' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const result = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'learned_skills',
            'unique()',
            data
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error creating learned skill:', error);
        return NextResponse.json({ error: 'Failed to create learned skill' }, { status: 500 });
    }
}
