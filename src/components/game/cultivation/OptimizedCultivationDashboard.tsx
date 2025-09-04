"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { useCultivationRate } from "@/hooks/useCultivation";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useEnergySystem } from "@/hooks/useEnergySystem";
import { Loader2, Zap, Heart, Flame } from "lucide-react";

type CultivationPath = "qi" | "body" | "demon";
type PracticeType = "meditation" | "training" | "alchemy";

interface OptimizedCultivationDashboardProps {
  isActive: boolean;
}

export default function OptimizedCultivationDashboard({
  isActive,
}: OptimizedCultivationDashboardProps) {
  const [selectedPractice, setSelectedPractice] =
    useState<PracticeType>("meditation");
  const { character, updateCharacter } = useAuthStore();
  const { addNotification } = useUIStore();
  const { consumeEnergy, energyInfo, canAfford } = useEnergySystem();

  // Queries and mutations - called unconditionally
  const { isLoading } = useCultivationRate(character?.$id || "");

  if (!isActive || !character) return null;

  const handlePractice = async () => {
    if (!character) return;

    try {
      const energyCost = getExpectedEnergyCost(selectedPractice);

      // Use energy system to consume energy
      const result = await consumeEnergy(selectedPractice, energyCost, {
        practiceType: selectedPractice,
        cultivationPath: character.cultivationPath,
      });

      if (!result.success) {
        // Error notification already handled by useEnergySystem
        return;
      }

      // Practice was successful, calculate experience gain
      const expGain = getExpectedExpGain(
        selectedPractice,
        character.cultivationPath
      );

      // Update character optimistically (energy already updated by API)
      const updatedCharacter = {
        ...result.character!,
        experience: character.experience + expGain,
        cultivationProgress: character.cultivationProgress + expGain,
      };

      // Check level up
      if (
        updatedCharacter.cultivationProgress >=
        getExpForNextLevel(character.level)
      ) {
        updatedCharacter.level += 1;
        updatedCharacter.cultivationProgress = 0;
        addNotification({
          type: "success",
          title: "Đột phá thành công!",
          message: `Đạt cấp ${updatedCharacter.level}!`,
        });
      }

      updateCharacter(updatedCharacter);

      addNotification({
        type: "success",
        title: "Tu luyện thành công",
        message: `${getPracticeDisplayName(
          selectedPractice
        )} hoàn thành! +${expGain} EXP`,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Tu luyện thất bại",
        message: "Có lỗi xảy ra trong quá trình tu luyện!",
      });
      console.error("Practice error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Character Stats */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          {getCultivationIcon(character.cultivationPath)}
          {getCultivationPathName(character.cultivationPath)}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">
                {character.realm} - Tầng {character.stage}
              </span>
              <span className="text-sm text-purple-300">
                Cấp {character.level}
              </span>
            </div>
            <Progress
              value={
                (character.cultivationProgress /
                  getExpForNextLevel(character.level)) *
                100
              }
              className="h-2"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Năng Lượng</span>
              <span
                className={`text-sm ${
                  energyInfo?.isLow
                    ? "text-red-300"
                    : energyInfo?.percentage && energyInfo.percentage < 50
                    ? "text-yellow-300"
                    : "text-blue-300"
                }`}
              >
                {character.energy}/{character.maxEnergy}
              </span>
            </div>
            <Progress value={energyInfo?.percentage || 0} className="h-2" />
            {energyInfo?.isLow && (
              <div className="text-xs text-red-400 mt-1">
                ⚠️ Năng lượng thấp! Hồi 10/giờ
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-xs text-gray-400">Sức Mạnh Tâm Linh</div>
            <div className="text-lg font-bold text-red-400">
              {character.spiritualPower}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Sức Mạnh Thể Chất</div>
            <div className="text-lg font-bold text-blue-400">
              {character.physicalPower}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Sức Mạnh Tinh Thần</div>
            <div className="text-lg font-bold text-green-400">
              {character.mentalPower}
            </div>
          </div>
        </div>
      </div>

      {/* Practice Section */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Tu Luyện</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {(["meditation", "training", "alchemy"] as PracticeType[]).map(
            (practice) => (
              <button
                key={practice}
                onClick={() => setSelectedPractice(practice)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedPractice === practice
                    ? "bg-purple-600/20 border-purple-500 text-purple-300"
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <div className="text-sm font-medium">
                  {getPracticeDisplayName(practice)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  +{getExpectedExpGain(practice, character.cultivationPath)} EXP
                </div>
                <div className="text-xs text-red-400">
                  -{getExpectedEnergyCost(practice)} Năng Lượng
                </div>
              </button>
            )
          )}
        </div>

        <Button
          onClick={handlePractice}
          disabled={!canAfford(getExpectedEnergyCost(selectedPractice))}
          className={`w-full transition-all ${
            !canAfford(getExpectedEnergyCost(selectedPractice))
              ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {!canAfford(getExpectedEnergyCost(selectedPractice))
            ? `Cần ${getExpectedEnergyCost(selectedPractice)} năng lượng`
            : `Bắt đầu ${getPracticeDisplayName(selectedPractice)}`}
        </Button>
      </div>

      {/* Additional Stats */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Thống Kê</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-400">Khí</div>
            <div className="text-white font-medium">{character.qi}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Thể Lực</div>
            <div className="text-white font-medium">{character.stamina}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Linh Thạch</div>
            <div className="text-white font-medium">
              {character.spiritStones}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Số Lần Giết</div>
            <div className="text-white font-medium">
              {character.killCount || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCultivationIcon(path: CultivationPath) {
  switch (path) {
    case "qi":
      return <Zap className="w-5 h-5 text-blue-400" />;
    case "body":
      return <Heart className="w-5 h-5 text-red-400" />;
    case "demon":
      return <Flame className="w-5 h-5 text-purple-400" />;
  }
}

function getCultivationPathName(path: CultivationPath): string {
  switch (path) {
    case "qi":
      return "Tu Luyện Khí";
    case "body":
      return "Tu Luyện Thể";
    case "demon":
      return "Ma Đạo Tu Luyện";
  }
}

function getPracticeDisplayName(practice: PracticeType): string {
  switch (practice) {
    case "meditation":
      return "Tịnh Tâm";
    case "training":
      return "Rèn Luyện";
    case "alchemy":
      return "Luyện Đan";
  }
}

function getExpectedExpGain(
  practice: PracticeType,
  path: CultivationPath
): number {
  const baseExp = {
    meditation: 10,
    training: 15,
    alchemy: 8,
  };

  // Path bonuses
  const pathBonus = {
    qi: practice === "meditation" ? 1.5 : 1.0,
    body: practice === "training" ? 1.5 : 1.0,
    demon: practice === "alchemy" ? 1.5 : 1.0,
  };

  return Math.floor(baseExp[practice] * pathBonus[path]);
}

function getExpectedEnergyCost(practice: PracticeType): number {
  switch (practice) {
    case "meditation":
      return 10;
    case "training":
      return 15;
    case "alchemy":
      return 20;
  }
}

function getExpForNextLevel(level: number): number {
  return level * 100 + 50;
}
