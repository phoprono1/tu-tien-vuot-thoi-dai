"use client";

import {
  Zap,
  Swords,
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
} from "lucide-react";

interface GameButtonsProps {
  onShowModal: (modal: string) => void;
}

export default function GameButtons({ onShowModal }: GameButtonsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Cultivation Button */}
      <button
        onClick={() => onShowModal("cultivation")}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 sm:p-4 lg:p-6 rounded-lg transition-all transform hover:scale-105"
      >
        <div className="text-center">
          <div className="mb-1 sm:mb-2 flex justify-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="font-bold text-sm sm:text-base">Tu Luyện</div>
          <div className="text-xs sm:text-sm opacity-80 hidden sm:block">
            Hấp thụ linh khí
          </div>
        </div>
      </button>

      {/* Breakthrough Button */}
      <button
        onClick={() => onShowModal("breakthrough")}
        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white p-3 sm:p-4 lg:p-6 rounded-lg transition-all transform hover:scale-105"
      >
        <div className="text-center">
          <div className="mb-1 sm:mb-2 flex justify-center">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="font-bold text-sm sm:text-base">Đột Phá</div>
          <div className="text-xs sm:text-sm opacity-80 hidden sm:block">
            Vượt thiên kiếp
          </div>
        </div>
      </button>

      {/* Battle Button - Navigate to Combat Page */}
      <a
        href="/combat"
        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white p-3 sm:p-4 lg:p-6 rounded-lg transition-all transform hover:scale-105 block text-decoration-none"
      >
        <div className="text-center">
          <div className="mb-1 sm:mb-2 flex justify-center">
            <Swords className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="font-bold text-sm sm:text-base">Chiến Đấu</div>
          <div className="text-xs sm:text-sm opacity-80 hidden sm:block">
            PvP & PvE
          </div>
        </div>
      </a>

      {/* Shop Button */}
      <button
        onClick={() => onShowModal("shop")}
        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white p-3 sm:p-4 lg:p-6 rounded-lg transition-all transform hover:scale-105"
      >
        <div className="text-center">
          <div className="mb-1 sm:mb-2 flex justify-center">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="font-bold text-sm sm:text-base">Cửa Hàng</div>
          <div className="text-xs sm:text-sm opacity-80 hidden sm:block">
            Mua trang bị
          </div>
        </div>
      </button>

      {/* Guild Button */}
      <button
        onClick={() => onShowModal("guild")}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 sm:p-4 lg:p-6 rounded-lg transition-all transform hover:scale-105"
      >
        <div className="text-center">
          <div className="mb-1 sm:mb-2 flex justify-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="font-bold text-sm sm:text-base">Bang Phái</div>
          <div className="text-xs sm:text-sm opacity-80 hidden sm:block">
            Gia nhập tổ chức
          </div>
        </div>
      </button>

      {/* Inventory Button */}
      <button
        onClick={() => onShowModal("inventory")}
        className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white p-3 sm:p-4 lg:p-6 rounded-lg transition-all transform hover:scale-105"
      >
        <div className="text-center">
          <div className="mb-1 sm:mb-2 flex justify-center">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="font-bold text-sm sm:text-base">Túi Đồ</div>
          <div className="text-xs sm:text-sm opacity-80 hidden sm:block">
            Quản lý vật phẩm
          </div>
        </div>
      </button>
    </div>
  );
}
