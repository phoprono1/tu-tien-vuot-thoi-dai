import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { DatabaseCharacter } from '@/types/database';

interface CultivationRate {
    baseRate: number;
    totalBonusPercentage: number;
    finalRate: number;
}

export function useAutoCultivation(
    cultivationRate: CultivationRate,
    character: DatabaseCharacter | null,
    isEnabled: boolean = true
) {
    const { updateCharacter } = useAuthStore();

    // Use refs to track accumulation without causing re-renders
    const accumulatedQiRef = useRef(0);
    const lastDbUpdateTimeRef = useRef(Date.now());
    const localQiRef = useRef(character?.qi || 0);
    const lastCultivationUpdateRef = useRef(character?.lastCultivationUpdate || new Date().toISOString());

    useEffect(() => {
        if (!isEnabled || !character || cultivationRate.finalRate <= 0) {
            return;
        }

        console.log('🧘 Starting optimized auto-cultivation with rate:', cultivationRate.finalRate, '/s');

        // Reset refs when character changes
        accumulatedQiRef.current = 0;
        lastDbUpdateTimeRef.current = Date.now();
        localQiRef.current = character.qi;
        lastCultivationUpdateRef.current = character.lastCultivationUpdate;

        const calculateAutoCultivation = async () => {
            const now = new Date();
            const lastUpdate = new Date(lastCultivationUpdateRef.current);
            const timeDifferenceMs = now.getTime() - lastUpdate.getTime();
            const timeDifferenceSeconds = Math.floor(timeDifferenceMs / 1000);

            if (timeDifferenceSeconds > 0) {
                // Use dynamic cultivation rate from API (includes technique bonuses)
                const rate = cultivationRate.finalRate;
                const qiGain = Math.floor(timeDifferenceSeconds * rate);

                if (qiGain > 0) {
                    console.log('🧘 Cultivation tick - adding:', qiGain, 'qi (rate:', rate, '/s)');

                    // Update local tracking variables
                    accumulatedQiRef.current += qiGain;
                    localQiRef.current += qiGain;
                    lastCultivationUpdateRef.current = now.toISOString();

                    // Update UI state immediately for responsiveness
                    updateCharacter({
                        ...character,
                        qi: localQiRef.current,
                        lastCultivationUpdate: lastCultivationUpdateRef.current,
                    });

                    // Batch database updates - only update every 15 seconds or 60+ qi accumulated
                    const timeSinceLastDbUpdate = now.getTime() - lastDbUpdateTimeRef.current;
                    if (timeSinceLastDbUpdate >= 15000 || accumulatedQiRef.current >= 60) {
                        console.log('💾 Saving to database - accumulated qi:', accumulatedQiRef.current);

                        try {
                            await databases.updateDocument(
                                DATABASE_ID,
                                COLLECTIONS.CHARACTERS,
                                character.$id,
                                {
                                    qi: localQiRef.current,
                                    lastCultivationUpdate: lastCultivationUpdateRef.current,
                                }
                            );

                            lastDbUpdateTimeRef.current = Date.now();
                            accumulatedQiRef.current = 0;
                            console.log('✅ Database updated successfully');
                        } catch (error) {
                            console.error('❌ Database update failed:', error);
                        }
                    }
                }
            }
        };

        // Calculate immediately when starting (handles offline time)
        calculateAutoCultivation();

        // Update UI every second but database only every 15 seconds or 60+ qi
        const interval = setInterval(calculateAutoCultivation, 1000);

        // Cleanup: Save any remaining qi when component unmounts
        return () => {
            console.log('🧘 Stopping auto-cultivation, saving remaining qi:', accumulatedQiRef.current);
            clearInterval(interval);

            if (accumulatedQiRef.current > 0) {
                databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.CHARACTERS,
                    character.$id,
                    {
                        qi: localQiRef.current,
                        lastCultivationUpdate: lastCultivationUpdateRef.current,
                    }
                ).catch(console.error);
            }
        };
    }, [
        character,
        cultivationRate.finalRate,
        isEnabled,
        updateCharacter
    ]);

    // Return current cultivation info for debugging
    return {
        isActive: isEnabled && cultivationRate.finalRate > 0,
        rate: cultivationRate.finalRate,
        accumulatedQi: accumulatedQiRef.current,
        localQi: localQiRef.current,
    };
}
