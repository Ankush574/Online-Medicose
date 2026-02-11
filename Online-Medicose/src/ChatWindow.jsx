import React, { useState, useEffect, useRef } from "react";

// Present a single chat message
const MessageBubble = ({ message, isLatestUser }) => (
  <div
    className={`chatbot-message chatbot-message--${message.sender} ${
      isLatestUser ? "chatbot-message--latest-user" : ""
    }`}
  >
    <div className="chatbot-message-text">{message.text}</div>
    <div className="chatbot-message-meta">{message.timestamp}</div>
  </div>
);

// Typing / loading skeleton bubble
const TypingIndicator = ({ isSending }) => {
  if (!isSending) return null;
  return (
    <div className="chatbot-message chatbot-message--bot chatbot-message-typing">
      <div className="chatbot-message-text">MediCose is typing...</div>
    </div>
  );
};

// Quick action chips under the message list
const QuickActions = ({ isSending, onQuickAction }) => {
  const groups = [
    {
      title: "Appointments",
      items: [
        { label: "📅 Book", action: "bookAppointment" },
        { label: "✏️ Reschedule", action: "rescheduleAppointment" },
        { label: "❌ Cancel", action: "cancelAppointment" },
        { label: "📋 My Appointments", action: "listAppointments" },
      ],
    },
    {
      title: "Medicines",
      items: [
        {
          label: "💊 Prescriptions",
          message: "Where can I view my prescriptions and active medications?",
        },
        {
          label: "🔁 Refill",
          message: "How do I request a refill for my medicines?",
        },
        { label: "📷 Scan Prescription", action: "scanPrescription" },
        { label: "📁 Upload Prescription", action: "uploadPrescription" },
      ],
    },
    {
      title: "Orders",
      items: [
        {
          label: "📦 Track Order",
          message:
            "How can I see the status and tracking for my medicine orders?",
        },
      ],
    },
  ];

  return (
    <div className="chatbot-suggestions">
      {groups.map((group) => (
        <div key={group.title} className="chatbot-suggestion-group">
          <div className="chatbot-suggestion-title">{group.title}</div>
          <div className="chatbot-suggestion-row">
            {group.items.map((item) => (
              <button
                key={item.label}
                type="button"
                className="chatbot-suggestion-chip"
                onClick={() => onQuickAction(item)}
                disabled={isSending}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main chat window shell
const ChatWindow = ({
  messages,
  isSending,
  input,
  onInputChange,
  onSend,
  onClose,
  onQuickAction,
  messagesEndRef,
  isCollapsed,
  onToggleCollapsed,
  soundEnabled,
  onToggleSound,
  themeMode,
  isListening,
  onToggleListening,
  cameraEnabled,
  onToggleCamera,
  videoRef,
  fileInputRef,
  onPrescriptionFileSelected,
  cameraStatus,
  placeholderText,
  MAX_INPUT_CHARS,
  language,
  onToggleLanguage,
  interimTranscript,
}) => {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  const handleWindowMouseMove = (event) => {
    if (!dragStartRef.current) return;
    const { startX, startY, baseX, baseY } = dragStartRef.current;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    setDragOffset({ x: baseX + dx, y: baseY + dy });
  };

  const handleWindowMouseUp = () => {
    if (!dragStartRef.current) return;
    dragStartRef.current = null;
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
  };

  const handleHeaderMouseDown = (event) => {
    if (event.button !== 0) return; // only left-click drags
    dragStartRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: dragOffset.x,
      baseY: dragOffset.y,
    };
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  return (
    <div
      className={`chatbot-window ${isCollapsed ? "chatbot-window--collapsed" : ""}`}
      id="medicose-chat-window"
      aria-label="MediCose Chatbot"
      role="dialog"
      aria-modal="false"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      data-theme={themeMode}
      style={{ transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)` }}
    >
      <div className="chatbot-header" onMouseDown={handleHeaderMouseDown}>
        <div>
          <div className="chatbot-title">MediCose Assistant</div>
          <div className="chatbot-subtitle">Helps you navigate the platform</div>
        </div>
        <div className="chatbot-header-actions">
          {/* Hidden file input for prescription uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file && onPrescriptionFileSelected) {
                onPrescriptionFileSelected(file);
              }
              // allow selecting the same file again later
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className={`chatbot-sound-btn ${isListening ? "is-listening" : ""}`}
            onClick={onToggleListening}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={isListening}
          >
            {isListening ? "🎙️" : "🎤"}
          </button>
          <button
            type="button"
            className="chatbot-sound-btn"
            onClick={onToggleCamera}
            aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
            aria-pressed={cameraEnabled}
          >
            {cameraEnabled ? "📷" : "📸"}
          </button>
          <button
            type="button"
            className="chatbot-sound-btn"
            onClick={onToggleSound}
            aria-label={soundEnabled ? "Mute chat sounds" : "Unmute chat sounds"}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
          <button
            type="button"
            className="chatbot-sound-btn"
            onClick={onToggleLanguage}
            aria-label={
              language === "hi"
                ? "Switch chatbot language to English"
                : "Switch chatbot language to Hindi"
            }
            aria-pressed={language === "hi"}
          >
            {language === "hi" ? "हिन्दी" : "EN"}
          </button>
          <button
            type="button"
            className="chatbot-collapse-btn"
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? "Expand chat" : "Minimize chat"}
            aria-pressed={isCollapsed}
          >
            {isCollapsed ? "▢" : "▁"}
          </button>
          <button
            type="button"
            className="chatbot-close-btn"
            onClick={onClose}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {cameraEnabled && (
            <div className="chatbot-camera-preview">
              <video
                ref={videoRef}
                className="chatbot-camera-video"
                autoPlay
                playsInline
                muted
                title="Click if the camera preview is not playing"
                onClick={() => {
                  const el = videoRef.current;
                  if (el && typeof el.play === "function") {
                    try {
                      const p = el.play();
                      if (p && typeof p.then === "function") {
                        p.catch(() => {
                          // ignore manual play errors
                        });
                      }
                    } catch {
                      // ignore
                    }
                  }
                }}
              />
              {cameraStatus && (
                <div className="chatbot-camera-status">{cameraStatus}</div>
              )}
            </div>
          )}
          <div
            className="chatbot-messages"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {(() => {
              let lastDateLabel = null;
              const lastUserId = [...messages]
                .reverse()
                .find((m) => m.sender === "user")?.id;
              return messages.map((msg) => {
                const created = msg.createdAt ? new Date(msg.createdAt) : new Date();
                const today = new Date();
                const isSameDay =
                  created.getFullYear() === today.getFullYear() &&
                  created.getMonth() === today.getMonth() &&
                  created.getDate() === today.getDate();
                const dateLabel = isSameDay
                  ? "Today"
                  : created.toLocaleDateString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                const showLabel = dateLabel !== lastDateLabel;
                lastDateLabel = dateLabel;

                return (
                  <React.Fragment key={msg.id}>
                    {showLabel && (
                      <div className="chatbot-date-separator">{dateLabel}</div>
                    )}
                    <MessageBubble
                      message={msg}
                      isLatestUser={msg.sender === "user" && msg.id === lastUserId}
                    />
                  </React.Fragment>
                );
              });
            })()}
            <TypingIndicator isSending={isSending} />
            <div ref={messagesEndRef} />
          </div>

          <QuickActions isSending={isSending} onQuickAction={onQuickAction} />

          <form className="chatbot-input-row" onSubmit={onSend}>
            <textarea
              rows={1}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={input ? undefined : placeholderText}
              aria-label="Type a message to the MediCose assistant"
              className="chatbot-input"
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend(e);
                }
              }}
            />
            {isListening && interimTranscript && (
              <div className="chatbot-stt-preview" aria-live="polite">
                {interimTranscript}
              </div>
            )}
            <div className="chatbot-char-count">
              {input.length}/{MAX_INPUT_CHARS}
            </div>
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={isSending || !input.trim()}
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </form>

          <div className="chatbot-disclaimer">
            <span>This assistant does not provide medical advice.</span>
            <span style={{ marginLeft: 8 }}>
              Language: {language === "hi" ? "हिन्दी" : "English"}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWindow;
