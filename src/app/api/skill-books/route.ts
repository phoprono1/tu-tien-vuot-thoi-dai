import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

export async function GET() {
    try {
        const result = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID!,
            'skill_books'
        );

        return NextResponse.json(result.documents);
    } catch (error) {
        console.error('Error fetching skill books:', error);
        return NextResponse.json({ error: 'Failed to fetch skill books' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const result = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID!,
            'skill_books',
            'unique()',
            data
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error creating skill book:', error);
        return NextResponse.json({ error: 'Failed to create skill book' }, { status: 500 });
    }
}
