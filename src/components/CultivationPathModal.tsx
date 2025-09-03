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
      // Tạo character với cultivation path đã chọn
      const character = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CHARACTERS,
        ID.unique(),
        {
          userId: userId,
          name: username || "Tu Tiên Giả",
          level: 1,
          realm: "Luyện Khí",
          stage: 1,
          cultivationPath: path.id,
          experience: 0,
          energy: path.stats.stamina,
          maxEnergy: path.stats.stamina,
          spiritualPower: 0,
          maxSpiritualPower: 100,
          physicalPower: 10,
          mentalPower: 10,
          spiritualQi: 0,
          qi: path.stats.qi,
          stamina: path.stats.stamina,
          spiritStones: path.stats.spiritStones,
          tribulationResistance: 0.0,
          cultivationProgress: 0.0,
          nextBreakthrough: 1000,
          killCount: path.id === "demon" ? 0 : null,
          lastCultivationUpdate: new Date().toISOString(),
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
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 w-full max-w-4xl border border-purple-500/30">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Chọn Con Đường Tu Tiên
          </h2>
          <p className="text-gray-300">
            Đây là quyết định quan trọng sẽ ảnh hưởng đến toàn bộ hành trình tu
            tiên của bạn
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {cultivationPaths.map((path) => (
            <div
              key={path.id}
              className={`bg-gradient-to-br from-${
                path.color
              }-900/50 to-gray-800/50 border border-${
                path.color
              }-500/30 rounded-lg p-6 hover:scale-105 transition-all cursor-pointer ${
                loading ? "opacity-50" : ""
              }`}
              onClick={() => !loading && handleSelectPath(path)}
            >
              <div
                className={`w-20 h-20 bg-${path.color}-500 rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <path.icon className="w-10 h-10 text-white" />
              </div>

              <h3
                className={`text-2xl font-bold text-${path.color}-300 text-center mb-4`}
              >
                {path.name}
              </h3>

              <p className="text-gray-300 text-center mb-6 min-h-[60px]">
                {path.description}
              </p>

              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">
                  Chỉ số ban đầu:
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Qi:</span>
                    <span className={`text-${path.color}-300`}>
                      {path.stats.qi}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stamina:</span>
                    <span className={`text-${path.color}-300`}>
                      {path.stats.stamina}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Linh Thạch:</span>
                    <span className={`text-${path.color}-300`}>
                      {path.stats.spiritStones}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Đặc điểm:</h4>
                <ul className={`text-sm text-${path.color}-200 space-y-1`}>
                  {path.benefits.map((benefit, index) => (
                    <li key={index}>• {benefit}</li>
                  ))}
                </ul>
              </div>

              <button
                disabled={loading}
                className={`w-full py-3 px-4 bg-gradient-to-r from-${
                  path.color
                }-600 to-${path.color}-700 hover:from-${
                  path.color
                }-700 hover:to-${
                  path.color
                }-800 text-white rounded-lg font-semibold transition-all ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Đang tạo..." : `Chọn ${path.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>
            ⚠️ Lưu ý: Một khi đã chọn, bạn không thể thay đổi con đường tu tiên
          </p>
        </div>
      </div>
    </div>
  );
}
