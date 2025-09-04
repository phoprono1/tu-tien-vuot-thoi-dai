"use client";

import { useState } from "react";
import { MessageCircle, FileText } from "lucide-react";
import { OptimizedChat } from "../chat";

export default function ActivityChatTabs() {
  const [activeTab, setActiveTab] = useState<"activity" | "chat">("activity");

  console.log("🗂️ ActivityChatTabs render - activeTab:", activeTab);

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 sm:p-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-purple-500/30 mb-4">
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-3 sm:px-4 sm:py-2 font-semibold transition-colors text-sm ${
            activeTab === "activity"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Nhật Ký</span>
            <span className="sm:hidden">Log</span>
          </div>
        </button>
        <button
          onClick={() => {
            console.log("🗂️ Chat tab clicked");
            setActiveTab("chat");
          }}
          className={`px-4 py-3 sm:px-4 sm:py-2 font-semibold transition-colors text-sm ${
            activeTab === "chat"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Trò Chuyện</span>
            <span className="sm:hidden">Chat</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "activity" ? (
        <div className="space-y-2 text-sm max-h-48 sm:max-h-40 md:max-h-48 overflow-y-auto">
          <div className="text-gray-300 leading-relaxed">
            <span className="text-blue-300">[10:30]</span> Bạn đã hấp thụ được
            1,250 điểm linh khí
          </div>
          <div className="text-gray-300 leading-relaxed">
            <span className="text-green-300">[10:25]</span> Tu luyện hoàn thành,
            tăng 45 điểm tu vi
          </div>
          <div className="text-gray-300 leading-relaxed">
            <span className="text-yellow-300">[10:15]</span> Bạn đã nhận được
            phần thưởng đăng nhập hàng ngày
          </div>
          <div className="text-gray-300 leading-relaxed">
            <span className="text-purple-300">[09:45]</span> Bắt đầu phiên tu
            luyện mới
          </div>
        </div>
      ) : (
        <OptimizedChat isActive={activeTab === "chat"} />
      )}
    </div>
  );
}
