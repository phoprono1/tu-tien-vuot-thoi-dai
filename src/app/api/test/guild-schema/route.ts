import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases } from 'node-appwrite'

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export async function GET() {
    try {
        // Lấy một guild bất kỳ để xem schema
        const guilds = await databases.listDocuments(
            DATABASE_ID,
            'guilds'
        );

        if (guilds.documents.length > 0) {
            const guild = guilds.documents[0];
            console.log('🏰 Guild schema:', Object.keys(guild));
            console.log('🏰 Guild data:', guild);

            return NextResponse.json({
                success: true,
                guildSchema: Object.keys(guild),
                sampleGuild: guild
            });
        }

        return NextResponse.json({ error: 'No guilds found' });

    } catch (error) {
        console.error('Error checking guild schema:', error);
        return NextResponse.json({ error: 'Failed to check schema' }, { status: 500 });
    }
}
