"use client";

import AdminTable from "@/components/AdminTable";
import ItemForm from "@/components/ItemForm";
import { COLLECTIONS } from "@/lib/appwrite";

interface Item {
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
  $createdAt: string;
  $updatedAt: string;
}

const RARITY_COLORS = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-orange-400",
  mythic: "text-red-400",
};

const RARITY_LABELS = {
  common: "Phàm Phẩm",
  uncommon: "Linh Phẩm",
  rare: "Bảo Phẩm",
  epic: "Địa Phẩm",
  legendary: "Thiên Phẩm",
  mythic: "Tiên Phẩm",
};

const TYPE_LABELS = {
  weapon: "Vũ Khí",
  armor: "Giáp",
  accessory: "Phụ Kiện",
  consumable: "Tiêu Hao",
  material: "Nguyên Liệu",
  treasure: "Bảo Vật",
  pill: "Đan Dược",
  formation: "Pháp Trận",
};

const columns = [
  {
    key: "name" as keyof Item,
    label: "Tên Vật Phẩm",
    sortable: true,
    searchable: true,
    render: (value: unknown, item: Item) => (
      <div className="font-medium text-white">
        {String(value)}
        <div className="text-xs text-gray-400">#{item.$id.slice(-6)}</div>
      </div>
    ),
  },
  {
    key: "type" as keyof Item,
    label: "Loại",
    sortable: true,
    render: (value: unknown) => (
      <span className="inline-block px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-sm">
        {TYPE_LABELS[value as keyof typeof TYPE_LABELS] || String(value)}
      </span>
    ),
  },
  {
    key: "rarity" as keyof Item,
    label: "Phẩm Chất",
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
    key: "level" as keyof Item,
    label: "Cấp Độ",
    sortable: true,
    render: (value: unknown) => (
      <span className="text-yellow-400 font-medium">Lv.{String(value)}</span>
    ),
  },
  {
    key: "price" as keyof Item,
    label: "Giá",
    sortable: true,
    render: (value: unknown) => (
      <span className="text-green-400">
        {Number(value).toLocaleString()} 💰
      </span>
    ),
  },
  {
    key: "stackable" as keyof Item,
    label: "Chồng được",
    render: (value: unknown, item: Item) => (
      <div className="text-sm">
        {value ? (
          <span className="text-green-400">✓ ({item.maxStack})</span>
        ) : (
          <span className="text-red-400">✗</span>
        )}
      </div>
    ),
  },
  {
    key: "$createdAt" as keyof Item,
    label: "Ngày Tạo",
    sortable: true,
    render: (value: unknown) => (
      <span className="text-gray-400 text-sm">
        {new Date(String(value)).toLocaleDateString("vi-VN")}
      </span>
    ),
  },
];

export default function ItemsPage() {
  return (
    <AdminTable<Item>
      title="Vật Phẩm"
      collectionId={COLLECTIONS.ITEMS}
      columns={columns}
      createForm={(onSuccess) => <ItemForm onSuccess={onSuccess} />}
      editForm={(item, onClose) => (
        <ItemForm item={item} onSuccess={onClose} onClose={onClose} />
      )}
    />
  );
}
