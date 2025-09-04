import { NextResponse } from 'next/server'
import { Client, Databases } from 'node-appwrite'

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export async function GET() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'guild_members'
        )

        return NextResponse.json({
            success: true,
            guildMembers: response.documents
        })

    } catch (error) {
        console.error('Error fetching guild members:', error)
        return NextResponse.json(
            { error: 'Failed to fetch guild members' },
            { status: 500 }
        )
    }
}
