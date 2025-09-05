"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Sword,
  Shield,
  Heart,
  Zap,
  Dumbbell,
  Skull,
} from "lucide-react";

interface LeaderboardEntry {
  characterId: string;
  name: string;
  level: number;
  realm: string;
  stage: number;
  cultivationPath: string;
  qi: number;
  spiritStones: number;
  maxHealth: number;
  attack: number;
  defense: number;
  agility: number;
  criticalRate: number;
  powerScore: number;
  rank: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaderboardModal({
  isOpen,
  onClose,
}: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [error, setError] = useState<string>("");

  const cultivationPaths = {
    qi: { name: "Khí Tu", color: "blue", icon: Zap },
    body: { name: "Thể Tu", color: "green", icon: Dumbbell },
    demon: { name: "Ma Tu", color: "red", icon: Skull },
  };

  const fetchLeaderboard = async (pathFilter?: string) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (pathFilter && pathFilter !== "all") {
        params.set("path", pathFilter);
      }

      const response = await fetch(`/api/leaderboard?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        setError(data.error || "Có lỗi khi tải bảng xếp hạng");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Không thể tải bảng xếp hạng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard(filter);
    }
  }, [isOpen, filter]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-amber-600" />;
    return (
      <span className="w-6 h-6 flex items-center justify-center text-gray-300 font-bold">
        #{rank}
      </span>
    );
  };

  const getPathIcon = (path: string) => {
    const pathData = cultivationPaths[path as keyof typeof cultivationPaths];
    if (!pathData) return null;
    const Icon = pathData.icon;
    return <Icon className={`w-5 h-5 text-${pathData.color}-400`} />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] border border-purple-500/30">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2 sm:gap-3">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <span className="hidden sm:inline">Bảng Xếp Hạng Tu Tiên</span>
              <span className="sm:hidden">Xếp Hạng</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl sm:text-2xl font-bold p-1"
            >
              ×
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Tất Cả
            </button>
            {Object.entries(cultivationPaths).map(([key, path]) => {
              const Icon = path.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key)}
                  className={`px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base ${
                    filter === key
                      ? `bg-${path.color}-600 text-white`
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{path.name}</span>
                  <span className="sm:hidden">
                    {key === "qi" ? "Khí" : key === "body" ? "Thể" : "Ma"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Đang tải bảng xếp hạng...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => fetchLeaderboard(filter)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Thử Lại
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Chưa có dữ liệu xếp hạng</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Desktop Header Row - Hidden on mobile */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-800/50 rounded-lg text-sm font-medium text-gray-300">
                <div className="col-span-1">#</div>
                <div className="col-span-2">Tên</div>
                <div className="col-span-2">Cảnh Giới</div>
                <div className="col-span-1">Lối Tu</div>
                <div className="col-span-1">Qi</div>
                <div className="col-span-1">
                  <Heart className="w-4 h-4 inline" />
                </div>
                <div className="col-span-1">
                  <Sword className="w-4 h-4 inline" />
                </div>
                <div className="col-span-1">
                  <Shield className="w-4 h-4 inline" />
                </div>
                <div className="col-span-2">Tổng Điểm</div>
              </div>

              {/* Leaderboard Entries */}
              {leaderboard.map((entry) => (
                <div key={entry.characterId}>
                  {/* Mobile Layout */}
                  <div
                    className={`lg:hidden p-4 rounded-lg transition-colors hover:bg-gray-700/30 ${
                      entry.rank <= 3
                        ? "bg-gradient-to-r from-yellow-900/20 to-transparent border border-yellow-600/30"
                        : "bg-gray-800/30"
                    }`}
                  >
                    {/* Top row - Rank, Name, Path, Power Score */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getRankIcon(entry.rank)}
                        <div>
                          <div className="font-bold text-white text-lg">
                            {entry.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            Level {entry.level}
                          </div>
                        </div>
                        <div className="ml-2">
                          {getPathIcon(entry.cultivationPath)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold text-lg">
                          {formatNumber(entry.powerScore)}
                        </div>
                        <div className="text-xs text-gray-400">Tổng Điểm</div>
                      </div>
                    </div>

                    {/* Middle row - Realm info */}
                    <div className="mb-3 text-center">
                      <div className="text-purple-300 font-medium text-lg">
                        {entry.realm}
                      </div>
                      <div className="text-sm text-gray-400">
                        Tầng {entry.stage}
                      </div>
                    </div>

                    {/* Bottom row - Stats */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-red-400 font-medium">
                          {formatNumber(entry.qi)}
                        </div>
                        <div className="text-xs text-gray-400">Qi</div>
                      </div>
                      <div>
                        <div className="text-green-400 font-medium flex items-center justify-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(entry.maxHealth)}
                        </div>
                        <div className="text-xs text-gray-400">HP</div>
                      </div>
                      <div>
                        <div className="text-orange-400 font-medium flex items-center justify-center gap-1">
                          <Sword className="w-3 h-3" />
                          {formatNumber(entry.attack)}
                        </div>
                        <div className="text-xs text-gray-400">ATK</div>
                      </div>
                      <div>
                        <div className="text-blue-400 font-medium flex items-center justify-center gap-1">
                          <Shield className="w-3 h-3" />
                          {formatNumber(entry.defense)}
                        </div>
                        <div className="text-xs text-gray-400">DEF</div>
                      </div>
                    </div>

                    {/* Extra info */}
                    <div className="mt-2 text-center">
                      <div className="text-xs text-gray-400">
                        Crit: {entry.criticalRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div
                    className={`hidden lg:grid grid-cols-12 gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-gray-700/30 ${
                      entry.rank <= 3
                        ? "bg-gradient-to-r from-yellow-900/20 to-transparent border border-yellow-600/30"
                        : "bg-gray-800/30"
                    }`}
                  >
                    <div className="col-span-1 flex items-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="col-span-2">
                      <div className="font-medium text-white">{entry.name}</div>
                      <div className="text-xs text-gray-400">
                        Level {entry.level}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-purple-300 font-medium">
                        {entry.realm}
                      </div>
                      <div className="text-xs text-gray-400">
                        Tầng {entry.stage}
                      </div>
                    </div>

                    <div className="col-span-1 flex items-center justify-center">
                      {getPathIcon(entry.cultivationPath)}
                    </div>

                    <div className="col-span-1 text-red-400 text-sm font-medium">
                      {formatNumber(entry.qi)}
                    </div>

                    <div className="col-span-1 text-green-400 text-sm">
                      {formatNumber(entry.maxHealth)}
                    </div>

                    <div className="col-span-1 text-orange-400 text-sm">
                      {formatNumber(entry.attack)}
                    </div>

                    <div className="col-span-1 text-blue-400 text-sm">
                      {formatNumber(entry.defense)}
                    </div>

                    <div className="col-span-2">
                      <div className="text-yellow-400 font-bold">
                        {formatNumber(entry.powerScore)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Crit: {entry.criticalRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            <span className="hidden sm:inline">
              Xếp hạng dựa trên cảnh giới, sau đó là tổng điểm sức mạnh từ các
              chỉ số combat
            </span>
            <span className="sm:hidden">
              Xếp hạng theo cảnh giới và tổng điểm sức mạnh
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
