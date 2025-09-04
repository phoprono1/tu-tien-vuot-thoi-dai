"use client";

import { Swords, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { DatabaseCharacter } from "@/types/database";
import { getRealmDisplayName } from "@/data/realms";
import { useAuthStore } from "@/stores/authStore";
import { useState, useEffect, useCallback } from "react";

interface CombatStats {
  maxHealth: number;
  currentHealth: number;
  maxStamina: number;
  currentStamina: number;
  attack: number;
  defense: number;
  agility: number;
  criticalRate: number;
  counterAttackRate: number;
  multiStrikeRate: number;
  lifeStealRate: number;
  healthRegenRate: number;
  burnRate: number;
  poisonRate: number;
  freezeRate: number;
  stunRate: number;
}

interface CharacterInfoPanelProps {
  character: DatabaseCharacter;
  cultivationRate: {
    baseRate: number;
    totalBonusPercentage: number;
    finalRate: number;
  };
  cultivationPaths: {
    [key: string]: {
      name: string;
      color: string;
      icon: React.ComponentType<{ className?: string }>;
    };
  };
}

export default function CharacterInfoPanel({
  character,
  cultivationRate,
  cultivationPaths,
}: CharacterInfoPanelProps) {
  // Get live character data from auth store
  const { character: liveCharacter } = useAuthStore();
  const [showCultivationDetails, setShowCultivationDetails] = useState(false);
  const [showCombatDetails, setShowCombatDetails] = useState(false);
  const [combatStats, setCombatStats] = useState<CombatStats | null>(null);
  const [loadingCombat, setLoadingCombat] = useState(false);

  // Use live character data if available, fallback to props
  const currentCharacter = liveCharacter || character;

  // Fetch combat stats function
  const fetchCombatStats = useCallback(async () => {
    if (!currentCharacter?.$id) {
      return;
    }

    setLoadingCombat(true);
    try {
      const response = await fetch(
        `/api/combat-stats?characterId=${currentCharacter.$id}`
      );
      const data = await response.json();

      if (data.success) {
        setCombatStats(data.combatStats);
      } else if (response.status === 404) {
        // Combat stats don't exist, let's create them
        console.log(
          "🚀 Combat stats not found, initializing for character:",
          currentCharacter.$id
        );

        try {
          const initResponse = await fetch("/api/combat-stats/initialize", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              characterId: currentCharacter.$id,
            }),
          });

          const initData = await initResponse.json();

          if (initData.success) {
            console.log("✅ Combat stats initialized successfully");
            setCombatStats(initData.combatStats);
          } else {
            console.error(
              "❌ Failed to initialize combat stats:",
              initData.error
            );
          }
        } catch (initError) {
          console.error("❌ Error initializing combat stats:", initError);
        }
      }
    } catch (error) {
      console.error("Error fetching combat stats:", error);
    } finally {
      setLoadingCombat(false);
    }
  }, [currentCharacter?.$id]);

  // Load combat stats when component mounts or character changes
  useEffect(() => {
    // Auto-fetch combat stats when component mounts
    if (currentCharacter?.$id) {
      fetchCombatStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCharacter?.$id]);

  // Debug: log level changes
  // Debug: track combatStats changes
  useEffect(() => {
    // console.log("🔄 Combat Stats Changed:", combatStats);
  }, [combatStats]);

  const currentPath =
    cultivationPaths[
      currentCharacter.cultivationPath as keyof typeof cultivationPaths
    ];

  return (
    <div
      className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 sm:p-6"
      key={`character-${currentCharacter.$id}-${currentCharacter.level}`}
    >
      <div className="text-center mb-4 sm:mb-6">
        <div
          className={`w-12 h-12 sm:w-16 sm:h-16 bg-${currentPath.color}-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}
        >
          <currentPath.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white">
          {currentCharacter.name}
        </h3>
        <div className="text-purple-300 text-xs sm:text-sm">
          {currentPath.name}
        </div>
        <div className="text-gray-400 text-xs sm:text-sm">
          {getRealmDisplayName(currentCharacter.level)}
        </div>
      </div>

      {/* Essential Stats */}
      <div className="space-y-3 sm:space-y-4">
        {/* Clickable Qi Section with Tu vi details */}
        <div>
          <button
            onClick={() => setShowCultivationDetails(!showCultivationDetails)}
            className="w-full text-left hover:bg-gray-700/30 rounded-lg p-2 transition-colors"
          >
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-red-300">Qi</span>
              <div className="flex items-center gap-2">
                <span className="text-white">
                  {currentCharacter.qi.toLocaleString()}
                </span>
                {showCultivationDetails ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs text-gray-400">
                Tu vi: {cultivationRate.finalRate.toFixed(1)}/s
                {cultivationRate.totalBonusPercentage > 0 && (
                  <span className="text-green-400 ml-1">
                    +{cultivationRate.totalBonusPercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-red-500 h-2 rounded-full transition-all animate-pulse" />
            </div>
          </button>

          {/* Expandable Cultivation Details */}
          {showCultivationDetails && (
            <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
              <div className="text-purple-300 font-medium mb-2 text-xs">
                Tốc Độ Tu Vi Chi Tiết
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Cơ bản ({currentPath.name}):
                  </span>
                  <span className="text-gray-300">
                    {cultivationRate.baseRate.toFixed(1)}/s
                  </span>
                </div>
                {cultivationRate.totalBonusPercentage > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Từ công pháp:</span>
                    <span className="text-green-300">
                      +{cultivationRate.totalBonusPercentage.toFixed(1)}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-700 pt-1">
                  <span className="text-white font-medium">Tổng cộng:</span>
                  <span className="text-purple-300 font-medium">
                    {cultivationRate.finalRate.toFixed(1)}/s
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ≈ {(cultivationRate.finalRate * 3600).toLocaleString()}/giờ
                </div>

                {/* Cultivation Path Balance Info */}
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="text-yellow-300 font-medium mb-1 text-xs">
                    Đặc Tính Con Đường
                  </div>
                  {currentCharacter.cultivationPath === "qi" && (
                    <div className="text-xs text-blue-300">
                      🔵 Khí Tu: Đột phá dễ, tốc độ bình thường, combat thấp
                    </div>
                  )}
                  {currentCharacter.cultivationPath === "body" && (
                    <div className="text-xs text-green-300">
                      🟢 Thể Tu: Đột phá trung bình, tốc độ chậm, combat cao
                    </div>
                  )}
                  {currentCharacter.cultivationPath === "demon" && (
                    <div className="text-xs text-red-300">
                      🔴 Ma Tu: Đột phá khó, tốc độ nhanh, combat trung bình
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Other Essential Stats */}
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Stamina:</span>
            <span className="text-yellow-300">{currentCharacter.stamina}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Đá linh:</span>
            <span className="text-blue-300">
              {currentCharacter.spiritStones.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Combat Stats Preview Section */}
      <div className="mt-4 sm:mt-6">
        <div
          onClick={() => setShowCombatDetails(!showCombatDetails)}
          className="w-full text-left hover:bg-gray-700/30 rounded-lg p-2 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-medium text-sm">
                Combat Stats
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  fetchCombatStats();
                }}
                className="p-1 hover:bg-gray-600/50 rounded transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3 h-3 text-gray-400 ${
                    loadingCombat ? "animate-spin" : ""
                  }`}
                />
              </div>
              {showCombatDetails ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Basic Combat Stats Preview */}
          {combatStats ? (
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-red-300">Máu</div>
                <div className="text-white">
                  {combatStats.currentHealth}/{combatStats.maxHealth}
                </div>
              </div>
              <div className="text-center">
                <div className="text-yellow-300">Stamina</div>
                <div className="text-white">
                  {combatStats.currentStamina}/{combatStats.maxStamina}
                </div>
              </div>
              <div className="text-center">
                <div className="text-orange-300">Tấn Công</div>
                <div className="text-white">{combatStats.attack}</div>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-gray-400 text-center">
              {loadingCombat
                ? "Đang tải combat stats..."
                : "Click để tải combat stats"}
            </div>
          )}
        </div>

        {/* Expandable Combat Details */}
        {showCombatDetails && combatStats && (
          <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-600/30">
            {/* Chỉ Số Cơ Bản */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Phòng Thủ:</span>
                  <span className="text-blue-300">{combatStats.defense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Nhanh Nhẹn:</span>
                  <span className="text-green-300">{combatStats.agility}</span>
                </div>
              </div>
            </div>

            {/* Tỷ Lệ Kỹ Năng */}
            <div className="border-t border-gray-700 pt-3">
              <div className="text-purple-300 font-medium mb-2 text-xs">
                Tỷ Lệ Kỹ Năng
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bạo Kích:</span>
                  <span className="text-red-300">
                    {combatStats.criticalRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phản Kích:</span>
                  <span className="text-blue-300">
                    {combatStats.counterAttackRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Liên Kích:</span>
                  <span className="text-yellow-300">
                    {combatStats.multiStrikeRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hút Máu:</span>
                  <span className="text-red-300">
                    {combatStats.lifeStealRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hồi Máu:</span>
                  <span className="text-green-300">
                    {combatStats.healthRegenRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Thiêu Đốt:</span>
                  <span className="text-orange-300">
                    {combatStats.burnRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Độc:</span>
                  <span className="text-purple-300">
                    {combatStats.poisonRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Đóng Băng:</span>
                  <span className="text-cyan-300">
                    {combatStats.freezeRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Làm Choáng:</span>
                  <span className="text-yellow-300">
                    {combatStats.stunRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Build Đề Xuất */}
            <div className="border-t border-gray-700 pt-3 mt-3">
              <div className="text-yellow-300 font-medium mb-2 text-xs">
                Build Đề Xuất
              </div>
              <div className="text-xs text-gray-300">
                {currentCharacter.cultivationPath === "body" &&
                  "Thể Tu Build - Tập trung phòng thủ và sức bền cao"}
                {currentCharacter.cultivationPath === "qi" &&
                  "Khí Tu Build - Cân bằng tốc độ và sát thương"}
                {currentCharacter.cultivationPath === "demon" &&
                  "Ma Tu Build - Tập trung sát thương và hiệu ứng đặc biệt"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Dựa trên con đường tu luyện của bạn
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
