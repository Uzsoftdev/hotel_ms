import { useState, useEffect, useRef } from "react";
import api from "../../services/api";

const BUBBLE_HINTS = [
  "Need help choosing a room?",
  "Ask me about our suites!",
  "I can find your perfect stay.",
];

const QUICK_CHIPS = [
  "Romantic suite",
  "Family rooms",
  "Budget-friendly",
  "Ocean view",
  "Business travel",
  "Pet-friendly",
];

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Hi there! 👋 I'm your allStay AI concierge. Ask me anything about our rooms, amenities, or I can help you find the perfect stay for any occasion!",
};

export default function AIHelper() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bubbleIdx, setBubbleIdx] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Cycle hint bubble text
  useEffect(() => {
    const id = setInterval(() => {
      setBubbleIdx((i) => (i + 1) % BUBBLE_HINTS.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Show welcome message when first opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([WELCOME_MESSAGE]);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Listen for external open event
  useEffect(() => {
    const handler = () => { setOpen(true); };
    window.addEventListener("ai-helper:open", handler);
    return () => window.removeEventListener("ai-helper:open", handler);
  }, []);

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6);
      const res = await api.post("/public/ai/chat", { message: trimmed, history });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    send(input);
  }

  function handleChip(chip) {
    send(chip);
  }

  const showChips = messages.length <= 1;

  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes aiPulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        @keyframes aiDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes aiSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes aiFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Floating chat panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 380,
            height: 520,
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            animation: "aiSlideUp 0.25s ease-out",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#fff", fontSize: 20, fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                allStay AI
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
                AI Concierge · always ready
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                padding: 4,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 14px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: "#f8fafc",
            }}
          >
            {messages.map((msg, i) =>
              msg.role === "assistant" ? (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#6366f1",
                      marginTop: 10,
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: "16px 16px 16px 4px",
                      padding: "10px 14px",
                      fontSize: 13.5,
                      color: "#334155",
                      lineHeight: 1.55,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      maxWidth: 280,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      borderRadius: "16px 16px 4px 16px",
                      padding: "10px 14px",
                      fontSize: 13.5,
                      color: "#fff",
                      lineHeight: 1.55,
                      maxWidth: 260,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            )}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#6366f1",
                    marginTop: 10,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "16px 16px 16px 4px",
                    padding: "12px 16px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((n) => (
                    <span
                      key={n}
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#a5b4fc",
                        display: "inline-block",
                        animation: `aiDot 1.2s ease-in-out ${n * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips — only on first message */}
          {showChips && !loading && (
            <div
              style={{
                padding: "6px 14px 0",
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                background: "#f8fafc",
              }}
            >
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChip(chip)}
                  style={{
                    padding: "5px 11px",
                    borderRadius: 20,
                    border: "1px solid #c7d2fe",
                    background: "#eef2ff",
                    color: "#4f46e5",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderTop: "1px solid #e2e8f0",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              disabled={loading}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 13.5,
                color: "#1e293b",
                background: "transparent",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "default",
                background:
                  input.trim() && !loading
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 17,
                  color: input.trim() && !loading ? "#fff" : "#94a3b8",
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                send
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Hint bubble */}
      {!open && (
        <div
          style={{
            position: "fixed",
            bottom: 92,
            right: 90,
            background: "#fff",
            color: "#334155",
            fontSize: 12,
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: 20,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            border: "1px solid rgba(99,102,241,0.2)",
            whiteSpace: "nowrap",
            zIndex: 1001,
            animation: "aiFadeIn 0.4s ease",
          }}
          key={bubbleIdx}
        >
          {BUBBLE_HINTS[bubbleIdx]}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="AI concierge"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          zIndex: 1001,
          cursor: "pointer",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(99,102,241,0.45)",
        }}
      >
        {/* Pulse ring */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid rgba(99,102,241,0.6)",
            animation: "aiPulseRing 1.8s ease-out infinite",
            pointerEvents: "none",
          }}
        />
        <span
          className="material-symbols-outlined"
          style={{
            color: "#fff",
            fontSize: 24,
            fontVariationSettings: "'FILL' 1",
            transition: "transform 0.2s",
          }}
        >
          {open ? "close" : "chat_bubble"}
        </span>
      </button>
    </>
  );
}
