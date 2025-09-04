"use client";

import React, { useState, useEffect } from "react";
import {
  Book,
  Star,
  Zap,
  Shield,
  Swords,
  DollarSign,
  Target,
} from "lucide-react";
import {
  CultivationTechnique,
  TechniqueCategory,
  TechniqueRarity,
} from "@/types/cultivation";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID } from "appwrite";

interface CultivationTechniqueFormProps {
  technique?: CultivationTechnique;
  onSuccess: () => void;
  onClose?: () => void;
}

const TECHNIQUE_CATEGORIES: {
  value: TechniqueCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "offense",
    label: "Công Kích",
    icon: <Swords className="w-4 h-4" />,
  },
  {
    value: "defense",
    label: "Phòng Thủ",
    icon: <Shield className="w-4 h-4" />,
  },
  { value: "elemental", label: "Ngũ Hành", icon: <Zap className="w-4 h-4" /> },
  {
    value: "cultivation",
    label: "Tu Luyện",
    icon: <Star className="w-4 h-4" />,
  },
  { value: "utility", label: "Tiện Ích", icon: <Target className="w-4 h-4" /> },
  { value: "forbidden", label: "Tà Thuật", icon: <Book className="w-4 h-4" /> },
];

const TECHNIQUE_RARITIES: {
  value: TechniqueRarity;
  label: string;
  color: string;
}[] = [
  { value: "mortal", label: "Phàm Cấp", color: "text-gray-400" },
  { value: "spiritual", label: "Linh Cấp", color: "text-green-400" },
  { value: "earth", label: "Địa Cấp", color: "text-yellow-400" },
  { value: "heaven", label: "Thiên Cấp", color: "text-blue-400" },
  { value: "immortal", label: "Tiên Cấp", color: "text-purple-400" },
  { value: "divine", label: "Thần Cấp", color: "text-red-400" },
];

const CULTIVATION_PATHS = [
  { value: "", label: "Tất Cả Con Đường" },
  { value: "qi", label: "Tu Luyện Khí" },
  { value: "body", label: "Luyện Thể" },
  { value: "demon", label: "Ma Đạo" },
];

