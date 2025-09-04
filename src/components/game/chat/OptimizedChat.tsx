"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Users } from "lucide-react";
import {
  useChatMessages,
  useSendMessage,
  useRealtimeChat,
} from "@/hooks/useChat";
import { useUserPresence } from "@/hooks/useUserPresence";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";

interface OptimizedChatProps {
  isActive: boolean;
}

export default function OptimizedChat({ isActive }: OptimizedChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, character } = useAuthStore();
  const { messages, isConnected, onlineCount } = useChatStore();

  // Queries and mutations
  const { isLoading: isFetching } = useChatMessages();
  const sendMessageMutation = useSendMessage();
  const { subscribeToRealtime } = useRealtimeChat();

  // User presence hook
  useUserPresence();

  // Simple auto-scroll to bottom
  const scrollToBottom = () => {
    console.log(
      "📜 scrollToBottom called, messagesEndRef.current:",
      !!messagesEndRef.current
    );
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      console.log("✅ Scroll triggered");
    } else {
      console.log("❌ messagesEndRef.current is null");
    }
  };

  // Subscribe to realtime updates when active
  const stableSubscribeToRealtime = useCallback(() => {
    return subscribeToRealtime();
  }, [subscribeToRealtime]);

  useEffect(() => {
    if (!isActive) return;

    let unsubscribe: (() => void) | undefined;

    console.log("🔗 Setting up realtime subscription...");

    // Get the subscription promise and handle cleanup
    const subscriptionPromise = stableSubscribeToRealtime();

    // Handle both promise and direct function returns
    if (subscriptionPromise && "then" in subscriptionPromise) {
      // It's a promise
      subscriptionPromise
        .then((unsub: () => void) => {
          unsubscribe = unsub;
          console.log("✅ Realtime subscription callback set");
        })
        .catch((error) => {
          console.error("❌ Realtime subscription failed:", error);
        });
    } else if (typeof subscriptionPromise === "function") {
      // It's already an unsubscribe function
      unsubscribe = subscriptionPromise;
      console.log("✅ Direct realtime subscription set");
    }

    return () => {
      console.log("🧹 Cleaning up realtime subscription");
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isActive, stableSubscribeToRealtime]);

  // Scroll to bottom when messages change
  useEffect(() => {
    console.log("📜 Messages changed, length:", messages.length);
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive (realtime)
  useEffect(() => {
    console.log("🔄 Scroll effect - messages.length:", messages.length);
    if (messages.length > 0) {
      console.log("📜 Calling scrollToBottom because messages changed");
      scrollToBottom();
    }
  }, [messages.length]);

  // Early return check after hooks
  if (!isActive) {
    return null;
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !character) {
      return;
    }

    const messageData = {
      userId: user.$id,
      characterName: character.name,
      message: newMessage.trim(),
    };

    try {
      await sendMessageMutation.mutateAsync(messageData);
      setNewMessage(""); // Only clear on success
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-72 sm:h-64 md:h-72">
      {/* Connection Status & Online Count */}
      <div className="flex items-center justify-between mb-2 text-xs">
        <div
          className={`flex items-center gap-1 ${
            isConnected ? "text-green-400" : "text-red-400"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          />
          {isConnected ? "Kết nối" : "Mất kết nối"}
        </div>

        {/* Online Users Count */}
        <div className="flex items-center gap-1 text-blue-300">
          <Users className="w-3 h-3" />
          <span>{onlineCount} online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 text-sm sm:text-sm mb-3 sm:mb-3 custom-scrollbar">
        {isFetching && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full mr-2" />
            Đang tải tin nhắn...
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.$id} className="text-gray-300 leading-relaxed">
              <span className="text-purple-300">
                [
                {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                ]
              </span>{" "}
              <span className="text-blue-300 font-medium">
                {message.characterName}:
              </span>{" "}
              <span>{message.message}</span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 h-full flex items-center justify-center">
            Chưa có tin nhắn nào
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sendMessageMutation.isPending}
          className="flex-1 px-3 py-2 sm:px-3 sm:py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 disabled:opacity-50 min-h-[38px]"
          maxLength={500}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
          className="px-3 py-2 sm:px-3 sm:py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded flex items-center justify-center transition-colors min-w-[44px] min-h-[38px]"
        >
          {sendMessageMutation.isPending ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
