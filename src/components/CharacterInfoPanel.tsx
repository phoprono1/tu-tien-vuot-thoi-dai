"use client";

import { Swords, Package, Clock } from "lucide-react";
import { DatabaseCharacter } from "@/types/database";
import { getRealmDisplayName } from "@/data/realms";

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
  onShowModal: (modal: string) => void;
}

export default function CharacterInfoPanel({
  character,
  cultivationRate,
  cultivationPaths,
  onShowModal,
}: CharacterInfoPanelProps) {
  const currentPath =
    cultivationPaths[
      character.cultivationPath as keyof typeof cultivationPaths
    ];

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 sm:p-6">
      <div className="text-center mb-4 sm:mb-6">
        <div
          className={`w-12 h-12 sm:w-16 sm:h-16 bg-${currentPath.color}-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}
        >
          <currentPath.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white">
          {character.name}
        </h3>
        <div className="text-purple-300 text-xs sm:text-sm">
          {currentPath.name}
        </div>
        <div className="text-gray-400 text-xs sm:text-sm">
          {getRealmDisplayName(character.level)}
        </div>
      </div>

      {/* Essential Stats Only */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-red-300">Qi</span>
            <span className="text-white">{character.qi.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Tu vi:</span>
              <span className="sm:hidden">TL:</span>{" "}
              {cultivationRate.finalRate.toFixed(1)}/s
            </div>
            {cultivationRate.totalBonusPercentage > 0 && (
              <span className="text-green-400 text-xs">
                +{cultivationRate.totalBonusPercentage.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
            <div className="bg-red-500 h-2 rounded-full transition-all animate-pulse" />
          </div>
        </div>

        <div className="mt-4 sm:mt-6 space-y-1 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Qi:</span>
            <span className="text-green-300">
              {character.qi.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Stamina:</span>
            <span className="text-yellow-300">{character.stamina}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Đá linh:</span>
            <span className="text-blue-300">
              {character.spiritStones.toLocaleString()}
            </span>
          </div>

          {/* Detailed Cultivation Rate */}
          <div className="border-t border-gray-600 pt-2 mt-4">
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
              <div className="text-xs text-gray-500 mt-1">
                ≈ {(cultivationRate.finalRate * 3600).toLocaleString()}
                /giờ
              </div>

              {/* Cultivation Path Balance Info */}
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="text-yellow-300 font-medium mb-1 text-xs">
                  Đặc Tính Con Đường
                </div>
                {character.cultivationPath === "qi" && (
                  <div className="text-xs text-blue-300">
                    🔵 Khí Tu: Đột phá dễ, tốc độ bình thường, combat thấp
                  </div>
                )}
                {character.cultivationPath === "body" && (
                  <div className="text-xs text-green-300">
                    🟢 Thể Tu: Đột phá trung bình, tốc độ chậm, combat cao
                  </div>
                )}
                {character.cultivationPath === "demon" && (
                  <div className="text-xs text-red-300">
                    🔴 Ma Tu: Đột phá khó, tốc độ nhanh, combat trung bình
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Buttons */}
      <div className="mt-4 sm:mt-6 space-y-2">
        <button
          onClick={() => onShowModal("combat")}
          className="w-full p-2 sm:p-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 hover:from-red-600/30 hover:to-orange-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-red-300 font-medium text-sm">
                Combat Stats
              </div>
              <div className="text-gray-400 text-xs">Sức mạnh chiến đấu</div>
            </div>
            <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
          </div>
        </button>

        <button
          onClick={() => onShowModal("skills")}
          className="w-full p-2 sm:p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-300 font-medium">Skill Books</div>
              <div className="text-gray-400 text-xs">Học võ công mới</div>
            </div>
            <Package className="w-5 h-5 text-blue-400" />
          </div>
        </button>
      </div>
    </div>
  );
}
