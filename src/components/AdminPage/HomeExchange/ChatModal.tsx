"use client";

import { useSendMessageMutation } from "@/redux/features/auth/exchangeApi";
import { ExchangeRequest } from "@/redux/types/auth.type";
import React, { useState } from "react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ExchangeRequest;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, request }) => {
  const [message, setMessage] = useState("");
  const [sendMessage] = useSendMessageMutation();

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        await sendMessage({
          exchangeRequestId: request.id,
          message: message.trim(),
        }).unwrap();
        setMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[0.2px] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="border rounded-lg p-4 mb-4 h-64 overflow-y-auto">
          {request.chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            request.chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 ${
                  msg.senderId === request.fromUserId
                    ? "text-right"
                    : "text-left"
                }`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-lg ${
                    msg.senderId === request.fromUserId
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.message}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(msg.createdAt!).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
