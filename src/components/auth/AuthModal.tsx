"use client";

import { useState } from "react";
import {
  account,
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
} from "@/lib/appwrite";
import { ID } from "appwrite";
import { X, Mail, Lock, User } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onSuccess: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  onSuccess,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        // Đăng ký
        const newUser = await account.create(
          ID.unique(),
          email,
          password,
          username
        );
        // Tự động đăng nhập sau khi đăng ký
        await account.createEmailPasswordSession(email, password);

        // Tạo user record trong database
        await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          ID.unique(),
          {
            userId: newUser.$id,
            username: username,
            email: email,
            level: 1, // Level mặc định cho người mới
            experience: 0, // Kinh nghiệm ban đầu
            lastLogin: new Date().toISOString(),
          }
        );

        // Không tạo character mặc định nữa - sẽ để CultivationPathModal xử lý
      } else {
        // Đăng nhập
        await account.createEmailPasswordSession(email, password);

        // Cập nhật last login
        // const currentUser = await account.get();
        // TODO: Update lastLogin in database
      }
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Có lỗi xảy ra";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md border border-purple-500/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {mode === "login" ? "Đăng Nhập" : "Đăng Ký"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tên người chơi
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            {loading
              ? "Đang xử lý..."
              : mode === "login"
              ? "Đăng Nhập"
              : "Đăng Ký"}
          </button>
        </form>
      </div>
    </div>
  );
}
