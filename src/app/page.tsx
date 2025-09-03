"use client";

import { useState, useEffect } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "appwrite";
import AuthModal from "@/components/AuthModal";
import GameDashboard from "@/components/GameDashboard";
import CultivationPathModal from "@/components/CultivationPathModal";
import { Zap, Sword, Shield, Users, TrendingUp, Star } from "lucide-react";
import { DatabaseCharacter } from "@/types/database";

interface User {
  $id: string;
  name?: string;
  email: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [character, setCharacter] = useState<DatabaseCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPathModal, setShowPathModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);

      // Kiểm tra xem user đã có character chưa
      const characters = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHARACTERS,
        [Query.equal("userId", currentUser.$id)]
      );

      if (characters.documents.length > 0) {
        setCharacter(characters.documents[0] as unknown as DatabaseCharacter);
      } else {
        // User chưa có character -> hiển thị modal chọn path
        setShowPathModal(true);
      }
    } catch {
      // User not logged in
      setUser(null);
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (mode: "login" | "register") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    checkUser();
  };

  const handlePathSuccess = (newCharacter: DatabaseCharacter) => {
    setCharacter(newCharacter);
    setShowPathModal(false);
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setCharacter(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  // Nếu đã đăng nhập và có character, hiển thị game dashboard
  if (user && character) {
    return (
      <GameDashboard
        user={user}
        character={character}
        onLogout={handleLogout}
      />
    );
  }

  // Nếu đã đăng nhập nhưng chưa có character, hiển thị modal chọn path
  if (user && !character) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">
                Chào mừng đến với Tu Tiên Vượt Thời Đại!
              </h1>
              <p className="text-xl text-gray-300">
                Hãy chọn con đường tu tiên của bạn...
              </p>
            </div>
          </div>
        </div>
        <CultivationPathModal
          isOpen={showPathModal}
          userId={user.$id}
          username={user.name || ""}
          onSuccess={handlePathSuccess}
        />
      </>
    );
  }

  // Nếu chưa đăng nhập, hiển thị landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Tu Tiên Vượt Thời Đại
            </h1>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => handleLogin("login")}
                className="px-3 py-2 sm:px-6 sm:py-2 text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => handleLogin("register")}
                className="px-3 py-2 sm:px-6 sm:py-2 text-sm sm:text-base bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
              >
                Đăng Ký
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Tu Tiên Trong Thời Đại
            <span className="block text-2xl sm:text-3xl lg:text-4xl text-purple-300 mt-2">
              Khoa Học Hiện Đại
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
            Khám phá thế giới tu tiên độc đáo nơi linh khí gặp gỡ công nghệ.
            Chọn con đường tu luyện của bạn và vượt qua thiên kiếp để đạt được
            bất tử.
          </p>
          <button
            onClick={() => handleLogin("register")}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg sm:text-xl font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            Bắt Đầu Tu Tiên
          </button>
        </div>

        {/* Cultivation Paths */}
        <div className="mb-12 sm:mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 sm:mb-12">
            Ba Con Đường Tu Luyện
          </h3>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {/* Qi Cultivation */}
            <div className="bg-blue-900/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 sm:p-8 text-center hover:transform hover:scale-105 transition-all">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-blue-300 mb-4">Khí Tu</h4>
              <p className="text-sm sm:text-base text-gray-300 mb-4">
                Con đường truyền thống, hấp thụ linh khí từ thiên địa để tu
                luyện. Cân bằng và ổn định nhất.
              </p>
              <ul className="text-xs sm:text-sm text-blue-200 space-y-2">
                <li>• Tốc độ hấp thụ linh khí trung bình</li>
                <li>• Đột phá ổn định</li>
                <li>• Khả năng chống thiên kiếp tốt</li>
              </ul>
            </div>

            {/* Body Cultivation */}
            <div className="bg-green-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-6 sm:p-8 text-center hover:transform hover:scale-105 transition-all">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-green-300 mb-4">Thể Tu</h4>
              <p className="text-sm sm:text-base text-gray-300 mb-4">
                Tôi luyện thể phách, dựa vào sức mạnh của cơ thể. Chậm nhưng bền
                bỉ và mạnh mẽ.
              </p>
              <ul className="text-xs sm:text-sm text-green-200 space-y-2">
                <li>• Tốc độ hấp thụ linh khí chậm</li>
                <li>• Tự động tăng chỉ số theo thời gian</li>
                <li>• Sức mạnh vật lý vượt trội</li>
              </ul>
            </div>

            {/* Demon Cultivation */}
            <div className="bg-red-900/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-6 sm:p-8 text-center hover:transform hover:scale-105 transition-all">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sword className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h4 className="text-xl sm:text-2xl font-bold text-red-300 mb-4">Ma Tu</h4>
              <p className="text-sm sm:text-base text-gray-300 mb-4">
                Con đường tà đạo, tăng sức mạnh qua việc sát sinh. Nguy hiểm
                nhưng quyền năng to lớn.
              </p>
              <ul className="text-xs sm:text-sm text-red-200 space-y-2">
                <li>• Tỷ lệ đột phá thấp</li>
                <li>• Sức mạnh tăng khi giết địch</li>
                <li>• Có thể chống lại thiên kiếp</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12 sm:mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 sm:mb-12">
            Tính Năng Nổi Bật
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-purple-400">
                <Users className="w-full h-full" />
              </div>
              <h5 className="font-bold text-white mb-2 text-sm sm:text-base">PvP Combat</h5>
              <p className="text-gray-300 text-xs sm:text-sm">
                Chiến đấu với người chơi khác để tranh giành tài nguyên
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-yellow-400">
                <TrendingUp className="w-full h-full" />
              </div>
              <h5 className="font-bold text-white mb-2 text-sm sm:text-base">PvE Trials</h5>
              <p className="text-gray-300 text-xs sm:text-sm">
                Thử thách thí luyện để nhận phần thưởng
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-green-400">
                <Sword className="w-full h-full" />
              </div>
              <h5 className="font-bold text-white mb-2 text-sm sm:text-base">Combat System</h5>
              <p className="text-gray-300 text-xs sm:text-sm">
                Hệ thống chiến đấu lượt với hiệu ứng và debuff
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-blue-400">
                <Star className="w-full h-full" />
              </div>
              <h5 className="font-bold text-white mb-2 text-sm sm:text-base">Thiên Kiếp</h5>
              <p className="text-gray-300 text-xs sm:text-sm">
                Vượt qua thử thách của trời đất để đột phá
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access Links */}
        <div className="text-center mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Truy cập nhanh</h3>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-4">
            <a
              href="/admin/trials"
              className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
            >
              Admin - Thí luyện
            </a>
            <a
              href="/pvp"
              className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-center"
            >
              Bảng xếp hạng PvP
            </a>
            <a
              href="/combat/test"
              className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-center"
            >
              Test Combat System
            </a>
            <a
              href="/admin/server"
              className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-center"
            >
              Admin - Server
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-purple-500/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 Tu Tiên Vượt Thời Đại. Tất cả quyền được bảo lưu.</p>
            <p className="mt-2 text-sm">
              Thế giới tu tiên gặp gỡ khoa học hiện đại
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
