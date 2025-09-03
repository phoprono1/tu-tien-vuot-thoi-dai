"use client";

import { useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import {
  Package,
  Book,
  Sword,
  Users,
  Building,
  Crown,
  Shield,
  Zap,
  TrendingUp,
  Database,
  Activity,
  BarChart3,
  Settings,
} from "lucide-react";

interface Stats {
  items: number;
  techniques: number;
  skills: number;
  characters: number;
  users: number;
  sects: number;
  battles: number;
  tribulations: number;
  combatStats: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    items: 0,
    techniques: 0,
    skills: 0,
    characters: 0,
    users: 0,
    sects: 0,
    battles: 0,
    tribulations: 0,
    combatStats: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const collections = Object.values(COLLECTIONS);
      const promises = collections.map(async (collectionId) => {
        try {
          const result = await databases.listDocuments(
            DATABASE_ID,
            collectionId
          );
          return { collection: collectionId, count: result.total };
        } catch (err) {
          console.warn(`Failed to fetch stats for ${collectionId}:`, err);
          return { collection: collectionId, count: 0 };
        }
      });

      const results = await Promise.all(promises);

      const newStats: Stats = {
        items:
          results.find((r) => r.collection === COLLECTIONS.ITEMS)?.count || 0,
        techniques:
          results.find(
            (r) => r.collection === COLLECTIONS.CULTIVATION_TECHNIQUES
          )?.count || 0,
        skills:
          results.find((r) => r.collection === COLLECTIONS.SKILL_BOOKS)
            ?.count || 0,
        characters:
          results.find((r) => r.collection === COLLECTIONS.CHARACTERS)?.count ||
          0,
        users:
          results.find((r) => r.collection === COLLECTIONS.USERS)?.count || 0,
        sects:
          results.find((r) => r.collection === COLLECTIONS.SECTS)?.count || 0,
        battles:
          results.find((r) => r.collection === COLLECTIONS.BATTLES)?.count || 0,
        tribulations:
          results.find((r) => r.collection === COLLECTIONS.TRIBULATIONS)
            ?.count || 0,
        combatStats:
          results.find((r) => r.collection === COLLECTIONS.COMBAT_STATS)
            ?.count || 0,
      };

      setStats(newStats);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Vật Phẩm",
      value: stats.items,
      icon: Package,
      color: "from-green-600 to-emerald-600",
      href: "/admin/items",
    },
    {
      name: "Công Pháp",
      value: stats.techniques,
      icon: Book,
      color: "from-purple-600 to-indigo-600",
      href: "/admin/techniques",
    },
    {
      name: "Công Kỹ",
      value: stats.skills,
      icon: Sword,
      color: "from-red-600 to-pink-600",
      href: "/admin/skills",
    },
    {
      name: "Nhân Vật",
      value: stats.characters,
      icon: Users,
      color: "from-blue-600 to-cyan-600",
      href: "/admin/characters",
    },
    {
      name: "Người Chơi",
      value: stats.users,
      icon: Activity,
      color: "from-yellow-600 to-orange-600",
      href: "/admin/users",
    },
    {
      name: "Tông Môn",
      value: stats.sects,
      icon: Building,
      color: "from-indigo-600 to-purple-600",
      href: "/admin/sects",
    },
    {
      name: "Trận Đấu",
      value: stats.battles,
      icon: Shield,
      color: "from-red-600 to-rose-600",
      href: "/admin/battles",
    },
    {
      name: "Thiên Kiếp",
      value: stats.tribulations,
      icon: Crown,
      color: "from-amber-600 to-yellow-600",
      href: "/admin/tribulations",
    },
    {
      name: "Combat Stats",
      value: stats.combatStats,
      icon: Zap,
      color: "from-cyan-600 to-blue-600",
      href: "/admin/combat-stats",
    },
    {
      name: "Cài Đặt Server",
      value: "⚙️",
      icon: Settings,
      color: "from-gray-600 to-slate-600",
      href: "/admin/server",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <h3 className="text-red-400 font-semibold mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-gray-300">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-400">
          Tổng quan hệ thống Tu Tiên Vượt Thời Đại
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={fetchStats}
          className="p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all"
        >
          <Database className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-white font-medium">Refresh Stats</div>
        </button>

        <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg">
          <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-white font-medium">System Online</div>
        </div>

        <div className="p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg">
          <BarChart3 className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-white font-medium">Analytics</div>
        </div>

        <div className="p-4 bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-lg">
          <Activity className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <div className="text-white font-medium">Monitor</div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-all group cursor-pointer"
            onClick={() => (window.location.href = card.href)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{card.name}</p>
                <p className="text-3xl font-bold text-white">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div
                className={`p-3 rounded-full bg-gradient-to-r ${card.color} group-hover:scale-110 transition-transform`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Click để quản lý {card.name.toLowerCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-300">Database đã được cập nhật</span>
            </div>
            <span className="text-gray-500 text-sm">2 phút trước</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-300">
                Có {stats.users} người chơi trực tuyến
              </span>
            </div>
            <span className="text-gray-500 text-sm">5 phút trước</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-300">Admin panel đã khởi tạo</span>
            </div>
            <span className="text-gray-500 text-sm">10 phút trước</span>
          </div>
        </div>
      </div>
    </div>
  );
}