export default function CultivationTechniqueForm({
  technique,
  onSuccess,
  onClose,
}: CultivationTechniqueFormProps) {
  // Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TechniqueCategory>("offense");
  const [rarity, setRarity] = useState<TechniqueRarity>("mortal");
  const [minLevel, setMinLevel] = useState(1);
  const [cultivationPath, setCultivationPath] = useState("");

  // Costs (JSON format)
  const [costQi, setCostQi] = useState(0);
  const [costSpiritStones, setCostSpiritStones] = useState(0);
  const [costStamina, setCostStamina] = useState(0);

  // Base Combat Stats Effects
  const [attackBonus, setAttackBonus] = useState(0);
  const [defenseBonus, setDefenseBonus] = useState(0);
  const [healthBonus, setHealthBonus] = useState(0);
  const [staminaBonus, setStaminaBonus] = useState(0);
  const [agilityBonus, setAgilityBonus] = useState(0);

  // Cultivation Effects
  const [qiGainMultiplier, setQiGainMultiplier] = useState(0);
  const [expGainMultiplier, setExpGainMultiplier] = useState(0);
  const [breakthroughChanceBonus, setBreakthroughChanceBonus] = useState(0);
  const [cultivationSpeedBonus, setCultivationSpeedBonus] = useState(0);

  // Resource Effects
  const [staminaRegenBonus, setStaminaRegenBonus] = useState(0);
  const [spiritStoneGainBonus, setSpiritStoneGainBonus] = useState(0);

  // Special Effects
  const [tribulationResistanceBonus, setTribulationResistanceBonus] =
    useState(0);
  const [realmStabilityBonus, setRealmStabilityBonus] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (technique) {
      setName(technique.name);
      setDescription(technique.description);
      setCategory(technique.category);
      setRarity(technique.rarity);
      setMinLevel(technique.minLevel);
      setCultivationPath(technique.cultivationPath || "");

      // Parse costs JSON
      try {
        const costs = JSON.parse(technique.costs);
        setCostQi(costs.qi || 0);
        setCostSpiritStones(costs.spiritStones || 0);
        setCostStamina(costs.stamina || 0);
      } catch (error) {
        console.error("Error parsing technique costs:", error);
      }

      // Parse effects JSON
      try {
        const effects = JSON.parse(technique.effects);
        setAttackBonus(effects.attackBonus || 0);
        setDefenseBonus(effects.defenseBonus || 0);
        setHealthBonus(effects.healthBonus || 0);
        setStaminaBonus(effects.staminaBonus || 0);
        setAgilityBonus(effects.agilityBonus || 0);
        setQiGainMultiplier(effects.qiGainMultiplier || 0);
        setExpGainMultiplier(effects.expGainMultiplier || 0);
        setBreakthroughChanceBonus(effects.breakthroughChanceBonus || 0);
        setCultivationSpeedBonus(effects.cultivationSpeedBonus || 0);
        setStaminaRegenBonus(effects.staminaRegenBonus || 0);
        setSpiritStoneGainBonus(effects.spiritStoneGainBonus || 0);
        setTribulationResistanceBonus(effects.tribulationResistanceBonus || 0);
        setRealmStabilityBonus(effects.realmStabilityBonus || 0);
      } catch (error) {
        console.error("Error parsing technique effects:", error);
      }
    }
  }, [technique]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // Prepare costs JSON
      const costs = JSON.stringify({
        qi: costQi,
        spiritStones: costSpiritStones,
        stamina: costStamina,
      });

      // Prepare effects JSON
      const effects = JSON.stringify({
        attackBonus,
        defenseBonus,
        healthBonus,
        staminaBonus,
        agilityBonus,
        qiGainMultiplier,
        expGainMultiplier,
        breakthroughChanceBonus,
        cultivationSpeedBonus,
        staminaRegenBonus,
        spiritStoneGainBonus,
        tribulationResistanceBonus,
        realmStabilityBonus,
      });

      const data = {
        name: name.trim(),
        description: description.trim(),
        category,
        rarity,
        minLevel,
        cultivationPath: cultivationPath || null,
        costs,
        effects,
      };

      if (technique) {
        // Update existing technique
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.CULTIVATION_TECHNIQUES,
          technique.$id,
          data
        );
      } else {
        // Create new technique
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.CULTIVATION_TECHNIQUES,
          ID.unique(),
          data
        );
      }

      onSuccess();

      // Close the form after successful submission
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving technique:", error);
      alert("Có lỗi xảy ra khi lưu công pháp");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {technique ? "Chỉnh Sửa Công Pháp" : "Tạo Công Pháp Mới"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Book className="w-5 h-5" />
                Thông Tin Cơ Bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên Công Pháp *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Ví dụ: Cửu Dương Thần Công"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cấp Độ Tối Thiểu
                  </label>
                  <input
                    type="number"
                    value={minLevel}
                    onChange={(e) => setMinLevel(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phân Loại
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as TechniqueCategory)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    {TECHNIQUE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phẩm Cấp
                  </label>
                  <select
                    value={rarity}
                    onChange={(e) =>
                      setRarity(e.target.value as TechniqueRarity)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    {TECHNIQUE_RARITIES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Con Đường Tu Luyện
                  </label>
                  <select
                    value={cultivationPath}
                    onChange={(e) => setCultivationPath(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    {CULTIVATION_PATHS.map((path) => (
                      <option key={path.value} value={path.value}>
                        {path.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mô Tả
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    rows={3}
                    placeholder="Mô tả chi tiết về công pháp..."
                  />
                </div>
              </div>
            </div>

            {/* Learning Costs */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Chi Phí Học Tập
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Qi Required
                  </label>
                  <input
                    type="number"
                    value={costQi}
                    onChange={(e) => setCostQi(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Linh Thạch
                  </label>
                  <input
                    type="number"
                    value={costSpiritStones}
                    onChange={(e) =>
                      setCostSpiritStones(parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thể Lực
                  </label>
                  <input
                    type="number"
                    value={costStamina}
                    onChange={(e) =>
                      setCostStamina(parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Combat Stats Effects */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5" />
                Hiệu Ứng Chiến Đấu (Base Stats)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💪 Attack Bonus (%)
                  </label>
                  <input
                    type="number"
                    value={attackBonus}
                    onChange={(e) =>
                      setAttackBonus(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🛡️ Defense Bonus (%)
                  </label>
                  <input
                    type="number"
                    value={defenseBonus}
                    onChange={(e) =>
                      setDefenseBonus(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ❤️ Health Bonus (%)
                  </label>
                  <input
                    type="number"
                    value={healthBonus}
                    onChange={(e) =>
                      setHealthBonus(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ⚡ Stamina Bonus (%)
                  </label>
                  <input
                    type="number"
                    value={staminaBonus}
                    onChange={(e) =>
                      setStaminaBonus(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💨 Agility Bonus (%)
                  </label>
                  <input
                    type="number"
                    value={agilityBonus}
                    onChange={(e) =>
                      setAgilityBonus(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Cultivation Effects */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Hiệu Ứng Tu Luyện
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🌟 Qi Gain Multiplier (%)
                  </label>
                  <input
                    type="number"
                    value={qiGainMultiplier}
                    onChange={(e) =>
                      setQiGainMultiplier(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📈 EXP Gain Multiplier (%)
                  </label>
                  <input
                    type="number"
                    value={expGainMultiplier}
                    onChange={(e) =>
                      setExpGainMultiplier(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🚀 Breakthrough Chance (%)
                  </label>
                  <input
                    type="number"
                    value={breakthroughChanceBonus}
                    onChange={(e) =>
                      setBreakthroughChanceBonus(
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ⏰ Cultivation Speed (%)
                  </label>
                  <input
                    type="number"
                    value={cultivationSpeedBonus}
                    onChange={(e) =>
                      setCultivationSpeedBonus(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Resource & Special Effects */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Hiệu Ứng Đặc Biệt
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🔋 Stamina Regen Bonus (%)
                  </label>
                  <input
                    type="number"
                    value={staminaRegenBonus}
                    onChange={(e) =>
                      setStaminaRegenBonus(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💎 Spirit Stone Gain (%)
                  </label>
                  <input
                    type="number"
                    value={spiritStoneGainBonus}
                    onChange={(e) =>
                      setSpiritStoneGainBonus(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ⚡ Tribulation Resistance (%)
                  </label>
                  <input
                    type="number"
                    value={tribulationResistanceBonus}
                    onChange={(e) =>
                      setTribulationResistanceBonus(
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🎯 Realm Stability (%)
                  </label>
                  <input
                    type="number"
                    value={realmStabilityBonus}
                    onChange={(e) =>
                      setRealmStabilityBonus(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Đang lưu..." : technique ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
