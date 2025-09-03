"use client";

import AdminTable from "@/components/AdminTable";
import CultivationTechniqueForm from "@/components/CultivationTechniqueForm";
import { COLLECTIONS } from "@/lib/appwrite";
import {
  CultivationTechnique,
  TechniqueCategory,
  TechniqueRarity,
} from "@/types/cultivation";

const TECHNIQUE_CATEGORY_LABELS: Record<TechniqueCategory, string> = {
  offense: "Công Kích",
  defense: "Phòng Thủ",
  elemental: "Ngũ Hành",
  cultivation: "Tu Luyện",
  utility: "Tiện Ích",
  forbidden: "Tà Thuật",
};

const TECHNIQUE_RARITY_LABELS: Record<TechniqueRarity, string> = {
  mortal: "Phàm Cấp",
  spiritual: "Linh Cấp",
  earth: "Địa Cấp",
  heaven: "Thiên Cấp",
  immortal: "Tiên Cấp",
  divine: "Thần Cấp",
};

const RARITY_COLORS: Record<TechniqueRarity, string> = {
  mortal: "text-gray-400",
  spiritual: "text-green-400",
  earth: "text-yellow-600",
  heaven: "text-blue-400",
  immortal: "text-purple-400",
  divine: "text-red-400",
};

const PATH_LABELS = {
  qi: "Tu Luyện Khí",
  body: "Luyện Thể",
  demon: "Ma Đạo",
  all: "Tất Cả",
  "": "Tất Cả",
};

const columns = [
  {
    key: "name" as keyof CultivationTechnique,
    label: "Tên Công Pháp",
    sortable: true,
    searchable: true,
    render: (value: unknown, item: CultivationTechnique) => (
      <div className="font-medium text-white">
        {String(value)}
        <div className="text-xs text-gray-400">#{item.$id.slice(-6)}</div>
      </div>
    ),
  },
  {
    key: "category" as keyof CultivationTechnique,
    label: "Loại",
    sortable: true,
    render: (value: unknown) => (
      <span className="inline-block px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-sm">
        {TECHNIQUE_CATEGORY_LABELS[value as TechniqueCategory] || String(value)}
      </span>
    ),
  },
  {
    key: "rarity" as keyof CultivationTechnique,
    label: "Phẩm Cấp",
    sortable: true,
    render: (value: unknown) => {
      const rarity = value as TechniqueRarity;
      return (
        <span
          className={`font-medium ${RARITY_COLORS[rarity] || "text-gray-400"}`}
        >
          {TECHNIQUE_RARITY_LABELS[rarity] || String(value)}
        </span>
      );
    },
  },
  {
    key: "cultivationPath" as keyof CultivationTechnique,
    label: "Con Đường",
    sortable: true,
    render: (value: unknown) => (
      <span className="inline-block px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-sm">
        {PATH_LABELS[value as keyof typeof PATH_LABELS] || String(value)}
      </span>
    ),
  },
  {
    key: "minLevel" as keyof CultivationTechnique,
    label: "Cấp Tối Thiểu",
    sortable: true,
    render: (value: unknown) => (
      <span className="text-yellow-400 font-medium">Cấp {String(value)}</span>
    ),
  },
  {
    key: "costs" as keyof CultivationTechnique,
    label: "Chi Phí Học",
    sortable: false,
    render: (value: unknown) => {
      try {
        const costs = JSON.parse(String(value));
        return (
          <div className="text-sm">
            {costs.qi > 0 && <div className="text-blue-400">{costs.qi} Qi</div>}
            {costs.spiritStones > 0 && (
              <div className="text-green-400">{costs.spiritStones} 💎</div>
            )}
            {costs.stamina > 0 && (
              <div className="text-yellow-400">{costs.stamina} ⚡</div>
            )}
          </div>
        );
      } catch {
        return <span className="text-gray-500">-</span>;
      }
    },
  },
  {
    key: "effects" as keyof CultivationTechnique,
    label: "Hiệu Ứng",
    sortable: false,
    render: (value: unknown) => {
      try {
        const effects = JSON.parse(String(value));
        const activeEffects = Object.entries(effects)
          .filter(([, val]) => val && Number(val) > 0)
          .slice(0, 3); // Show max 3 effects

        return (
          <div className="text-xs">
            {activeEffects.map(([key, val]) => (
              <div key={key} className="text-gray-300">
                +{String(val)}%{" "}
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </div>
            ))}
            {activeEffects.length === 0 && (
              <span className="text-gray-500">Không có</span>
            )}
          </div>
        );
      } catch {
        return <span className="text-gray-500">-</span>;
      }
    },
  },
  {
    key: "$createdAt" as keyof CultivationTechnique,
    label: "Ngày Tạo",
    sortable: true,
    render: (value: unknown) => (
      <span className="text-gray-400 text-sm">
        {new Date(String(value)).toLocaleDateString("vi-VN")}
      </span>
    ),
  },
];

export default function TechniquesPage() {
  return (
    <AdminTable<CultivationTechnique>
      title="Công Pháp Tu Luyện"
      collectionId={COLLECTIONS.CULTIVATION_TECHNIQUES}
      columns={columns}
      createForm={(onSuccess) => (
        <CultivationTechniqueForm onSuccess={onSuccess} onClose={onSuccess} />
      )}
      editForm={(technique, onClose) => (
        <CultivationTechniqueForm
          technique={technique}
          onSuccess={onClose}
          onClose={onClose}
        />
      )}
    />
  );
}
