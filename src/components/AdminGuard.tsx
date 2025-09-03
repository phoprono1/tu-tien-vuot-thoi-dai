"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isClientAdminAuthenticated,
  clearClientAdminSession,
} from "@/lib/admin";
import AdminAuthModal from "@/components/AdminAuthModal";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isClientAdminAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        setShowAuthModal(true);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleAuthModalClose = () => {
    // If user closes modal without authenticating, redirect to home
    if (!isAuthenticated) {
      router.push("/");
    } else {
      setShowAuthModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      clearClientAdminSession();
      setIsAuthenticated(false);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API fails
      clearClientAdminSession();
      setIsAuthenticated(false);
      router.push("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          Đang kiểm tra quyền admin...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-2">Admin Area</h1>
            <p className="text-gray-300">Authentication required</p>
          </div>
        </div>
        <AdminAuthModal
          isOpen={showAuthModal}
          onClose={handleAuthModalClose}
          onAuthenticated={handleAuthenticated}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Admin Header with Logout */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-white font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Admin Mode
          </div>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Admin Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}
