"use client";

import React from "react";
import ServerSettingsPanel from "@/components/ServerSettingsPanel";

export default function ServerSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ⚙️ Cài Đặt Server
          </h1>
          <p className="text-gray-300">
            Quản lý tốc độ tu luyện và sự kiện cho toàn server
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            <a
              href="/admin"
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← Quay lại Admin
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          <ServerSettingsPanel />
        </div>
      </div>
    </div>
  );
}
