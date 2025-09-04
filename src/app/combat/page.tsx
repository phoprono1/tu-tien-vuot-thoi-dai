"use client";

import { useState, useEffect } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import Link from "next/link";
import {
  Swords,
  Trophy,
  Skull,
  User,
  Home,
  Gift,
  X,
  Zap,
  Clock,
} from "lucide-react";

interface Character {
  $id: string;
  name: string;
  level: number;
  realm: string;
  cultivationPath: string;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  agility: number;
}

interface CombatStats {
  characterId: string;
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

interface EnemyStats {
  health: number;
  attack: number;
  defense: number;
  agility: number;
  [key: string]: number;
}

interface Rewards {
  experience: number;
  spirit_stones: number;
}

interface Trial {
  $id: string;
  name: string;
  description: string;
  difficulty: string;
  minLevel: number;
  maxLevel: number;
  minRealm: string;
  maxRealm: string;
  enemyStats: EnemyStats | string; // Object or JSON string
  rewards: Rewards | string; // Object or JSON string
}

interface CombatResult {
  success: boolean;
  winner: "attacker" | "defender";
  combatLog: Array<{
    turn: number;
    attacker: string;
    defender: string;
    action: string;
    damage: number;
    effects: string[];
    attackerHealth: number;
    defenderHealth: number;
  }>;
  rewards?: {
    experience: number;
    spirit_stones: number;
  };
  error?: string;
}

export default function CombatPage() {
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(
    null
  );
  const [currentCombatStats, setCurrentCombatStats] =
    useState<CombatStats | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pve" | "pvp">("pve");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showCombatModal, setShowCombatModal] = useState(false);
  const [currentTrialName, setCurrentTrialName] = useState<string>("");
  const [trialCooldowns, setTrialCooldowns] = useState<{
    [trialId: string]: {
      canCombat: boolean;
      cooldownRemaining: number;
      lastCombatTime?: string;
    };
  }>({});

  const fetchCurrentCharacter = async () => {
    try {
      // Lấy user hiện tại đang đăng nhập
      const currentUser = await account.get();

      // Lấy characters của user này
      const characters = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHARACTERS,
        [Query.equal("userId", currentUser.$id)]
      );

      if (characters.documents.length > 0) {
        // Lấy character đầu tiên của user hiện tại
        const character = characters.documents[0] as unknown as Character;
        setCurrentCharacter(character);

        // Fetch combat stats for this character
        await fetchCombatStats(character.$id);

        // Fetch trial cooldowns for this character
        await fetchTrialCooldowns(character.$id);
      }
    } catch (error) {
      console.error("Error fetching current character:", error);
      // Nếu chưa đăng nhập hoặc có lỗi, có thể redirect về trang chính
    }
  };

  const fetchCombatStats = async (characterId: string) => {
    try {
      const response = await fetch(
        `/api/combat-stats?characterId=${characterId}`
      );
      const data = await response.json();

      if (data.success && data.combatStats) {
        setCurrentCombatStats(data.combatStats);
      }
    } catch (error) {
      console.error("Error fetching combat stats:", error);
    }
  };

  const fetchTrials = async () => {
    try {
      const response = await fetch("/api/trials");
      const data = await response.json();
      if (data.success) {
        setTrials(data.trials);
      }
    } catch (error) {
      console.error("Error fetching trials:", error);
    }
  };

