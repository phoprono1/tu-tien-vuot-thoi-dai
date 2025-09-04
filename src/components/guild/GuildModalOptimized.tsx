"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useGuildStore } from "@/stores/guildStore";
import {
  useGuilds,
  useGuildMembership,
  useGuildMembers,
  useCreateGuild,
  useJoinGuild,
  useClaimDailyReward,
  useCharacters,
  useAddContribution,
  useUpgradeGuild,
} from "@/hooks/useGuild";

interface Character {
  $id: string;
  name: string;
  level: number;
  spiritStones: number;
  cultivationPath: string;
}

interface DatabaseCharacter extends Character {
  realm: string;
  stage: number;
  qi: number;
  energy: number;
  maxEnergy: number;
}

interface ExtendedGuild {
  $id: string;
  name: string;
  leaderId: string;
  level?: number;
  treasuryFunds?: number;
  maxMembers?: number;
  dailyReward?: number;
  description: string;
}

interface GuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null;
}

interface CreateGuildForm {
  name: string;
  description: string;
}

export default function GuildModal({
  isOpen,
  onClose,
  character,
}: GuildModalProps) {
  const { user } = useAuthStore();
  const { guilds, currentGuild, guildMembers, userMembership, error } =
    useGuildStore();

  // Queries
  const { isLoading: isLoadingGuilds } = useGuilds();
  const { isLoading: isLoadingMembership } = useGuildMembership(character?.$id);
  useGuildMembers(currentGuild?.$id);

  // Get character names for guild members
  const characterIds = guildMembers.map((member) => member.characterId);
  const { data: charactersData } = useCharacters(characterIds);

  // Helper function to get character info including realm
  const getCharacterInfo = (characterId: string) => {
    const character = charactersData?.characters?.find(
      (c) => c.$id === characterId
    ) as DatabaseCharacter | undefined;

    console.log("Character data for", characterId, ":", character);

    if (character) {
      // If no realm or realm is empty, use level-based display
      const hasValidRealm = character.realm && character.realm !== "Unknown";

      return {
        name: character.name,
        realm: hasValidRealm ? character.realm : `Cấp ${character.level}`,
        stage: hasValidRealm ? character.stage || 0 : 0,
        level: character.level || 0,
        displayRealm: hasValidRealm,
      };
    }

    return {
      name: characterId,
      realm: "Loading...",
      stage: 0,
      level: 0,
      displayRealm: false,
    };
  };

  // Mutations
  const createGuildMutation = useCreateGuild();
  const joinGuildMutation = useJoinGuild();
  const claimRewardMutation = useClaimDailyReward();
  const addContributionMutation = useAddContribution();
  const upgradeGuildMutation = useUpgradeGuild();

  // Local state
  const [activeTab, setActiveTab] = useState<
    "list" | "create" | "manage" | "contribution"
  >("list");
  const [createForm, setCreateForm] = useState<CreateGuildForm>({
    name: "",
    description: "",
  });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [contributionAmount, setContributionAmount] = useState<number>(1000);

  // Set active tab to manage if user has membership
  React.useEffect(() => {
    if (userMembership && currentGuild) {
      setActiveTab("manage");
    }
  }, [userMembership, currentGuild]);

  if (!isOpen) return null;

  const canCreateGuild =
    character && character.level >= 31 && character.spiritStones >= 10000;

  const isLoading =
    isLoadingGuilds ||
    isLoadingMembership ||
    createGuildMutation.isPending ||
    joinGuildMutation.isPending ||
    claimRewardMutation.isPending ||
    upgradeGuildMutation.isPending;

  const createGuild = async () => {
    if (!character || !user) return;

    // Clear previous errors
    setErrorMessage("");

    // Kiểm tra điều kiện
    if (character.level < 31) {
      setErrorMessage("Cần đạt ít nhất cấp 31 để tạo bang phái");
      return;
    }

    if (character.spiritStones < 10000) {
      setErrorMessage("Cần ít nhất 10,000 linh thạch để tạo bang phái");
      return;
    }

    if (!createForm.name.trim()) {
      setErrorMessage("Vui lòng nhập tên bang phái");
      return;
    }

    try {
      const result = await createGuildMutation.mutateAsync({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        characterId: character.$id,
        characterLevel: character.level,
        spiritStones: character.spiritStones,
      });

      if (result.success) {
        setActiveTab("manage");
        setCreateForm({ name: "", description: "" });
        setErrorMessage("");
        // Refresh character data để cập nhật spiritStones
        window.location.reload(); // Temporary solution
      }
    } catch (error: unknown) {
      console.error("Error creating guild:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage?.includes("đã tồn tại") ||
        errorMessage?.includes("already exists")
      ) {
        setErrorMessage("Tên bang phái đã tồn tại, vui lòng chọn tên khác");
      } else {
        setErrorMessage("Có lỗi xảy ra khi tạo bang phái");
      }
    }
  };

  const joinGuild = async (guildId: string) => {
    if (!character) return;

    try {
      setErrorMessage("");
      const result = await joinGuildMutation.mutateAsync({
        guildId: guildId,
        characterId: character.$id,
      });

      if (result.success) {
        setSuccessMessage("🎉 Gia nhập bang phái thành công!");
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
        window.location.reload(); // Temporary solution để cập nhật character
      }
    } catch (error) {
      console.error("Error joining guild:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMessage);
    }
  };

  // Calculate upgrade cost based on level - match backend costs
  const getUpgradeCost = (level: number) => {
    const UPGRADE_COSTS: { [key: number]: number } = {
      1: 0, // Level 1 (start)
      2: 100000, // 100k linh thạch
      3: 250000, // 250k linh thạch
      4: 500000, // 500k linh thạch
      5: 1000000, // 1M linh thạch
      6: 2000000, // 2M linh thạch
      7: 5000000, // 5M linh thạch
      8: 10000000, // 10M linh thạch
      9: 25000000, // 25M linh thạch
      10: 50000000, // 50M linh thạch (max level)
    };
    return UPGRADE_COSTS[level + 1] || 0;
  };

  const upgradeGuild = async () => {
    if (!currentGuild || !character) return;

    const currentLevel = currentGuild.level || 1;
    const upgradeCost = getUpgradeCost(currentLevel);
    const treasuryFunds = (currentGuild as ExtendedGuild).treasuryFunds || 0;

    // Check if guild has enough funds
    if (treasuryFunds < upgradeCost) {
      setErrorMessage(
        `Không đủ linh thạch chung để nâng cấp! Cần: ${upgradeCost.toLocaleString()}, Có: ${treasuryFunds.toLocaleString()}`
      );
      return;
    }

    try {
      setErrorMessage("");
      const result = await upgradeGuildMutation.mutateAsync({
        guildId: currentGuild.$id,
        characterId: character.$id,
      });

      if (result.success) {
        setSuccessMessage(
          `🎉 Nâng cấp bang phái thành công! Cấp mới: ${result.newLevel}`
        );
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error upgrading guild:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMessage);
    }
  };

  const claimDailyReward = async () => {
    if (!currentGuild || !userMembership || !character) return;

    try {
      setErrorMessage("");
      const result = await claimRewardMutation.mutateAsync({
        characterId: character.$id,
      });

      if (result.success) {
        setSuccessMessage(
          `🎉 Đã nhận ${result.reward?.toLocaleString()} linh thạch!`
        );
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrorMessage(result.error || "Không thể nhận bổng lộc");
      }
    } catch (error: unknown) {
      console.error("Error claiming reward:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMessage);
    }
  };

  // Check if user has already claimed daily reward today
  const hasClaimedDailyReward = () => {
    if (!userMembership?.lastDailyRewardClaim) return false;

    const lastClaimDate = new Date(userMembership.lastDailyRewardClaim);
    const today = new Date();

    // Check if last claim was today
    return (
      lastClaimDate.getDate() === today.getDate() &&
      lastClaimDate.getMonth() === today.getMonth() &&
      lastClaimDate.getFullYear() === today.getFullYear()
    );
  };

  const addContribution = async () => {
    if (!character || !contributionAmount || contributionAmount <= 0) return;

    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await addContributionMutation.mutateAsync({
        characterId: character.$id,
        amount: contributionAmount,
      });

      if (result.success) {
        const detailedMessage = `${result.message} | 💰 Linh thạch còn lại: ${
          result.characterSpiritStones?.toLocaleString() || "N/A"
        }`;
        setSuccessMessage(detailedMessage);
        setContributionAmount(1000); // Reset to default

        // Auto clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(result.error || "Không thể thêm cống hiến");
      }
    } catch (error: unknown) {
      console.error("Error adding contribution:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setErrorMessage(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 rounded-lg border-2 border-yellow-600/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-yellow-600/30 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-yellow-100">⚔️ Bang Phái</h2>
            {currentGuild && (
              <div className="text-yellow-200">
                <span className="text-lg font-semibold">
                  {currentGuild.name}
                </span>
                <span className="ml-2 text-sm">(Cấp {currentGuild.level})</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-yellow-200 hover:text-white text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                activeTab === "list"
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-800/30 text-yellow-200 hover:bg-yellow-700/50"
              }`}
            >
              Danh Sách Bang
            </button>
            {!currentGuild && (
              <button
                onClick={() => setActiveTab("create")}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === "create"
                    ? "bg-yellow-600 text-white"
                    : "bg-yellow-800/30 text-yellow-200 hover:bg-yellow-700/50"
                }`}
              >
                Tạo Bang Phái
              </button>
            )}
            {currentGuild && (
              <button
                onClick={() => setActiveTab("manage")}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === "manage"
                    ? "bg-yellow-600 text-white"
                    : "bg-yellow-800/30 text-yellow-200 hover:bg-yellow-700/50"
                }`}
              >
                Quản Lý Bang
              </button>
            )}
            {currentGuild && (
              <button
                onClick={() => setActiveTab("contribution")}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  activeTab === "contribution"
                    ? "bg-yellow-600 text-white"
                    : "bg-yellow-800/30 text-yellow-200 hover:bg-yellow-700/50"
                }`}
              >
                Cống Hiến Bang
              </button>
            )}
          </div>

          {/* Content */}
          {activeTab === "list" && (
            <div>
              <h3 className="text-xl font-bold text-yellow-100 mb-4">
                Danh Sách Bang Phái
              </h3>
              {isLoading ? (
                <div className="text-yellow-200">Đang tải...</div>
              ) : guilds.length === 0 ? (
                <div className="text-yellow-200">
                  Chưa có bang phái nào được thành lập
                </div>
              ) : (
                <div className="space-y-4">
                  {guilds.map((guild) => (
                    <div
                      key={guild.$id}
                      className="bg-yellow-800/20 rounded border border-yellow-600/30 p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-yellow-100">
                            {guild.name}
                          </h4>
                          <p className="text-yellow-200 text-sm mb-2">
                            {guild.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-yellow-300">
                              📊 Cấp:{" "}
                              <span className="text-yellow-100">
                                {guild.level}
                              </span>
                            </div>
                            <div className="text-yellow-300">
                              👥 Thành viên:{" "}
                              <span className="text-yellow-100">
                                {guild.memberCount}/{guild.maxMembers}
                              </span>
                            </div>
                            <div className="text-yellow-300">
                              ⚡ Buff tu vi:{" "}
                              <span className="text-yellow-100">
                                +
                                {((guild.cultivationBonus - 1) * 100).toFixed(
                                  0
                                )}
                                %
                              </span>
                            </div>
                            <div className="text-yellow-300">
                              💎 Bổng lộc:{" "}
                              <span className="text-yellow-100">
                                {guild.dailyReward.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!currentGuild &&
                          guild.memberCount < guild.maxMembers && (
                            <button
                              onClick={() => joinGuild(guild.$id)}
                              disabled={isLoading}
                              className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50"
                            >
                              Gia Nhập
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "create" && (
            <div>
              <h3 className="text-xl font-bold text-yellow-100 mb-4">
                Tạo Bang Phái
              </h3>

              <div className="bg-yellow-800/20 rounded border border-yellow-600/30 p-4 mb-6">
                <h4 className="text-lg font-medium text-yellow-100 mb-2">
                  Điều kiện tạo bang:
                </h4>
                <ul className="space-y-2 text-yellow-200">
                  <li
                    className={
                      character?.level && character.level >= 31
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    ✓ Cấp độ: {character?.level || 0}/31
                  </li>
                  <li
                    className={
                      character?.spiritStones && character.spiritStones >= 10000
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    ✓ Linh thạch:{" "}
                    {character?.spiritStones?.toLocaleString() || 0}/10,000
                  </li>
                </ul>
              </div>

              {canCreateGuild ? (
                <div className="space-y-4">
                  {errorMessage && (
                    <div className="bg-red-900/50 border border-red-600 text-red-200 p-3 rounded">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-yellow-200 font-medium mb-2">
                      Tên Bang Phái
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                      className="w-full p-3 rounded bg-yellow-900/30 border border-yellow-600/50 text-yellow-100 placeholder-yellow-400"
                      placeholder="Nhập tên bang phái..."
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-yellow-200 font-medium mb-2">
                      Mô tả (không bắt buộc)
                    </label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded bg-yellow-900/30 border border-yellow-600/50 text-yellow-100 placeholder-yellow-400"
                      placeholder="Mô tả về bang phái..."
                      rows={3}
                      maxLength={200}
                    />
                  </div>
                  <button
                    onClick={createGuild}
                    disabled={isLoading || !createForm.name.trim()}
                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded transition-colors disabled:opacity-50"
                  >
                    {isLoading
                      ? "Đang tạo..."
                      : "Tạo Bang Phái (10,000 Linh Thạch)"}
                  </button>
                </div>
              ) : (
                <div className="text-yellow-200 text-center py-8">
                  Bạn chưa đủ điều kiện để tạo bang phái
                </div>
              )}
            </div>
          )}

          {activeTab === "manage" && currentGuild && (
            <div>
              <h3 className="text-xl font-bold text-yellow-100 mb-4">
                👑 Quản Lý Bang Phái
              </h3>

              {/* Guild Info */}
              <div className="bg-yellow-800/20 rounded border border-yellow-600/30 p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-yellow-300 text-sm">Cấp Bang</div>
                    <div className="text-yellow-100 text-xl font-bold">
                      {currentGuild.level || 1}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-300 text-sm">Thành Viên</div>
                    <div className="text-yellow-100 text-xl font-bold">
                      {guildMembers.length}/{currentGuild.maxMembers || 10}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-300 text-sm">
                      Linh Thạch Chung
                    </div>
                    <div className="text-blue-300 text-xl font-bold">
                      {(
                        (currentGuild as ExtendedGuild).treasuryFunds || 0
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guild Upgrade Section - Only for master */}
              {userMembership?.role === "master" && (
                <div className="bg-purple-900/20 rounded border border-purple-600/30 p-4 mb-6">
                  <h4 className="text-lg font-medium text-yellow-100 mb-3">
                    ⬆️ Nâng Cấp Bang Phái
                  </h4>
                  <div className="text-yellow-200 text-sm mb-4">
                    Sử dụng linh thạch chung để nâng cấp bang phái, tăng số
                    lượng thành viên và thưởng hàng ngày.
                  </div>

                  {(currentGuild.level || 1) < 10 ? (
                    <div>
                      <div className="text-sm text-yellow-300 mb-2">
                        Nâng cấp lên cấp {(currentGuild.level || 1) + 1}
                      </div>
                      <button
                        onClick={upgradeGuild}
                        disabled={upgradeGuildMutation.isPending}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded transition-colors disabled:opacity-50"
                      >
                        {upgradeGuildMutation.isPending ? (
                          <span className="inline-flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Đang nâng cấp...
                          </span>
                        ) : (
                          <>
                            🔄 Nâng Cấp Bang Phái (Chi phí:{" "}
                            {getUpgradeCost(
                              currentGuild.level || 1
                            ).toLocaleString()}
                            )
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gold-300 font-bold">
                      🏆 Bang phái đã đạt cấp tối đa!
                    </div>
                  )}
                </div>
              )}

              {/* Daily Reward */}
              <div className="mb-6">
                <button
                  onClick={claimDailyReward}
                  disabled={isLoading || hasClaimedDailyReward()}
                  className={`w-full py-3 text-white font-bold rounded transition-colors ${
                    hasClaimedDailyReward()
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } disabled:opacity-50`}
                >
                  {hasClaimedDailyReward() ? (
                    <>✅ Đã Nhận Bổng Lộc Hôm Nay</>
                  ) : (
                    <>
                      🎁 Nhận Bổng Lộc Hàng Ngày (
                      {(currentGuild.dailyReward || 1000).toLocaleString()} Linh
                      Thạch)
                    </>
                  )}
                </button>
              </div>

              {/* Members List */}
              <div>
                <h4 className="text-lg font-medium text-yellow-100 mb-3">
                  Danh Sách Thành Viên
                </h4>
                <div className="space-y-2">
                  {guildMembers.map((member) => {
                    const characterInfo = getCharacterInfo(member.characterId);
                    return (
                      <div
                        key={member.$id}
                        className="flex justify-between items-center bg-yellow-800/10 rounded border border-yellow-600/20 p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="text-yellow-100 font-medium">
                              {characterInfo.name}
                            </div>
                            <div className="text-yellow-300 text-xs">
                              {characterInfo.displayRealm
                                ? `${characterInfo.realm} - Tầng ${characterInfo.stage} (Cấp ${characterInfo.level})`
                                : `${characterInfo.realm} - Tu Luyện`}
                            </div>
                          </div>
                          <div className="text-sm">
                            {member.role === "master" && "👑 Tông Chủ"}
                            {member.role === "vice_master" && "🥈 Phó Tông Chủ"}
                            {member.role === "elder" && "🏅 Trưởng Lão"}
                            {member.role === "member" && "👤 Thành Viên"}
                          </div>
                        </div>
                        <div className="text-yellow-300 text-sm">
                          Cống hiến: {member.contribution.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "contribution" && currentGuild && (
            <div>
              <h3 className="text-xl font-bold text-yellow-100 mb-4">
                � Cống Hiến Linh Thạch
              </h3>

              <div className="bg-yellow-800/20 rounded border border-yellow-600/30 p-4 mb-6">
                <h4 className="text-lg font-medium text-yellow-100 mb-3">
                  📊 Thông Tin Bang Phái
                </h4>
                <div className="grid grid-cols-2 gap-4 text-yellow-200">
                  <div>
                    <div className="font-medium text-yellow-100">Cấp độ:</div>
                    <div className="text-2xl font-bold text-purple-300">
                      {currentGuild.level || 1}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-yellow-100">
                      Linh thạch chung:
                    </div>
                    <div className="text-2xl font-bold text-blue-300">
                      {(
                        (currentGuild as ExtendedGuild).treasuryFunds || 0
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-800/20 rounded border border-yellow-600/30 p-4 mb-6">
                <h4 className="text-lg font-medium text-yellow-100 mb-3">
                  🏆 Bảng Xếp Hạng Cống Hiến
                </h4>
                <div className="space-y-3">
                  {guildMembers
                    .sort((a, b) => b.contribution - a.contribution)
                    .map((member, index) => (
                      <div
                        key={member.$id}
                        className="flex justify-between items-center bg-yellow-800/10 rounded border border-yellow-600/20 p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-yellow-100 font-bold text-lg w-8">
                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : `${index + 1}.`}
                          </div>
                          <div>
                            <div className="text-yellow-100 font-medium">
                              {getCharacterInfo(member.characterId).name}
                            </div>
                            <div className="text-xs text-yellow-300 mb-1">
                              {(() => {
                                const info = getCharacterInfo(
                                  member.characterId
                                );
                                return info.displayRealm
                                  ? `${info.realm} - Tầng ${info.stage} (Cấp ${info.level})`
                                  : `${info.realm} - Tu Luyện`;
                              })()}
                            </div>
                            <div className="text-sm text-yellow-300">
                              {member.role === "master" && "👑 Tông Chủ"}
                              {member.role === "vice_master" &&
                                "🥈 Phó Tông Chủ"}
                              {member.role === "elder" && "🏅 Trưởng Lão"}
                              {member.role === "member" && "👤 Thành Viên"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-100 font-bold text-lg">
                            {member.contribution.toLocaleString()}
                          </div>
                          <div className="text-yellow-300 text-sm">
                            điểm cống hiến
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-blue-900/30 rounded border border-blue-600/50 p-4 mb-6">
                <div className="text-blue-200 text-sm">
                  💡 <strong>Hệ thống cống hiến:</strong> Góp linh thạch cá nhân
                  để tạo linh thạch chung cho bang phái. Mỗi 100 linh thạch góp
                  = 1 điểm cống hiến. Linh thạch chung dùng để nâng cấp bang
                  phái.
                </div>
              </div>

              {/* Contribution Form */}
              <div className="bg-yellow-800/20 rounded border border-yellow-600/30 p-4">
                <h4 className="text-lg font-medium text-yellow-100 mb-3">
                  💎 Góp Linh Thạch
                </h4>

                {errorMessage && (
                  <div className="bg-red-900/50 border border-red-600 text-red-200 p-3 rounded mb-4">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-900/50 border border-green-600 text-green-200 p-3 rounded mb-4">
                    ✅ {successMessage}
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-yellow-200 font-medium">
                      Số lượng linh thạch
                    </label>
                    <div className="text-sm text-blue-300">
                      Bạn có: {character?.spiritStones?.toLocaleString() || 0}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={contributionAmount}
                    onChange={(e) => {
                      setContributionAmount(parseInt(e.target.value) || 100);
                      // Clear messages when user changes amount
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="w-full p-3 rounded bg-yellow-900/30 border border-yellow-600/50 text-yellow-100 text-lg font-medium"
                    placeholder="Tối thiểu 100 linh thạch"
                  />
                  <div className="text-sm text-yellow-300 mt-1">
                    Sẽ nhận: {Math.floor(contributionAmount / 100)} điểm cống
                    hiến
                  </div>
                </div>

                <button
                  onClick={addContribution}
                  disabled={
                    addContributionMutation.isPending ||
                    contributionAmount < 100
                  }
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addContributionMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang góp linh thạch...
                    </span>
                  ) : (
                    `💎 Góp ${contributionAmount.toLocaleString()} Linh Thạch`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
