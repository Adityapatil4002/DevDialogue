import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Terminal,
  Code2,
  MessageSquare,
  Play,
  ArrowRight,
  Zap,
  Cpu,
  Sparkles,
  CheckCircle2,
  Layout,
  Folder,
  FileCode,
  Users,
  PlayCircle,
  Github,
  Twitter,
  Disc,
  MessageCircle,
  Menu,
  X,
  Globe,
  Loader2,
  Rocket,
  ChevronRight,
  ChevronDown,
  Layers,
  Shield,
  Database,
  Send,
  GitBranch,
  Box,
  Lock,
  Activity,
  BarChart3,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import logo from "../assets/logo.png";

import { useUser } from "../Context/user.context.jsx";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── SCROLL REVEAL ─────────────────────────────────────────
const Reveal = ({ children, delay = 0, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 48 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── PARTICLE NETWORK (Hero Background) ────────────────────
const ParticleField = React.memo(() => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const particles = [];
    const COUNT = 90;
    const MAX_DIST = 130;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 1.8 + 0.6,
        o: Math.random() * 0.45 + 0.12,
      });
    }

    const onMouse = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < COUNT; i++) {
        const p = particles[i];
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < 180) {
          p.vx -= dx * 0.00004;
          p.vy -= dy * 0.00004;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.fill();

        for (let j = i + 1; j < COUNT; j++) {
          const q = particles[j];
          const ddx = p.x - q.x;
          const ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < MAX_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.12 * (1 - d / MAX_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
});

// ─── NAVBAR ─────────────────────────────────────────────────
const Navbar = () => {
  const { user, loading } = useUser();
  const authed = !loading && !!user;

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { name: "Collaboration", href: "#chat" },
    { name: "AI Engine", href: "#ai" },
    { name: "Runtime", href: "#runtime" },
    { name: "Insights", href: "#insights" },
  ];

  const scroll = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.offsetTop - 85, behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b",
        scrolled
          ? "bg-black/70 backdrop-blur-2xl border-white/[0.06] py-3"
          : "bg-transparent border-transparent py-5",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <motion.div
            initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.12, rotate: 8 }}
            className="w-12 h-12 flex items-center justify-center relative"
          >
            <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain brightness-0 invert relative z-10"
            />
          </motion.div>
          <span className="ml-1 font-bold text-sm text-white tracking-wide group-hover:text-gray-300 transition-colors">
            DevDialogue
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.name}
              href={l.href}
              onClick={(e) => scroll(e, l.href)}
              className="text-sm font-medium text-gray-500 hover:text-white transition-colors relative group"
            >
              {l.name}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
          ) : (
            <>
              {!authed && (
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              )}
              <Link to={authed ? "/home" : "/register"}>
                <button className="bg-white text-black font-bold py-2.5 px-6 rounded-full text-sm hover:bg-gray-200 transition-all hover:scale-105 active:scale-95">
                  {authed ? "Open Workspace →" : "Get Started →"}
                </button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/[0.06] overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((l) => (
                <a
                  key={l.name}
                  href={l.href}
                  onClick={(e) => scroll(e, l.href)}
                  className="text-gray-300 hover:text-white font-medium"
                >
                  {l.name}
                </a>
              ))}
              <hr className="border-white/10" />
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-600 mx-auto" />
              ) : !authed ? (
                <>
                  <Link to="/login" className="text-white font-medium">
                    Sign In
                  </Link>
                  <Link to="/register">
                    <button className="w-full py-3 bg-white text-black font-bold rounded-lg">
                      Get Started
                    </button>
                  </Link>
                </>
              ) : (
                <Link to="/home">
                  <button className="w-full py-3 bg-white text-black font-bold rounded-lg">
                    Open Workspace
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ─── HERO SECTION ───────────────────────────────────────────
const HeroSection = () => {
  const { user, loading } = useUser();
  const authed = !loading && !!user;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white selection:bg-white/20">
      <ParticleField />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black z-[1]" />

      {/* Floating geometric wireframes */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360, y: [-20, 20, -20] }}
          transition={{
            rotate: { duration: 40, repeat: Infinity, ease: "linear" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-[15%] left-[8%] w-36 h-36 border border-white/[0.04] rounded-2xl"
        />
        <motion.div
          animate={{ rotate: -360, x: [-15, 15, -15] }}
          transition={{
            rotate: { duration: 35, repeat: Infinity, ease: "linear" },
            x: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-[55%] right-[12%] w-28 h-28 border border-white/[0.04] rounded-full"
        />
        <motion.div
          animate={{ rotate: 180, scale: [1, 1.15, 1] }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute bottom-[25%] left-[20%] w-20 h-20 border border-white/[0.03]"
        />
        <motion.div
          animate={{ rotate: -180, y: [10, -10, 10] }}
          transition={{
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-[30%] right-[30%] w-14 h-14 border border-white/[0.03] rotate-45"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-8"
        >
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          AI-Powered Development Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9 }}
          className="text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.92] tracking-tight mb-8"
        >
          Turn Conversation
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">
            into Execution.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-lg text-gray-500 max-w-2xl leading-relaxed mb-12"
        >
          DevDialogue is the world's first chat-native IDE. Tag{" "}
          <strong className="text-white font-semibold">@ai</strong> to generate
          full-stack code, create file architectures, and run logic — all inside
          your team chat.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to={authed ? "/home" : "/register"}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-shadow"
            >
              {authed ? "Open Workspace" : "Start Building"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              document
                .getElementById("chat")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="border border-white/15 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/5 transition-colors"
          >
            Explore Features
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/15 rounded-full flex justify-center pt-2"
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-1 h-2 bg-white/60 rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// ─── ANIMATED GROUP CHAT DEMO (Proportional Size & Continuous) ─────────────
const ChatFlowAnimation = () => {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  const messageSequence = [
    {
      user: "Elena",
      avatar: "E",
      text: "Just pushed the new API endpoints to dev. Ready for testing! 🚀",
      color: "from-blue-500 to-blue-600",
      delay: 0,
    },
    {
      user: "David",
      avatar: "D",
      text: "Perfect timing! I'll test the frontend integration now.",
      color: "from-purple-500 to-purple-600",
      delay: 1400,
    },
    {
      user: "Sarah",
      avatar: "S",
      text: "Should we add rate limiting to prevent abuse?",
      color: "from-pink-500 to-pink-600",
      delay: 2800,
    },
    {
      user: "You",
      avatar: "ME",
      text: "@ai create a rate limiting middleware with Redis",
      color: "from-white to-gray-200",
      isMe: true,
      hasAI: true,
      delay: 4200,
    },
    {
      user: "AI",
      avatar: "✦",
      text: "Analyzing your project structure...",
      color: "from-white to-gray-300",
      isAI: true,
      isTyping: true,
      delay: 5800,
    },
    {
      user: "AI",
      avatar: "✦",
      text: "✓ Created middleware/rateLimiter.js with Redis integration\n✓ Added express-rate-limit configuration\n✓ Updated server.js with middleware",
      color: "from-white to-gray-300",
      isAI: true,
      hasCode: true,
      delay: 8000,
    },
    {
      user: "Mike",
      avatar: "M",
      text: "Wow, that's exactly what we needed!",
      color: "from-green-500 to-green-600",
      delay: 10500,
    },
    {
      user: "Elena",
      avatar: "E",
      text: "This AI integration saves us hours every day 💯",
      color: "from-blue-500 to-blue-600",
      delay: 12000,
    },
  ];

  useEffect(() => {
    let timeouts = [];
    const runSequence = () => {
      setMessages([]);
      messageSequence.forEach((msg, index) => {
        const t = setTimeout(() => {
          setMessages((prev) => {
            const filtered = prev.filter((m) => !m.isTyping);
            return [...filtered, { ...msg, id: Date.now() + index }];
          });
        }, msg.delay);
        timeouts.push(t);
      });

      const reset = setTimeout(
        runSequence,
        messageSequence[messageSequence.length - 1].delay + 4000,
      );
      timeouts.push(reset);
    };

    runSequence();

    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[450px] lg:h-[520px] bg-[#070707] rounded-[2rem] border border-white/[0.08] overflow-hidden shadow-2xl flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="h-16 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Users className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              # dev-team
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400">
                5 online
              </span>
            </div>
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
              Real-time sync
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto px-6 py-6 space-y-5 scrollbar-hide"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn("flex gap-3.5", msg.isMe && "flex-row-reverse")}
              >
                <motion.div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-lg",
                    msg.isAI
                      ? "bg-gradient-to-br from-white to-gray-200 text-black border border-white/20"
                      : msg.isMe
                        ? "bg-gradient-to-br from-white/15 to-white/5 text-white border border-white/20"
                        : `bg-gradient-to-br ${msg.color} text-white`,
                  )}
                >
                  {msg.avatar}
                </motion.div>

                <div
                  className={cn(
                    "flex flex-col max-w-[75%]",
                    msg.isMe && "items-end",
                  )}
                >
                  <div
                    className={cn(
                      "text-[13px] font-semibold mb-1.5 px-1 flex items-center gap-2",
                      msg.isMe
                        ? "text-gray-400"
                        : msg.isAI
                          ? "text-gray-300"
                          : "text-gray-500",
                    )}
                  >
                    {msg.user}
                    {msg.isAI && (
                      <span className="text-[9px] bg-white/15 text-white px-1.5 py-0.5 rounded-md">
                        AI Assistant
                      </span>
                    )}
                  </div>

                  <motion.div
                    className={cn(
                      "px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed backdrop-blur-md",
                      msg.isMe
                        ? "bg-gradient-to-br from-white/10 to-white/5 text-white border border-white/10 rounded-tr-sm"
                        : msg.isAI
                          ? "bg-gradient-to-br from-white/10 to-white/5 text-gray-100 border border-white/10 rounded-tl-sm"
                          : "bg-gradient-to-br from-[#141414] to-[#0a0a0a] text-gray-300 border border-white/5 rounded-tl-sm shadow-md",
                    )}
                  >
                    {msg.hasAI && (
                      <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded text-[12px] font-bold mr-2 mb-1.5 border border-white/20">
                        <Zap className="w-3.5 h-3.5 text-yellow-300" /> @ai
                      </span>
                    )}

                    {msg.hasCode ? (
                      <div className="space-y-2 font-mono text-[13px] mt-1">
                        {msg.text.split("\n").map((line, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="flex items-center gap-2.5"
                          >
                            {line.startsWith("✓") && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            )}
                            <span
                              className={
                                line.startsWith("✓")
                                  ? "text-gray-200"
                                  : "text-gray-300"
                              }
                            >
                              {line}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <span>{msg.text}</span>
                    )}

                    {msg.isTyping && (
                      <div className="flex gap-1 mt-1.5 h-3 items-center">
                        {[0, 0.2, 0.4].map((d) => (
                          <motion.div
                            key={d}
                            animate={{ y: [-2, 2, -2], opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: d,
                            }}
                            className="w-1.5 h-1.5 bg-white/60 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="h-20 border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center px-6 shrink-0">
        <div className="flex-1 flex items-center gap-3 bg-[#0a0a0a] rounded-xl px-4 py-3 border border-white/[0.08]">
          <MessageCircle className="w-5 h-5 text-gray-500" />
          <div className="flex-1 text-sm text-gray-500">
            Message or mention @ai...
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Code2 className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 bg-white text-black hover:bg-gray-200 rounded-lg transition-colors shadow-lg">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── FEATURE 1 — CHAT (Intact Layout Design) ──────────────────────────
const ChatFeatureSection = () => {
  const topThreeCards = [
    {
      icon: MessageCircle,
      title: "Instant Messaging",
      desc: "Lightning-fast real-time communication. Messages sync across all devices in under 50ms with WebSockets.",
      iconColor: "text-blue-400 group-hover:text-blue-300",
      bgGradient: "from-blue-500/10 to-transparent",
    },
    {
      icon: Users,
      title: "Smart Mentions",
      desc: "Tag teammates with @ for instant notifications. Mention @ai to summon the assistant directly.",
      iconColor: "text-purple-400 group-hover:text-purple-300",
      bgGradient: "from-purple-500/10 to-transparent",
    },
    {
      icon: Code2,
      title: "Rich Formatting",
      desc: "Share code with syntax highlighting, markdown support, and previews. Supports 150+ languages.",
      iconColor: "text-pink-400 group-hover:text-pink-300",
      bgGradient: "from-pink-500/10 to-transparent",
    },
  ];

  const bottomTwoCards = [
    {
      icon: Layers,
      title: "Organized Threads",
      desc: "Keep conversations structured with nested threads and replies. Create focused discussions without cluttering the main channel. Perfect for code reviews, bug tracking, and feature planning.",
      iconColor: "text-green-400 group-hover:text-green-300",
      bgGradient: "from-green-500/10 to-transparent",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      desc: "Bank-grade encryption for all messages. SOC 2 Type II certified with end-to-end encryption, SSO integration, and granular access controls. Your code discussions stay perfectly secure.",
      iconColor: "text-orange-400 group-hover:text-orange-300",
      bgGradient: "from-orange-500/10 to-transparent",
    },
  ];

  return (
    <section id="chat" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-16">
          <motion.div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/[0.03] text-gray-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <MessageCircle className="w-4 h-4" />
            Real-time Collaboration
          </motion.div>
          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Code Together.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
              Ship Faster.
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            A chat platform built exclusively for developers. Discuss
            architecture, debug issues together, and deploy code—all without
            leaving your conversation.
          </p>
        </Reveal>

        {/* Proportional Chat Demo */}
        <Reveal delay={0.1} className="mb-16 relative z-20">
          <ChatFlowAnimation />
        </Reveal>

        {/* 3 Intact Sections */}
        <Reveal delay={0.15}>
          <div className="flex flex-col lg:flex-row w-full border border-white/[0.08] rounded-[2rem] overflow-hidden bg-[#070707] mb-8 shadow-2xl">
            {topThreeCards.map((card, i) => (
              <div
                key={i}
                className="flex-1 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.08] last:border-0 relative group transition-all duration-500 overflow-hidden cursor-pointer"
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    card.bgGradient,
                  )}
                />
                <div className="relative z-10 flex flex-col items-start transition-transform duration-500 group-hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center mb-6 border border-white/[0.05] shadow-inner group-hover:bg-white/[0.06] transition-colors">
                    <card.icon
                      className={cn(
                        "w-6 h-6 transition-colors duration-500",
                        card.iconColor,
                      )}
                    />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 2 Intact Sections */}
        <Reveal delay={0.25}>
          <div className="flex flex-col lg:flex-row w-full border border-white/[0.08] rounded-[2rem] overflow-hidden bg-[#070707] shadow-2xl">
            {bottomTwoCards.map((card, i) => (
              <div
                key={i}
                className="flex-1 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/[0.08] last:border-0 relative group transition-all duration-500 overflow-hidden cursor-pointer"
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    card.bgGradient,
                  )}
                />
                <div className="relative z-10 flex flex-col md:flex-row gap-6 lg:gap-8 items-start transition-transform duration-500 group-hover:-translate-y-1">
                  <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center shrink-0 border border-white/[0.05] shadow-inner group-hover:bg-white/[0.06] transition-colors">
                    <card.icon
                      className={cn(
                        "w-8 h-8 transition-colors duration-500",
                        card.iconColor,
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-3 group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-base leading-relaxed group-hover:text-gray-300 transition-colors">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── AI CHAT PANEL (for Design B left) ─────────────────────
const AIChatPanel = () => {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const full =
    "The authMiddleware validates the JWT from the Authorization header. If the token is valid it decodes the payload and attaches the user object to req.user for downstream controllers.";

  useEffect(() => {
    const run = () => {
      setStep(0);
      setTyped("");
      const t1 = setTimeout(() => setStep(1), 800);
      const t2 = setTimeout(() => setStep(2), 2200);
      const t3 = setTimeout(() => setStep(3), 3800);
      const t4 = setTimeout(run, 14000);
      return [t1, t2, t3, t4];
    };
    const ts = run();
    return () => ts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (step === 3) {
      let i = 0;
      const iv = setInterval(() => {
        if (i <= full.length) {
          setTyped(full.slice(0, i));
          i++;
        } else clearInterval(iv);
      }, 22);
      return () => clearInterval(iv);
    }
  }, [step]);

  const msgs = [
    { user: "Sarah", text: "I keep getting a 401 on /profile." },
    { user: "Mike", text: "Is the token in the Authorization header?" },
    {
      user: "Sarah",
      text: "Yeah, it's there. Not sure why it's failing.",
    },
  ];

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="h-11 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between px-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          # dev-team
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-600" />
          <div className="w-2 h-2 rounded-full bg-gray-600" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>

      <div className="flex-1 p-5 space-y-4 flex flex-col justify-end overflow-hidden">
        {msgs.map((m, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-[10px] text-gray-400 font-bold shrink-0">
              {m.user[0]}
            </div>
            <div>
              <div className="text-[10px] text-gray-600 font-bold uppercase mb-1">
                {m.user}
              </div>
              <div className="bg-[#141414] border border-white/[0.06] p-2.5 rounded-xl rounded-tl-none text-gray-400 text-xs">
                {m.text}
              </div>
            </div>
          </div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 16 }}
          className="flex gap-3 flex-row-reverse"
        >
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
            ME
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-600 font-bold uppercase mb-1">
              You
            </div>
            <div className="bg-white/10 border border-white/10 p-2.5 rounded-xl rounded-tr-none text-white text-xs text-left">
              <span className="text-gray-300 font-bold bg-white/10 px-1 rounded">
                @ai
              </span>{" "}
              how does the auth middleware work?
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 16 }}
          className="flex gap-3"
        >
          <div className="w-7 h-7 rounded-full bg-white border border-white/20 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-black" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center gap-1.5">
              AI
              {step === 2 && (
                <span className="flex gap-0.5">
                  {[0, 0.15, 0.3].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.9,
                        delay: d,
                      }}
                      className="w-1 h-1 bg-gray-400 rounded-full"
                    />
                  ))}
                </span>
              )}
            </div>
            <div className="bg-[#141414] border border-white/[0.06] p-3 rounded-xl rounded-tl-none text-gray-300 text-xs leading-relaxed min-h-[40px]">
              {step === 2 ? (
                <span className="text-gray-600 italic">
                  Analyzing codebase…
                </span>
              ) : step >= 3 ? (
                <>
                  {typed}
                  {typed.length < full.length && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-1 h-3 bg-white/60 ml-0.5 align-middle"
                    />
                  )}
                </>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ─── FEATURE 2 — AI ENGINE ─────────────────────
const AIFeatureSection = () => {
  const [activeFaq, setActiveFaq] = useState(0);

  const faqs = [
    {
      q: "How does context awareness work?",
      short:
        "The AI reads your open files, project structure, and conversation history to give contextually relevant answers.",
      animKey: "context",
    },
    {
      q: "What AI models are supported?",
      short:
        "We support GPT-4, Claude, and custom fine-tuned models. Switch between them in settings.",
      animKey: "models",
    },
    {
      q: "Is my code kept private?",
      short:
        "Yes. All code is encrypted in transit and at rest. We never use your code for training.",
      animKey: "security",
    },
  ];

  const faqAnimations = {
    context: (
      <div className="space-y-3 w-full">
        {["project.config", "auth.middleware.js", "user.controller.js"].map(
          (f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 bg-[#141414] border border-white/[0.06] p-3 rounded-lg"
            >
              <FileCode className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-400 font-mono">{f}</span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, delay: i * 0.2 }}
                className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden"
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.2 }}
                  className="h-full bg-white/20 rounded-full"
                />
              </motion.div>
              <Eye className="w-3 h-3 text-gray-600" />
            </motion.div>
          ),
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[10px] text-gray-600 uppercase tracking-wider mt-2"
        >
          3 files analyzed • full context loaded
        </motion.div>
      </div>
    ),
    models: (
      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          { name: "GPT-4o", status: "Active" },
          { name: "Claude 3", status: "Ready" },
          { name: "Custom", status: "Ready" },
        ].map((m, i) => (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12 }}
            className={cn(
              "bg-[#141414] border rounded-xl p-4 text-center",
              i === 0 ? "border-white/20" : "border-white/[0.06]",
            )}
          >
            <Cpu className="w-5 h-5 text-gray-500 mx-auto mb-2" />
            <div className="text-xs text-white font-bold">{m.name}</div>
            <div
              className={cn(
                "text-[9px] mt-1 font-bold uppercase tracking-wider",
                i === 0 ? "text-white" : "text-gray-600",
              )}
            >
              {m.status}
            </div>
          </motion.div>
        ))}
      </div>
    ),
    security: (
      <div className="flex flex-col items-center gap-4 w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-center"
        >
          <Shield className="w-8 h-8 text-gray-400" />
        </motion.div>
        {[
          "AES-256 Encryption",
          "Zero-knowledge Architecture",
          "SOC 2 Compliant",
        ].map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12 }}
            className="flex items-center gap-2 text-xs text-gray-400"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />
            {t}
          </motion.div>
        ))}
      </div>
    ),
  };

  return (
    <section id="ai" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.02)_0%,transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="w-3.5 h-3.5" /> Context-Aware Intelligence
          </div>
          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight">
            Your Team's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              AI Co-founder.
            </span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
          <Reveal className="lg:col-span-3 min-h-[420px]">
            <AIChatPanel />
          </Reveal>

          <div className="lg:col-span-2 flex flex-col gap-5">
            <Reveal delay={0.1} className="flex-1">
              <motion.div
                whileHover={{
                  y: -4,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
                className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 h-full transition-colors group"
              >
                <div className="w-11 h-11 bg-white/[0.04] rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">
                  Context Awareness
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  AI reads your open files, git history, and conversation
                  context to deliver precise, relevant answers instantly.
                </p>
                <div className="flex gap-2 mt-4">
                  {["Files", "Git", "Chat"].map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded text-gray-500 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Reveal>
            <Reveal delay={0.15} className="flex-1">
              <motion.div
                whileHover={{
                  y: -4,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
                className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 h-full transition-colors group"
              >
                <div className="w-11 h-11 bg-white/[0.04] rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                  <Sparkles className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">
                  Multi-model Support
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Switch between GPT-4, Claude, and custom fine-tuned models for
                  different tasks and preferences.
                </p>
              </motion.div>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Reveal>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Frequently Asked
              </h3>
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  onClick={() => setActiveFaq(i)}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all duration-300",
                    activeFaq === i
                      ? "bg-white/[0.04] border-white/15"
                      : "bg-transparent border-white/[0.06] hover:border-white/10",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4
                      className={cn(
                        "font-semibold text-sm transition-colors",
                        activeFaq === i ? "text-white" : "text-gray-500",
                      )}
                    >
                      {faq.q}
                    </h4>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        activeFaq === i
                          ? "rotate-90 text-white"
                          : "text-gray-700",
                      )}
                    />
                  </div>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-gray-600 text-xs leading-relaxed overflow-hidden"
                      >
                        {faq.short}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-8 min-h-[280px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFaq}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                  className="w-full"
                >
                  {faqAnimations[faqs[activeFaq].animKey]}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// ─── FILE TREE ANIMATION (Proportional Size & Continuous) ────────────
const FileTreeAnimation = () => {
  const allItems = [
    { name: "project-root", type: "folder", depth: 0, icon: Folder },
    { name: "src", type: "folder", depth: 1, icon: Folder },
    { name: "components", type: "folder", depth: 2, icon: Folder },
    { name: "Button.tsx", type: "file", depth: 3, icon: FileCode, lang: "tsx" },
    { name: "Input.tsx", type: "file", depth: 3, icon: FileCode, lang: "tsx" },
    { name: "Navbar.tsx", type: "file", depth: 3, icon: FileCode, lang: "tsx" },
    { name: "lib", type: "folder", depth: 2, icon: Folder },
    { name: "utils.ts", type: "file", depth: 3, icon: FileCode, lang: "ts" },
    { name: "api.ts", type: "file", depth: 3, icon: FileCode, lang: "ts" },
    { name: "app", type: "folder", depth: 1, icon: Folder },
    { name: "page.tsx", type: "file", depth: 2, icon: FileCode, lang: "tsx" },
    { name: "layout.tsx", type: "file", depth: 2, icon: FileCode, lang: "tsx" },
    {
      name: "package.json",
      type: "file",
      depth: 1,
      icon: FileCode,
      lang: "json",
    },
  ];

  const [visibleItems, setVisibleItems] = useState([]);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    const animate = () => {
      setVisibleItems([]);
      setProgress(0);
      let index = 0;

      intervalId = setInterval(() => {
        if (index < allItems.length) {
          setVisibleItems((prev) => [
            ...prev,
            { ...allItems[index], id: Date.now() + index },
          ]);
          setProgress(((index + 1) / allItems.length) * 100);
          index++;
        } else {
          clearInterval(intervalId);
          timeoutId = setTimeout(() => {
            animate();
          }, 3500);
        }
      }, 300);
    };

    animate();

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [visibleItems]);

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[450px] lg:h-[520px] bg-[#070707] rounded-[2rem] border border-white/[0.08] overflow-hidden shadow-2xl flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="h-16 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center border border-white/10"
            whileHover={{ scale: 1.05, rotate: -5 }}
          >
            <Layout className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
              Architecture Generator
            </div>
            <div className="text-[11px] text-gray-500">
              {visibleItems.length} of {allItems.length} generated
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {visibleItems.length < allItems.length ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-3.5 h-3.5 text-blue-400" />
              </motion.div>
              <span className="text-[11px] text-gray-300 font-bold">
                Scaffolding...
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[11px] text-green-400 font-bold">
                Complete
              </span>
            </motion.div>
          )}
        </div>
      </div>

      <div className="h-1 bg-white/[0.03] relative shrink-0">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <div
          ref={scrollRef}
          className="absolute inset-0 p-6 overflow-y-auto scrollbar-hide font-mono text-[14px]"
        >
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                    className="flex items-center gap-3 py-2 px-3 hover:bg-white/[0.06] rounded-xl transition-all group cursor-pointer border border-transparent hover:border-white/10"
                    style={{ paddingLeft: `${item.depth * 24 + 12}px` }}
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.2,
                        rotate: item.type === "folder" ? 15 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            item.type === "folder"
                              ? "text-blue-400"
                              : "text-gray-500 group-hover:text-gray-300",
                          )}
                        />
                      )}
                    </motion.div>

                    <span
                      className={cn(
                        "flex-1 transition-colors",
                        item.type === "folder"
                          ? "text-white font-semibold"
                          : "text-gray-400 group-hover:text-white",
                      )}
                    >
                      {item.name}
                    </span>

                    {item.lang && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[10px] bg-white/[0.06] border border-white/[0.1] px-2 py-0.5 rounded font-bold text-gray-400 uppercase tracking-wider group-hover:bg-white/10 group-hover:text-white transition-colors"
                      >
                        {item.lang}
                      </motion.span>
                    )}

                    {index === visibleItems.length - 1 &&
                      visibleItems.length < allItems.length && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-2 py-1 rounded-md font-bold"
                        >
                          ADDED
                        </motion.span>
                      )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="h-14 border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-xl flex items-center px-6 shrink-0">
        <span className="text-gray-600 text-[13px] font-mono mr-3 font-bold">
          {">"}
        </span>
        <span className="text-gray-400 text-[13px] font-mono flex-1">
          {visibleItems.length < allItems.length
            ? `Generating ${allItems[visibleItems.length]?.name || "..."}`
            : `✓ Successfully bootstrapped complete architecture.`}
        </span>
        {visibleItems.length < allItems.length && (
          <motion.div
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-4 bg-blue-400/80 rounded-sm"
          />
        )}
      </div>
    </div>
  );
};

// ─── FEATURE 3 — FILE TREE (Intact Layout Design) ─────────────────────
const FileTreeFeatureSection = () => {
  const topThreeCards = [
    {
      icon: Layout,
      title: "AI Scaffolding",
      desc: "Describe your project in English and watch the AI generate a complete, production-ready structure.",
      iconColor: "text-sky-400 group-hover:text-sky-300",
      bgGradient: "from-sky-500/10 to-transparent",
    },
    {
      icon: GitBranch,
      title: "Best Practices",
      desc: "Every structure follows industry standards with proper modular architecture and scalable patterns.",
      iconColor: "text-purple-400 group-hover:text-purple-300",
      bgGradient: "from-purple-500/10 to-transparent",
    },
    {
      icon: Zap,
      title: "Smart Imports",
      desc: "AI automatically sets up imports, exports, and relationships. No manual linking required.",
      iconColor: "text-rose-400 group-hover:text-rose-300",
      bgGradient: "from-rose-500/10 to-transparent",
    },
  ];

  const bottomTwoCards = [
    {
      icon: Box,
      title: "Framework Intelligence",
      desc: "Supports React, Next.js, Vue, Express, NestJS, and more. Each scaffold follows framework-specific conventions, deeply understanding routing patterns and configurations.",
      iconColor: "text-emerald-400 group-hover:text-emerald-300",
      bgGradient: "from-emerald-500/10 to-transparent",
    },
    {
      icon: Database,
      title: "Template Library",
      desc: "Start from battle-tested templates or custom architectures. Includes monorepos, microservices, and boilerplates pre-configured with databases and CI/CD.",
      iconColor: "text-amber-400 group-hover:text-amber-300",
      bgGradient: "from-amber-500/10 to-transparent",
    },
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-16">
          <motion.div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/[0.03] text-gray-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Layout className="w-4 h-4" />
            Intelligent Scaffolding
          </motion.div>
          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6">
            From Idea to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
              Full Architecture.
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Stop writing boilerplate. Describe your app, and let the AI generate
            complete, interconnected codebases instantly.
          </p>
        </Reveal>

        {/* Proportional File Tree Demo */}
        <Reveal delay={0.1} className="mb-16 relative z-20">
          <FileTreeAnimation />
        </Reveal>

        {/* 3 Intact Sections */}
        <Reveal delay={0.15}>
          <div className="flex flex-col lg:flex-row w-full border border-white/[0.08] rounded-[2rem] overflow-hidden bg-[#070707] mb-8 shadow-2xl">
            {topThreeCards.map((card, i) => (
              <div
                key={i}
                className="flex-1 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/[0.08] last:border-0 relative group transition-all duration-500 overflow-hidden cursor-pointer"
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    card.bgGradient,
                  )}
                />
                <div className="relative z-10 flex flex-col items-start transition-transform duration-500 group-hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white/[0.03] rounded-xl flex items-center justify-center mb-6 border border-white/[0.05] shadow-inner group-hover:bg-white/[0.06] transition-colors">
                    <card.icon
                      className={cn(
                        "w-6 h-6 transition-colors duration-500",
                        card.iconColor,
                      )}
                    />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 2 Intact Sections */}
        <Reveal delay={0.25}>
          <div className="flex flex-col lg:flex-row w-full border border-white/[0.08] rounded-[2rem] overflow-hidden bg-[#070707] shadow-2xl">
            {bottomTwoCards.map((card, i) => (
              <div
                key={i}
                className="flex-1 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/[0.08] last:border-0 relative group transition-all duration-500 overflow-hidden cursor-pointer"
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    card.bgGradient,
                  )}
                />
                <div className="relative z-10 flex flex-col md:flex-row gap-6 lg:gap-8 items-start transition-transform duration-500 group-hover:-translate-y-1">
                  <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center shrink-0 border border-white/[0.05] shadow-inner group-hover:bg-white/[0.06] transition-colors">
                    <card.icon
                      className={cn(
                        "w-8 h-8 transition-colors duration-500",
                        card.iconColor,
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-2xl mb-3 group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-base leading-relaxed group-hover:text-gray-300 transition-colors">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── TERMINAL PANEL ────────────────────
const TerminalPanel = () => {
  const [tab, setTab] = useState("code");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let ts = [];
    const run = () => {
      setTab("code");
      setStatus("idle");
      setLogs([]);
      ts.push(
        setTimeout(() => {
          setStatus("running");
          setTab("terminal");
        }, 2000),
      );
      const logSeq = [
        { text: "> npm install", delay: 2400 },
        { text: "added 58 packages in 400ms", delay: 3200 },
        { text: "> node server.js", delay: 3800 },
        { text: "[info] Connecting to database...", delay: 4400 },
        { text: "[success] MongoDB Connected", delay: 5100 },
        { text: "🚀 Server running on port 3000", delay: 5900 },
      ];
      logSeq.forEach(({ text, delay }) => {
        ts.push(setTimeout(() => setLogs((p) => [...p, text]), delay));
      });
      ts.push(setTimeout(() => setStatus("success"), 6600));
      ts.push(setTimeout(run, 11000));
    };
    run();
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl overflow-hidden h-full flex flex-col">
      <div className="h-11 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-3">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10 border border-white/20" />
          </div>
          <div className="flex bg-black/30 rounded p-0.5">
            <button
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-bold rounded transition-all",
                tab === "code" ? "bg-white/10 text-white" : "text-gray-600",
              )}
            >
              server.js
            </button>
            <button
              className={cn(
                "px-2.5 py-0.5 text-[10px] font-bold rounded transition-all flex items-center gap-1",
                tab === "terminal" ? "bg-white/10 text-white" : "text-gray-600",
              )}
            >
              <Terminal className="w-2.5 h-2.5" /> Terminal
            </button>
          </div>
        </div>
        <motion.div
          animate={
            status === "running"
              ? { scale: 0.95, opacity: 0.7 }
              : { scale: 1, opacity: 1 }
          }
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold border",
            status === "running"
              ? "bg-white/5 text-gray-400 border-white/10"
              : "bg-white text-black border-transparent",
          )}
        >
          {status === "running" ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
          ) : (
            <Play className="w-2.5 h-2.5 fill-current" />
          )}
          {status === "running" ? "Running…" : "Run"}
        </motion.div>
      </div>

      <div className="flex-1 relative font-mono text-xs">
        <motion.div
          animate={{
            opacity: tab === "code" ? 1 : 0,
            pointerEvents: tab === "code" ? "auto" : "none",
          }}
          className="absolute inset-0 p-5 bg-[#0a0a0a] text-gray-500 overflow-hidden"
        >
          <div className="opacity-40 text-[10px] mb-2">
            // Initialize Express Server
          </div>
          <div>
            <span className="text-gray-300">import</span> express{" "}
            <span className="text-gray-300">from</span>{" "}
            <span className="text-gray-400">'express'</span>;
          </div>
          <div>
            <span className="text-gray-300">const</span> app ={" "}
            <span className="text-gray-400">express</span>();
          </div>
          <br />
          <div>
            app.<span className="text-gray-300">get</span>(
            <span className="text-gray-400">'/'</span>, (req, res) ={">"} {"{"}
          </div>
          <div className="pl-4">
            res.<span className="text-gray-400">json</span>({"{"} status:{" "}
            <span className="text-gray-400">'Active'</span> {"}"});
          </div>
          <div>{"}"});</div>
          <br />
          <div>
            app.<span className="text-gray-300">listen</span>(
            <span className="text-gray-400">3000</span>, () ={">"} {"{"}
          </div>
          <div className="pl-4">
            console.<span className="text-gray-400">log</span>(
            <span className="text-gray-400">'Server Ready 🚀'</span>);
          </div>
          <div>{"}"});</div>
        </motion.div>

        <motion.div
          animate={{
            opacity: tab === "terminal" ? 1 : 0,
            pointerEvents: tab === "terminal" ? "auto" : "none",
          }}
          className="absolute inset-0 bg-black p-5 font-mono text-xs overflow-hidden"
        >
          <div className="space-y-1.5">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  log.includes("[success]") || log.includes("🚀")
                    ? "text-gray-200"
                    : log.includes("[info]")
                      ? "text-gray-500"
                      : "text-gray-400",
                )}
              >
                {log}
              </motion.div>
            ))}
            {status === "running" && (
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-3.5 bg-white/30"
              />
            )}
          </div>

          <AnimatePresence>
            {status === "success" && (
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 16, opacity: 0 }}
                className="absolute bottom-4 right-4 bg-[#141414] border border-white/10 p-3 rounded-lg flex items-center gap-2.5"
              >
                <div className="relative">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-40" />
                </div>
                <div>
                  <div className="text-white font-bold text-[10px]">
                    Localhost:3000
                  </div>
                  <div className="text-gray-500 text-[9px]">
                    Live & Listening
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

// ─── FEATURE 4 — EXECUTION ─────────────────────
const ExecutionFeatureSection = () => {
  const [activeFaq, setActiveFaq] = useState(0);

  const faqs = [
    {
      q: "What runtimes are supported?",
      short:
        "Node.js, Python, and browser-based runtimes via WebContainers. More coming soon.",
      animKey: "runtimes",
    },
    {
      q: "How fast is execution?",
      short:
        "Code executes in under 100ms with our edge-optimized sandbox infrastructure.",
      animKey: "speed",
    },
    {
      q: "Can I deploy from the chat?",
      short:
        "Yes. Type @ai deploy and your code goes live with a shareable URL instantly.",
      animKey: "deploy",
    },
  ];

  const faqAnimations = {
    runtimes: (
      <div className="space-y-3 w-full">
        {[
          { name: "Node.js", ver: "v20.x" },
          { name: "Python", ver: "3.12" },
          { name: "Browser", ver: "ES2024" },
        ].map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center justify-between bg-[#141414] border border-white/[0.06] p-3 rounded-lg"
          >
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-300 font-bold">{r.name}</span>
            </div>
            <span className="text-[10px] text-gray-600 font-mono">{r.ver}</span>
          </motion.div>
        ))}
      </div>
    ),
    speed: (
      <div className="flex flex-col items-center gap-5 w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-5xl font-extrabold text-white"
        >
          {"<"}100
          <span className="text-lg text-gray-500 font-normal ml-1">ms</span>
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "80%" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-2 bg-white/[0.06] rounded-full overflow-hidden max-w-[200px]"
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "95%" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-gray-600 to-white rounded-full"
          />
        </motion.div>
        <span className="text-[10px] text-gray-600 uppercase tracking-wider">
          Edge-optimized execution
        </span>
      </div>
    ),
    deploy: (
      <div className="space-y-3 w-full">
        {[
          { step: "Build", status: "Complete" },
          { step: "Optimize", status: "Complete" },
          { step: "Deploy", status: "Live" },
        ].map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            className="flex items-center justify-between bg-[#141414] border border-white/[0.06] p-3 rounded-lg"
          >
            <div className="flex items-center gap-2.5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.3, type: "spring" }}
              >
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
              </motion.div>
              <span className="text-xs text-gray-300">{s.step}</span>
            </div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                s.status === "Live" ? "text-white" : "text-gray-600",
              )}
            >
              {s.status}
            </span>
          </motion.div>
        ))}
      </div>
    ),
  };

  return (
    <section id="runtime" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_right,rgba(255,255,255,0.02)_0%,transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">
            <PlayCircle className="w-3.5 h-3.5" /> Instant Sandbox
          </div>
          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight">
            Write. Run. Fix.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              Inside the Chat.
            </span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
          <Reveal className="lg:col-span-3 min-h-[400px]">
            <TerminalPanel />
          </Reveal>

          <div className="lg:col-span-2 flex flex-col gap-5">
            <Reveal delay={0.1} className="flex-1">
              <motion.div
                whileHover={{
                  y: -4,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
                className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 h-full transition-colors group"
              >
                <div className="w-11 h-11 bg-white/[0.04] rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                  <Cpu className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">
                  WebContainer Engine
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Full Node.js runtime in the browser. Install packages, run
                  servers, and test APIs without leaving the chat.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" />
                  <span className="text-[10px] text-gray-500 font-medium">
                    Zero-latency startup
                  </span>
                </div>
              </motion.div>
            </Reveal>
            <Reveal delay={0.15} className="flex-1">
              <motion.div
                whileHover={{
                  y: -4,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
                className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 h-full transition-colors group"
              >
                <div className="w-11 h-11 bg-white/[0.04] rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-white font-bold text-base mb-2">
                  Multi-Runtime
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Node.js, React, Python — run any stack. Each project gets its
                  own isolated sandbox environment.
                </p>
              </motion.div>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Reveal>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Frequently Asked
              </h3>
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  onClick={() => setActiveFaq(i)}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all duration-300",
                    activeFaq === i
                      ? "bg-white/[0.04] border-white/15"
                      : "bg-transparent border-white/[0.06] hover:border-white/10",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h4
                      className={cn(
                        "font-semibold text-sm transition-colors",
                        activeFaq === i ? "text-white" : "text-gray-500",
                      )}
                    >
                      {faq.q}
                    </h4>
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        activeFaq === i
                          ? "rotate-90 text-white"
                          : "text-gray-700",
                      )}
                    />
                  </div>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginTop: 8,
                        }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="text-gray-600 text-xs leading-relaxed overflow-hidden"
                      >
                        {faq.short}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-8 min-h-[260px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFaq}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                  className="w-full"
                >
                  {faqAnimations[faqs[activeFaq].animKey]}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

// ─── DASHBOARD SECTION ──────────────────────────────────────
const DashboardSection = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const stats = [
    { label: "Projects", value: 12, suffix: "" },
    { label: "Collaborators", value: 5, suffix: "" },
    { label: "AI Queries", value: 2847, suffix: "" },
    { label: "Files Generated", value: 148, suffix: "" },
  ];

  const AnimatedCounter = ({ value, suffix }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setInView(true);
        },
        { threshold: 0.5 },
      );
      if (ref.current) obs.observe(ref.current);
      return () => obs.disconnect();
    }, []);

    useEffect(() => {
      if (!inView) return;
      let start = 0;
      const dur = 1800;
      const startTime = performance.now();
      const tick = (now) => {
        const t = Math.min((now - startTime) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setCount(Math.round(ease * value));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, [inView, value]);

    return (
      <span ref={ref}>
        {count.toLocaleString()}
        {suffix}
      </span>
    );
  };

  const activityData = [
    35, 60, 45, 80, 55, 90, 70, 95, 60, 75, 85, 40, 65, 90, 50, 78, 88, 62, 72,
    55,
  ];

  const recentActivity = [
    { action: "Created component", file: "Button.tsx", time: "2m ago" },
    { action: "AI generated", file: "auth.middleware.js", time: "5m ago" },
    { action: "Deployed", file: "v2.4.0-beta", time: "12m ago" },
    { action: "Code review", file: "PR #420", time: "18m ago" },
  ];

  return (
    <section id="insights" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.015)_0%,transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">
            <BarChart3 className="w-3.5 h-3.5" /> Team Insights
          </div>
          <h2 className="text-4xl lg:text-6xl font-extrabold tracking-tight">
            The Pulse of Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              Engineering Team.
            </span>
          </h2>
          <p className="text-gray-500 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Real-time analytics that track project velocity, AI usage, and
            collaborator activity — without micro-managing.
          </p>
        </Reveal>

        <Reveal>
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                  <Activity className="w-4.5 h-4.5 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Dashboard</div>
                  <div className="text-[10px] text-gray-600">Team Overview</div>
                </div>
              </div>
              <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/[0.06]">
                {["7d", "30d", "90d"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                      selectedPeriod === p
                        ? "bg-white/10 text-white"
                        : "text-gray-600 hover:text-gray-400",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/[0.04]">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className={cn("p-6", i < 3 && "border-r border-white/[0.04]")}
                >
                  <div className="text-[10px] text-gray-600 uppercase font-bold tracking-wider mb-2">
                    {s.label}
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-white/[0.04]">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold text-gray-400">
                    Activity Level
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 bg-white/[0.04] px-2 py-1 rounded border border-white/[0.06]">
                    <TrendingUp className="w-3 h-3" />
                    +24%
                  </div>
                </div>

                <div className="flex items-end gap-1.5 h-32">
                  {activityData.map((v, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${v}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.04,
                        ease: "easeOut",
                      }}
                      className="flex-1 rounded-sm bg-gradient-to-t from-white/5 to-white/20 hover:to-white/35 transition-colors cursor-pointer relative group"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {v}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 p-6">
                <div className="text-xs font-bold text-gray-400 mb-4">
                  Recent Activity
                </div>
                <div className="space-y-4">
                  {recentActivity.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 group-hover:bg-white/[0.08] transition-colors">
                        <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-300 font-medium truncate">
                          {item.action}
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono truncate">
                          {item.file}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-700 shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        {item.time}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── CTA SECTION ────────────────────────────────────────────
const CTASection = () => {
  const { user, loading } = useUser();
  const authed = !loading && !!user;

  return (
    <section className="py-32 bg-black relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_40%,transparent_100%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full">
        <Reveal>
          <div className="relative rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-2xl overflow-hidden p-12 md:p-20 text-center group">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/[0.03] rounded-full blur-[100px] group-hover:bg-white/[0.05] transition-colors duration-1000" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/[0.03] rounded-full blur-[100px] group-hover:bg-white/[0.05] transition-colors duration-1000" />

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_80px_rgba(255,255,255,0.15)] transition-shadow rotate-3 group-hover:rotate-6"
              >
                <Rocket className="w-8 h-8 text-black" />
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Ready to code at the
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
                  speed of thought?
                </span>
              </h2>

              <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
                Join thousands of developers using DevDialogue to build, deploy,
                and scale faster than ever before.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to={authed ? "/home" : "/register"}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-shadow flex items-center gap-2"
                  >
                    {authed ? "Open Workspace" : "Get Started Now"}
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <button
                  onClick={() =>
                    document
                      .getElementById("chat")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-4 rounded-xl text-gray-400 font-medium hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-gray-600" />
                  Explore Features
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── FOOTER ─────────────────────────────────────────────────
const Footer = () => (
  <footer className="relative bg-black pt-24 pb-12 overflow-hidden border-t border-white/[0.04]">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              DevDialogue
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
            The world's first chat-native IDE. Build, deploy, and scale your
            applications at the speed of conversation.
          </p>
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Stay in the loop
            </span>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-white/20 transition-all w-full placeholder-gray-700"
              />
              <button className="bg-white text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors shrink-0">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 lg:pl-12">
          {[
            {
              title: "Product",
              items: [
                "Real-time Chat",
                "AI Assistant",
                "Cloud Runtime",
                "Team Insights",
                "Enterprise",
              ],
            },
            {
              title: "Company",
              items: ["About Us", "Careers", "Blog", "Contact", "Partners"],
            },
            {
              title: "Legal",
              items: [
                "Privacy Policy",
                "Terms of Service",
                "Cookie Policy",
                "Security",
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-white mb-6 text-sm">{col.title}</h4>
              <ul className="space-y-3.5 text-sm text-gray-600">
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {item}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xs text-gray-700">
          &copy; {new Date().getFullYear()} DevDialogue Inc. All rights
          reserved.
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white/60" />
          </div>
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
            All systems normal
          </span>
        </div>

        <div className="flex gap-5 text-gray-600">
          {[Github, Twitter, Disc].map((Icon, i) => (
            <Icon
              key={i}
              className="w-5 h-5 hover:text-white cursor-pointer transition-colors hover:scale-110 transform duration-200"
            />
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─── LANDING PAGE ───────────────────────────────────────────
const LandingPage = () => (
  <div className="bg-black min-h-screen text-white font-sans selection:bg-white/20 antialiased">
    <Navbar />
    <HeroSection />
    <ChatFeatureSection />
    <AIFeatureSection />
    <FileTreeFeatureSection />
    <ExecutionFeatureSection />
    <DashboardSection />
    <CTASection />
    <Footer />
  </div>
);

export default LandingPage;
