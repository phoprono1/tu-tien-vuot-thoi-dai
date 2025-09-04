import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Stale time - data is fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache time - data stays in cache for 10 minutes after last use
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 2 times
            retry: 2,
            // Retry delay
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus
            refetchOnWindowFocus: false,
            // Background refetch
            refetchOnMount: 'always',
        },
        mutations: {
            // Retry failed mutations once
            retry: 1,
            // Show error notifications
            onError: (error) => {
                console.error('Mutation error:', error);
            },
        },
    },
});

// Query keys factory
export const queryKeys = {
    // Auth
    user: () => ['user'] as const,
    character: (userId?: string) => ['character', userId] as const,

    // Chat
    chatMessages: () => ['chat', 'messages'] as const,

    // Cultivation
    cultivationRate: (characterId: string) => ['cultivation', 'rate', characterId] as const,
    cultivationTechniques: () => ['cultivation', 'techniques'] as const,
    learnedTechniques: (characterId: string) => ['cultivation', 'learned', characterId] as const,

    // Combat
    combatStats: (characterId: string) => ['combat', 'stats', characterId] as const,
    pvpRankings: () => ['pvp', 'rankings'] as const,

    // Breakthrough
    breakthroughInfo: (characterId: string) => ['breakthrough', 'info', characterId] as const,

    // Admin
    allCharacters: () => ['admin', 'characters'] as const,
    serverSettings: () => ['admin', 'server-settings'] as const,

    // Skills & Items
    skillBooks: () => ['skill-books'] as const,
    learnedSkills: (characterId: string) => ['learned-skills', characterId] as const,
} as const;
