"use client";

import AdminTable from "@/components/AdminTable";
import SkillForm from "@/components/SkillForm";
import { COLLECTIONS } from "@/lib/appwrite";

interface Skill {
  $id: string;
  name: string;
  description: string;
  element: string;
  rarity: string;
  // Combat Rate Bonuses
  burnRateBonus?: number;
  poisonRateBonus?: number;
  freezeRateBonus?: number;
  stunRateBonus?: number;
  criticalRateBonus?: number;
  counterAttackRateBonus?: number;
  multiStrikeRateBonus?: number;
  lifeStealRateBonus?: number;
  healthRegenRateBonus?: number;
  $createdAt: string;
  $updatedAt: string;
}

const RARITY_COLORS = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-orange-400",
  immortal: "text-red-400",
};

const RARITY_LABELS = {
  common: "Thường",
  uncommon: "Không Thường",
  rare: "Hiếm",
  epic: "Sử Thi",
  legendary: "Huyền Thoại",
  immortal: "Bất Tử",
};

const ELEMENT_LABELS = {
  fire: "🔥 Hỏa",
  ice: "❄️ Băng",
  poison: "🧪 Độc",
  lightning: "⚡ Lôi",
  earth: "🌍 Thổ",
  wind: "💨 Phong",
  light: "✨ Quang",
  dark: "🌑 Ám",
  physical: "⚔️ Vật Lý",
  mental: "🧠 Tinh Thần",
};

const columns = [
  {
    key: "name" as keyof Skill,
    label: "Tên Công Kỹ",
    sortable: true,
    searchable: true,
    render: (value: unknown, item: Skill) => (
      <div className="font-medium text-white">
        {String(value)}
        <div className="text-xs text-gray-400">#{item.$id.slice(-6)}</div>
      </div>
    ),
  },
  {
    key: "element" as keyof Skill,
    label: "Thuộc Tính",
    sortable: true,
    render: (value: unknown) => (
      <span className="inline-block px-2 py-1 bg-green-900/30 text-green-400 rounded text-sm">
        {ELEMENT_LABELS[value as keyof typeof ELEMENT_LABELS] || String(value)}
      </span>
    ),
  },
  {
    key: "rarity" as keyof Skill,
    label: "Độ Hiếm",
    sortable: true,
    render: (value: unknown) => {
      const rarity = value as keyof typeof RARITY_COLORS;
      return (
        <span
          className={`font-medium ${RARITY_COLORS[rarity] || "text-gray-400"}`}
        >
          {RARITY_LABELS[rarity] || String(value)}
        </span>
      );
    },
  },
  {
    key: "burnRateBonus" as keyof Skill,
    label: "Combat Buffs",
    render: (value: unknown, item: Skill) => {
      const bonuses = [];
      if (item.burnRateBonus && item.burnRateBonus > 0)
        bonuses.push(`🔥+${item.burnRateBonus}%`);
      if (item.poisonRateBonus && item.poisonRateBonus > 0)
        bonuses.push(`🧪+${item.poisonRateBonus}%`);
      if (item.freezeRateBonus && item.freezeRateBonus > 0)
        bonuses.push(`❄️+${item.freezeRateBonus}%`);
      if (item.stunRateBonus && item.stunRateBonus > 0)
        bonuses.push(`⚡+${item.stunRateBonus}%`);
      if (item.criticalRateBonus && item.criticalRateBonus > 0)
        bonuses.push(`💥+${item.criticalRateBonus}%`);
      if (item.counterAttackRateBonus && item.counterAttackRateBonus > 0)
        bonuses.push(`🛡️+${item.counterAttackRateBonus}%`);
      if (item.multiStrikeRateBonus && item.multiStrikeRateBonus > 0)
        bonuses.push(`🗡️+${item.multiStrikeRateBonus}%`);
      if (item.lifeStealRateBonus && item.lifeStealRateBonus > 0)
        bonuses.push(`🩸+${item.lifeStealRateBonus}%`);
      if (item.healthRegenRateBonus && item.healthRegenRateBonus > 0)
        bonuses.push(`💚+${item.healthRegenRateBonus}%`);

      return bonuses.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {bonuses.map((bonus, index) => (
            <span
              key={index}
              className="text-xs bg-purple-900/30 text-purple-300 px-1 py-0.5 rounded"
            >
              {bonus}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-500 text-xs">Không có buff</span>
      );
    },
  },
  {
    key: "description" as keyof Skill,
    label: "Mô Tả",
    searchable: true,
    render: (value: unknown) => (
      <span className="text-gray-300 text-sm">
        {String(value).length > 100
          ? String(value).substring(0, 100) + "..."
          : String(value)}
      </span>
    ),
  },
  {
    key: "$createdAt" as keyof Skill,
    label: "Ngày Tạo",
    sortable: true,
    render: (value: unknown) => (
      <span className="text-gray-400 text-sm">
        {new Date(String(value)).toLocaleDateString("vi-VN")}
      </span>
    ),
  },
];

export default function SkillsPage() {
  return (
    <AdminTable<Skill>
      title="Công Kỹ"
      collectionId={COLLECTIONS.SKILL_BOOKS}
      columns={columns}
      createForm={(onSuccess) => <SkillForm onSuccess={onSuccess} />}
      editForm={(skill, onClose) => (
        <SkillForm skill={skill} onSuccess={onClose} onClose={onClose} />
      )}
    />
  );
}
