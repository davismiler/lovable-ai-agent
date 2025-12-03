/**
 * Custom hook for managing chat messages
 */

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types";
import { INITIAL_MESSAGE } from "@/constants";

export function useMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      ...INITIAL_MESSAGE,
      id: "1",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    setMessages((prev: ChatMessage[]) => [
      ...prev,
      {
        ...message,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      },
    ]);
  };

  return {
    messages,
    setMessages,
    addMessage,
    messagesEndRef,
  };
}

