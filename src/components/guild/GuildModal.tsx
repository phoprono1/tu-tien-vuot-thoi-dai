"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

interface Guild {
  $id: string;
  name: string;
  description?: string;
  leaderId: string;
  memberCount: number;
  maxMembers: number;
  level: number;
  treasuryFunds: number;
  cultivationBonus: number;
  dailyReward: number;
  createdAt: string;
  lastDailyRewardTime?: string;
}

interface GuildMember {
  $id: string;
  guildId: string;
  characterId: string;
  role: "master" | "vice_master" | "elder" | "member";
  joinedAt: string;
  contribution: number;
  lastDailyRewardClaim?: string;
}

interface Character {
  $id: string;
  name: string;
  level: number;
  spiritStones: number;
  cultivationPath: string;
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
  const [loading, setLoading] = useState(false);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [currentGuild, setCurrentGuild] = useState<Guild | null>(null);
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [userMembership, setUserMembership] = useState<GuildMember | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"list" | "create" | "manage">(
    "list"
  );
  const [createForm, setCreateForm] = useState<CreateGuildForm>({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");

  // Refresh function to reload guild data
  const refreshGuildData = async () => {
    if (!character) return;

    try {
      setLoading(true);

      // Load guilds
      const guildsResponse = await fetch("/api/guilds");
      const guildsData = await guildsResponse.json();
      if (guildsData.success) {
        setGuilds(guildsData.guilds);
      }

      // Check membership
      const membershipResponse = await fetch(
        `/api/guilds/membership?characterId=${character.$id}`
      );
      if (membershipResponse.ok) {
        const membershipData = await membershipResponse.json();
        if (membershipData.membership) {
          setUserMembership(membershipData.membership);
          setCurrentGuild(membershipData.guild);
          setActiveTab("manage");

          // Load all guild members
          const membersResponse = await fetch(
            `/api/guilds/${membershipData.guild.$id}/members`
          );
          if (membersResponse.ok) {
            const membersResponseData = await membersResponse.json();
            setGuildMembers(membersResponseData.members);
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing guild data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load guilds khi modal mở với debounce - chỉ depend vào characterId để tránh re-render liên tục
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    if (isOpen && character) {
      const characterId = character.$id; // Extract character ID để tránh stale closure

      // Set loading immediately
      setLoading(true);

      // Clear timeout nếu component re-render
      if (timeoutId) clearTimeout(timeoutId);

      // Define API calls directly in useEffect to avoid dependency issues
      const loadGuildsLocal = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/guilds");
          const data = await response.json();

          if (data.success) {
            setGuilds(data.guilds);
          } else {
            setError(data.error || "Không thể tải danh sách bang phái");
          }
        } catch (error) {
          console.error("Error loading guilds:", error);
          setError("Không thể tải danh sách bang phái");
        } finally {
          setLoading(false);
        }
      };

      const checkUserMembershipLocal = async () => {
        if (!characterId) return;

        try {
          const response = await fetch(
            `/api/guilds/membership?characterId=${characterId}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.membership) {
              setUserMembership(data.membership);
              setCurrentGuild(data.guild);
              setActiveTab("manage");

              // Load all guild members
              const membersResponse = await fetch(
                `/api/guilds/${data.guild.$id}/members`
              );
              if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                setGuildMembers(membersData.members);
              }
            }
          }
        } catch {
          // Silently handle errors to reduce console spam
        }
      };

      // Debounce 500ms để tránh gọi API nhiều lần
      timeoutId = setTimeout(async () => {
        if (isMounted) {
          try {
            await Promise.all([loadGuildsLocal(), checkUserMembershipLocal()]);
          } catch {
            // Silently handle errors to reduce console spam
          }
        }
      }, 500);
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, character]); // Keep original dependencies but use characterId inside to avoid stale closure

  const createGuild = async () => {
    if (!character || !user) return;

    // Kiểm tra điều kiện
    if (character.level < 31) {
      setError("Cần đạt ít nhất cấp 31 để tạo bang phái");
      return;
    }

    if (character.spiritStones < 10000) {
      setError("Cần ít nhất 10,000 linh thạch để tạo bang phái");
      return;
    }

    if (!createForm.name.trim()) {
      setError("Tên bang phái không được để trống");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/guilds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name.trim(),
          description: createForm.description.trim(),
          characterId: character.$id,
          characterLevel: character.level,
          spiritStones: character.spiritStones,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentGuild(data.guild as unknown as Guild);
        setActiveTab("manage");
        setCreateForm({ name: "", description: "" });
        setError("");
        // Refresh character data để cập nhật spiritStones
        window.location.reload(); // Temporary solution
      } else {
        setError(data.error || "Không thể tạo bang phái");
      }
    } catch (error) {
      console.error("Error creating guild:", error);
      setError("Không thể tạo bang phái");
    } finally {
      setLoading(false);
    }
  };

  const joinGuild = async (guildId: string) => {
    if (!character) return;

    try {
      setLoading(true);

      const response = await fetch("/api/guilds/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: guildId,
          characterId: character.$id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setError("");
        await refreshGuildData(); // Refresh guild data
        window.location.reload(); // Temporary solution để cập nhật character
      } else {
        setError(data.error || "Không thể gia nhập bang phái");
      }
    } catch (error) {
      console.error("Error joining guild:", error);
      setError("Không thể gia nhập bang phái");
    } finally {
      setLoading(false);
    }
  };

  const claimDailyReward = async () => {
    if (!currentGuild || !userMembership || !character) return;

    try {
      setLoading(true);

      const response = await fetch("/api/guilds/daily-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character.$id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setError("");
        // Update local state hoặc refresh
        window.location.reload(); // Temporary solution
      } else {
        setError(data.error || "Không thể nhận bổng lộc");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      setError("Không thể nhận bổng lộc");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const canCreateGuild =
    character && character.level >= 31 && character.spiritStones >= 10000;

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
          </div>

          {/* Content */}
          {activeTab === "list" && (
            <div>
              <h3 className="text-xl font-bold text-yellow-100 mb-4">
                Danh Sách Bang Phái
              </h3>
              {loading ? (
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
                              disabled={loading}
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
                    disabled={loading || !createForm.name.trim()}
                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded transition-colors disabled:opacity-50"
                  >
                    {loading
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
                Quản Lý Bang Phái
              </h3>

              {/* Guild Info */}
              <div className="bg-yellow-800/20 rounded border border-yellow-600/30 p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-yellow-300 text-sm">Cấp Bang</div>
                    <div className="text-yellow-100 text-xl font-bold">
                      {currentGuild.level}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-300 text-sm">Thành Viên</div>
                    <div className="text-yellow-100 text-xl font-bold">
                      {currentGuild.memberCount}/{currentGuild.maxMembers}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-300 text-sm">Quỹ Bang</div>
                    <div className="text-yellow-100 text-xl font-bold">
                      {currentGuild.treasuryFunds.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-300 text-sm">Buff Tu Vi</div>
                    <div className="text-yellow-100 text-xl font-bold">
                      +{((currentGuild.cultivationBonus - 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Reward */}
              <div className="mb-6">
                <button
                  onClick={claimDailyReward}
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors disabled:opacity-50"
                >
                  🎁 Nhận Bổng Lộc Hàng Ngày (
                  {currentGuild.dailyReward.toLocaleString()} Linh Thạch)
                </button>
              </div>

              {/* Members List */}
              <div>
                <h4 className="text-lg font-medium text-yellow-100 mb-3">
                  Danh Sách Thành Viên
                </h4>
                <div className="space-y-2">
                  {guildMembers.map((member) => (
                    <div
                      key={member.$id}
                      className="flex justify-between items-center bg-yellow-800/10 rounded border border-yellow-600/20 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-yellow-100 font-medium">
                          {member.characterId}
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
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
