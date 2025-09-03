"use client";

import AdminTable from "@/components/AdminTable";
import CharacterForm from "@/components/CharacterForm";
import { COLLECTIONS } from "@/lib/appwrite";

interface Character {
  $id: string;
  userId: string;
  name: string;
  cultivationPath: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  stamina: number;
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
  $createdAt: string;
  $updatedAt: string;
}

const PATH_LABELS = {
  qi: "Tu Luyện Khí",
  body: "Luyện Thể",
  demon: "Ma Đạo",
};

const columns = [
  {
    key: "name" as keyof Character,
    label: "Tên Nhân Vật",
    sortable: true,
    searchable: true,
    render: (value: unknown, item: Character) => (
      <div className="flex items-center gap-3">
        <div>
          <div className="font-medium text-white">{String(value)}</div>
          <div className="text-xs text-gray-400">#{item.$id.slice(-6)}</div>
        </div>
      </div>
    ),
  },
  {
    key: "userId" as keyof Character,
    label: "User ID",
    sortable: true,
    searchable: true,
    render: (value: unknown) => (
      <span className="text-gray-300 text-sm">{String(value).slice(-8)}</span>
    ),
  },
  {
    key: "level" as keyof Character,
    label: "Cấp Độ",
    sortable: true,
    render: (value: unknown, item: Character) => (
      <div className="text-center">
        <span className="text-yellow-400 font-bold text-lg">
          {String(value)}
        </span>
        <div className="text-xs text-gray-400">
          {Number(item.experience).toLocaleString()} EXP
        </div>
      </div>
    ),
  },
  {
    key: "cultivationPath" as keyof Character,
    label: "Con Đường",
    sortable: true,
    render: (value: unknown) => (
      <span className="inline-block px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-sm">
        {PATH_LABELS[value as keyof typeof PATH_LABELS] || String(value)}
      </span>
    ),
  },
  {
    key: "realm" as keyof Character,
    label: "Cảnh Giới",
    sortable: true,
    searchable: true,
    render: (value: unknown, item: Character) => (
      <div>
        <span className="text-blue-300 font-medium">{String(value)}</span>
        <div className="text-xs text-gray-400">Tầng {item.stage}</div>
      </div>
    ),
  },
  {
    key: "health" as keyof Character,
    label: "Sinh Lực",
    render: (value: unknown, item: Character) => (
      <div className="w-20">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-red-400">{String(value)}</span>
          <span className="text-gray-400">{item.maxHealth}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-red-400 h-2 rounded-full"
            style={{ width: `${(Number(value) / item.maxHealth) * 100}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    key: "energy" as keyof Character,
    label: "Năng Lượng",
    render: (value: unknown, item: Character) => (
      <div className="w-20">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-blue-400">{String(value)}</span>
          <span className="text-gray-400">{item.maxEnergy}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-400 h-2 rounded-full"
            style={{ width: `${(Number(value) / item.maxEnergy) * 100}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    key: "spiritualPower" as keyof Character,
    label: "Tu Vi",
    sortable: true,
    render: (value: unknown, item: Character) => (
      <div className="text-right">
        <div className="text-purple-400">
          ⚡ {Number(value).toLocaleString()}
        </div>
        <div className="text-cyan-300 text-sm">
          💪 {Number(item.physicalPower).toLocaleString()}
        </div>
        <div className="text-pink-300 text-sm">
          🧠 {Number(item.mentalPower).toLocaleString()}
        </div>
      </div>
    ),
  },
  {
    key: "spiritStones" as keyof Character,
    label: "Tài Sản",
    sortable: true,
    render: (value: unknown, item: Character) => (
      <div className="text-right">
        <div className="text-blue-300">{Number(value).toLocaleString()} 💎</div>
        <div className="text-yellow-300 text-sm">
          Qi: {Number(item.qi).toLocaleString()}
        </div>
      </div>
    ),
  },
  {
    key: "cultivationProgress" as keyof Character,
    label: "Tu Luyện",
    sortable: true,
    render: (value: unknown, item: Character) => (
      <div className="w-24">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-green-400">{Number(value).toFixed(1)}%</span>
          <span className="text-orange-400">{item.killCount} kills</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-400 h-2 rounded-full"
            style={{ width: `${Number(value)}%` }}
          />
        </div>
      </div>
    ),
  },
  {
    key: "$createdAt" as keyof Character,
    label: "Ngày Tạo",
    sortable: true,
    render: (value: unknown) => (
      <span className="text-gray-400 text-sm">
        {new Date(String(value)).toLocaleDateString("vi-VN")}
      </span>
    ),
  },
];

export default function CharactersPage() {
  return (
    <AdminTable<Character>
      title="Nhân Vật"
      collectionId={COLLECTIONS.CHARACTERS}
      columns={columns}
      createForm={(onSuccess) => <CharacterForm onSuccess={onSuccess} />}
      editForm={(character, onClose) => (
        <CharacterForm
          character={character}
          onSuccess={onClose}
          onClose={onClose}
        />
      )}
    />
  );
}
