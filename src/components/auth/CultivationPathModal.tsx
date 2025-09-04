"use client";

import { useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID } from "appwrite";
import { Zap, Dumbbell, Skull } from "lucide-react";
import { DatabaseCharacter } from "@/types/database";

interface CultivationPathModalProps {
  isOpen: boolean;
  userId: string;
  username: string;
  onSuccess: (character: DatabaseCharacter) => void;
}

export default function CultivationPathModal({
  isOpen,
  userId,
  username,
  onSuccess,
}: CultivationPathModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cultivationPaths = [
    {
      id: "qi",
      name: "Khí Tu",
      description:
        "Con đường truyền thống, hấp thụ linh khí từ thiên địa để tu luyện. Cân bằng và ổn định.",
      icon: Zap,
      color: "blue",
      stats: {
        qi: 0, // Bắt đầu từ 0, sẽ tự động tăng theo thời gian
        stamina: 100, // Dùng cho combat, alchemy, training
        spiritStones: 100,
      },
      benefits: ["Tỷ lệ đột phá cao", "Tu luyện ổn định", "Dễ tìm tài nguyên"],
    },
    {
      id: "body",
      name: "Thể Tu",
      description:
        "Tôi luyện thể phách, dựa vào sức mạnh của cơ thể. Chậm nhưng bền bỉ và mạnh mẽ.",
      icon: Dumbbell,
      color: "green",
      stats: {
        qi: 0,
        stamina: 150, // Thể tu có stamina cao hơn
        spiritStones: 50,
      },
      benefits: [
        "HP và phòng thủ cao",
        "Kháng thiên kiếp tốt",
        "Sức mạnh vật lý lớn",
      ],
    },
    {
      id: "demon",
      name: "Ma Tu",
      description:
        "Con đường tà đạo, tăng sức mạnh qua việc sát sinh. Nguy hiểm nhưng quyền năng to lớn.",
      icon: Skull,
      color: "red",
      stats: {
        qi: 0,
        stamina: 80, // Ma tu có stamina thấp nhưng power cao
        spiritStones: 200,
      },
      benefits: [
        "Sức mạnh tăng khi giết địch",
        "Kỹ năng đặc biệt",
        "Tốc độ tu luyện nhanh",
      ],
    },
  ];

  const handleSelectPath = async (path: (typeof cultivationPaths)[0]) => {
    setLoading(true);
    setError("");

    try {
      // Generate character ID first
      const characterId = ID.unique();

      // Tạo character với cultivation path đã chọn
      const character = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CHARACTERS,
        characterId,
        {
          userId: userId,
          name: username || "Tu Tiên Giả",
          level: 1,
          realm: "Luyện Khí",
          stage: 1,
          cultivationPath: path.id,
          experience: 0,
          energy: path.stats.stamina, // Using stamina value for energy
          maxEnergy: path.stats.stamina,
          qi: path.stats.qi,
          spiritStones: path.stats.spiritStones,
          tribulationResistance: 0.0,
          cultivationProgress: 0.0,
          nextBreakthrough: 1000,
          killCount: path.id === "demon" ? 0 : null,
          lastCultivationUpdate: new Date().toISOString(),
        }
      );

      // Calculate initial combat stats based on cultivation path
      const getInitialCombatStats = (pathId: string) => {
        const baseStats = {
          maxHealth: 100,
          currentHealth: 100,
          maxStamina: path.stats.stamina,
          currentStamina: path.stats.stamina,
          attack: 10,
          defense: 10,
          agility: 10,
          criticalRate: 5.0,
          counterAttackRate: 2.0,
          multiStrikeRate: 1.0,
          lifeStealRate: 0.0,
          healthRegenRate: 1.0,
          burnRate: 0.0,
          poisonRate: 0.0,
          freezeRate: 0.0,
          stunRate: 0.0,
          spiritualQi: 0,
          stamina: path.stats.stamina,
        };

        // Customize stats based on cultivation path
        if (pathId === "qi") {
          baseStats.spiritualQi = 50;
          baseStats.criticalRate = 8.0;
        } else if (pathId === "body") {
          baseStats.maxHealth = 150;
          baseStats.currentHealth = 150;
          baseStats.attack = 15;
          baseStats.defense = 15;
          baseStats.maxStamina = path.stats.stamina;
          baseStats.currentStamina = path.stats.stamina;
        } else if (pathId === "demon") {
          baseStats.attack = 12;
          baseStats.criticalRate = 10.0;
          baseStats.lifeStealRate = 3.0;
        }

        return baseStats;
      };

      // Tạo combat stats cho character
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.COMBAT_STATS,
        ID.unique(),
        {
          characterId: characterId,
          ...getInitialCombatStats(path.id),
        }
      );

      onSuccess(character as unknown as DatabaseCharacter);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo nhân vật";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-start justify-center z-50 p-4 pt-8 md:pt-16 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 md:p-8 w-full max-w-6xl border border-purple-500/30 my-4">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2 md:mb-4">
            Chọn Con Đường Tu Tiên
          </h2>
          <p className="text-gray-300 text-sm md:text-base px-2">
            Đây là quyết định quan trọng sẽ ảnh hưởng đến toàn bộ hành trình tu
            tiên của bạn
          </p>
        </div>

        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm md:text-base">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {cultivationPaths.map((path) => (
            <div
              key={path.id}
              className={`bg-gradient-to-br from-${
                path.color
              }-900/50 to-gray-800/50 border border-${
                path.color
              }-500/30 rounded-lg p-4 md:p-6 hover:scale-105 transition-all cursor-pointer touch-manipulation ${
                loading ? "opacity-50" : ""
              }`}
              onClick={() => !loading && handleSelectPath(path)}
            >
              <div
                className={`w-16 h-16 md:w-20 md:h-20 bg-${path.color}-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4`}
              >
                <path.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>

              <h3
                className={`text-xl md:text-2xl font-bold text-${path.color}-300 text-center mb-3 md:mb-4`}
              >
                {path.name}
              </h3>

              <p className="text-gray-300 text-center text-sm md:text-base mb-4 md:mb-6 min-h-[50px] md:min-h-[60px] leading-relaxed">
                {path.description}
              </p>

              <div className="mb-4 md:mb-6">
                <h4 className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base">
                  Chỉ số ban đầu:
                </h4>
                <div className="space-y-1 md:space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-400">Qi:</span>
                    <span className={`text-${path.color}-300`}>
                      {path.stats.qi}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-400">Năng lượng:</span>
                    <span className={`text-${path.color}-300`}>
                      {path.stats.stamina}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-400">Linh Thạch:</span>
                    <span className={`text-${path.color}-300`}>
                      {path.stats.spiritStones}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4 md:mb-6">
                <h4 className="text-white font-semibold mb-2 md:mb-3 text-sm md:text-base">
                  Đặc điểm:
                </h4>
                <ul
                  className={`text-xs md:text-sm text-${path.color}-200 space-y-1`}
                >
                  {path.benefits.map((benefit, index) => (
                    <li key={index}>• {benefit}</li>
                  ))}
                </ul>
              </div>

              <button
                disabled={loading}
                className={`w-full py-2 md:py-3 px-4 bg-gradient-to-r from-${
                  path.color
                }-600 to-${path.color}-700 hover:from-${
                  path.color
                }-700 hover:to-${
                  path.color
                }-800 text-white rounded-lg font-semibold transition-all text-sm md:text-base ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Đang tạo..." : `Chọn ${path.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-6 md:mt-8 text-gray-400 text-xs md:text-sm px-2">
          <p>
            ⚠️ Lưu ý: Một khi đã chọn, bạn không thể thay đổi con đường tu tiên
          </p>
        </div>
      </div>
    </div>
  );
}
