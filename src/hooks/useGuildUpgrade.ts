import { useMutation, useQueryClient } from "@tanstack/react-query"

interface UpgradeGuildParams {
    guildId: string
    characterId: string
}

interface UpgradeGuildResponse {
    success: boolean
    message: string
    newLevel?: number
    cost?: number
    newBenefits?: {
        maxMembers: number
        cultivationBonus: number
        dailyReward: number
    }
}

const upgradeGuild = async ({ guildId, characterId }: UpgradeGuildParams): Promise<UpgradeGuildResponse> => {
    const response = await fetch('/api/guilds/upgrade', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guildId, characterId }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Không thể nâng cấp bang phái')
    }

    return response.json()
}

export const useGuildUpgrade = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: upgradeGuild,
        onSuccess: (data, variables) => {
            // Invalidate and refetch guild data
            queryClient.invalidateQueries({ queryKey: ['guilds'] })
            queryClient.invalidateQueries({ queryKey: ['guild', variables.guildId] })
            queryClient.invalidateQueries({ queryKey: ['user-guild'] })
            queryClient.invalidateQueries({ queryKey: ['guild-members', variables.guildId] })
        },
        onError: (error) => {
            console.error('Guild upgrade failed:', error)
        }
    })
}
