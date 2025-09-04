"use client";

import { useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID } from "appwrite";
import { Save, X } from "lucide-react";

interface SkillFormData {
  name: string;
  description: string;
  element: string;
  rarity: string;
  // Combat Rate Bonuses (%)
  burnRateBonus: number;
  poisonRateBonus: number;
  freezeRateBonus: number;
  stunRateBonus: number;
  criticalRateBonus: number;
  counterAttackRateBonus: number;
  multiStrikeRateBonus: number;
  lifeStealRateBonus: number;
  healthRegenRateBonus: number;
}

interface SkillFormProps {
  skill?: {
    $id: string;
    name: string;
    description: string;
    element: string;
    rarity: string;
    burnRateBonus?: number;
    poisonRateBonus?: number;
    freezeRateBonus?: number;
    stunRateBonus?: number;
    criticalRateBonus?: number;
    counterAttackRateBonus?: number;
    multiStrikeRateBonus?: number;
    lifeStealRateBonus?: number;
    healthRegenRateBonus?: number;
  };
  onSuccess: () => void;
  onClose?: () => void;
}

const ELEMENTS = [
  { value: "fire", label: "Hỏa" },
  { value: "ice", label: "Băng" },
  { value: "poison", label: "Độc" },
  { value: "lightning", label: "Lôi" },
  { value: "earth", label: "Thổ" },
  { value: "wind", label: "Phong" },
  { value: "light", label: "Quang" },
  { value: "dark", label: "Ám" },
  { value: "physical", label: "Vật Lý" },
  { value: "mental", label: "Tinh Thần" },
];

const RARITY_OPTIONS = [
  { value: "common", label: "Thường", color: "text-gray-400" },
  { value: "uncommon", label: "Không Thường", color: "text-green-400" },
  { value: "rare", label: "Hiếm", color: "text-blue-400" },
  { value: "epic", label: "Sử Thi", color: "text-purple-400" },
  { value: "legendary", label: "Huyền Thoại", color: "text-orange-400" },
  { value: "immortal", label: "Bất Tử", color: "text-red-400" },
];

export default function SkillForm({
  skill,
  onSuccess,
  onClose,
}: SkillFormProps) {
  const [formData, setFormData] = useState<SkillFormData>({
    name: skill?.name || "",
    description: skill?.description || "",
    element: skill?.element || "fire",
    rarity: skill?.rarity || "common",
    // Combat Rate Bonuses
    burnRateBonus: skill?.burnRateBonus || 0,
    poisonRateBonus: skill?.poisonRateBonus || 0,
    freezeRateBonus: skill?.freezeRateBonus || 0,
    stunRateBonus: skill?.stunRateBonus || 0,
    criticalRateBonus: skill?.criticalRateBonus || 0,
    counterAttackRateBonus: skill?.counterAttackRateBonus || 0,
    multiStrikeRateBonus: skill?.multiStrikeRateBonus || 0,
    lifeStealRateBonus: skill?.lifeStealRateBonus || 0,
    healthRegenRateBonus: skill?.healthRegenRateBonus || 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Tên công kỹ không được để trống");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (skill) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.SKILL_BOOKS,
          skill.$id,
          data
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.SKILL_BOOKS,
          ID.unique(),
          data
        );
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tên Công Kỹ *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
            placeholder="Nhập tên công kỹ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Thuộc Tính Ngũ Hành
          </label>
          <select
            value={formData.element}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, element: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
          >
            {ELEMENTS.map((element) => (
              <option key={element.value} value={element.value}>
                {element.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Độ Hiếm
          </label>
          <select
            value={formData.rarity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, rarity: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
          >
            {RARITY_OPTIONS.map((rarity) => (
              <option key={rarity.value} value={rarity.value}>
                {rarity.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mô Tả Công Kỹ
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={4}
          className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          placeholder="Mô tả về công kỹ, hiệu ứng, cách sử dụng, yêu cầu tu luyện..."
        />
      </div>

      {/* Combat Rate Bonuses */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">
          Buff Tỷ Lệ Combat (%)
        </h4>
        <p className="text-sm text-gray-400 mb-4">
          Các tỷ lệ buff sẽ cộng thêm vào combat stats của nhân vật. Ví dụ: nhân
          vật có burnRate 5%, công kỹ buff +10% → tổng 15%
        </p>

        {/* Elemental Effects */}
        <div className="mb-4">
          <h5 className="text-md font-medium text-gray-200 mb-2">
            🔥 Hiệu Ứng Nguyên Tố
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                🔥 Thiêu Đốt +%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.burnRateBonus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    burnRateBonus: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                🧪 Hạ Độc +%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.poisonRateBonus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    poisonRateBonus: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                ❄️ Đóng Băng +%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.freezeRateBonus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    freezeRateBonus: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                ⚡ Làm Choáng +%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.stunRateBonus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stunRateBonus: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Combat Techniques */}
        <div className="mb-4">
          <h5 className="text-md font-medium text-gray-200 mb-2">
            ⚔️ Kỹ Thuật Chiến Đấu
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                💥 Bạo Kích +%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.criticalRateBonus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    criticalRateBonus: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                🛡️ Phản Kích +%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.counterAttackRateBonus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    counterAttackRateBonus: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                🗡️ Liên Kích +%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.multiStrikeRateBonus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    multiStrikeRateBonus: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Survival Abilities */}
        <div>
          <h5 className="text-md font-medium text-gray-200 mb-2">
            💚 Năng Lực Sinh Tồn
          </h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                🩸 Hút Máu +%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.lifeStealRateBonus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lifeStealRateBonus: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                💚 Hồi Máu +%
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.healthRegenRateBonus}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    healthRegenRateBonus: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-purple-500/30">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
        >
          <Save className="w-4 h-4" />
          {loading ? "Đang lưu..." : skill ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
