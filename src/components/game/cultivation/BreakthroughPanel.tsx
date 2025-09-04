"use client";
import React, { useState, useEffect } from "react";
import {
  Zap,
  Shield,
  Heart,
  Star,
  AlertTriangle,
  Crown,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Flame,
} from "lucide-react";
import { DatabaseCharacter } from "@/types/database";
import { useAuthStore } from "@/stores/authStore";

interface BreakthroughPanelProps {
  character: DatabaseCharacter;
  onBreakthroughSuccess?: (newStats: Record<string, string | number>) => void;
}

interface RealmBonuses {
  healthMultiplier: number;
  energyMultiplier: number;
  baseAttackBonus: number;
  baseDefenseBonus: number;
}

interface BreakthroughRequirements {
  level: number;
  qiRequired: number;
  spiritStonesRequired: number;
  tribulationRequired: boolean;
  isRealmBreakthrough: boolean;
}

interface BreakthroughResult {
  success: boolean;
  breakthrough?: boolean;
  tribulationRequired?: boolean;
  tribulationSuccess?: boolean;
  tribulationFailed?: boolean;
  isRealmBreakthrough?: boolean;
  message: string;
  oldLevel?: number;
  newLevel?: number;
  oldRealm?: string;
  newRealm?: string;
  damage?: number;
  newStats?: Record<string, string | number>;
  error?: string;
}

interface BreakthroughInfo {
  characterId: string;
  currentLevel: number;
  currentRealm: {
    name: string;
    stage: number;
    displayName: string;
    description: string;
    dangerLevel: string;
    bonuses: RealmBonuses | null;
  };
  breakthrough: {
    canBreakthrough: boolean;
    requirements: BreakthroughRequirements | null;
    nextRealmName: string | null;
  };
  resources: {
    currentQi: number;
    spiritStones: number;
    health: number;
    maxHealth: number;
  };
}

