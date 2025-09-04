"use client";

import { LogOut } from "lucide-react";

interface User {
  $id: string;
  name?: string;
  email: string;
}

interface GameHeaderProps {
  user: User;
  onLogout: () => void;
}

export default function GameHeader({ user, onLogout }: GameHeaderProps) {
  return (
    <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Tu Tiên Vượt Thời Đại
            </h1>
            <div className="text-xs sm:text-sm text-gray-300 hidden sm:block">
              Xin chào,{" "}
              <span className="text-purple-300 font-semibold">
                {user.name || user.email}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm flex items-center gap-2"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Đăng Xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
