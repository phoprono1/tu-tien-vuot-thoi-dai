"use client";

import { useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID } from "appwrite";
import { Save, X } from "lucide-react";

interface CharacterFormData {
  name: string;
  userId: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  stamina: number;
  cultivationPath: string;
  realm: string;
  stage: number;
  spiritualPower: number;
  maxSpiritualPower: number;
  physicalPower: number;
  mentalPower: number;
  spiritualQi: number;
  qi: number;
  spiritStones: number;
  tribulationResistance: number;
  cultivationProgress: number;
  nextBreakthrough: number;
  killCount: number;
  lastCultivationUpdate: string;
}

interface CharacterFormProps {
  character?: {
    $id: string;
    name: string;
    userId: string;
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    stamina: number;
    cultivationPath: string;
    realm: string;
    stage: number;
    spiritualPower: number;
    maxSpiritualPower: number;
    physicalPower: number;
    mentalPower: number;
    spiritualQi: number;
    qi: number;
    spiritStones: number;
    tribulationResistance: number;
    cultivationProgress: number;
    nextBreakthrough: number;
    killCount: number;
    lastCultivationUpdate: string;
  };
  onSuccess: () => void;
  onClose?: () => void;
}

const CULTIVATION_PATHS = [
  { value: "qi", label: "Tu Luyện Khí" },
  { value: "body", label: "Luyện Thể" },
  { value: "demon", label: "Ma Đạo" },
];

export default function CharacterForm({
  character,
  onSuccess,
  onClose,
}: CharacterFormProps) {
  const [formData, setFormData] = useState<CharacterFormData>({
    name: character?.name || "",
    userId: character?.userId || "",
    level: character?.level || 1,
    experience: character?.experience || 0,
    health: character?.health || 100,
    maxHealth: character?.maxHealth || 100,
    energy: character?.energy || 50,
    maxEnergy: character?.maxEnergy || 50,
    stamina: character?.stamina || 100,
    cultivationPath: character?.cultivationPath || "qi",
    realm: character?.realm || "Luyện Khí",
    stage: character?.stage || 1,
    spiritualPower: character?.spiritualPower || 0,
    maxSpiritualPower: character?.maxSpiritualPower || 100,
    physicalPower: character?.physicalPower || 0,
    mentalPower: character?.mentalPower || 0,
    spiritualQi: character?.spiritualQi || 0,
    qi: character?.qi || 0,
    spiritStones: character?.spiritStones || 0,
    tribulationResistance: character?.tribulationResistance || 0,
    cultivationProgress: character?.cultivationProgress || 0,
    nextBreakthrough: character?.nextBreakthrough || 1000,
    killCount: character?.killCount || 0,
    lastCultivationUpdate:
      character?.lastCultivationUpdate || new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Tên nhân vật không được để trống");
      return;
    }

    if (!formData.userId.trim()) {
      setError("User ID không được để trống");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = {
        ...formData,
        name: formData.name.trim(),
        userId: formData.userId.trim(),
        realm: formData.realm.trim(),
        lastCultivationUpdate:
          formData.lastCultivationUpdate || new Date().toISOString(),
      };

      if (character) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.CHARACTERS,
          character.$id,
          data
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CHARACTERS,
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
            Tên Nhân Vật *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
            placeholder="Nhập tên nhân vật"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            User ID *
          </label>
          <input
            type="text"
            value={formData.userId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, userId: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
            placeholder="ID của user sở hữu"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cấp Độ
          </label>
          <input
            type="number"
            min="1"
            max="200"
            value={formData.level}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                level: parseInt(e.target.value) || 1,
              }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Kinh Nghiệm
          </label>
          <input
            type="number"
            min="0"
            max="9999999"
            value={formData.experience}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                experience: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Con Đường Tu Luyện
          </label>
          <select
            value={formData.cultivationPath}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                cultivationPath: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
          >
            {CULTIVATION_PATHS.map((path) => (
              <option key={path.value} value={path.value}>
                {path.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cảnh Giới
          </label>
          <input
            type="text"
            value={formData.realm}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, realm: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
            placeholder="Ví dụ: Luyện Khí"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tầng
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.stage}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                stage: parseInt(e.target.value) || 1,
              }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Linh Thạch
          </label>
          <input
            type="number"
            min="0"
            max="9999999"
            value={formData.spiritStones}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                spiritStones: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Vitals */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">
          Sinh Lực & Năng Lượng
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Sinh Lực
              </label>
              <input
                type="number"
                min="1"
                max="99999"
                value={formData.health}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    health: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Tối Đa</label>
              <input
                type="number"
                min="1"
                max="99999"
                value={formData.maxHealth}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxHealth: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Năng Lượng
              </label>
              <input
                type="number"
                min="0"
                max="9999"
                value={formData.energy}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    energy: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Tối Đa</label>
              <input
                type="number"
                min="1"
                max="9999"
                value={formData.maxEnergy}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxEnergy: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Thể Lực</label>
            <input
              type="number"
              min="0"
              max="9999"
              value={formData.stamina}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stamina: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Power Stats */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">Sức Mạnh Tu Vi</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Tinh Thần Lực
              </label>
              <input
                type="number"
                min="0"
                max="999999"
                value={formData.spiritualPower}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    spiritualPower: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Tối Đa</label>
              <input
                type="number"
                min="1"
                max="999999"
                value={formData.maxSpiritualPower}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxSpiritualPower: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Thể Lực</label>
            <input
              type="number"
              min="0"
              max="999999"
              value={formData.physicalPower}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  physicalPower: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Tinh Thần Lực
            </label>
            <input
              type="number"
              min="0"
              max="999999"
              value={formData.mentalPower}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  mentalPower: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Linh Khí</label>
            <input
              type="number"
              min="0"
              max="999999"
              value={formData.spiritualQi}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  spiritualQi: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Khí</label>
            <input
              type="number"
              min="0"
              max="999999"
              value={formData.qi}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  qi: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Cultivation Progress */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">
          Tiến Trình Tu Luyện
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Kháng Thiên Kiếp (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.tribulationResistance}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tribulationResistance: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Tiến Độ Tu Luyện (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.cultivationProgress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cultivationProgress: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Cần EXP Đột Phá
            </label>
            <input
              type="number"
              min="0"
              max="9999999"
              value={formData.nextBreakthrough}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  nextBreakthrough: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Kill Count */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Số Lượt Giết (Kill Count)
        </label>
        <input
          type="number"
          min="0"
          max="999999"
          value={formData.killCount}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              killCount: parseInt(e.target.value) || 0,
            }))
          }
          className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
        />
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
          {loading ? "Đang lưu..." : character ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
