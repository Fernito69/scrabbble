import { useAuth } from "@/contexts/AuthContext";
import { useGameContext } from "@/contexts/GameState.context";
import {
  useAddMessage,
  useGetLastNChatMessages,
} from "@/services/collections/game/chat/chat.hooks";
import { Send, ChevronRight, ChevronLeft, MessagesSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "../UserAvatar";
import { playNotificationSound } from "@/services/collections/game/game.utils";
import { cn } from "@/lib/utils";

export const Chat = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { gameId } = useGameContext();
  const [inputValue, setInputValue] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { messages, error } = useGetLastNChatMessages(gameId, 50);
  const addMessage = useAddMessage(gameId);

  // Play notification sound and scroll to bottom
  useEffect(() => {
    scrollToChatBottom();
    if (messages?.[0]?.playerId === user?.uid) return;
    playNotificationSound(3);
  }, [messages]);

  useEffect(() => {
    scrollToChatBottom();
  }, [isCollapsed]);

  const scrollToChatBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user) return;

    try {
      addMessage({
        text: inputValue,
        playerId: user.uid,
      });
      setInputValue("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col h-[600px] w-[300px] border-2 border-border rounded-lg p-4">
        <div className="text-destructive">{t("chat.error")}</div>
      </div>
    );
  }

  // Collapsed state
  if (isCollapsed) {
    return (
      <div className="flex flex-col border-2 border-border rounded-lg bg-card shadow-md">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 hover:bg-accent transition-colors flex items-center gap-2 h-full flex flex-col justify-center"
          title={t("chat.expand")}
        >
          <ChevronLeft className="h-5 w-5" />
          <MessagesSquare className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] w-[300px] border-2 border-border rounded-lg bg-card shadow-md overflow-hidden">
      {/* Header */}
      <div
        className="border-b bg-gray-100 border-border p-3 flex justify-between items-center cursor-pointer h-12"
        onClick={() => setIsCollapsed(true)}
      >
        {
          <h3 className="font-semibold text-lg flex flex-row gap-2 items-center">
            {t("chat.title")} <MessagesSquare className="h-5 w-5" />
          </h3>
        }
        <button
          className="p-1 hover:bg-accent rounded transition-colors"
          title={t("chat.collapse")}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {!messages || messages.length === 0 ? (
          <div className="text-muted-foreground text-sm text-center mt-4">
            {t("chat.noMessages")}
          </div>
        ) : (
          messages
            .slice()
            .reverse()
            .map((message) => {
              const isOwnMessage = message.playerId === user?.uid;
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[95%] rounded-lg p-2 flex flex-row items-center relative p-2 shadow-md ${
                      isOwnMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="text-xs mr-1">
                        <UserAvatar userId={message.playerId} diameter={20} />
                      </div>
                    )}
                    <div className="text-sm break-words text-start">
                      {message.text}
                    </div>
                    <div
                      className={cn(
                        "absolute bottom-[1px] text-[6px] mt-1 right-1",
                        isOwnMessage ? "text-blue-200" : "text-black"
                      )}
                    >
                      {message.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-border p-3">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSendMessage(e);
              }
            }}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("chat.placeholder")}
            className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
