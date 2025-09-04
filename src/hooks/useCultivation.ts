import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

interface CultivationRate {
    baseRate: number;
    totalBonusPercentage: number;
    finalRate: number;
}

interface CultivationTechnique {
    $id: string;
    name: string;
    description: string;
    type: string;
    cultivationPath: string;
    effects: Array<{
        type: string;
        value: number;
        description: string;
    }>;
    rarity: string;
    spiritStonesCost: number;
}

// Get cultivation rate for character
export function useCultivationRate(characterId: string) {
    return useQuery({
        queryKey: queryKeys.cultivationRate(characterId),
        queryFn: async (): Promise<CultivationRate> => {
            const response = await fetch(`/api/cultivation/rate?characterId=${characterId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch cultivation rate');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to get cultivation rate');
            }

            return data.cultivationData;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!characterId,
    });
}

// Get available cultivation techniques
export function useCultivationTechniques() {
    return useQuery({
        queryKey: queryKeys.cultivationTechniques(),
        queryFn: async (): Promise<CultivationTechnique[]> => {
            const response = await fetch('/api/cultivation/techniques');

            if (!response.ok) {
                throw new Error('Failed to fetch cultivation techniques');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to get cultivation techniques');
            }

            return data.techniques;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - techniques don't change often
    });
}

// Get learned techniques for character
export function useLearnedTechniques(characterId: string) {
    return useQuery({
        queryKey: queryKeys.learnedTechniques(characterId),
        queryFn: async (): Promise<CultivationTechnique[]> => {
            const response = await fetch(`/api/cultivation/learned?characterId=${characterId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch learned techniques');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to get learned techniques');
            }

            return data.techniques;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!characterId,
    });
}

// Practice cultivation technique
export function usePracticeTechnique() {
    const queryClient = useQueryClient();
    const { updateCharacter } = useAuthStore();
    const { addNotification, setLoading } = useUIStore();

    return useMutation({
        mutationFn: async ({ characterId, techniqueId }: { characterId: string; techniqueId: string }) => {
            setLoading('practicing', true);

            const response = await fetch('/api/cultivation/practice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ characterId, techniqueId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to practice technique');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to practice technique');
            }

            return data;
        },
        onSuccess: (data, variables) => {
            setLoading('practicing', false);

            // Update character in auth store
            if (data.newStats) {
                updateCharacter(data.newStats);
            }

            // Show success notification
            addNotification({
                type: 'success',
                title: 'Tu luyện thành công!',
                message: data.message || 'Đã hoàn thành phiên tu luyện.',
            });

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: queryKeys.cultivationRate(variables.characterId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.character(variables.characterId) });
        },
        onError: (error) => {
            setLoading('practicing', false);

            addNotification({
                type: 'error',
                title: 'Tu luyện thất bại',
                message: error.message,
            });
        },
    });
}
