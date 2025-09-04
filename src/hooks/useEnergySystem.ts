import { useState, useEffect, useCallback } from "react";
import { DatabaseCharacter } from "@/types/database";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";

interface EnergyConsumptionResult {
  success: boolean;
  character?: DatabaseCharacter;
  energyUsed?: number;
  currentEnergy?: number;
  error?: string;
  required?: number;
  maxEnergy?: number;
  nextRegenTime?: string;
}

interface EnergyRegenResult {
  success: boolean;
  character?: DatabaseCharacter;
  currentEnergy: number;
  maxEnergy: number;
  energyRegenerated: number;
  nextRegenTime: string;
  minutesUntilNextRegen: number;
  regenRate: string;
}

export const useEnergySystem = () => {
  const { character, updateCharacter } = useAuthStore();
  const { addNotification } = useUIStore();
  const [isConsuming, setIsConsuming] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastRegenCheck, setLastRegenCheck] = useState<Date>(new Date());

  // Auto-regenerate energy every minute
  useEffect(() => {
    if (!character?.$id) return;

    const regenInterval = setInterval(async () => {
      await regenerateEnergy();
    }, 60 * 1000); // Check every minute

    return () => clearInterval(regenInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character?.$id]);

  const consumeEnergy = useCallback(async (
    activityType: string,
    energyCost: number,
    activityData?: Record<string, unknown>
  ): Promise<EnergyConsumptionResult> => {
    if (!character) {
      return { success: false, error: "No character found" };
    }

    setIsConsuming(true);

    try {
      const response = await fetch("/api/energy/consume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterId: character.$id,
          activityType,
          energyCost,
          activityData,
        }),
      });

      const result: EnergyConsumptionResult = await response.json();

      if (result.success && result.character) {
        updateCharacter(result.character);
        addNotification({
          type: "info",
          title: "Năng lượng tiêu thụ",
          message: `Sử dụng ${energyCost} năng lượng cho ${getActivityName(activityType)}`,
        });
      } else {
        addNotification({
          type: "error",
          title: "Không đủ năng lượng",
          message: result.error || `Cần ${result.required} năng lượng, chỉ có ${result.currentEnergy}`,
        });
      }

      return result;
    } catch (error) {
      console.error("Energy consumption error:", error);
      const errorResult = { success: false, error: "Failed to consume energy" };
      addNotification({
        type: "error",
        title: "Lỗi hệ thống",
        message: "Không thể tiêu thụ năng lượng",
      });
      return errorResult;
    } finally {
      setIsConsuming(false);
    }
  }, [character, updateCharacter, addNotification]);

  const regenerateEnergy = useCallback(async (): Promise<EnergyRegenResult | null> => {
    if (!character) return null;

    setIsRegenerating(true);

    try {
      const response = await fetch(`/api/energy/regen?characterId=${character.$id}`);
      const result: EnergyRegenResult = await response.json();

      if (result.success && result.character) {
        updateCharacter(result.character);

        // Only show notification if energy was actually regenerated
        if (result.energyRegenerated > 0) {
          addNotification({
            type: "success",
            title: "Năng lượng hồi phục",
            message: `Hồi phục ${result.energyRegenerated} năng lượng`,
          });
        }
      }

      setLastRegenCheck(new Date());
      return result;
    } catch (error) {
      console.error("Energy regen error:", error);
      return null;
    } finally {
      setIsRegenerating(false);
    }
  }, [character, updateCharacter, addNotification]);

  const getEnergyInfo = useCallback(() => {
    if (!character) return null;

    return {
      current: character.energy,
      max: character.maxEnergy,
      percentage: (character.energy / character.maxEnergy) * 100,
      isLow: character.energy < character.maxEnergy * 0.2, // Less than 20%
      isEmpty: character.energy === 0,
    };
  }, [character]);

  const canAfford = useCallback((energyCost: number): boolean => {
    if (!character) return false;
    return character.energy >= energyCost;
  }, [character]);

  return {
    // States
    isConsuming,
    isRegenerating,
    lastRegenCheck,

    // Functions
    consumeEnergy,
    regenerateEnergy,
    getEnergyInfo,
    canAfford,

    // Current energy info
    energyInfo: getEnergyInfo(),
  };
};

// Helper function to get activity display name
function getActivityName(activityType: string): string {
  const activityNames: Record<string, string> = {
    meditation: "Tịnh Tâm",
    training: "Rèn Luyện",
    alchemy: "Luyện Đan",
    technique_practice: "Rèn Luyện Công Pháp",
    technique_learning: "Học Công Pháp",
    combat: "Chiến Đấu",
    breakthrough: "Đột Phá",
  };

  return activityNames[activityType] || activityType;
}

export default useEnergySystem;