const BreakthroughPanel: React.FC<BreakthroughPanelProps> = ({
  character,
  onBreakthroughSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [breakthroughInfo, setBreakthroughInfo] =
    useState<BreakthroughInfo | null>(null);
  const [attempting, setAttempting] = useState(false);
  const [result, setResult] = useState<BreakthroughResult | null>(null);

  // Get updateCharacter from auth store
  const { updateCharacter } = useAuthStore();

  // Fetch breakthrough info
  useEffect(() => {
    const fetchBreakthroughInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/breakthrough?characterId=${character.$id}`
        );
        const data = await response.json();

        if (data.success) {
          setBreakthroughInfo(data);
        }
      } catch (error) {
        console.error("Error fetching breakthrough info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakthroughInfo();
  }, [character.$id]);

  // Handle breakthrough attempt
  const handleBreakthrough = async (skipTribulation = false) => {
    if (!breakthroughInfo) return;

    setAttempting(true);
    setResult(null);

    try {
      const response = await fetch("/api/breakthrough", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterId: character.$id,
          skipTribulation,
        }),
      });

      const data = await response.json();
      setResult(data);

      // If successful, refresh data and notify parent
      if (data.success) {
        // Update character in auth store immediately with complete data
        if (data.newStats) {
          const characterUpdates = {
            ...data.newStats,
            // Ensure we also update the level and realm if they're in the response
            ...(data.newLevel && { level: data.newLevel }),
            ...(data.newRealm &&
              data.oldRealm !== data.newRealm && { realm: data.newRealm }),
          };

          updateCharacter(characterUpdates as Partial<DatabaseCharacter>);
        }

        // Refresh breakthrough info
        try {
          const refreshResponse = await fetch(
            `/api/breakthrough?characterId=${character.$id}`
          );
          const refreshData = await refreshResponse.json();

          if (refreshData.success) {
            setBreakthroughInfo(refreshData);
          }
        } catch (error) {
          console.error("Error refreshing breakthrough info:", error);
        }

        onBreakthroughSuccess?.(data.newStats);
      }
    } catch (error) {
      console.error("Error attempting breakthrough:", error);
      setResult({
        success: false,
        message: "Network error",
        error: "Network error",
      });
    } finally {
      setAttempting(false);
    }
  };

  const getDangerColor = (dangerLevel: string) => {
    switch (dangerLevel) {
      case "Low":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "High":
        return "text-orange-400";
      case "Extreme":
        return "text-red-400";
      case "Legendary":
        return "text-purple-400";
      case "Mythical":
        return "text-pink-400";
      default:
        return "text-gray-400";
    }
  };

  const getDangerIcon = (dangerLevel: string) => {
    switch (dangerLevel) {
      case "Low":
        return <Shield className="w-4 h-4" />;
      case "Medium":
        return <AlertTriangle className="w-4 h-4" />;
      case "High":
        return <Flame className="w-4 h-4" />;
      case "Extreme":
        return <Zap className="w-4 h-4" />;
      case "Legendary":
        return <Crown className="w-4 h-4" />;
      case "Mythical":
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!breakthroughInfo) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không thể tải thông tin đột phá
      </div>
    );
  }

  const { currentRealm, breakthrough, resources } = breakthroughInfo;

  return (
    <div className="space-y-6">
      {/* Current Realm Info */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              {currentRealm.displayName}
            </h3>
            <p className="text-purple-300 text-sm mb-2">
              {currentRealm.description}
            </p>
            <div className="flex items-center gap-2">
              {getDangerIcon(currentRealm.dangerLevel)}
              <span
                className={`text-sm font-medium ${getDangerColor(
                  currentRealm.dangerLevel
                )}`}
              >
                {currentRealm.dangerLevel} Risk
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">
              {breakthroughInfo.currentLevel}
            </div>
            <div className="text-sm text-gray-400">Cấp độ hiện tại</div>
          </div>
        </div>

        {/* Current Realm Bonuses */}
        {currentRealm.bonuses && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-black/20 rounded p-3 text-center">
              <Heart className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Máu</div>
              <div className="text-white font-medium">
                ×{currentRealm.bonuses.healthMultiplier}
              </div>
            </div>
            <div className="bg-black/20 rounded p-3 text-center">
              <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Năng lượng</div>
              <div className="text-white font-medium">
                ×{currentRealm.bonuses.energyMultiplier}
              </div>
            </div>
            <div className="bg-black/20 rounded p-3 text-center">
              <TrendingUp className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Công kích</div>
              <div className="text-white font-medium">
                +{currentRealm.bonuses.baseAttackBonus}
              </div>
            </div>
            <div className="bg-black/20 rounded p-3 text-center">
              <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-sm text-gray-400">Phòng thủ</div>
              <div className="text-white font-medium">
                +{currentRealm.bonuses.baseDefenseBonus}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resources Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-medium">Qi</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {resources.currentQi.toLocaleString()}
          </div>
        </div>

        <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-medium">Đá Linh</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {resources.spiritStones.toLocaleString()}
          </div>
        </div>

        <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-medium">Sức khỏe</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {resources.health}/{resources.maxHealth}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{
                width: `${(resources.health / resources.maxHealth) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Breakthrough Section */}
      {breakthrough.canBreakthrough && breakthrough.requirements ? (
        <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-yellow-300">
              Sẵn sàng đột phá!
            </h3>
          </div>

          <div className="mb-4">
            <div className="text-white mb-2">
              <strong>Tiến tới:</strong> {breakthrough.nextRealmName}
            </div>
            <div className="text-sm text-gray-300 mb-4">
              {breakthrough.requirements.isRealmBreakthrough
                ? "Đột phá cảnh giới mới - Sẽ nhận được bonus lớn!"
                : "Đột phá tiểu cảnh trong cùng cảnh giới"}
            </div>
          </div>

          {/* Requirements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black/20 rounded p-3">
              <div className="text-sm text-gray-400 mb-1">Qi cần thiết</div>
              <div
                className={`font-bold ${
                  resources.currentQi >= breakthrough.requirements.qiRequired
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {breakthrough.requirements.qiRequired.toLocaleString()}
              </div>
            </div>

            <div className="bg-black/20 rounded p-3">
              <div className="text-sm text-gray-400 mb-1">Đá linh cần</div>
              <div
                className={`font-bold ${
                  resources.spiritStones >=
                  breakthrough.requirements.spiritStonesRequired
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {breakthrough.requirements.spiritStonesRequired.toLocaleString()}
              </div>
            </div>

            <div className="bg-black/20 rounded p-3">
              <div className="text-sm text-gray-400 mb-1">Thiên kiếp</div>
              <div
                className={`font-bold ${
                  breakthrough.requirements.tribulationRequired
                    ? "text-orange-400"
                    : "text-green-400"
                }`}
              >
                {breakthrough.requirements.tribulationRequired ? "Có" : "Không"}
              </div>
            </div>

            <div className="bg-black/20 rounded p-3">
              <div className="text-sm text-gray-400 mb-1">Loại đột phá</div>
              <div
                className={`font-bold ${
                  breakthrough.requirements.isRealmBreakthrough
                    ? "text-purple-400"
                    : "text-blue-400"
                }`}
              >
                {breakthrough.requirements.isRealmBreakthrough
                  ? "Cảnh giới"
                  : "Tiểu cảnh"}
              </div>
            </div>
          </div>

          {/* Realm Breakthrough Bonus Preview */}
          {breakthrough.requirements.isRealmBreakthrough && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-yellow-300">
                  Đột Phá Cảnh Giới!
                </span>
              </div>
              <p className="text-sm text-yellow-200 mb-3">
                Đây là đột phá lên cảnh giới mới! Bạn sẽ nhận được bonus lớn.
              </p>

              <div className="text-xs space-y-1">
                <div className="text-yellow-300 mb-1">
                  Bonus combat theo con đường:
                </div>
                {character.cultivationPath === "qi" && (
                  <div className="text-blue-300">
                    🔵 Khí Tu: Tăng combat thấp (60% chuẩn)
                  </div>
                )}
                {character.cultivationPath === "body" && (
                  <div className="text-green-300">
                    🟢 Thể Tu: Tăng combat cao (140% chuẩn)
                  </div>
                )}
                {character.cultivationPath === "demon" && (
                  <div className="text-red-300">
                    🔴 Ma Tu: Tăng combat trung bình (100% chuẩn)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tribulation Warning */}
          {breakthrough.requirements.tribulationRequired && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-bold text-red-300">
                  Cảnh báo Thiên Kiếp!
                </span>
              </div>
              <p className="text-sm text-red-200 mb-3">
                Đột phá này yêu cầu vượt qua thiên kiếp. Thất bại sẽ gây thương
                tích nặng và mất tài nguyên.
              </p>

              {/* Path-specific tribulation difficulty */}
              <div className="mb-3">
                <div className="text-xs text-red-300 mb-1">
                  Độ khó theo con đường:
                </div>
                <div className="text-xs space-y-1">
                  {character.cultivationPath === "qi" && (
                    <div className="text-blue-300">
                      🔵 Khí Tu: Thiên kiếp dễ nhất (-30% khó)
                    </div>
                  )}
                  {character.cultivationPath === "body" && (
                    <div className="text-green-300">
                      🟢 Thể Tu: Thiên kiếp trung bình (bình thường)
                    </div>
                  )}
                  {character.cultivationPath === "demon" && (
                    <div className="text-red-300">
                      🔴 Ma Tu: Thiên kiếp khó nhất (+40% khó)
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-red-300">
                Kháng kiếp hiện tại: {character.tribulationResistance || 0} (-
                {((character.tribulationResistance || 0) * 2).toFixed(1)}% khó)
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => handleBreakthrough(false)}
              disabled={attempting}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              {attempting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang đột phá...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Đột Phá
                </>
              )}
            </button>

            {breakthrough.requirements.tribulationRequired && (
              <button
                onClick={() => handleBreakthrough(true)}
                disabled={attempting}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                title="Bỏ qua thiên kiếp (cheat mode)"
              >
                <Clock className="w-4 h-4" />
                Bỏ qua
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900/40 border border-gray-500/30 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-300 mb-2">
            Chưa thể đột phá
          </h3>
          <p className="text-gray-400 mb-4">
            Bạn cần thêm tài nguyên để có thể đột phá lên cấp độ tiếp theo.
          </p>

          {breakthrough.requirements && (
            <div className="text-sm text-gray-500">
              <div>
                Cần: {breakthrough.requirements.qiRequired.toLocaleString()} Qi
              </div>
              <div>
                Cần:{" "}
                {breakthrough.requirements.spiritStonesRequired.toLocaleString()}{" "}
                Đá linh
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div
          className={`border rounded-lg p-6 ${
            result.success
              ? "bg-green-900/20 border-green-500/30"
              : "bg-red-900/20 border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400" />
            )}
            <h3
              className={`text-lg font-bold ${
                result.success ? "text-green-300" : "text-red-300"
              }`}
            >
              {result.success ? "Đột phá thành công!" : "Đột phá thất bại!"}
            </h3>
          </div>

          <p className="text-white mb-4">{result.message}</p>

          {result.success && result.isRealmBreakthrough && (
            <div className="bg-black/20 rounded p-4 mb-4">
              <div className="text-yellow-300 font-bold mb-2">
                🎉 Đã tiến vào cảnh giới mới!
              </div>
              <div className="text-sm text-gray-300">
                <div>
                  Từ: {result.oldRealm} → {result.newRealm}
                </div>
                <div>
                  Cấp: {result.oldLevel} → {result.newLevel}
                </div>
              </div>
            </div>
          )}

          {!result.success && result.tribulationFailed && (
            <div className="bg-red-800/20 rounded p-4">
              <div className="text-red-300 text-sm">
                <div>Sát thương: {result.damage}</div>
                <div>Qi mất: {result.newStats?.qi}</div>
                <div>Kháng kiếp: +1</div>
              </div>
            </div>
          )}

          <button
            onClick={() => setResult(null)}
            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-all"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default BreakthroughPanel;
