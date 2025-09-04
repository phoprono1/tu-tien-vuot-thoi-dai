import { NextRequest, NextResponse } from 'next/server'
import { Client, Databases } from 'node-appwrite'
import { Query } from 'node-appwrite'

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// GET - Lấy thông tin nhiều characters theo IDs
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const idsParam = searchParams.get('ids')

        if (!idsParam) {
            return NextResponse.json(
                { error: 'Missing character IDs' },
                { status: 400 }
            )
        }

        const ids = idsParam.split(',').filter(id => id.trim().length > 0)

        if (ids.length === 0) {
            return NextResponse.json(
                { success: true, characters: [] }
            )
        }

        // Lấy characters với IDs được cung cấp
        const response = await databases.listDocuments(
            DATABASE_ID,
            'characters',
            [
                Query.equal('$id', ids),
                Query.select(['$id', 'name', 'level', 'cultivationPath'])
            ]
        )

        return NextResponse.json({
            success: true,
            characters: response.documents
        })

    } catch (error) {
        console.error('Error fetching characters:', error)
        return NextResponse.json(
            { error: 'Không thể tải thông tin nhân vật' },
            { status: 500 }
        )
    }
}
