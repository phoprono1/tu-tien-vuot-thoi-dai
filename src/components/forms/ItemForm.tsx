"use client";

import { useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID } from "appwrite";
import { Save, X } from "lucide-react";

interface ItemFormData {
  name: string;
  description: string;
  type: string;
  rarity: string;
  level: number;
  stats: Record<string, number>;
  price: number;
  stackable: boolean;
  maxStack: number;
  requirements: Record<string, number>;
  effects: Record<string, unknown>;
}

interface ItemFormProps {
  item?: {
    $id: string;
    name: string;
    description: string;
    type: string;
    rarity: string;
    level: number;
    stats: Record<string, number>;
    price: number;
    stackable: boolean;
    maxStack: number;
    requirements: Record<string, number>;
    effects: Record<string, unknown>;
  };
  onSuccess: () => void;
  onClose?: () => void;
}

const ITEM_TYPES = [
  { value: "weapon", label: "Vũ Khí" },
  { value: "armor", label: "Giáp" },
  { value: "accessory", label: "Phụ Kiện" },
  { value: "consumable", label: "Tiêu Hao" },
  { value: "material", label: "Nguyên Liệu" },
  { value: "treasure", label: "Bảo Vật" },
  { value: "pill", label: "Đan Dược" },
  { value: "formation", label: "Pháp Trận" },
];

const RARITIES = [
  { value: "common", label: "Phàm Phẩm", color: "text-gray-400" },
  { value: "uncommon", label: "Linh Phẩm", color: "text-green-400" },
  { value: "rare", label: "Bảo Phẩm", color: "text-blue-400" },
  { value: "epic", label: "Địa Phẩm", color: "text-purple-400" },
  { value: "legendary", label: "Thiên Phẩm", color: "text-orange-400" },
  { value: "mythic", label: "Tiên Phẩm", color: "text-red-400" },
];

const STAT_TYPES = [
  { key: "attack", label: "Công Kích" },
  { key: "defense", label: "Phòng Thủ" },
  { key: "health", label: "Sinh Lực" },
  { key: "mana", label: "Nội Lực" },
  { key: "speed", label: "Tốc Độ" },
  { key: "crit", label: "Bạo Kích" },
  { key: "critDamage", label: "Sát Thương Bạo Kích" },
  { key: "accuracy", label: "Chính Xác" },
  { key: "dodge", label: "Né Tránh" },
];

export default function ItemForm({ item, onSuccess, onClose }: ItemFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: item?.name || "",
    description: item?.description || "",
    type: item?.type || "weapon",
    rarity: item?.rarity || "common",
    level: item?.level || 1,
    stats: item?.stats || {},
    price: item?.price || 0,
    stackable: item?.stackable || false,
    maxStack: item?.maxStack || 1,
    requirements: item?.requirements || {},
    effects: item?.effects || {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Tên vật phẩm không được để trống");
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

      if (item) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.ITEMS,
          item.$id,
          data
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.ITEMS,
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

  const handleStatChange = (statKey: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statKey]: numValue,
      },
    }));
  };

  const handleRequirementChange = (reqKey: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [reqKey]: numValue,
      },
    }));
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
            Tên Vật Phẩm *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
            placeholder="Nhập tên vật phẩm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Loại Vật Phẩm
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
          >
            {ITEM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phẩm Chất
          </label>
          <select
            value={formData.rarity}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, rarity: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
          >
            {RARITIES.map((rarity) => (
              <option key={rarity.value} value={rarity.value}>
                {rarity.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cấp Độ
          </label>
          <input
            type="number"
            min="1"
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
            Giá Bán
          </label>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.stackable}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  stackable: e.target.checked,
                  maxStack: e.target.checked ? prev.maxStack : 1,
                }))
              }
              className="mr-2"
            />
            <span className="text-sm text-gray-300">Có thể chồng</span>
          </label>

          {formData.stackable && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Số lượng tối đa
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxStack}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxStack: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-20 px-2 py-1 bg-black/50 border border-purple-500/30 rounded text-white text-sm focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mô Tả
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          placeholder="Mô tả về vật phẩm..."
        />
      </div>

      {/* Stats */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">Thuộc Tính</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STAT_TYPES.map((stat) => (
            <div key={stat.key}>
              <label className="block text-sm text-gray-300 mb-1">
                {stat.label}
              </label>
              <input
                type="number"
                value={formData.stats[stat.key] || ""}
                onChange={(e) => handleStatChange(stat.key, e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">Yêu Cầu Sử Dụng</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Cấp Độ</label>
            <input
              type="number"
              min="1"
              value={formData.requirements.level || ""}
              onChange={(e) => handleRequirementChange("level", e.target.value)}
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
              placeholder="1"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tu Vi</label>
            <input
              type="number"
              min="0"
              value={formData.requirements.cultivation || ""}
              onChange={(e) =>
                handleRequirementChange("cultivation", e.target.value)
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Sức Mạnh</label>
            <input
              type="number"
              min="0"
              value={formData.requirements.strength || ""}
              onChange={(e) =>
                handleRequirementChange("strength", e.target.value)
              }
              className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
              placeholder="0"
            />
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
          {loading ? "Đang lưu..." : item ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
