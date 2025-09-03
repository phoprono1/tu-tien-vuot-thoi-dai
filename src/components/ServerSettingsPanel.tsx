import React, { useState, useEffect } from "react";
import {
  Settings,
  Zap,
  Calendar,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
} from "lucide-react";

interface ServerSettings {
  cultivationSpeedMultiplier: number;
  eventName: string;
  eventDescription: string;
  eventActive: boolean;
  eventEndTime: string | null;
  lastUpdated?: string;
}

const ServerSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<ServerSettings>({
    cultivationSpeedMultiplier: 5.0,
    eventName: "",
    eventDescription: "",
    eventActive: true,
    eventEndTime: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/server/settings");
      const data = await response.json();

      setSettings(data);
    } catch (error) {
      console.error("Error loading server settings:", error);
      setMessage({ type: "error", text: "Lỗi khi tải cài đặt server" });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch("/api/server/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setSettings({ ...settings, lastUpdated: new Date().toISOString() });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Lỗi khi lưu cài đặt",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "Lỗi kết nối khi lưu cài đặt" });
    } finally {
      setSaving(false);
    }
  };

  const presetMultipliers = [
    { value: 1, label: "1x (Bình thường)", color: "bg-gray-600" },
    { value: 2, label: "2x (Tăng nhẹ)", color: "bg-blue-600" },
    { value: 5, label: "5x (Tăng mạnh)", color: "bg-green-600" },
    { value: 10, label: "10x (Sự kiện)", color: "bg-yellow-600" },
    { value: 20, label: "20x (Mega Event)", color: "bg-orange-600" },
    { value: 50, label: "50x (Max Speed)", color: "bg-red-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Cài Đặt Server</h2>
        </div>
        <p className="text-gray-300 text-sm">
          Điều chỉnh tốc độ tu luyện và tổ chức sự kiện cho toàn server
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`border rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-900/20 border-green-500/30 text-green-300"
              : "bg-red-900/20 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-medium">Tốc Độ Tu Luyện</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {settings.cultivationSpeedMultiplier}x
          </div>
          <div className="text-sm text-gray-400">
            {settings.eventActive ? "Đang hoạt động" : "Tạm dừng"}
          </div>
        </div>

        <div className="bg-black/40 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">Trạng Thái</span>
          </div>
          <div className="text-lg font-bold text-white">
            {settings.eventActive ? "🟢 Kích hoạt" : "🔴 Tắt"}
          </div>
          <div className="text-sm text-gray-400">
            Áp dụng cho tất cả người chơi
          </div>
        </div>

        <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-medium">
              Cập nhật lần cuối
            </span>
          </div>
          <div className="text-sm text-white">
            {settings.lastUpdated
              ? new Date(settings.lastUpdated).toLocaleString("vi-VN")
              : "Chưa có"}
          </div>
        </div>
      </div>

      {/* Speed Multiplier Settings */}
      <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Tốc Độ Tu Luyện</h3>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Preset nhanh:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presetMultipliers.map((preset) => (
              <button
                key={preset.value}
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    cultivationSpeedMultiplier: preset.value,
                  }))
                }
                className={`${preset.color} ${
                  settings.cultivationSpeedMultiplier === preset.value
                    ? "ring-2 ring-white"
                    : "hover:opacity-80"
                } text-white px-4 py-2 rounded-lg font-medium transition-all`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Multiplier */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tốc độ tùy chỉnh (1x - 50x):
          </label>
          <input
            type="number"
            min="1"
            max="50"
            step="0.1"
            value={settings.cultivationSpeedMultiplier}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                cultivationSpeedMultiplier: parseFloat(e.target.value) || 1,
              }))
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Tốc độ tu luyện sẽ được nhân với hệ số này cho tất cả người chơi
          </p>
        </div>

        {/* Event Active Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="eventActive"
            checked={settings.eventActive}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                eventActive: e.target.checked,
              }))
            }
            className="w-5 h-5 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="eventActive" className="text-white font-medium">
            Kích hoạt tăng tốc độ tu luyện
          </label>
        </div>
      </div>

      {/* Event Information */}
      <div className="bg-black/40 border border-yellow-500/30 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold text-white">Thông Tin Sự Kiện</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tên sự kiện:
            </label>
            <input
              type="text"
              value={settings.eventName}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, eventName: e.target.value }))
              }
              placeholder="VD: Tuần lễ tu luyện x5"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mô tả sự kiện:
            </label>
            <textarea
              value={settings.eventDescription}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  eventDescription: e.target.value,
                }))
              }
              placeholder="Mô tả chi tiết về sự kiện..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thời gian kết thúc sự kiện:
            </label>
            <input
              type="datetime-local"
              value={settings.eventEndTime || ""}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  eventEndTime: e.target.value || null,
                }))
              }
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Để trống nếu không có thời gian kết thúc
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 px-6 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Lưu Cài Đặt
            </>
          )}
        </button>

        <button
          onClick={loadSettings}
          disabled={saving}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Tải lại
        </button>
      </div>

      {/* Warning */}
      <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-orange-200 text-sm">
            <p className="font-medium mb-1">⚠️ Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Thay đổi sẽ áp dụng ngay lập tức cho tất cả người chơi</li>
              <li>Tốc độ tu luyện cao có thể làm mất cân bằng game</li>
              <li>Nên tổ chức sự kiện trong thời gian giới hạn</li>
              <li>Backup dữ liệu trước khi thay đổi cài đặt quan trọng</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSettingsPanel;
