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
  attack?: number;
  defense?: number;
  agility?: number;
}

interface CharacterFormProps {
  character?: CharacterFormData & { $id: string };
  onSuccess?: () => void;
  onClose?: () => void;
}

const cultivationPaths = [
  { value: "qi", label: "Khí Tu" },
  { value: "body", label: "Thể Tu" },
  { value: "demon", label: "Ma Tu" },
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
      const documentData = {
        ...formData,
        lastCultivationUpdate: new Date().toISOString(),
      };

      let result;
      if (character?.$id) {
        // Update existing character
        result = await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.CHARACTERS,
          character.$id,
          documentData
        );
      } else {
        // Create new character
        result = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CHARACTERS,
          ID.unique(),
          documentData
        );

        // Also create combat stats for the new character
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.COMBAT_STATS,
          ID.unique(),
          {
            characterId: result.$id,
            maxHealth: 100,
            currentHealth: 100,
            maxStamina: formData.stamina,
            currentStamina: formData.stamina,
            attack: 10,
            defense: 10,
            agility: 10,
            criticalRate: 5,
            counterAttackRate: 5,
            multiStrikeRate: 5,
            lifeStealRate: 0,
            healthRegenRate: 1,
            burnRate: 0,
            poisonRate: 0,
            freezeRate: 0,
            stunRate: 0,
          }
        );
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Error saving character:", err);
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu nhân vật"
      );
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
      <div>
        <h4 className="text-lg font-medium text-white mb-3">
          Thông Tin Cơ Bản
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tên Nhân Vật *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
              placeholder="Nhập tên nhân vật..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User ID *
            </label>
            <input
              type="text"
              required
              value={formData.userId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, userId: e.target.value }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
              placeholder="Nhập User ID..."
            />
          </div>
        </div>
      </div>

      {/* Cultivation Path */}
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
          {cultivationPaths.map((path) => (
            <option key={path.value} value={path.value}>
              {path.label}
            </option>
          ))}
        </select>
      </div>

      {/* Level & Experience */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">
          Cấp Độ & Kinh Nghiệm
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cấp Độ
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={formData.level}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  level: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kinh Nghiệm
            </label>
            <input
              type="number"
              min="0"
              value={formData.experience}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  experience: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Linh Thạch
            </label>
            <input
              type="number"
              min="0"
              value={formData.spiritStones}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  spiritStones: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Energy & Stamina */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">
          Năng Lượng & Thể Lực
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Năng Lượng
            </label>
            <input
              type="number"
              min="0"
              value={formData.energy}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  energy: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Năng Lượng Tối Đa
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxEnergy}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxEnergy: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thể Lực
            </label>
            <input
              type="number"
              min="1"
              value={formData.stamina}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stamina: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-purple-500/30">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? "Đang lưu..." : character ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
