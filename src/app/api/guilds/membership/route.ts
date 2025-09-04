import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const characterId = searchParams.get('characterId')

        if (!characterId) {
            return NextResponse.json(
                { error: 'Character ID is required' },
                { status: 400 }
            )
        }

        // Use fetch to call internal API to avoid circular imports
        const baseUrl = process.env.NODE_ENV === 'production'
            ? process.env.NEXTAUTH_URL || 'https://tu-tien-vuot-thoi-dai.vercel.app'
            : 'http://localhost:3000'

        // Get all guild members to find this character
        const membershipResponse = await fetch(`${baseUrl}/api/admin/guild-members`, {
            cache: 'no-store'
        })

        if (!membershipResponse.ok) {
            return NextResponse.json({
                success: true,
                membership: null,
                guild: null
            })
        }

        const membershipData = await membershipResponse.json()

        // Find membership for this character
        const membership = membershipData.guildMembers?.find((doc: { characterId: string }) =>
            doc.characterId === characterId
        )

        if (!membership) {
            return NextResponse.json({
                success: true,
                membership: null,
                guild: null
            })
        }

        // Get guild info
        const guildResponse = await fetch(`${baseUrl}/api/admin/guilds`, {
            cache: 'no-store'
        })

        if (!guildResponse.ok) {
            return NextResponse.json({
                success: true,
                membership,
                guild: null
            })
        }

        const guildsData = await guildResponse.json()
        const guild = guildsData.guilds?.find((g: { $id: string }) => g.$id === membership.guildId)

        return NextResponse.json({
            success: true,
            membership,
            guild
        })

    } catch (error) {
        console.error('Error checking guild membership:', error)
        return NextResponse.json(
            { error: 'Failed to check guild membership' },
            { status: 500 }
        )
    }
}
