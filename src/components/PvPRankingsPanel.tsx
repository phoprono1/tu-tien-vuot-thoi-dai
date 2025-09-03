"use client";

import { useState, useEffect } from "react";

interface PvPRanking {
  $id: string;
  characterId: string;
  characterName: string;
  level: number;
  realm: string;
  cultivationPath: "qi" | "body" | "demon";
  rating: number;
  wins: number;
  losses: number;
  totalMatches: number;
  winStreak: number;
  highestRating: number;
  combatPower: number;
}

const pathNames = {
  qi: "Khí Tu",
  body: "Thể Tu",
  demon: "Ma Tu",
};

const pathColors = {
  qi: "text-blue-600",
  body: "text-green-600",
  demon: "text-red-600",
};

export default function PvPRankingsPanel() {
  const [rankings, setRankings] = useState<PvPRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await fetch("/api/pvp/rankings");
      const data = await response.json();
      if (data.success) {
        setRankings(data.rankings);
      }
    } catch (error) {
      console.error("Error fetching rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRank = (index: number) => {
    const rank = index + 1;
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getWinRate = (wins: number, totalMatches: number) => {
    if (totalMatches === 0) return "0%";
    return `${Math.round((wins / totalMatches) * 100)}%`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Đang tải xếp hạng PvP...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Bảng xếp hạng PvP</h2>
        <p className="text-gray-600">Top cao thủ võ lâm</p>
      </div>

      {rankings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có dữ liệu PvP. Hãy tham gia trận đấu đầu tiên!
        </div>
      ) : (
        <div className="space-y-3">
          {rankings.map((ranking, index) => (
            <div
              key={ranking.$id}
              className={`
                flex items-center justify-between p-4 rounded-lg border
                ${
                  index < 3
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                    : "bg-white border-gray-200"
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold min-w-[60px]">
                  {getRank(index)}
                </div>

                <div>
                  <h3 className="font-bold text-lg">{ranking.characterName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Cấp {ranking.level}</span>
                    <span>•</span>
                    <span>{ranking.realm}</span>
                    <span>•</span>
                    <span className={pathColors[ranking.cultivationPath]}>
                      {pathNames[ranking.cultivationPath]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {ranking.rating.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {ranking.wins}W - {ranking.losses}L
                  </div>
                  <div className="text-xs text-gray-500">
                    Tỷ lệ thắng:{" "}
                    {getWinRate(ranking.wins, ranking.totalMatches)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-orange-600">
                    {ranking.combatPower.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Chiến lực</div>
                </div>

                <div className="text-right">
                  <div className="text-sm">
                    <div>
                      <span className="text-red-600">🔥</span>
                      <span className="ml-1">{ranking.winStreak}</span>
                    </div>
                    <div className="text-xs text-gray-500">Win streak</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Peak: {ranking.highestRating}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-xs text-gray-500 border-t pt-4">
        <div className="space-y-1">
          <p>🥇 Hạng 1-3: Huy hiệu vàng, bạc, đồng</p>
          <p>Rating system: Thắng +25, Thua -25</p>
          <p>Cập nhật theo thời gian thực</p>
        </div>
      </div>
    </div>
  );
}
