import React, { useState, useEffect } from "react";
import { CombatStats, Character } from "@/types/game";

interface CombatStatsFormProps {
  combatStats?: CombatStats;
  characters: Character[];
  onSubmit: (data: Partial<CombatStats>) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function CombatStatsForm({
  combatStats,
  characters,
  onSubmit,
  onClose,
  isSubmitting = false,
}: CombatStatsFormProps) {
  const [formData, setFormData] = useState<Partial<CombatStats>>({
    characterId: "",
    maxHealth: 100,
    currentHealth: 100,
    maxStamina: 100,
    currentStamina: 100,
    attack: 10,
    defense: 10,
    agility: 10,
    criticalRate: 5.0,
    counterAttackRate: 5.0,
    multiStrikeRate: 5.0,
    lifeStealRate: 0.0,
    healthRegenRate: 1.0,
    burnRate: 0.0,
    poisonRate: 0.0,
    freezeRate: 0.0,
    stunRate: 0.0,
  });

  useEffect(() => {
    if (combatStats) {
      setFormData(combatStats);
    }
  }, [combatStats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (
    field: keyof CombatStats,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedCharacter = characters.find(
    (c) => c.$id === formData.characterId
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {combatStats ? "Chỉnh Sửa" : "Thêm Mới"} Chỉ Số Chiến Đấu
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Character Selection */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Thông Tin Cơ Bản</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhân Vật *
                  </label>
                  <select
                    value={formData.characterId}
                    onChange={(e) =>
                      handleInputChange("characterId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!combatStats} // Disable if editing
                  >
                    <option value="">Chọn nhân vật...</option>
                    {characters.map((character) => (
                      <option key={character.$id} value={character.$id}>
                        {character.name} - {character.realm} (Stage{" "}
                        {character.stage})
                      </option>
                    ))}
                  </select>
                  {selectedCharacter && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tu luyện:{" "}
                      {selectedCharacter.cultivationPath === "qi"
                        ? "Luyện Khí"
                        : selectedCharacter.cultivationPath === "body"
                        ? "Luyện Thể"
                        : "Tu Ma"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Health & Stamina */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-red-800">
                Máu & Thể Lực
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máu Tối Đa *
                  </label>
                  <input
                    type="number"
                    value={formData.maxHealth}
                    onChange={(e) =>
                      handleInputChange("maxHealth", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="999999"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máu Hiện Tại *
                  </label>
                  <input
                    type="number"
                    value={formData.currentHealth}
                    onChange={(e) =>
                      handleInputChange(
                        "currentHealth",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max={formData.maxHealth || 999999}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thể Lực Tối Đa *
                  </label>
                  <input
                    type="number"
                    value={formData.maxStamina}
                    onChange={(e) =>
                      handleInputChange("maxStamina", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="9999"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thể Lực Hiện Tại *
                  </label>
                  <input
                    type="number"
                    value={formData.currentStamina}
                    onChange={(e) =>
                      handleInputChange(
                        "currentStamina",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max={formData.maxStamina || 9999}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Core Combat Stats */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">
                Chỉ Số Chiến Đấu Cốt Lõi
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tấn Công *
                  </label>
                  <input
                    type="number"
                    value={formData.attack}
                    onChange={(e) =>
                      handleInputChange("attack", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="99999"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng Thủ *
                  </label>
                  <input
                    type="number"
                    value={formData.defense}
                    onChange={(e) =>
                      handleInputChange("defense", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="99999"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhanh Nhẹn *
                  </label>
                  <input
                    type="number"
                    value={formData.agility}
                    onChange={(e) =>
                      handleInputChange("agility", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="9999"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Combat Rate Stats */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-green-800">
                Tỷ Lệ Chiến Đấu (%)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ Lệ Bạo Kích *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.criticalRate}
                    onChange={(e) =>
                      handleInputChange(
                        "criticalRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ Lệ Phản Công *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.counterAttackRate}
                    onChange={(e) =>
                      handleInputChange(
                        "counterAttackRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ Lệ Đánh Nhiều Lần *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.multiStrikeRate}
                    onChange={(e) =>
                      handleInputChange(
                        "multiStrikeRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ Lệ Hút Máu *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.lifeStealRate}
                    onChange={(e) =>
                      handleInputChange(
                        "lifeStealRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ Lệ Hồi Máu *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.healthRegenRate}
                    onChange={(e) =>
                      handleInputChange(
                        "healthRegenRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Status Effect Rates */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-purple-800">
                Tỷ Lệ Hiệu Ứng Trạng Thái (%)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ Lệ Thiêu Đốt *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.burnRate}
                    onChange={(e) =>
                      handleInputChange("burnRate", parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ Lệ Nhiễm Độc *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.poisonRate}
                    onChange={(e) =>
                      handleInputChange(
                        "poisonRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ Lệ Đóng Băng *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.freezeRate}
                    onChange={(e) =>
                      handleInputChange(
                        "freezeRate",
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ Lệ Choáng *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.stunRate}
                    onChange={(e) =>
                      handleInputChange("stunRate", parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting || !formData.characterId}
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : combatStats
                  ? "Cập nhật"
                  : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
