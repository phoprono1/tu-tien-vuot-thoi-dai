"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Dumbbell,
  Skull,
  Swords,
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  LogOut,
  Clock,
  Send,
  MessageCircle,
  FileText,
} from "lucide-react";
import { DatabaseCharacter } from "@/types/database";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import CombatStatsPanel from "./CombatStatsPanel";
import SkillBooksPanel from "./SkillBooksPanel";
import CultivationTechniques from "./CultivationTechniques";
import BreakthroughPanel from "./BreakthroughPanel";
import { getRealmDisplayName } from "@/data/realms";
import { useOptimizedChat } from "@/hooks/useOptimizedChat";

interface User {
  $id: string;
  name?: string;
  email: string;
}

interface GameDashboardProps {
  user: User;
  character: DatabaseCharacter;
  onLogout: () => void;
}

export default function GameDashboard({
  user,
  character,
  onLogout,
}: GameDashboardProps) {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState(character);
  const [cultivationRate, setCultivationRate] = useState({
    baseRate: 1.0,
    totalBonusPercentage: 0,
    finalRate: 1.0,
  });

  // Chat and Activity Tab States
  const [activeTab, setActiveTab] = useState<"activity" | "chat">("activity");
  const [newMessage, setNewMessage] = useState("");

  // Use optimized chat hook
  const {
    messages: chatMessages,
    isLoading: isLoadingChat,
    messagesEndRef,
    sendMessage: optimizedSendMessage,
  } = useOptimizedChat(activeTab === "chat");

  // Load cultivation rate data when character changes
  useEffect(() => {
    const fetchCultivationRate = async () => {
      try {
        const response = await fetch(
          `/api/cultivation/rate?characterId=${currentCharacter.$id}`
        );
        const data = await response.json();
        if (data.success) {
          setCultivationRate(data.cultivationData);
        }
      } catch (error) {
        console.error("Error fetching cultivation rate:", error);
      }
    };

    fetchCultivationRate();
  }, [currentCharacter.$id]);

  // Optimized Auto cultivation system - Batch updates
  useEffect(() => {
    let accumulatedQi = 0;
    let lastDbUpdateTime = Date.now();
    let localQi = currentCharacter.qi;
    let lastCultivationUpdate = currentCharacter.lastCultivationUpdate;

    const calculateAutoCultivation = () => {
      const now = new Date();
      const lastUpdate = new Date(lastCultivationUpdate);
      const timeDifferenceMs = now.getTime() - lastUpdate.getTime();
      const timeDifferenceSeconds = Math.floor(timeDifferenceMs / 1000);

      if (timeDifferenceSeconds > 0) {
        // Use dynamic cultivation rate from API (includes technique bonuses)
        const rate = cultivationRate.finalRate;
        const qiGain = Math.floor(timeDifferenceSeconds * rate);

        if (qiGain > 0) {
          // Update local tracking variables
          accumulatedQi += qiGain;
          localQi += qiGain;
          lastCultivationUpdate = now.toISOString();

          // Update UI state immediately for responsiveness
          setCurrentCharacter((prev) => ({
            ...prev,
            qi: localQi,
            lastCultivationUpdate: lastCultivationUpdate,
          }));

          // Batch database updates - only update every 15 seconds or 60+ qi accumulated
          const timeSinceLastDbUpdate = now.getTime() - lastDbUpdateTime;
          if (timeSinceLastDbUpdate >= 15000 || accumulatedQi >= 60) {
            databases
              .updateDocument(
                DATABASE_ID,
                COLLECTIONS.CHARACTERS,
                currentCharacter.$id,
                {
                  qi: localQi,
                  lastCultivationUpdate: lastCultivationUpdate,
                }
              )
              .then(() => {
                lastDbUpdateTime = Date.now();
                accumulatedQi = 0;
              })
              .catch(console.error);
          }
        }
      }
    };

    // Tính toán ngay khi load
    calculateAutoCultivation();

    // Cập nhật UI mỗi giây nhưng database chỉ 15 giây 1 lần hoặc khi đủ 60 qi
    const interval = setInterval(calculateAutoCultivation, 1000);

    // Cleanup: Save any remaining qi when component unmounts
    return () => {
      clearInterval(interval);
      if (accumulatedQi > 0) {
        databases
          .updateDocument(
            DATABASE_ID,
            COLLECTIONS.CHARACTERS,
            currentCharacter.$id,
            {
              qi: localQi,
              lastCultivationUpdate: lastCultivationUpdate,
            }
          )
          .catch(console.error);
      }
    };
  }, [
    currentCharacter.$id,
    currentCharacter.cultivationPath,
    currentCharacter.qi,
    currentCharacter.lastCultivationUpdate,
    cultivationRate.finalRate,
  ]); // Dependencies cho cultivation system

  // Chat Functions
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const success = await optimizedSendMessage(
      user.$id,
      currentCharacter.name,
      newMessage
    );

    if (success) {
      setNewMessage("");
    } else {
      console.error("Failed to send message");
    }
  };

  // Remove old chat loading effect - now handled by useOptimizedChat hook

  const cultivationPaths = {
    qi: { name: "Khí Tu", color: "blue", icon: Zap },
    body: { name: "Thể Tu", color: "green", icon: Dumbbell },
    demon: { name: "Ma Tu", color: "red", icon: Skull },
  };

  const currentPath =
    cultivationPaths[
      currentCharacter.cultivationPath as keyof typeof cultivationPaths
    ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header */}
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

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Character Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 sm:p-6">
              <div className="text-center mb-4 sm:mb-6">
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 bg-${currentPath.color}-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}
                >
                  <currentPath.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {currentCharacter.name}
                </h3>
                <div className="text-purple-300 text-xs sm:text-sm">
                  {currentPath.name}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm">
                  {getRealmDisplayName(currentCharacter.level)}
                </div>
              </div>

              {/* Essential Stats Only */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-red-300">Qi</span>
                    <span className="text-white">
                      {currentCharacter.qi.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Tu vi:</span>
                      <span className="sm:hidden">TL:</span>{" "}
                      {cultivationRate.finalRate.toFixed(1)}/s
                    </div>
                    {cultivationRate.totalBonusPercentage > 0 && (
                      <span className="text-green-400 text-xs">
                        +{cultivationRate.totalBonusPercentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div className="bg-red-500 h-2 rounded-full transition-all animate-pulse" />
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Qi:</span>
                    <span className="text-green-300">
                      {currentCharacter.qi.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stamina:</span>
                    <span className="text-yellow-300">
                      {currentCharacter.stamina}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Đá linh:</span>
                    <span className="text-blue-300">
                      {currentCharacter.spiritStones.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-4">
                    <div className="text-purple-300 font-medium mb-2 text-xs">
                      Tốc Độ Tu Vi Chi Tiết
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          Cơ bản ({currentPath.name}):
                        </span>
                        <span className="text-gray-300">
                          {cultivationRate.baseRate.toFixed(1)}/s
                        </span>
                      </div>
                      {cultivationRate.totalBonusPercentage > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Từ công pháp:</span>
                          <span className="text-green-300">
                            +{cultivationRate.totalBonusPercentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-700 pt-1">
                        <span className="text-white font-medium">
                          Tổng cộng:
                        </span>
                        <span className="text-purple-300 font-medium">
                          {cultivationRate.finalRate.toFixed(1)}/s
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ≈ {(cultivationRate.finalRate * 3600).toLocaleString()}
                        /giờ
                      </div>

                      {/* Cultivation Path Balance Info */}
                      <div className="border-t border-gray-700 pt-2 mt-2">
                        <div className="text-yellow-300 font-medium mb-1 text-xs">
                          Đặc Tính Con Đường
                        </div>
                        {currentCharacter.cultivationPath === "qi" && (
                          <div className="text-xs text-blue-300">
                            🔵 Khí Tu: Đột phá dễ, tốc độ bình thường, combat
                            thấp
                          </div>
                        )}
                        {currentCharacter.cultivationPath === "body" && (
                          <div className="text-xs text-green-300">
                            🟢 Thể Tu: Đột phá trung bình, tốc độ chậm, combat
                            cao
                          </div>
                        )}
                        {currentCharacter.cultivationPath === "demon" && (
                          <div className="text-xs text-red-300">
                            🔴 Ma Tu: Đột phá khó, tốc độ nhanh, combat trung
                            bình
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Buttons */}
              <div className="mt-4 sm:mt-6 space-y-2">
                <button
                  onClick={() => setShowModal("combat")}
                  className="w-full p-2 sm:p-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 hover:from-red-600/30 hover:to-orange-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-red-300 font-medium text-sm">
                        Combat Stats
                      </div>
                      <div className="text-gray-400 text-xs">
                        Sức mạnh chiến đấu
                      </div>
                    </div>
                    <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  </div>
                </button>

                <button
                  onClick={() => setShowModal("skills")}
                  className="w-full p-2 sm:p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-blue-300 font-medium">
                        Skill Books
                      </div>
                      <div className="text-gray-400 text-xs">
                        Học võ công mới
                      </div>
                    </div>
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Cultivation Button */}
              <button
                onClick={() => setShowModal("cultivation")}
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
                onClick={() => setShowModal("breakthrough")}
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
                  <div className="font-bold text-sm sm:text-base">
                    Chiến Đấu
                  </div>
                  <div className="text-xs sm:text-sm opacity-80 hidden sm:block">
                    PvP & PvE
                  </div>
                </div>
              </a>

              {/* Shop Button */}
              <button
                onClick={() => setShowModal("shop")}
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
                onClick={() => setShowModal("guild")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 sm:p-4 lg:p-6 rounded-lg transition-all transform hover:scale-105"
              >
                <div className="text-center">
                  <div className="mb-1 sm:mb-2 flex justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                  </div>
                  <div className="font-bold text-sm sm:text-base">
                    Bang Phái
                  </div>
                  <div className="text-xs sm:text-sm opacity-80 hidden sm:block">
                    Gia nhập tổ chức
                  </div>
                </div>
              </button>

              {/* Inventory Button */}
              <button
                onClick={() => setShowModal("inventory")}
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

            {/* Activity Log & Chat */}
            <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 sm:p-6">
              {/* Tab Navigation */}
              <div className="flex border-b border-purple-500/30 mb-3 sm:mb-4">
                <button
                  onClick={() => setActiveTab("activity")}
                  className={`px-3 py-2 sm:px-4 sm:py-2 font-semibold transition-colors text-sm ${
                    activeTab === "activity"
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Nhật Ký</span>
                    <span className="sm:hidden">Log</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-3 py-2 sm:px-4 sm:py-2 font-semibold transition-colors text-sm ${
                    activeTab === "chat"
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Trò Chuyện</span>
                    <span className="sm:hidden">Chat</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "activity" ? (
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm max-h-32 sm:max-h-40 overflow-y-auto">
                  <div className="text-gray-300">
                    <span className="text-blue-300">[10:30]</span> Bạn đã hấp
                    thụ được 1,250 điểm linh khí
                  </div>
                  <div className="text-gray-300">
                    <span className="text-green-300">[10:25]</span> Tu luyện
                    hoàn thành, tăng 45 điểm tu vi
                  </div>
                  <div className="text-gray-300">
                    <span className="text-yellow-300">[10:15]</span> Bạn đã nhận
                    được phần thưởng đăng nhập hàng ngày
                  </div>
                  <div className="text-gray-300">
                    <span className="text-purple-300">[09:45]</span> Bắt đầu
                    phiên tu luyện mới
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-32 sm:h-40">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto space-y-1 sm:space-y-2 text-xs sm:text-sm mb-2 sm:mb-3">
                    {isLoadingChat ? (
                      <div className="text-center text-gray-400">
                        Đang tải tin nhắn...
                      </div>
                    ) : chatMessages.length > 0 ? (
                      chatMessages.map((message) => (
                        <div key={message.$id} className="text-gray-300">
                          <span className="text-purple-300">
                            [
                            {new Date(message.timestamp).toLocaleTimeString(
                              "vi-VN",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                            ]
                          </span>{" "}
                          <span className="text-yellow-300 font-medium">
                            {message.characterName}:
                          </span>{" "}
                          {message.message}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400">
                        Chưa có tin nhắn nào. Hãy là người đầu tiên gửi tin
                        nhắn!
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-1 sm:gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Nhập tin nhắn..."
                      maxLength={500}
                      className="flex-1 px-2 sm:px-3 py-1 sm:py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-2 sm:px-3 py-1 sm:py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal System */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className={`bg-gray-900 rounded-lg p-4 sm:p-6 border border-purple-500/30 ${
              showModal === "combat" ||
              showModal === "skills" ||
              showModal === "cultivation" ||
              showModal === "breakthrough"
                ? "w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                : "w-full max-w-md"
            }`}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {showModal === "cultivation" && "Tu Luyện"}
                {showModal === "breakthrough" && "Đột Phá"}
                {showModal === "shop" && "Cửa Hàng"}
                {showModal === "guild" && "Bang Phái"}
                {showModal === "inventory" && "Túi Đồ"}
                {showModal === "combat" && "Combat Stats"}
                {showModal === "skills" && "Skill Books"}
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-400 hover:text-white p-1 sm:p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            {showModal === "cultivation" && (
              <CultivationTechniques
                characterId={currentCharacter.$id}
                characterLevel={currentCharacter.level}
                cultivationPath={
                  currentCharacter.cultivationPath as "qi" | "body" | "demon"
                }
                currentQi={currentCharacter.qi}
                spiritStones={currentCharacter.spiritStones}
                stamina={currentCharacter.stamina}
                onTechniqueUpdate={async () => {
                  // Refresh cultivation rate when techniques are learned or practiced
                  try {
                    const response = await fetch(
                      `/api/cultivation/rate?characterId=${currentCharacter.$id}`
                    );
                    const data = await response.json();
                    if (data.success) {
                      setCultivationRate(data.cultivationData);
                    }
                  } catch (error) {
                    console.error("Error refreshing cultivation rate:", error);
                  }
                }}
              />
            )}

            {showModal === "breakthrough" && (
              <BreakthroughPanel
                character={currentCharacter}
                onBreakthroughSuccess={(newStats) => {
                  // Update character stats after successful breakthrough
                  setCurrentCharacter((prev) => ({
                    ...prev,
                    ...newStats,
                  }));
                  // Refresh cultivation rate as well
                  fetch(
                    `/api/cultivation/rate?characterId=${currentCharacter.$id}`
                  )
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.success) {
                        setCultivationRate(data.cultivationData);
                      }
                    })
                    .catch(console.error);
                }}
              />
            )}

            {showModal === "combat" && (
              <CombatStatsPanel
                character={currentCharacter}
                onStatsUpdate={(stats) => {
                  console.log("Combat stats updated:", stats);
                }}
              />
            )}

            {showModal === "skills" && (
              <SkillBooksPanel
                character={currentCharacter}
                onSkillLearned={() => {
                  // Refresh character data when skill is learned
                  setCurrentCharacter({
                    ...currentCharacter,
                    stamina: currentCharacter.stamina - 10, // Example stamina cost
                  });
                }}
              />
            )}

            {!["combat", "skills", "cultivation", "breakthrough"].includes(
              showModal
            ) && (
              <div className="text-gray-300 text-center py-8">
                Tính năng đang được phát triển...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
