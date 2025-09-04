import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGuildStore } from '@/stores/guildStore';
import type { Guild, GuildMember } from '@/stores/guildStore';

// Query keys
export const GUILD_KEYS = {
    all: ['guilds'] as const,
    lists: () => [...GUILD_KEYS.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...GUILD_KEYS.lists(), filters] as const,
    details: () => [...GUILD_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...GUILD_KEYS.details(), id] as const,
    membership: (characterId: string) => [...GUILD_KEYS.all, 'membership', characterId] as const,
    members: (guildId: string) => [...GUILD_KEYS.all, 'members', guildId] as const,
    characters: (characterIds: string[]) => ['characters', 'batch', characterIds.sort().join(',')] as const,
} as const;

interface Character {
    $id: string;
    name: string;
    level: number;
    cultivationPath: string;
}

// API functions
const guildApi = {
    getGuilds: async (): Promise<{ success: boolean; guilds: Guild[]; error?: string }> => {
        const response = await fetch('/api/guilds');
        return response.json();
    },

    getUserMembership: async (characterId: string): Promise<{
        membership: GuildMember | null;
        guild: Guild | null
    }> => {
        const response = await fetch(`/api/guilds/membership?characterId=${characterId}`);
        if (!response.ok) {
            return { membership: null, guild: null };
        }
        return response.json();
    },

    getGuildMembers: async (guildId: string): Promise<{ members: GuildMember[] }> => {
        const response = await fetch(`/api/guilds/${guildId}/members`);
        return response.json();
    },

    getCharacters: async (characterIds: string[]): Promise<{ success: boolean; characters: Character[] }> => {
        if (characterIds.length === 0) return { success: true, characters: [] };
        const response = await fetch(`/api/characters/batch?ids=${characterIds.join(',')}`);
        return response.json();
    },

    createGuild: async (data: {
        name: string;
        description: string;
        characterId: string;
        characterLevel: number;
        spiritStones: number;
    }): Promise<{ success: boolean; guild?: Guild; error?: string }> => {
        const response = await fetch('/api/guilds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    joinGuild: async (data: {
        guildId: string;
        characterId: string;
    }): Promise<{ success: boolean; error?: string }> => {
        console.log('🔗 Join Guild API call:', data);
        const response = await fetch('/api/guilds/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log('🔗 Join Guild API response:', result);

        if (!response.ok) {
            throw new Error(result.error || 'Failed to join guild');
        }

        return result;
    },

    claimDailyReward: async (data: {
        characterId: string;
    }): Promise<{ success: boolean; reward?: number; newSpiritStones?: number; message?: string; error?: string }> => {
        const response = await fetch('/api/guilds/daily-reward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    addContribution: async (data: {
        characterId: string;
        amount: number;
    }): Promise<{ success: boolean; donatedAmount?: number; contributionPoints?: number; totalContribution?: number; guildFund?: number; characterSpiritStones?: number; message?: string; error?: string }> => {
        const response = await fetch('/api/guilds/contribution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    upgradeGuild: async (data: { characterId: string; guildId: string }) => {
        const response = await fetch('/api/guilds/upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    getUpgradeInfo: async (guildId: string) => {
        const response = await fetch(`/api/guilds/upgrade?guildId=${guildId}`);
        return response.json();
    },
};

// Hooks
export function useGuilds() {
    const { setGuilds, setError } = useGuildStore();

    const query = useQuery({
        queryKey: GUILD_KEYS.lists(),
        queryFn: guildApi.getGuilds,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
        refetchOnWindowFocus: false,
    });

    // Update store when data changes
    React.useEffect(() => {
        if (query.data?.success) {
            setGuilds(query.data.guilds);
            setError(null);
        } else if (query.data && !query.data.success) {
            setError(query.data.error || 'Failed to load guilds');
        }
    }, [query.data, setGuilds, setError]);

    return query;
}

export function useGuildMembership(characterId: string | undefined) {
    const { setUserMembership, setCurrentGuild } = useGuildStore();

    const query = useQuery({
        queryKey: GUILD_KEYS.membership(characterId || ''),
        queryFn: () => guildApi.getUserMembership(characterId!),
        enabled: !!characterId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Update store when data changes
    React.useEffect(() => {
        if (query.data) {
            setUserMembership(query.data.membership);
            setCurrentGuild(query.data.guild);
        }
    }, [query.data, setUserMembership, setCurrentGuild]);

    return query;
}

export function useGuildMembers(guildId: string | undefined) {
    const { setGuildMembers } = useGuildStore();

    const query = useQuery({
        queryKey: GUILD_KEYS.members(guildId || ''),
        queryFn: () => guildApi.getGuildMembers(guildId!),
        enabled: !!guildId,
        staleTime: 3 * 60 * 1000, // 3 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Update store when data changes
    React.useEffect(() => {
        if (query.data) {
            setGuildMembers(query.data.members || []);
        }
    }, [query.data, setGuildMembers]);

    return query;
}

// Get characters info by IDs
export function useCharacters(characterIds: string[]) {
    return useQuery({
        queryKey: GUILD_KEYS.characters(characterIds),
        queryFn: () => guildApi.getCharacters(characterIds),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        enabled: characterIds.length > 0,
        refetchOnWindowFocus: false,
    });
}

// Mutations
export function useCreateGuild() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: guildApi.createGuild,
        onSuccess: () => {
            // Invalidate and refetch guild queries
            queryClient.invalidateQueries({ queryKey: GUILD_KEYS.all });
        },
    });
}

export function useJoinGuild() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: guildApi.joinGuild,
        onSuccess: () => {
            // Invalidate guild queries
            queryClient.invalidateQueries({ queryKey: GUILD_KEYS.all });
        },
    });
}

export function useClaimDailyReward() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: guildApi.claimDailyReward,
        onSuccess: () => {
            // Invalidate membership and members queries
            queryClient.invalidateQueries({ queryKey: GUILD_KEYS.all });
        },
    });
}

export function useAddContribution() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: guildApi.addContribution,
        onSuccess: () => {
            // Invalidate guild queries to refresh contribution and fund
            queryClient.invalidateQueries({ queryKey: GUILD_KEYS.all });
            // Also invalidate character data since spirit stones changed
            queryClient.invalidateQueries({ queryKey: ['characters'] });
        },
    });
}

export function useUpgradeGuild() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: guildApi.upgradeGuild,
        onSuccess: () => {
            // Invalidate all guild queries to refresh data
            queryClient.invalidateQueries({ queryKey: GUILD_KEYS.all });
        },
    });
}

export function useUpgradeInfo(guildId: string | undefined) {
    return useQuery({
        queryKey: ['guild-upgrade', guildId],
        queryFn: () => guildApi.getUpgradeInfo(guildId!),
        enabled: !!guildId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
}

// Re-export useGuildUpgrade hook
export { useGuildUpgrade } from './useGuildUpgrade';
