import { NextRequest, NextResponse } from 'next/server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ guildId: string }> }
) {
    try {
        const { guildId } = await params

        // Use fetch to call admin API
        const baseUrl = process.env.NODE_ENV === 'production'
            ? process.env.NEXTAUTH_URL || 'https://tu-tien-vuot-thoi-dai.vercel.app'
            : 'http://localhost:3000'

        const response = await fetch(`${baseUrl}/api/admin/guild-members`, {
            cache: 'no-store'
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch guild members' },
                { status: 500 }
            )
        }

        const data = await response.json()

        // Filter members for this specific guild
        const guildMembers = data.guildMembers?.filter((member: { guildId: string }) =>
            member.guildId === guildId
        ) || []

        return NextResponse.json({
            success: true,
            members: guildMembers
        })

    } catch (error) {
        console.error('Error getting guild members:', error)
        return NextResponse.json(
            { error: 'Failed to get guild members' },
            { status: 500 }
        )
    }
}
