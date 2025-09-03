"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import {
  Settings,
  Package,
  Sword,
  Book,
  Zap,
  Users,
  Building,
  Shield,
  Crown,
  Menu,
  X,
} from "lucide-react";

const adminMenuItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Settings,
    description: "Tổng quan hệ thống",
  },
  {
    name: "Vật Phẩm",
    href: "/admin/items",
    icon: Package,
    description: "Quản lý items và trang bị",
  },
  {
    name: "Công Pháp",
    href: "/admin/techniques",
    icon: Book,
    description: "Quản lý cultivation techniques",
  },
  {
    name: "Công Kỹ",
    href: "/admin/skills",
    icon: Sword,
    description: "Quản lý skill books",
  },
  {
    name: "Combat Stats",
    href: "/admin/combat-stats",
    icon: Zap,
    description: "Quản lý combat stats",
  },
  {
    name: "Nhân Vật",
    href: "/admin/characters",
    icon: Users,
    description: "Quản lý characters",
  },
  {
    name: "Tông Môn",
    href: "/admin/sects",
    icon: Building,
    description: "Quản lý sects và guilds",
  },
  {
    name: "Thiên Kiếp",
    href: "/admin/trials",
    icon: Crown,
    description: "Quản lý trials và thí luyện",
  },
  {
    name: "Trận Đấu",
    href: "/admin/battles",
    icon: Shield,
    description: "Quản lý battles và PvP",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 w-80 bg-black/40 backdrop-blur-sm border-r border-purple-500/30 
          transform transition-transform duration-300 ease-in-out z-50
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0
        `}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-purple-500/30">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Tu Tiên Admin Panel
                </h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-400 hover:text-white p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Quản lý game data và settings
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {adminMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center p-3 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? "bg-purple-600/20 border border-purple-500/50 text-purple-300"
                          : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-purple-500/30">
              <Link
                href="/"
                className="flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all"
              >
                <Settings className="w-4 h-4 mr-2" />
                Quay về Game
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:ml-80">
          {/* Top bar */}
          <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-30">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  Admin Panel - Game Management
                </div>
                <div
                  className="w-3 h-3 bg-green-500 rounded-full animate-pulse"
                  title="System Online"
                />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
