import axios from "../Config/axios.js";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../Config/auth-client.js";
import { useUser } from "../Context/user.context.jsx";

// ─── Chat Messages ────────────────────────────────────────────────────────────
const chatMessages = [
  {
    id: 1,
    text: "Just joined the team! 👋",
    side: "left",
    avatar: "D",
    name: "Dev",
  },
  {
    id: 2,
    text: "Welcome aboard! 🎉",
    side: "right",
    avatar: "S",
    name: "Sarah",
  },
  {
    id: 3,
    text: "Thanks! Where do I start?",
    side: "left",
    avatar: "D",
    name: "Dev",
  },
  {
    id: 4,
    text: "Check #onboarding first 📌",
    side: "right",
    avatar: "M",
    name: "Mike",
  },
  {
    id: 5,
    text: "I'll send you repo access now 🔑",
    side: "left",
    avatar: "S",
    name: "Sarah",
  },
  {
    id: 6,
    text: "Got it! Setting up local env now",
    side: "right",
    avatar: "D",
    name: "Dev",
  },
  {
    id: 7,
    text: "Any issues? We got you covered 🛡️",
    side: "left",
    avatar: "M",
    name: "Mike",
  },
  {
    id: 8,
    text: "Build succeeded! First PR coming 🚀",
    side: "right",
    avatar: "D",
    name: "Dev",
  },
  {
    id: 9,
    text: "That was fast! Reviewing now 👀",
    side: "left",
    avatar: "S",
    name: "Sarah",
  },
  {
    id: 10,
    text: "Clean code from day one 🔥",
    side: "right",
    avatar: "M",
    name: "Mike",
  },
  {
    id: 11,
    text: "This team is amazing 💙",
    side: "left",
    avatar: "D",
    name: "Dev",
  },
  {
    id: 12,
    text: "Glad you're here! Let's build 🏗️",
    side: "right",
    avatar: "S",
    name: "Sarah",
  },
];

const avatarColors = { D: "#4b5563", S: "#374151", M: "#6b7280" };

// ─── Chat Animation ───────────────────────────────────────────────────────────
const ChatAnimation = () => {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const indexRef = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    setVisibleMessages([chatMessages[0]]);
    indexRef.current = 1;

    const interval = setInterval(() => {
      const idx = indexRef.current % chatMessages.length;
      const msg = chatMessages[idx];

      setVisibleMessages((prev) => {
        const next = [...prev, msg];
        return next.length > 5 ? next.slice(next.length - 5) : next;
      });

      indexRef.current = idx + 1;
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleMessages]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#9ca3af",
            animation: "pulse 2s infinite",
          }}
        />
        <span
          style={{
            color: "#d1d5db",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
        >
          # onboarding
        </span>
        <span style={{ marginLeft: "auto", color: "#6b7280", fontSize: 11 }}>
          3 online
        </span>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "16px 14px",
          gap: 10,
        }}
      >
        {visibleMessages.map((msg, i) => {
          const isRight = msg.side === "right";
          const isNewest = i === visibleMessages.length - 1;
          return (
            <div
              key={`${msg.id}-${i}`}
              style={{
                display: "flex",
                flexDirection: isRight ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 8,
                animation: isNewest
                  ? "msgIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards"
                  : "none",
                opacity: isNewest ? 0 : 1,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: avatarColors[msg.avatar],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {msg.avatar}
              </div>
              <div
                style={{
                  maxWidth: "70%",
                  padding: "8px 13px",
                  borderRadius: isRight
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  background: isRight
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.05)",
                  border: isRight ? "none" : "1px solid rgba(255,255,255,0.06)",
                  color: isRight ? "#e5e7eb" : "#d1d5db",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Typing dots */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {chatMessages[indexRef.current % chatMessages.length]?.avatar ??
              "D"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "9px 13px",
              borderRadius: "18px 18px 18px 4px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#9ca3af",
                display: "block",
                animation: "dot 1.4s infinite 0.0s",
              }}
            />
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#9ca3af",
                display: "block",
                animation: "dot 1.4s infinite 0.2s",
              }}
            />
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#9ca3af",
                display: "block",
                animation: "dot 1.4s infinite 0.4s",
              }}
            />
          </div>
        </div>
      </div>

      {/* Decorative input */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "9px 14px",
          }}
        >
          <span style={{ color: "#4b5563", fontSize: 13, flex: 1 }}>
            Type a message...
          </span>
          <svg width="14" height="14" fill="#4b5563" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// ─── Register ─────────────────────────────────────────────────────────────────
const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/home`,
      });
    } catch {
      setError("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (authError) {
        setError(authError.message || "Registration failed");
        return;
      }
      try {
        const res = await axios.get("/user/profile");
        setUser(res.data.user);
      } catch {
        setUser({
          _id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          ...data.user,
        });
      }
      navigate("/home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes dot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1;   }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #4b5563; }
        input:focus { border-color: #6b7280 !important; }
        @media (min-width: 1024px) {
          .chat-panel-reg { display: flex !important; }
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          background: "#0a0a0a",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ── LEFT: Form ──────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            maxWidth: 520,
            padding: "40px 48px",
            animation: "fadeUp 0.6s ease forwards",
          }}
        >
          <div style={{ width: "100%", maxWidth: 380 }}>
            {/* Brand */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 36,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              <span
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 17,
                  letterSpacing: "-0.02em",
                }}
              >
                DevDialogue
              </span>
            </div>

            <h1
              style={{
                color: "#fff",
                fontSize: 28,
                fontWeight: 700,
                margin: "0 0 6px",
                letterSpacing: "-0.03em",
              }}
            >
              Create account
            </h1>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 28px" }}>
              Join DevDialogue and start collaborating
            </p>

            {/* Error */}
            {error && (
              <div
                style={{
                  marginBottom: 18,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "11px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: 22,
                transition: "all 0.2s",
                opacity: googleLoading ? 0.5 : 1,
              }}
            >
              {googleLoading ? (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid rgba(255,255,255,0.2)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <span
                style={{
                  color: "#4b5563",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                }}
              >
                OR
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    color: "#9ca3af",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "11px 14px",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    color: "#9ca3af",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "11px 14px",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label
                  style={{
                    display: "block",
                    color: "#9ca3af",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "11px 14px",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  background: loading ? "rgba(255,255,255,0.7)" : "#fff",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: 14,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading && (
                  <span
                    style={{
                      width: 15,
                      height: 15,
                      border: "2px solid rgba(0,0,0,0.2)",
                      borderTopColor: "#000",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                )}
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p
              style={{
                textAlign: "center",
                color: "#6b7280",
                fontSize: 13,
                marginTop: 28,
              }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#d1d5db",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* ── RIGHT: Chat Panel ────────────────────────────────── */}
        <div
          className="chat-panel-reg"
          style={{
            flex: 1,
            background: "#111111",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            display: "none",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
            animation: "slideIn 0.7s ease forwards",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.025,
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.02)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: "36px 32px",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <h2
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 700,
                  margin: "0 0 6px",
                  letterSpacing: "-0.02em",
                }}
              >
                Join the conversation
              </h2>
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
                Collaborate with developers around the world
              </p>
            </div>

            <div
              style={{
                flex: 1,
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              }}
            >
              <ChatAnimation />
            </div>

            <div
              style={{
                marginTop: 18,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#9ca3af",
                  animation: "pulse 2s infinite",
                }}
              />
              <span style={{ color: "#4b5563", fontSize: 12 }}>
                Live • Onboarding channel
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Register;
