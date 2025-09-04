"use client";

import { useState } from "react";
import { Beaker, Hammer, Dumbbell } from "lucide-react";
import { DatabaseCharacter } from "@/types/database";

interface CultivationTrainingTabsProps {
  character: DatabaseCharacter;
  onCultivationRateRefresh?: () => void;
  onCharacterUpdate?: (updates: Partial<DatabaseCharacter>) => void;
}

export default function CultivationTrainingTabs({}: CultivationTrainingTabsProps) {
  const [activeTab, setActiveTab] = useState<"alchemy" | "qi" | "body">(
    "alchemy"
  );

  const tabs = [
    {
      id: "alchemy" as const,
      name: "Luyện Đan",
      icon: Beaker,
      description: "Chế tạo và tinh luyện đan dược",
      color: "from-green-600 to-emerald-600",
    },
    {
      id: "qi" as const,
      name: "Luyện Khí",
      icon: Hammer,
      description: "Rèn vũ khí và trang bị",
      color: "from-orange-600 to-red-600",
    },
    {
      id: "body" as const,
      name: "Luyện Thể",
      icon: Dumbbell,
      description: "Rèn luyện và cường hóa thể phách",
      color: "from-purple-600 to-pink-600",
    },
  ];

  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="space-y-4">
      {/* Tab Headers */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              activeTab === tab.id
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Description */}
      <div className="text-sm text-gray-400 px-1">
        {currentTab?.description}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "alchemy" && (
          <div className="space-y-4">
            <div
              className={`bg-gradient-to-r ${currentTab?.color} rounded-lg p-6 text-white`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Beaker className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Luyện Đan</h3>
                  <p className="text-white/80">Nghệ thuật chế tạo đan dược</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Đan Phương Cơ Bản
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Học các công thức luyện đan cơ bản
                </p>
                <div className="text-center py-8 text-gray-500">
                  <Beaker className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sẽ phát triển trong tương lai</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Lò Luyện Đan
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Nâng cấp và sử dụng lò luyện
                </p>
                <div className="text-center py-8 text-gray-500">
                  <Beaker className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sẽ phát triển trong tương lai</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "qi" && (
          <div className="space-y-4">
            <div
              className={`bg-gradient-to-r ${currentTab?.color} rounded-lg p-6 text-white`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Hammer className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Luyện Khí</h3>
                  <p className="text-white/80">
                    Nghệ thuật rèn vũ khí và trang bị
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Rèn Vũ Khí
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Chế tạo và nâng cấp vũ khí
                </p>
                <div className="text-center py-8 text-gray-500">
                  <Hammer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sẽ phát triển trong tương lai</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Rèn Giáp Trụ
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Tạo và cường hóa giáp bảo vệ
                </p>
                <div className="text-center py-8 text-gray-500">
                  <Hammer className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sẽ phát triển trong tương lai</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "body" && (
          <div className="space-y-4">
            <div
              className={`bg-gradient-to-r ${currentTab?.color} rounded-lg p-6 text-white`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Luyện Thể</h3>
                  <p className="text-white/80">
                    Cường hóa thể chất và sức mạnh
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Rèn Luyện Cơ Thể
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Tăng cường sức mạnh thể chất
                </p>
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sẽ phát triển trong tương lai</p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Luyện Cốt Tẩy Tủy
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Tinh luyện xương cốt và tủy não
                </p>
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sẽ phát triển trong tương lai</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
