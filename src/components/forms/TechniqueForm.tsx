"use client";

import { useState } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID } from "appwrite";
import { Save, X } from "lucide-react";

interface TechniqueFormData {
  name: string;
  description: string;
  type: string;
  grade: string;
  level: number;
  maxLevel: number;
  cultivationPath: string;
  requirements: Record<string, number>;
  effects: Record<string, unknown>;
  learningCost: number;
  upgradeCost: number;
}

interface TechniqueFormProps {
  technique?: {
    $id: string;
    name: string;
    description: string;
    type: string;
    grade: string;
    level: number;
    maxLevel: number;
    cultivationPath: string;
    requirements: Record<string, number>;
    effects: Record<string, unknown>;
    learningCost: number;
    upgradeCost: number;
  };
  onSuccess: () => void;
  onClose?: () => void;
}

const TECHNIQUE_TYPES = [
  { value: "attack", label: "Công Kích" },
  { value: "defense", label: "Phòng Thủ" },
  { value: "movement", label: "Thân Pháp" },
  { value: "support", label: "Hỗ Trợ" },
  { value: "healing", label: "Trị Liệu" },
  { value: "buff", label: "Tăng Cường" },
  { value: "debuff", label: "Suy Yếu" },
  { value: "formation", label: "Pháp Trận" },
];

const TECHNIQUE_GRADES = [
  { value: "mortal", label: "Phàm Cấp", color: "text-gray-400" },
  { value: "earth", label: "Địa Cấp", color: "text-yellow-600" },
  { value: "heaven", label: "Thiên Cấp", color: "text-blue-400" },
  { value: "immortal", label: "Tiên Cấp", color: "text-purple-400" },
  { value: "divine", label: "Thần Cấp", color: "text-red-400" },
  { value: "chaos", label: "Hỗn Độn", color: "text-black" },
];

const CULTIVATION_PATHS = [
  { value: "qi", label: "Tu Luyện Khí" },
  { value: "body", label: "Luyện Thể" },
  { value: "demon", label: "Ma Đạo" },
  { value: "all", label: "Tất Cả" },
];

export default function TechniqueForm({
  technique,
  onSuccess,
  onClose,
}: TechniqueFormProps) {
  const [formData, setFormData] = useState<TechniqueFormData>({
    name: technique?.name || "",
    description: technique?.description || "",
    type: technique?.type || "attack",
    grade: technique?.grade || "mortal",
    level: technique?.level || 1,
    maxLevel: technique?.maxLevel || 10,
    cultivationPath: technique?.cultivationPath || "all",
    requirements: technique?.requirements || {},
    effects: technique?.effects || {},
    learningCost: technique?.learningCost || 100,
    upgradeCost: technique?.upgradeCost || 50,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Tên công pháp không được để trống");
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

      if (technique) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.CULTIVATION_TECHNIQUES,
          technique.$id,
          data
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CULTIVATION_TECHNIQUES,
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
            Tên Công Pháp *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
            placeholder="Nhập tên công pháp"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Loại Công Pháp
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
          >
            {TECHNIQUE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phẩm Cấp
          </label>
          <select
            value={formData.grade}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, grade: e.target.value }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none"
          >
            {TECHNIQUE_GRADES.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
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
            Cấp Độ Hiện Tại
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
            Cấp Độ Tối Đa
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxLevel}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                maxLevel: parseInt(e.target.value) || 10,
              }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chi Phí Học (Linh Thạch)
          </label>
          <input
            type="number"
            min="0"
            value={formData.learningCost}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                learningCost: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chi Phí Nâng Cấp/Level
          </label>
          <input
            type="number"
            min="0"
            value={formData.upgradeCost}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                upgradeCost: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          />
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
          rows={4}
          className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none"
          placeholder="Mô tả về công pháp, hiệu quả, cách sử dụng..."
        />
      </div>

      {/* Requirements */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">Yêu Cầu Học</h4>
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
            <label className="block text-sm text-gray-300 mb-1">
              Tinh Thần
            </label>
            <input
              type="number"
              min="0"
              value={formData.requirements.spirit || ""}
              onChange={(e) =>
                handleRequirementChange("spirit", e.target.value)
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
          {loading ? "Đang lưu..." : technique ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
}