  const fetchTrialCooldowns = async (characterId: string) => {
    try {
      const response = await fetch(
        `/api/combat/cooldown-all?characterId=${characterId}`
      );
      const data = await response.json();
      if (data.success) {
        console.log("Trial cooldowns loaded:", data.cooldowns);
        setTrialCooldowns(data.cooldowns);
      }
    } catch (error) {
      console.error("Error fetching trial cooldowns:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCurrentCharacter(), fetchTrials()]);
      setIsDataLoading(false);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPvECombat = async (trialId: string) => {
    if (!currentCharacter || !trialId) {
      alert("Vui lòng chọn thí luyện!");
      return;
    }

    // Get trial name for display
    const trial = trials.find((t) => t.$id === trialId);
    if (trial) {
      setCurrentTrialName(trial.name);
    }

    // Check cooldown từ state trước
    const cooldownInfo = trialCooldowns[trialId];
    if (cooldownInfo && !cooldownInfo.canCombat) {
      alert(
        `Cần chờ ${cooldownInfo.cooldownRemaining} phút nữa để combat lại!`
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/combat/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attackerId: currentCharacter.$id,
          defenderId: trialId,
          combatType: "pve",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          alert(result.error || "Cần chờ để combat lại");
          // Refresh cooldown data
          if (currentCharacter) {
            await fetchTrialCooldowns(currentCharacter.$id);
          }
        } else {
          alert(result.error || "Có lỗi xảy ra");
        }
        setIsLoading(false);
        return;
      }

      setCombatResult(result);
      setShowCombatModal(true);

      // Refresh cooldown data sau khi combat
      if (currentCharacter) {
        await fetchTrialCooldowns(currentCharacter.$id);
      }
    } catch (error) {
      console.error("Combat error:", error);
      alert("Có lỗi xảy ra khi combat!");
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "normal":
        return "text-blue-500";
      case "hard":
        return "text-orange-500";
      case "extreme":
        return "text-red-500";
      case "nightmare":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header với nút quay lại */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Swords className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            <span className="hidden sm:inline">Arena Chiến Đấu</span>
            <span className="sm:hidden">Combat</span>
          </h1>
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-2 bg-black/20 backdrop-blur-sm border border-gray-600 hover:border-gray-400 text-white px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-lg font-medium transition-all hover:bg-black/30 text-sm sm:text-base"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Trang Chủ</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>

        {isDataLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-white text-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              Đang tải dữ liệu...
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex justify-center mb-4 sm:mb-6 lg:mb-8">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-1 flex w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("pve")}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium transition-all text-sm sm:text-base ${
                    activeTab === "pve"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <span className="hidden sm:inline">PvE - Thí Luyện</span>
                  <span className="sm:hidden">PvE</span>
                </button>
                <button
                  onClick={() => setActiveTab("pvp")}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-md font-medium transition-all text-sm sm:text-base ${
                    activeTab === "pvp"
                      ? "bg-red-600 text-white shadow-lg"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <span className="hidden sm:inline">PvP - Đấu Trường</span>
                  <span className="sm:hidden">PvP</span>
                </button>
              </div>
            </div>

            {activeTab === "pve" && (
              <div className="space-y-6">
                {/* Character Info Bar */}
                {currentCharacter ? (
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                    {/* Mobile layout - stacked vertically */}
                    <div className="block sm:hidden space-y-3">
                      <div className="bg-blue-600/20 border border-blue-400 p-3 rounded-lg text-center">
                        <div className="text-white font-bold text-lg">
                          {currentCharacter.name}
                        </div>
                        <div className="text-xs text-gray-300">
                          Cấp {currentCharacter.level} •{" "}
                          {currentCharacter.realm}
                        </div>
                        <div className="text-xs text-gray-300">
                          {currentCharacter.cultivationPath}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center bg-red-600/20 border border-red-400 rounded-lg p-2">
                          <div className="text-red-400 font-bold">HP</div>
                          <div className="text-white font-bold text-xs leading-tight">
                            {currentCombatStats?.currentHealth || 0}/
                            {currentCombatStats?.maxHealth || 0}
                          </div>
                        </div>
                        <div className="text-center bg-blue-600/20 border border-blue-400 rounded-lg p-2">
                          <div className="text-blue-400 font-bold">MP</div>
                          <div className="text-white font-bold text-xs leading-tight">
                            {currentCharacter.stamina}/
                            {currentCharacter.maxStamina}
                          </div>
                        </div>
                        <div className="text-center bg-orange-600/20 border border-orange-400 rounded-lg p-2">
                          <div className="text-orange-400 font-bold">ATK</div>
                          <div className="text-white font-bold text-xs leading-tight">
                            {currentCharacter.attack}
                          </div>
                        </div>
                        <div className="text-center bg-green-600/20 border border-green-400 rounded-lg p-2">
                          <div className="text-green-400 font-bold">DEF</div>
                          <div className="text-white font-bold text-xs leading-tight">
                            {currentCharacter.defense}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop layout - horizontal */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-600/20 border border-blue-400 p-3 rounded-lg">
                          <div className="text-white font-bold text-lg">
                            {currentCharacter.name}
                          </div>
                          <div className="text-sm text-gray-300">
                            Cấp {currentCharacter.level} •{" "}
                            {currentCharacter.realm} •{" "}
                            {currentCharacter.cultivationPath}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-red-400">HP</div>
                          <div className="text-white font-bold">
                            {currentCombatStats?.currentHealth || 0}/
                            {currentCombatStats?.maxHealth || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400">MP</div>
                          <div className="text-white font-bold">
                            {currentCharacter.stamina}/
                            {currentCharacter.maxStamina}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-orange-400">ATK</div>
                          <div className="text-white font-bold">
                            {currentCharacter.attack}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-400">DEF</div>
                          <div className="text-white font-bold">
                            {currentCharacter.defense}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 text-center">
                    <div className="text-lg text-red-400 mb-2">
                      😴 Không có nhân vật
                    </div>
                    <div className="text-sm text-gray-300 mb-4">
                      Vui lòng tạo nhân vật trước khi chiến đấu!
                    </div>
                    <a
                      href="/admin/characters"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Tạo nhân vật
                    </a>
                  </div>
                )}

                {/* Trials List */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <Swords className="w-5 h-5 sm:w-7 sm:h-7" />
                    <span className="hidden sm:inline">
                      Danh Sách Thí Luyện PvE
                    </span>
                    <span className="sm:hidden">Thí Luyện PvE</span>
                  </h2>

                  {trials?.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {trials.map((trial) => {
                        const cooldownInfo = trialCooldowns[trial.$id];
                        const canCombat =
                          !cooldownInfo || cooldownInfo.canCombat;
                        const cooldownMinutes =
                          cooldownInfo?.cooldownRemaining || 0;

                        return (
                          <div
                            key={trial.$id}
                            className="bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-600 hover:border-gray-500 transition-all"
                          >
                            {/* Mobile Layout - Stacked */}
                            <div className="block sm:hidden space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-white font-bold text-base leading-tight">
                                      {trial.name}
                                    </h3>
                                    <span
                                      className={`text-xs font-bold ${getDifficultyColor(
                                        trial.difficulty
                                      )} bg-black/30 px-2 py-1 rounded`}
                                    >
                                      {trial.difficulty
                                        .slice(0, 4)
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                  {!canCombat && (
                                    <div className="flex items-center gap-1 text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded mb-2 w-fit">
                                      <Clock className="w-3 h-3" />
                                      {cooldownMinutes}p
                                    </div>
                                  )}
                                </div>
                              </div>

                              <p className="text-gray-300 text-xs leading-relaxed">
                                {trial.description}
                              </p>

                              <div className="grid grid-cols-1 gap-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Cấp độ:</span>
                                  <span className="text-white">
                                    {trial.minLevel}-{trial.maxLevel}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Realm:</span>
                                  <span className="text-white">
                                    {trial.minRealm}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Thưởng:</span>
                                  <span className="text-yellow-400 text-xs">
                                    {(() => {
                                      try {
                                        const rewardsData =
                                          typeof trial.rewards === "string"
                                            ? JSON.parse(trial.rewards)
                                            : trial.rewards;
                                        return `${
                                          rewardsData.experience || 0
                                        } EXP, ${
                                          rewardsData.spirit_stones || 0
                                        } LS`;
                                      } catch {
                                        return "0 EXP, 0 LS";
                                      }
                                    })()}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => startPvECombat(trial.$id)}
                                disabled={
                                  !currentCharacter || isLoading || !canCombat
                                }
                                className={`w-full px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 justify-center text-sm ${
                                  !canCombat
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : !currentCharacter
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : isLoading
                                    ? "bg-yellow-600 text-white"
                                    : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                                }`}
                              >
                                {isLoading ? (
                                  <>
                                    <Zap className="w-4 h-4 animate-pulse" />
                                    Đang đấu...
                                  </>
                                ) : !canCombat ? (
                                  <>
                                    <Clock className="w-4 h-4" />
                                    Chờ {cooldownMinutes}p
                                  </>
                                ) : !currentCharacter ? (
                                  "Cần nhân vật"
                                ) : (
                                  <>
                                    <Swords className="w-4 h-4" />
                                    Chiến Đấu
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Desktop Layout - Horizontal */}
                            <div className="hidden sm:flex items-center justify-between">
                              {/* Trial Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-white font-bold text-lg">
                                    {trial.name}
                                  </h3>
                                  <span
                                    className={`text-sm font-bold ${getDifficultyColor(
                                      trial.difficulty
                                    )} bg-black/30 px-2 py-1 rounded`}
                                  >
                                    {trial.difficulty.toUpperCase()}
                                  </span>
                                  {!canCombat && (
                                    <div className="flex items-center gap-1 text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
                                      <Clock className="w-3 h-3" />
                                      {cooldownMinutes}p
                                    </div>
                                  )}
                                </div>

                                <p className="text-gray-300 text-sm mb-2">
                                  {trial.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-gray-400">
                                    Cấp độ: {trial.minLevel}-{trial.maxLevel}
                                  </span>
                                  <span className="text-gray-400">
                                    Realm: {trial.minRealm}
                                  </span>
                                  <span className="text-yellow-400">
                                    Thưởng:{" "}
                                    {(() => {
                                      try {
                                        const rewardsData =
                                          typeof trial.rewards === "string"
                                            ? JSON.parse(trial.rewards)
                                            : trial.rewards;
                                        return `${
                                          rewardsData.experience || 0
                                        } EXP, ${
                                          rewardsData.spirit_stones || 0
                                        } Linh Thạch`;
                                      } catch {
                                        return "0 EXP, 0 Linh Thạch";
                                      }
                                    })()}
                                  </span>
                                </div>
                              </div>

                              {/* Combat Button */}
                              <div className="ml-4">
                                <button
                                  onClick={() => startPvECombat(trial.$id)}
                                  disabled={
                                    !currentCharacter || isLoading || !canCombat
                                  }
                                  className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 min-w-[140px] justify-center ${
                                    !canCombat
                                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                      : !currentCharacter
                                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                      : isLoading
                                      ? "bg-yellow-600 text-white"
                                      : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                                  }`}
                                >
                                  {isLoading ? (
                                    <>
                                      <Zap className="w-4 h-4 animate-pulse" />
                                      Đang đấu...
                                    </>
                                  ) : !canCombat ? (
                                    <>
                                      <Clock className="w-4 h-4" />
                                      {cooldownMinutes}p
                                    </>
                                  ) : !currentCharacter ? (
                                    "Cần nhân vật"
                                  ) : (
                                    <>
                                      <Swords className="w-4 h-4" />
                                      Chiến Đấu
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-12">
                      <Swords className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <div className="text-xl mb-2">🎯 Không có thí luyện</div>
                      <div className="text-sm mb-4">
                        Vui lòng tạo thí luyện trước khi chiến đấu!
                      </div>
                      <a
                        href="/admin/trials"
                        className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Tạo thí luyện
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "pvp" && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 sm:p-8 text-center">
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-4 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
                  <Swords className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="hidden sm:inline">Đấu Trường PvP</span>
                  <span className="sm:hidden">PvP</span>
                </h2>
                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
                  Tính năng PvP đang được phát triển...
                </p>
                <a
                  href="/pvp"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 sm:px-8 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 justify-center text-sm sm:text-base max-w-xs sm:max-w-none mx-auto"
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">
                    Xem Bảng Xếp Hạng PvP
                  </span>
                  <span className="sm:hidden">Bảng Xếp Hạng</span>
                </a>
              </div>
            )}

            {/* Combat Modal */}
            {showCombatModal && combatResult && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-xl p-4 sm:p-8 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-auto">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                      {combatResult.success ? (
                        <>
                          <Swords className="w-6 h-6 sm:w-8 sm:h-8" />
                          <span className="hidden sm:inline">
                            Kết Quả Chiến Đấu
                          </span>
                          <span className="sm:hidden">Kết Quả</span>
                        </>
                      ) : (
                        <>
                          <X className="w-6 h-6 sm:w-8 sm:h-8" />
                          <span className="hidden sm:inline">
                            Lỗi Chiến Đấu
                          </span>
                          <span className="sm:hidden">Lỗi</span>
                        </>
                      )}
                    </h2>
                    <button
                      onClick={() => setShowCombatModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>
                  </div>

                  {combatResult.success ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Winner/Loser Display */}
                      <div className="text-center">
                        <div
                          className={`text-2xl sm:text-4xl font-bold mb-4 animate-bounce flex items-center justify-center gap-2 sm:gap-3 ${
                            combatResult.winner === "attacker"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {combatResult.winner === "attacker" ? (
                            <>
                              <Trophy className="w-8 h-8 sm:w-12 sm:h-12" />
                              <span className="hidden sm:inline">
                                CHIẾN THẮNG!
                              </span>
                              <span className="sm:hidden">THẮNG!</span>
                            </>
                          ) : (
                            <>
                              <Skull className="w-8 h-8 sm:w-12 sm:h-12" />
                              <span className="hidden sm:inline">
                                THẤT BẠI!
                              </span>
                              <span className="sm:hidden">THUA!</span>
                            </>
                          )}
                        </div>

                        {/* Character vs Enemy */}
                        <div className="bg-black/30 rounded-lg p-3 sm:p-4 mb-4">
                          <div className="flex items-center justify-between text-sm sm:text-lg">
                            <div className="text-blue-400 font-bold flex items-center gap-1 sm:gap-2">
                              <User className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="truncate max-w-[100px] sm:max-w-none">
                                {currentCharacter?.name}
                              </span>
                            </div>
                            <div className="text-white font-bold text-xs sm:text-base">
                              VS
                            </div>
                            <div className="text-red-400 font-bold flex items-center gap-1 sm:gap-2">
                              <Skull className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="truncate max-w-[100px] sm:max-w-none">
                                {currentTrialName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rewards */}
                      {combatResult.rewards &&
                        combatResult.winner === "attacker" && (
                          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500 rounded-lg p-4 sm:p-6">
                            <h3 className="text-yellow-400 font-bold text-lg sm:text-xl mb-3 sm:mb-4 flex items-center gap-2">
                              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                              Phần Thưởng
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                              <div className="bg-blue-800/30 rounded-lg p-3 sm:p-4 text-center">
                                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2" />
                                <div className="text-white font-bold text-sm sm:text-base">
                                  + {combatResult.rewards.experience} EXP
                                </div>
                              </div>
                              <div className="bg-purple-800/30 rounded-lg p-3 sm:p-4 text-center">
                                <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mx-auto mb-2" />
                                <div className="text-white font-bold text-sm sm:text-base">
                                  + {combatResult.rewards.spirit_stones}{" "}
                                  <span className="hidden sm:inline">
                                    Linh Thạch
                                  </span>
                                  <span className="sm:hidden">LS</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                          onClick={() => setShowCombatModal(false)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 justify-center"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          Đóng
                        </button>
                        <button
                          onClick={() => {
                            window.location.reload();
                            setShowCombatModal(false);
                          }}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 sm:px-8 py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 justify-center"
                        >
                          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                          Làm Mới
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-red-400 text-base sm:text-lg mb-4">
                        {combatResult.error || "Có lỗi xảy ra trong chiến đấu"}
                      </div>
                      <button
                        onClick={() => setShowCombatModal(false)}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-bold hover:from-red-700 hover:to-red-800 transition-all"
                      >
                        Thử Lại
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
