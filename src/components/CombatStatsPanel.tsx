import { useEffect, useState, useCallback } from "react";
import {
  Shield,
  Sword,
  Zap,
  Heart,
  Battery,
  Target,
  RotateCcw,
  Repeat,
  Users,
  Plus,
  Flame,
  Droplet,
  Snowflake,
  ZapOff,
} from "lucide-react";
import { DatabaseCharacter } from "@/types/database";
import { CombatStats } from "@/types/combat";
import {
  calculateBaseCombatStats,
  getRecommendedBuild,
} from "@/utils/combatCalculations";
import { useAPICache } from "@/hooks/useOptimization";

interface CombatStatsPanelProps {
  character: DatabaseCharacter;
  onStatsUpdate?: (stats: CombatStats) => void;
}

export default function CombatStatsPanel({
  character,
  onStatsUpdate,
}: CombatStatsPanelProps) {
  const [combatStats, setCombatStats] = useState<CombatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learnedSkills, setLearnedSkills] = useState<
    Array<{ skillBookId: string; element: string }>
  >([]);

  const loadCombatStats = useCallback(async () => {
    try {
      console.log("Loading combat stats for character:", character.$id);

      // Try to get existing combat stats with caching
      const response = await fetch(
        `/api/combat-stats?characterId=${character.$id}`
      );

      console.log("Combat stats response status:", response.status);

      if (response.ok) {
        const stats = await response.json();
        console.log("Combat stats loaded successfully:", stats);
        setCombatStats(stats);
        onStatsUpdate?.(stats);
        setError(null);
      } else {
        const errorData = await response.text();
        console.log("Combat stats not found, error:", errorData);
        setError(`Failed to load: ${errorData}`);

        // Create new combat stats if none exist
        console.log("Creating new combat stats for character:", character);
        const newStats = calculateBaseCombatStats(character);
        console.log("New stats calculated:", newStats);

        const createResponse = await fetch("/api/combat-stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStats),
        });

        console.log("Create response status:", createResponse.status);

        if (createResponse.ok) {
          const createdStats = await createResponse.json();
          console.log("Combat stats created successfully:", createdStats);
          setCombatStats(createdStats);
          onStatsUpdate?.(createdStats);
          setError(null);
        } else {
          const createError = await createResponse.text();
          console.error("Failed to create combat stats:", createError);
          setError(`Failed to create: ${createError}`);
        }
      }
    } catch (error) {
      console.error("Error loading combat stats:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [character, onStatsUpdate]); // Include full character object

  // Cache learned skills data
  const learnedSkillsFetcher = useCallback(async () => {
    const response = await fetch(
      `/api/learned-skills?characterId=${character.$id}`
    );
    if (!response.ok) {
      throw new Error("Failed to load learned skills");
    }
    return response.json();
  }, [character.$id]);

  const { getCachedData: getCachedLearnedSkills } = useAPICache(
    `learned-skills-${character.$id}`,
    learnedSkillsFetcher,
    { cacheTime: 30000 } // 30 seconds cache
  );

  const loadLearnedSkills = useCallback(async () => {
    try {
      const skills = await getCachedLearnedSkills();
      setLearnedSkills(skills);
    } catch (error) {
      console.error("Error loading learned skills:", error);
    }
  }, [getCachedLearnedSkills]);

  useEffect(() => {
    loadCombatStats();
    loadLearnedSkills();
  }, [loadCombatStats, loadLearnedSkills]);

  const handleRegenerateStats = async () => {
    if (!combatStats) return;

    try {
      const newBaseStats = calculateBaseCombatStats(character);
      const updatedStats = {
        ...newBaseStats,
        $id: combatStats.$id,
        currentHealth: Math.min(
          combatStats.currentHealth,
          newBaseStats.maxHealth
        ),
        currentStamina: Math.min(
          combatStats.currentStamina,
          newBaseStats.maxStamina
        ),
      };

      const response = await fetch(`/api/combat-stats/${combatStats.$id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStats),
      });

      if (response.ok) {
        const updated = await response.json();
        setCombatStats(updated);
        onStatsUpdate?.(updated);
      }
    } catch (error) {
      console.error("Error regenerating stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Combat Stats</h2>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-2">Đang tải Combat Stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-red-400" />
          <h2 className="text-xl font-bold text-white">Combat Stats</h2>
        </div>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400 font-medium">Lỗi khi tải Combat Stats</p>
          <p className="text-red-300 text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              loadCombatStats();
            }}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!combatStats) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Combat Stats</h2>
        </div>
        <p className="text-yellow-400">Combat Stats chưa được tạo</p>
        <button
          onClick={loadCombatStats}
          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          Tạo Combat Stats
        </button>
      </div>
    );
  }

  const recommendedBuild = getRecommendedBuild(learnedSkills);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Combat Stats</h2>
        </div>
        <button
          onClick={handleRegenerateStats}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm flex items-center gap-2"
          title="Cập nhật stats theo level hiện tại"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Core Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-gray-300 text-sm">Máu</span>
          </div>
          <div className="text-white font-bold">
            {combatStats.currentHealth}/{combatStats.maxHealth}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{
                width: `${
                  (combatStats.currentHealth / combatStats.maxHealth) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">Stamina</span>
          </div>
          <div className="text-white font-bold">
            {combatStats.currentStamina}/{combatStats.maxStamina}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div
              className="bg-yellow-500 h-2 rounded-full"
              style={{
                width: `${
                  (combatStats.currentStamina / combatStats.maxStamina) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sword className="w-4 h-4 text-orange-400" />
            <span className="text-gray-300 text-sm">Tấn Công</span>
          </div>
          <div className="text-white font-bold">{combatStats.attack}</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 text-sm">Phòng Thủ</span>
          </div>
          <div className="text-white font-bold">{combatStats.defense}</div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="text-gray-300 text-sm">Nhanh Nhẹn</span>
          </div>
          <div className="text-white font-bold">{combatStats.agility}</div>
        </div>
      </div>

      {/* Skill Rates */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Tỷ Lệ Kỹ Năng
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-red-400" />
              <span className="text-gray-300 text-sm">Bạo Kích</span>
            </div>
            <div className="text-white font-bold">
              {combatStats.criticalRate}%
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300 text-sm">Phản Kích</span>
            </div>
            <div className="text-white font-bold">
              {combatStats.counterAttackRate}%
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Repeat className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300 text-sm">Liên Kích</span>
            </div>
            <div className="text-white font-bold">
              {combatStats.multiStrikeRate}%
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-red-500" />
              <span className="text-gray-300 text-sm">Hút Máu</span>
            </div>
            <div className="text-white font-bold">
              {combatStats.lifeStealRate}%
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-4 h-4 text-green-400" />
              <span className="text-gray-300 text-sm">Hồi Máu</span>
            </div>
            <div className="text-white font-bold">
              {combatStats.healthRegenRate}%
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-gray-300 text-sm">Thiêu Đốt</span>
            </div>
            <div className="text-white font-bold">{combatStats.burnRate}%</div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Droplet className="w-4 h-4 text-green-500" />
              <span className="text-gray-300 text-sm">Độc</span>
            </div>
            <div className="text-white font-bold">
              {combatStats.poisonRate}%
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Snowflake className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 text-sm">Đóng Băng</span>
            </div>
            <div className="text-white font-bold">
              {combatStats.freezeRate}%
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-3 col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <ZapOff className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300 text-sm">Làm Choáng</span>
            </div>
            <div className="text-white font-bold">{combatStats.stunRate}%</div>
          </div>
        </div>
      </div>

      {/* Recommended Build */}
      <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-2">Build Đề Xuất</h3>
        <p className="text-purple-200 text-sm">{recommendedBuild}</p>
        <div className="mt-2 text-xs text-purple-300">
          Dựa trên {learnedSkills.length} skill đã học
        </div>
      </div>
    </div>
  );
}
