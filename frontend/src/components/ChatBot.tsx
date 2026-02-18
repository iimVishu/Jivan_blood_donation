"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello. How can I assist you today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Format history for Gemini
      // Gemini requires the first message in history to be from the user
      // We filter out any initial bot messages that appear before the first user message
      let historyMessages = [...messages];
      const firstUserIndex = historyMessages.findIndex(msg => msg.sender === "user");
      
      if (firstUserIndex !== -1) {
        historyMessages = historyMessages.slice(firstUserIndex);
      } else {
        historyMessages = [];
      }

      const history = historyMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage.text, 
          history 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the server's response message if available
        const errorMessage = data.response || data.error || "Failed to get response";
        throw new Error(errorMessage);
      }

      const botResponse: Message = { 
        id: Date.now() + 1, 
        text: data.response, 
        sender: "bot" 
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorResponse: Message = { 
        id: Date.now() + 1, 
        text: error.message || "Sorry, I'm having trouble connecting right now. Please try again later.", 
        sender: "bot" 
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-white rounded-xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-white p-4 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-semibold text-gray-900">Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] text-sm leading-relaxed p-3 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-red-600 text-white font-medium"
                          : "bg-white text-gray-700 border border-gray-200 shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white text-gray-700 border border-gray-200 shadow-sm p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder={isLoading ? "Thinking..." : "Type a message..."}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className={`text-red-600 hover:text-red-700 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-red-700 transition-colors"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </motion.button>
    </>
  );
}
