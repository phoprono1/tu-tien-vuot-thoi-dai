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
  const [selectedTrial, setSelectedTrial] = useState<string>("");
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pve" | "pvp">("pve");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showCombatModal, setShowCombatModal] = useState(false);
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

  const startPvECombat = async () => {
    if (!currentCharacter || !selectedTrial) {
      alert("Vui lòng chọn thí luyện!");
      return;
    }

    // Check cooldown từ state trước
    const cooldownInfo = trialCooldowns[selectedTrial];
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
          defenderId: selectedTrial,
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

  const selectedTrialData = trials?.find((t) => t.$id === selectedTrial);

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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Current Character Display */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Nhân Vật Hiện Tại
                  </h2>
                  {currentCharacter ? (
                    <div className="bg-blue-600/20 border-2 border-blue-400 p-4 rounded-lg">
                      <div className="text-white font-medium text-lg">
                        {currentCharacter.name}
                      </div>
                      <div className="text-sm text-gray-300">
                        Cấp {currentCharacter.level} • {currentCharacter.realm}
                      </div>
                      <div className="text-sm text-cyan-400 mb-3">
                        {currentCharacter.cultivationPath}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-red-800/30 p-2 rounded">
                          <div className="text-red-400">Máu</div>
                          <div className="text-white">
                            {currentCombatStats?.currentHealth || 0}/
                            {currentCombatStats?.maxHealth || 0}
                          </div>
                        </div>
                        <div className="bg-blue-800/30 p-2 rounded">
                          <div className="text-blue-400">Thể Lực</div>
                          <div className="text-white">
                            {currentCharacter.stamina}/
                            {currentCharacter.maxStamina}
                          </div>
                        </div>
                        <div className="bg-orange-800/30 p-2 rounded">
                          <div className="text-orange-400">Tấn Công</div>
                          <div className="text-white">
                            {currentCharacter.attack}
                          </div>
                        </div>
                        <div className="bg-green-800/30 p-2 rounded">
                          <div className="text-green-400">Phòng Thủ</div>
                          <div className="text-white">
                            {currentCharacter.defense}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-center bg-purple-800/30 p-2 rounded">
                        <div className="text-purple-400 text-xs">Tử Khí</div>
                        <div className="text-white text-sm">
                          {currentCharacter.agility}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-lg mb-2">😴 Không có nhân vật</div>
                      <div className="text-sm">
                        Vui lòng tạo nhân vật trước khi chiến đấu!
                      </div>
                      <a
                        href="/admin/characters"
                        className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Tạo nhân vật
                      </a>
                    </div>
                  )}
                </div>

                {/* Trial Selection */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Chọn Thí Luyện
                  </h2>
                  <div className="space-y-3">
                    {trials?.length > 0 ? (
                      trials.map((trial) => {
                        const cooldownInfo = trialCooldowns[trial.$id];
                        const canCombat =
                          !cooldownInfo || cooldownInfo.canCombat;
                        const cooldownMinutes =
                          cooldownInfo?.cooldownRemaining || 0;

                        return (
                          <div
                            key={trial.$id}
                            onClick={() =>
                              canCombat && setSelectedTrial(trial.$id)
                            }
                            className={`p-4 rounded-lg transition-all ${
                              selectedTrial === trial.$id && canCombat
                                ? "bg-red-600/50 border-2 border-red-400"
                                : canCombat
                                ? "bg-gray-800/50 border-2 border-transparent hover:border-gray-600 cursor-pointer"
                                : "bg-gray-700/30 border-2 border-gray-600 opacity-60 cursor-not-allowed"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="text-white font-medium">
                                {trial.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`text-sm font-bold ${getDifficultyColor(
                                    trial.difficulty
                                  )}`}
                                >
                                  {trial.difficulty.toUpperCase()}
                                </div>
                                {!canCombat && (
                                  <div className="flex items-center gap-1 text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" />
                                    {cooldownMinutes}p
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-300 mt-1">
                              {trial.description}
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              Yêu cầu: Cấp {trial.minLevel}-{trial.maxLevel} •{" "}
                              {trial.minRealm}
                            </div>
                            <div className="text-xs text-yellow-400 mt-1">
                              Phần thưởng:{" "}
                              {(() => {
                                try {
                                  const rewardsData =
                                    typeof trial.rewards === "string"
                                      ? JSON.parse(trial.rewards)
                                      : trial.rewards;
                                  return `${rewardsData.experience || 0} EXP, ${
                                    rewardsData.spirit_stones || 0
                                  } Linh Thạch`;
                                } catch {
                                  return "0 EXP, 0 Linh Thạch";
                                }
                              })()}
                            </div>
                            {!canCombat && (
                              <div className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Cooldown: {cooldownMinutes} phút nữa
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        <div className="text-lg mb-2">
                          🎯 Không có thí luyện
                        </div>
                        <div className="text-sm">
                          Vui lòng tạo thí luyện trước khi chiến đấu!
                        </div>
                        <a
                          href="/admin/trials"
                          className="inline-block mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Tạo thí luyện
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Combat Actions */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Chiến Đấu
                  </h2>

                  {currentCharacter && selectedTrialData && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Trận Đấu Sắp Tới
                      </h3>
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-400">
                            {currentCharacter.name}
                          </span>
                          <span className="text-white">VS</span>
                          <span className="text-red-400">
                            {selectedTrialData.name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 text-center">
                          Cấp {currentCharacter.level}{" "}
                          {currentCharacter.cultivationPath} vs Thí Luyện{" "}
                          {selectedTrialData.difficulty}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={startPvECombat}
                    disabled={
                      !currentCharacter ||
                      !selectedTrial ||
                      isLoading ||
                      (Boolean(selectedTrial) &&
                        trialCooldowns[selectedTrial] &&
                        !trialCooldowns[selectedTrial].canCombat)
                    }
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-6 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Zap className="w-5 h-5 animate-pulse" />
                        Đang Chiến Đấu...
                      </>
                    ) : selectedTrial &&
                      trialCooldowns[selectedTrial] &&
                      !trialCooldowns[selectedTrial].canCombat ? (
                      <>
                        <Clock className="w-5 h-5" />
                        Cooldown{" "}
                        {trialCooldowns[selectedTrial].cooldownRemaining}p
                      </>
                    ) : (
                      <>
                        <Swords className="w-5 h-5" />
                        Bắt Đầu Chiến Đấu
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "pvp" && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <Swords className="w-8 h-8" />
                  Đấu Trường PvP
                </h2>
                <p className="text-gray-300 mb-6">
                  Tính năng PvP đang được phát triển...
                </p>
                <a
                  href="/pvp"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-8 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 justify-center"
                >
                  <Trophy className="w-5 h-5" />
                  Xem Bảng Xếp Hạng PvP
                </a>
              </div>
            )}

            {/* Combat Modal */}
            {showCombatModal && combatResult && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      {combatResult.success ? (
                        <>
                          <Swords className="w-8 h-8" />
                          Kết Quả Chiến Đấu
                        </>
                      ) : (
                        <>
                          <X className="w-8 h-8" />
                          Lỗi Chiến Đấu
                        </>
                      )}
                    </h2>
                    <button
                      onClick={() => setShowCombatModal(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-8 h-8" />
                    </button>
                  </div>

                  {combatResult.success ? (
                    <div className="space-y-6">
                      {/* Winner/Loser Display */}
                      <div className="text-center">
                        <div
                          className={`text-4xl font-bold mb-4 animate-bounce flex items-center justify-center gap-3 ${
                            combatResult.winner === "attacker"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {combatResult.winner === "attacker" ? (
                            <>
                              <Trophy className="w-12 h-12" />
                              CHIẾN THẮNG!
                            </>
                          ) : (
                            <>
                              <Skull className="w-12 h-12" />
                              THẤT BẠI!
                            </>
                          )}
                        </div>

                        {/* Character vs Enemy */}
                        <div className="bg-black/30 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between text-lg">
                            <div className="text-blue-400 font-bold flex items-center gap-2">
                              <User className="w-5 h-5" />
                              {currentCharacter?.name}
                            </div>
                            <div className="text-white font-bold">VS</div>
                            <div className="text-red-400 font-bold flex items-center gap-2">
                              <Skull className="w-5 h-5" />
                              {
                                trials.find((t) => t.$id === selectedTrial)
                                  ?.name
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rewards */}
                      {combatResult.rewards &&
                        combatResult.winner === "attacker" && (
                          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500 rounded-lg p-6">
                            <h3 className="text-yellow-400 font-bold text-xl mb-4 flex items-center gap-2">
                              <Gift className="w-6 h-6" />
                              Phần Thưởng
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-800/30 rounded-lg p-4 text-center">
                                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <div className="text-white font-bold">
                                  + {combatResult.rewards.experience} EXP
                                </div>
                              </div>
                              <div className="bg-purple-800/30 rounded-lg p-4 text-center">
                                <Gift className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                <div className="text-white font-bold">
                                  + {combatResult.rewards.spirit_stones} Linh
                                  Thạch
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => setShowCombatModal(false)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Đóng
                        </button>
                        <button
                          onClick={() => {
                            window.location.reload();
                            setShowCombatModal(false);
                          }}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
                        >
                          <Home className="w-5 h-5" />
                          Làm Mới
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-red-400 text-lg mb-4">
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
