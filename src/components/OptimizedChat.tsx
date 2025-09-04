"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import {
  useChatMessages,
  useSendMessage,
  useRealtimeChat,
} from "@/hooks/useChat";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";

interface OptimizedChatProps {
  isActive: boolean;
}

export default function OptimizedChat({ isActive }: OptimizedChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, character } = useAuthStore();
  const { messages, isConnected, unreadCount } = useChatStore();

  // Queries and mutations
  const { isLoading: isFetching } = useChatMessages();
  const sendMessageMutation = useSendMessage();
  const { subscribeToRealtime } = useRealtimeChat();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Subscribe to realtime updates when active
  useEffect(() => {
    if (isActive) {
      const unsubscribe = subscribeToRealtime();
      return unsubscribe;
    }
  }, [isActive, subscribeToRealtime]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !character) return;

    const messageData = {
      userId: user.$id,
      characterName: character.name,
      message: newMessage.trim(),
    };

    // Clear input immediately for better UX
    setNewMessage("");

    // Send message (with optimistic update)
    sendMessageMutation.mutate(messageData);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isActive) return null;

  return (
    <div className="flex flex-col h-32 sm:h-40">
      {/* Connection Status */}
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
        {unreadCount > 0 && (
          <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount} tin mới
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1 sm:space-y-2 text-xs sm:text-sm mb-2 sm:mb-3 custom-scrollbar">
        {isFetching && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full mr-2" />
            Đang tải tin nhắn...
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.$id} className="text-gray-300">
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
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sendMessageMutation.isPending}
          className="flex-1 px-2 sm:px-3 py-1 sm:py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          maxLength={500}
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sendMessageMutation.isPending}
          className="px-2 sm:px-3 py-1 sm:py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded flex items-center justify-center transition-colors min-w-[40px] sm:min-w-[44px]"
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
