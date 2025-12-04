import React, { useState, useEffect, useMemo, useRef } from "react";
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
  LayoutTemplate,
  FolderTree,
  FileCode,
  Users,
  PlayCircle,
  Github,
  Twitter,
  Disc,
  MessageCircle,
  Menu,
  X,
  Check,
  Globe,
  Loader2,
  LogIn,
  Rocket,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// --- IMPORT YOUR LOGO HERE ---
import logo from "../assets/logo.png";

// --- Import your components ---
import LiquidEther from "../components/LiquidEther";

const NOISE_BG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E`;

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Navigation Helper ---
const handleLoginNavigation = () => {
  window.location.href = "/login";
};

// --- 🎬 ANIMATION WRAPPER (Scroll Reveal) ---
const Reveal = ({ children, delay = 0, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, ease: "easeOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// ==========================================
// 🧭 NEW NAVBAR COMPONENT (Updated Logo Size & Pos)
// ==========================================
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Collaboration", href: "#chat" },
    { name: "AI Engine", href: "#features" },
    { name: "Runtime", href: "#runtime" },
    { name: "Insights", href: "#insights" },
  ];

  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const offsetTop = target.offsetTop - 85;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-[#020617]/80 backdrop-blur-md border-white/10 py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Section */}
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {/* 1. Container Size: w-16 h-16 (64px) makes the logo big enough */}
          <motion.div
            initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            whileHover={{ scale: 1.15, rotate: 10 }}
            className="w-16 h-16 flex items-center justify-center relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <img
              src={logo}
              alt="DevDialogue Logo"
              // Optional: scale-110 makes it pop a tiny bit more out of its box
              className="w-full h-full object-contain scale-110 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] relative z-10"
            />
          </motion.div>

          {/* 2. Negative Margin (-ml-3): Pulls the text LEFT, into the logo's space */}
          {/* Adjust to -ml-4 or -ml-2 if you need it closer/further */}
          <span className="-ml-3 font-bold text-sm text-white tracking-wide group-hover:text-cyan-400 transition-colors duration-300 relative z-20">
            DevDialogue
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLoginNavigation}
            className="text-sm font-medium text-white hover:text-cyan-400 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleLoginNavigation}
            className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-cyan-50 transition-all transform hover:scale-105"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B1120] border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-slate-300 hover:text-cyan-400 font-medium"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-white/10 my-2" />
              <button
                onClick={handleLoginNavigation}
                className="text-left text-white font-medium"
              >
                Sign In
              </button>
              <button
                onClick={handleLoginNavigation}
                className="w-full py-3 bg-cyan-500 text-white font-bold rounded-lg"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ==========================================
// 🌌 HERO SECTION
// ==========================================
const BACKGROUND_COLORS = ["#5227FF", "#FF9FFC", "#B19EEF"];

const MemoizedLiquidBackground = React.memo(() => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <LiquidEther
        colors={BACKGROUND_COLORS}
        mouseForce={20}
        cursorSize={100}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        resolution={0.5}
        isBounce={false}
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
      />
    </div>
  );
});

// --- Hero Cards Logic ---
const ChatCardContent = ({ isActive }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (isActive) {
      setStep(0);
      const t1 = setTimeout(() => setStep(1), 300);
      const t2 = setTimeout(() => setStep(2), 1000);
      const t3 = setTimeout(() => setStep(3), 2500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setStep(0);
    }
  }, [isActive]);
  return (
    <div className="space-y-5 font-mono text-sm h-full flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -20 }}
        className="flex gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
          <span className="text-slate-300 text-xs">U</span>
        </div>
        <div className="bg-slate-900/90 p-3 rounded-2xl rounded-tl-none border border-slate-700 text-slate-300 shadow-lg">
          <span className="text-cyan-400 font-bold">@ai</span> create a{" "}
          <span className="text-violet-400">Login</span> component
        </div>
      </motion.div>
      <div className="flex gap-3 flex-row-reverse min-h-[60px]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: step >= 2 ? 1 : 0 }}
          className="w-8 h-8 rounded-full bg-cyan-900/50 border border-cyan-500/30 flex items-center justify-center shrink-0"
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
        </motion.div>
        <div className="relative">
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-cyan-950/30 border border-cyan-500/20 p-3 rounded-2xl rounded-tr-none flex gap-1 items-center h-full"
            >
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75" />
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150" />
            </motion.div>
          )}
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-cyan-950/30 border border-cyan-500/20 p-3 rounded-2xl rounded-tr-none text-cyan-100"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Component created.</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const CodeCardContent = ({ isActive }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = useMemo(
    () => [
      {
        html: (
          <>
            <span className="text-violet-400">export</span>{" "}
            <span className="text-cyan-400">default</span>{" "}
            <span className="text-violet-400">function</span> Login() {"{"}
          </>
        ),
        indent: 0,
      },
      {
        html: (
          <>
            <span className="text-pink-400">const</span> [email, setEmail] =
            useState(<span className="text-green-400">""</span>);
          </>
        ),
        indent: 1,
      },
      {
        html: (
          <>
            <span className="text-pink-400">return</span> (
          </>
        ),
        indent: 1,
      },
      {
        html: (
          <>
            <span className="text-cyan-400">{"<form>"}</span>
          </>
        ),
        indent: 2,
      },
      {
        html: (
          <>
            <span className="text-cyan-400">{"<input"}</span> type=
            <span className="text-green-400">"email"</span> /{">"}
          </>
        ),
        indent: 3,
      },
      {
        html: (
          <>
            <span className="text-cyan-400">{"<button>"}</span>Sign In
            <span className="text-cyan-400">{"</button>"}</span>
          </>
        ),
        indent: 3,
      },
      {
        html: (
          <>
            <span className="text-cyan-400">{"</form>"}</span>
          </>
        ),
        indent: 2,
      },
    ],
    []
  );
  useEffect(() => {
    if (isActive) {
      setVisibleLines(0);
      const interval = setInterval(() => {
        setVisibleLines((prev) => {
          if (prev < lines.length) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 400);
      return () => clearInterval(interval);
    } else {
      setVisibleLines(0);
    }
  }, [isActive, lines]);
  return (
    <div className="font-mono text-xs leading-loose text-slate-400 mt-1">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
        <span className="text-violet-300">Login.jsx</span>
        <span className="text-[9px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
          JSX
        </span>
      </div>
      <div className="h-[180px]">
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              paddingLeft: `${line.indent * 12}px`,
              opacity: i < visibleLines ? 1 : 0,
            }}
            className="flex items-center"
          >
            {line.html}
            {i === visibleLines - 1 && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-1.5 h-4 bg-cyan-400 ml-1 inline-block align-middle"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const TerminalCardContent = ({ isActive }) => {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    if (isActive) {
      setLogs([]);
      const sequence = [
        { text: "> npm run dev", color: "text-white", delay: 200 },
        { text: "[info] ready in 120ms", color: "text-slate-400", delay: 800 },
        { text: "[vite] connecting...", color: "text-slate-400", delay: 1400 },
        {
          text: "[success] Local: http://localhost:5173",
          color: "text-green-400",
          delay: 2200,
        },
        { text: "App running 🚀", color: "text-cyan-300", delay: 2800 },
      ];
      let timeouts = [];
      sequence.forEach((item) => {
        const t = setTimeout(() => {
          setLogs((prev) => [...prev, item]);
        }, item.delay);
        timeouts.push(t);
      });
      return () => timeouts.forEach(clearTimeout);
    } else {
      setLogs([]);
    }
  }, [isActive]);
  return (
    <div className="font-mono text-xs text-slate-300 h-full flex flex-col mt-2">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        <span className="ml-auto text-[10px] text-slate-500">bash</span>
      </div>
      <div className="space-y-2 flex-1 overflow-hidden">
        {logs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={log.color}
          >
            {log.text}
          </motion.div>
        ))}{" "}
        {logs.length > 0 && (
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-4 bg-slate-500"
          />
        )}
      </div>
    </div>
  );
};

const cards = [
  {
    id: 1,
    type: "chat",
    title: "Chat Interface",
    theme: "cyan",
    icon: <MessageSquare className="w-5 h-5 text-cyan-400" />,
  },
  {
    id: 2,
    type: "code",
    title: "Code Generation",
    theme: "violet",
    icon: <Code2 className="w-5 h-5 text-violet-400" />,
  },
  {
    id: 3,
    type: "terminal",
    title: "Live Execution",
    theme: "green",
    icon: <Terminal className="w-5 h-5 text-green-400" />,
  },
];

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  const getCardStyle = (index) => {
    const position = (index - activeIndex + cards.length) % cards.length;
    if (position === 0) {
      return {
        zIndex: 30,
        y: 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px) brightness(1)",
        boxShadow: "0 25px 60px -10px rgba(34, 211, 238, 0.15)",
      };
    }
    if (position === 1) {
      return {
        zIndex: 20,
        y: -45,
        scale: 0.92,
        opacity: 0.6,
        filter: "blur(2px) brightness(0.6)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
      };
    }
    return {
      zIndex: 10,
      y: -90,
      scale: 0.84,
      opacity: 0.3,
      filter: "blur(4px) brightness(0.4)",
      boxShadow: "none",
    };
  };
  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-[#020617] text-white selection:bg-cyan-500/30 group"
      onMouseMove={handleMouseMove}
    >
      <MemoizedLiquidBackground />
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at var(--x) var(--y), rgba(34, 211, 238, 0.05), transparent 40%)`,
        }}
      >
        <motion.div
          className="w-full h-full"
          style={{ "--x": springX, "--y": springY }}
        />
      </motion.div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 lg:pt-32 pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 h-full justify-center">
        <div className="flex-1 text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-md text-cyan-300 text-xs font-bold uppercase tracking-wider"
          >
            <Zap className="w-3 h-3 fill-cyan-300" />
            <span>AI-Native Code Generation</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight"
          >
            Turn Conversation <br /> into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-purple-400">
              Execution.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            DevDialogue is more than a chat. Tag{" "}
            <strong className="text-cyan-400">@ai</strong> to generate
            full-stack code, create files, and run logic in real-time.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <motion.button
              onClick={handleLoginNavigation}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              Start Building <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        <div className="flex-1 w-full flex justify-center lg:justify-end relative h-[500px] items-center perspective-[2000px]">
          <div className="relative w-full max-w-[450px] h-[320px]">
            <AnimatePresence>
              {cards.map((card, index) => {
                const style = getCardStyle(index);
                const isCurrent = index === activeIndex;
                return (
                  <motion.div
                    key={card.id}
                    animate={style}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className={cn(
                      "absolute inset-0 rounded-2xl border bg-[#0B1120] overflow-hidden",
                      card.theme === "cyan"
                        ? "border-cyan-500/30"
                        : card.theme === "violet"
                        ? "border-violet-500/30"
                        : "border-green-500/30"
                    )}
                  >
                    <div className="h-11 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between px-5">
                      <div className="flex items-center gap-3">
                        {card.icon}
                        <span className="text-xs font-bold text-slate-200 uppercase">
                          {card.title}
                        </span>
                      </div>
                      <div className="flex gap-2 opacity-50">
                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                      </div>
                    </div>
                    <div className="p-6 h-full bg-gradient-to-b from-transparent to-[#000000]/50">
                      {card.type === "chat" && (
                        <ChatCardContent isActive={isCurrent} />
                      )}
                      {card.type === "code" && (
                        <CodeCardContent isActive={isCurrent} />
                      )}
                      {card.type === "terminal" && (
                        <TerminalCardContent isActive={isCurrent} />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 💬 SECTION 2: LIVE GROUP CHAT
// ==========================================
const StandardChatSection = () => {
  const messagePool = [
    {
      id: 1,
      user: "Elena",
      avatar: "E",
      color: "bg-pink-500",
      text: "The API latency is looking much better.",
      isMe: false,
    },
    {
      id: 2,
      user: "You",
      avatar: "ME",
      color: "bg-blue-600",
      text: "Nice! I optimized the DB queries.",
      isMe: true,
    },
    {
      id: 3,
      user: "David",
      avatar: "D",
      color: "bg-cyan-500",
      text: "Can someone review PR #420?",
      isMe: false,
    },
    {
      id: 4,
      user: "Sarah",
      avatar: "S",
      color: "bg-indigo-500",
      text: "On it! Giving it a look now.",
      isMe: false,
    },
    {
      id: 5,
      user: "You",
      avatar: "ME",
      color: "bg-blue-600",
      text: "Thanks Sarah. Let me know if it breaks.",
      isMe: true,
    },
    {
      id: 6,
      user: "System",
      avatar: "🤖",
      color: "bg-slate-600",
      text: "Deployment successful: v2.4.0-beta",
      isMe: false,
      isSystem: true,
    },
    {
      id: 7,
      user: "Mike",
      avatar: "M",
      color: "bg-emerald-500",
      text: "Great work everyone! 🚀",
      isMe: false,
    },
  ];

  const [messages, setMessages] = useState(messagePool.slice(0, 4));

  useEffect(() => {
    let poolIndex = 4;
    const interval = setInterval(() => {
      poolIndex = (poolIndex + 1) % messagePool.length;
      const newMessage = { ...messagePool[poolIndex], id: Date.now() };

      setMessages((prevMessages) => {
        const newHistory = [...prevMessages, newMessage];
        if (newHistory.length > 5) {
          return newHistory.slice(1);
        }
        return newHistory;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="chat" className="py-32 bg-[#020617] relative overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <MessageCircle className="w-3 h-3" /> Real-time Sync
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Built for Teams, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Ready for Code.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Before the AI magic happens, it's a powerful communication
              platform. Organize discussions in channels, share code snippets
              with syntax highlighting, and sync with your team in real-time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                "Threaded Conversations",
                "Code Syntax Highlighting",
                "Secure Direct Messages",
                "File Sharing",
              ].map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-slate-300 font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2} className="relative">
          <div className="relative rounded-xl border border-white/10 bg-[#0f172a] shadow-2xl overflow-hidden flex h-[500px] w-full max-w-lg mx-auto lg:mx-0">
            <div className="w-[30%] bg-[#0B1120] border-r border-white/5 flex flex-col hidden sm:flex">
              <div className="h-14 border-b border-white/5 flex items-center px-4">
                <div className="font-bold text-slate-200 text-xs tracking-wide uppercase opacity-70">
                  Workspaces
                </div>
              </div>

              <div className="flex-1 p-3 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 cursor-pointer">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      D
                    </div>
                    <div className="hidden md:block">
                      <div className="text-xs font-bold text-indigo-200">
                        DevTeam
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                      M
                    </div>
                    <div className="hidden md:block">
                      <div className="text-xs font-bold text-slate-300">
                        Marketing
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mb-2 block px-1">
                    Channels
                  </span>
                  <ul className="space-y-1">
                    {["general", "engineering", "design"].map((channel) => (
                      <div
                        key={channel}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs",
                          channel === "engineering"
                            ? "bg-white/10 text-white font-medium"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        )}
                      >
                        <span className="opacity-50">#</span> {channel}
                      </div>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#0f172a] relative">
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0f172a]/95 backdrop-blur-md z-10 absolute top-0 left-0 right-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">#</span>
                  <span className="font-bold text-slate-200 text-sm">
                    engineering
                  </span>
                </div>
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-[#0f172a] bg-slate-600"
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-hidden flex flex-col justify-end pt-16">
                <div className="space-y-4 relative z-0">
                  <AnimatePresence initial={false} mode="popLayout">
                    {messages.map((msg) => (
                      <motion.div
                        layout
                        key={msg.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                          transition: { duration: 0.2 },
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={cn(
                          "flex w-full",
                          msg.isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] flex flex-col p-3 rounded-2xl shadow-lg border relative break-words text-sm",
                            msg.isSystem
                              ? "bg-slate-800/50 border-slate-700 text-slate-400 text-xs text-center w-full max-w-full"
                              : msg.isMe
                              ? "bg-blue-600 border-blue-500 text-white rounded-br-none"
                              : "bg-slate-800 border-slate-700 text-slate-100 rounded-bl-none"
                          )}
                        >
                          {!msg.isMe && !msg.isSystem && (
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white",
                                  msg.color
                                )}
                              >
                                {msg.avatar}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {msg.user}
                              </span>
                            </div>
                          )}

                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="h-6 mt-2 flex items-center gap-2 pl-2">
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay }}
                        className="w-1 h-1 bg-slate-500 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium">
                    Someone is typing...
                  </span>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="h-10 bg-slate-800/50 rounded-lg border border-white/5 flex items-center px-3 gap-2">
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center">
                    <span className="text-[10px] text-slate-500">+</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Message #engineering...
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -z-10 top-20 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px]" />
          <div className="absolute -z-10 bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-[80px]" />
        </Reveal>
      </div>
    </section>
  );
};

// ==========================================
// 🧠 FEATURE 3: THE @ai INVOCATION
// ==========================================
const NeuralChatSection = () => {
  const [step, setStep] = useState(0);
  const [aiText, setAiText] = useState("");

  const fullResponse =
    "The `authMiddleware` verifies the JWT token from the request headers. If valid, it decodes the payload and attaches the user ID to `req.user` for the controllers to use.";

  const staticHistory = [
    {
      id: 1,
      user: "Sarah",
      avatar: "S",
      color: "bg-indigo-500",
      text: "I keep getting a 401 error on the /profile route.",
      isMe: false,
    },
    {
      id: 2,
      user: "Mike",
      avatar: "M",
      color: "bg-emerald-500",
      text: "Did you check if the token is being passed in the headers?",
      isMe: false,
    },
    {
      id: 3,
      user: "Sarah",
      avatar: "S",
      color: "bg-indigo-500",
      text: "Yeah, it's in the Authorization header. Not sure why it's failing.",
      isMe: false,
    },
  ];

  useEffect(() => {
    let timeout;
    const runSequence = () => {
      setStep(0);
      setAiText("");
      timeout = setTimeout(() => setStep(1), 1000);
      timeout = setTimeout(() => setStep(2), 2500);
      timeout = setTimeout(() => setStep(3), 4000);
      timeout = setTimeout(runSequence, 12000);
    };

    runSequence();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (step === 3) {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex <= fullResponse.length) {
          setAiText(fullResponse.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 30);
      return () => clearInterval(typeInterval);
    }
  }, [step]);

  return (
    <section id="features" className="py-32 relative bg-[#020617]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3" /> Context Aware Intelligence
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Your team's new <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                Technical Co-founder.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Don't switch tabs to ChatGPT. Just type{" "}
              <strong className="text-cyan-400">@ai</strong> inside your group
              chat. The AI reads your current file context, answers
              architectural questions, and explains complex logic instantly.
            </p>
            <ul className="space-y-4 pt-4">
              {[
                "Context-aware answers based on open files",
                "Explains code logic and functionality",
                "Instant knowledge retrieval for docs & APIs",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />{" "}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal
          delay={0.2}
          className="relative rounded-2xl border border-white/10 bg-[#0B1120] shadow-2xl overflow-hidden min-h-[500px] flex flex-col"
        >
          <div className="h-12 border-b border-white/5 bg-white/5 flex items-center justify-between px-4 bg-[#0B1120]/90 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-300">
                # dev-team
              </span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#0B1120] flex items-center justify-center text-xs font-bold text-white">
                JD
              </div>
              <motion.div
                animate={{ borderColor: ["#0B1120", "#a78bfa", "#0B1120"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-violet-600 border-2 flex items-center justify-center text-[10px] font-bold"
              >
                AI
              </motion.div>
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1 relative flex flex-col justify-end">
            {staticHistory.map((msg) => (
              <div key={msg.id} className="flex gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-lg ${msg.color}`}
                >
                  {msg.avatar}
                </div>
                <div className="max-w-[85%] space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    {msg.user}
                  </div>
                  <div className="bg-[#1e293b] border border-white/5 p-3 rounded-2xl rounded-tl-none text-slate-300 text-sm shadow-md">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 20 }}
              className="flex gap-4 flex-row-reverse"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-lg">
                ME
              </div>
              <div className="max-w-[80%] space-y-1 text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  You
                </div>
                <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none text-white text-sm text-left shadow-lg">
                  <span className="text-cyan-300 font-bold bg-black/20 px-1 rounded">
                    @ai
                  </span>{" "}
                  how does the auth middleware work?
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-violet-600 border border-violet-400 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-[85%] space-y-1">
                <div className="text-[10px] text-violet-400 uppercase font-bold tracking-wider flex items-center gap-2">
                  DevDialogue AI
                  {step === 2 && (
                    <span className="flex gap-0.5">
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-1 h-1 bg-violet-400 rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: 0.2,
                        }}
                        className="w-1 h-1 bg-violet-400 rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: 0.4,
                        }}
                        className="w-1 h-1 bg-violet-400 rounded-full"
                      />
                    </span>
                  )}
                </div>

                <div className="bg-[#1e293b] border border-white/5 p-4 rounded-2xl rounded-tl-none text-slate-300 text-sm shadow-xl leading-relaxed">
                  {step === 2 ? (
                    <span className="text-slate-500 italic text-xs">
                      Analyzing codebase...
                    </span>
                  ) : (
                    <>
                      {aiText}
                      {step === 3 && aiText.length < fullResponse.length && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-1.5 h-3 bg-violet-400 ml-1 align-middle"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ==========================================
// 📂 FEATURE 4: GENERATIVE FILE TREE
// ==========================================
const FileTreeSection = () => {
  const treeItems = [
    { id: 1, name: "src", type: "folder", depth: 0, color: "text-blue-400" },
    {
      id: 2,
      name: "components",
      type: "folder",
      depth: 1,
      color: "text-blue-400",
    },
    {
      id: 3,
      name: "Button.tsx",
      type: "file",
      depth: 2,
      color: "text-yellow-300",
    },
    {
      id: 4,
      name: "Header.tsx",
      type: "file",
      depth: 2,
      color: "text-yellow-300",
    },
    { id: 5, name: "lib", type: "folder", depth: 1, color: "text-blue-400" },
    { id: 6, name: "utils.ts", type: "file", depth: 2, color: "text-cyan-300" },
    { id: 7, name: "app", type: "folder", depth: 0, color: "text-green-400" },
    {
      id: 8,
      name: "page.tsx",
      type: "file",
      depth: 1,
      color: "text-slate-300",
    },
    {
      id: 9,
      name: "layout.tsx",
      type: "file",
      depth: 1,
      color: "text-slate-300",
    },
  ];

  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= treeItems.length) {
          setTimeout(() => setVisibleCount(0), 3000);
          return prev;
        }
        return prev + 1;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [treeItems.length]);

  return (
    <section className="py-32 relative bg-[#020617] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal delay={0.2} className="order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-green-300 text-xs font-bold uppercase tracking-wider">
            <LayoutTemplate className="w-3 h-3" /> Full Scaffolding
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            Don't just write snippets. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              Generate Architectures.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            DevDialogue can understand your intent and generate entire{" "}
            <strong className="text-white">File Trees</strong>. It creates
            folders, separates concerns, and links files automatically for both
            Frontend and Backend projects.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 text-sm text-slate-300">
            <span className="text-cyan-400 font-bold">@ai</span> create a React
            project structure with Tailwind and a basic API route.
          </div>
        </Reveal>

        <Reveal
          className="order-2 lg:order-1 relative rounded-xl border border-white/10 bg-[#0B1120] p-6 lg:p-8 shadow-2xl min-h-[450px] flex flex-col"
          style={{ perspective: "1000px" }}
        >
          <div className="flex items-center gap-2 text-slate-400 mb-6 border-b border-white/5 pb-4">
            <FolderTree className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-mono">/project-root (Generated)</span>
            {visibleCount < treeItems.length && (
              <span className="ml-auto flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </div>

          <div className="relative z-10 space-y-1 font-mono text-sm flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout">
              {treeItems.slice(0, visibleCount).map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -15, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="relative group"
                >
                  {item.depth > 0 && (
                    <div
                      className="absolute left-0 top-0 bottom-0 border-l border-white/10"
                      style={{ left: `${item.depth * 20 - 10}px` }}
                    />
                  )}

                  <div
                    className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded cursor-pointer transition-colors"
                    style={{ paddingLeft: `${item.depth * 20}px` }}
                  >
                    {item.type === "folder" ? (
                      <div className="w-4 h-4 text-blue-400/80 fill-current">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-full h-full"
                        >
                          <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.422.422 1.012.659 1.59.659h4.319a3 3 0 0 1 3 3v.761A4.49 4.49 0 0 0 19.5 9h-15a4.49 4.49 0 0 0-3 1.146Z" />
                        </svg>
                      </div>
                    ) : (
                      <FileCode className="w-4 h-4 text-slate-500" />
                    )}

                    <span className={item.color}>{item.name}</span>

                    <motion.div
                      initial={{ opacity: 1, scale: 1.2 }}
                      animate={{ opacity: 0, scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="ml-auto text-[9px] text-green-400 font-bold px-2 py-0.5 bg-green-500/10 rounded"
                    >
                      NEW
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleCount === 0 && (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-600 rounded-full animate-pulse" />
                  Initializing generator...
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-slate-500 flex items-center gap-2 h-8">
            <span className="text-green-500 font-bold">{">"}</span>
            {visibleCount < treeItems.length ? (
              <span>
                creating{" "}
                <span className="text-slate-300">
                  {treeItems[visibleCount]?.name || "..."}
                </span>
              </span>
            ) : (
              <span className="text-green-400">
                Generation complete. 9 files created.
              </span>
            )}
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-1.5 h-3 bg-green-500"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ==========================================
// 🚀 FEATURE 5: LIVE EXECUTION
// ==========================================
const ExecutionSection = () => {
  const [activeTab, setActiveTab] = useState("code");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let timeouts = [];
    const runSequence = () => {
      setActiveTab("code");
      setStatus("idle");
      setLogs([]);

      timeouts.push(
        setTimeout(() => {
          setStatus("running");
          setActiveTab("terminal");
        }, 2000)
      );

      const logMessages = [
        { text: "> npm install", color: "text-slate-400", delay: 2500 },
        {
          text: "added 58 packages in 400ms",
          color: "text-green-400",
          delay: 3200,
        },
        { text: "> node server.js", color: "text-white", delay: 3800 },
        {
          text: "[info] Connecting to database...",
          color: "text-blue-400",
          delay: 4500,
        },
        {
          text: "[success] MongoDB Connected",
          color: "text-green-400",
          delay: 5200,
        },
        {
          text: "🚀 Server running on port 3000",
          color: "text-cyan-300",
          delay: 6000,
        },
      ];

      logMessages.forEach(({ text, color, delay }) => {
        timeouts.push(
          setTimeout(() => {
            setLogs((prev) => [...prev, { text, color }]);
          }, delay)
        );
      });

      timeouts.push(
        setTimeout(() => {
          setStatus("success");
        }, 7000)
      );

      timeouts.push(setTimeout(runSequence, 11000));
    };

    runSequence();
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <section
      id="runtime"
      className="py-32 relative bg-[#020617] border-t border-white/5 overflow-hidden"
    >
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-green-400 text-xs font-bold uppercase tracking-wider">
            <PlayCircle className="w-3 h-3" /> Instant Sandbox
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            Write. Run. Fix. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              Inside the Chat.
            </span>
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed">
            Why switch to VS Code to test a logic snippet? DevDialogue comes
            with a built-in <strong>WebContainer</strong> engine. The AI
            generates code, and you can execute it instantly—works for Node.js,
            React, and Python.
          </p>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/50 px-4 py-2 rounded-lg border border-white/5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Node.js Runtime</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/50 px-4 py-2 rounded-lg border border-white/5">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Zero Latency</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2} className="relative">
          <div className="relative rounded-2xl border border-white/10 bg-[#0f172a]/90 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[400px] flex flex-col group">
            <div className="absolute inset-0 rounded-2xl border border-green-500/20 pointer-events-none" />

            <div className="h-12 border-b border-white/5 bg-[#0B1120] flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>

                <div className="flex bg-black/20 rounded-lg p-1">
                  <button
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded transition-all",
                      activeTab === "code"
                        ? "bg-slate-700 text-white shadow-sm"
                        : "text-slate-500"
                    )}
                  >
                    server.js
                  </button>
                  <button
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded transition-all flex items-center gap-1",
                      activeTab === "terminal"
                        ? "bg-slate-700 text-white shadow-sm"
                        : "text-slate-500"
                    )}
                  >
                    <Terminal className="w-3 h-3" /> Terminal
                  </button>
                </div>
              </div>

              <motion.button
                animate={
                  status === "running"
                    ? { scale: 0.95, opacity: 0.8 }
                    : { scale: 1, opacity: 1 }
                }
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all border",
                  status === "running"
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-green-600 hover:bg-green-500 text-white border-transparent shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                )}
              >
                {status === "running" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                {status === "running" ? "Running..." : "Run Code"}
              </motion.button>
            </div>

            <div className="flex-1 relative font-mono text-sm">
              <motion.div
                initial={{ opacity: 1 }}
                animate={{
                  opacity: activeTab === "code" ? 1 : 0,
                  pointerEvents: activeTab === "code" ? "auto" : "none",
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-6 bg-[#0f172a] text-slate-300 overflow-hidden"
              >
                <div className="opacity-50 text-xs mb-2">
                  // Initialize Express Server
                </div>
                <div>
                  <span className="text-purple-400">import</span> express{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">'express'</span>;
                </div>
                <div>
                  <span className="text-purple-400">const</span> app ={" "}
                  <span className="text-blue-400">express</span>();
                </div>
                <br />
                <div>
                  app.<span className="text-yellow-300">get</span>(
                  <span className="text-green-400">'/'</span>, (req, res) ={">"}{" "}
                  {"{"}
                </div>
                <div className="pl-4">
                  res.<span className="text-blue-400">json</span>({"{"}{" "}
                  <span className="text-cyan-300">status</span>:{" "}
                  <span className="text-green-400">'Active'</span> {"}"});
                </div>
                <div>{"}"});</div>
                <br />
                <div>
                  app.<span className="text-yellow-300">listen</span>(
                  <span className="text-orange-400">3000</span>, () ={">"} {"{"}
                </div>
                <div className="pl-4">
                  console.<span className="text-blue-400">log</span>(
                  <span className="text-green-400">'Server Ready 🚀'</span>);
                </div>
                <div>{"}"});</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeTab === "terminal" ? 1 : 0,
                  pointerEvents: activeTab === "terminal" ? "auto" : "none",
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-[#0B1120] p-4 font-mono text-xs overflow-hidden"
              >
                <div className="space-y-2">
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={log.color}
                    >
                      {log.text}
                    </motion.div>
                  ))}
                  {status === "running" && (
                    <div className="w-2 h-4 bg-slate-500 animate-pulse" />
                  )}
                </div>

                <AnimatePresence>
                  {status === "success" && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="absolute bottom-4 right-4 bg-[#1e293b] border border-green-500/30 p-3 rounded-lg shadow-2xl flex items-center gap-3 z-10"
                    >
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs">
                          Localhost:3000
                        </div>
                        <div className="text-green-400 text-[10px]">
                          Live & Listening
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ==========================================
// 📊 FEATURE 6: DASHBOARD ANALYTICS
// ==========================================
const DashboardFeatureSection = () => {
  return (
    <section
      id="insights"
      className="py-32 relative bg-[#020617] border-t border-white/5 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_BG}")` }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal delay={0.2} className="order-2 lg:order-1 relative">
          <div className="relative rounded-2xl border border-white/10 bg-[#0f172a]/90 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[450px] flex flex-col p-6 group">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <LayoutTemplate className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Overview</div>
                  <div className="text-[10px] text-slate-400">Last 30 Days</div>
                </div>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-slate-700 border border-[#0f172a]"
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
              {[
                {
                  label: "Projects",
                  val: "12",
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                },
                {
                  label: "Collabs",
                  val: "5",
                  color: "text-purple-400",
                  bg: "bg-purple-400/10",
                },
                {
                  label: "Files",
                  val: "148",
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-[#1e293b] border border-white/5 p-3 rounded-xl"
                >
                  <div className="text-[10px] text-slate-500 uppercase font-bold">
                    {stat.label}
                  </div>
                  <div className={`text-xl font-bold mt-1 ${stat.color}`}>
                    {stat.val}
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                    className={`h-1 rounded-full mt-2 ${stat.bg}`}
                  >
                    <div
                      className={`h-full rounded-full ${stat.color.replace(
                        "text",
                        "bg"
                      )} opacity-50`}
                      style={{ width: "70%" }}
                    />
                  </motion.div>
                </div>
              ))}
            </div>

            <div className="bg-[#1e293b] border border-white/5 rounded-xl p-4 flex-1 relative overflow-hidden z-10">
              <div className="flex justify-between items-center mb-4">
                <div className="text-xs font-bold text-slate-300">
                  Activity Level
                </div>
                <div className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20">
                  +24%
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-32 w-full">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d="M0,80 C20,70 40,90 60,60 S100,20 140,50 S180,30 200,10 V100 H0 Z"
                    fill="url(#chartGradient)"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d="M0,80 C20,70 40,90 60,60 S100,20 140,50 S180,30 200,10"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3 h-3" /> Team Insights
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            The Pulse of your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Engineering Team.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Stop guessing who is working on what. DevDialogue provides a
            beautiful, real-time dashboard that tracks project velocity, AI
            usage, and collaborator activity without micro-managing.
          </p>

          <div className="space-y-4 pt-4">
            {[
              {
                title: "Activity Heatmaps",
                desc: "Visualize coding intensity over time.",
              },
              {
                title: "Language Distribution",
                desc: "See which stacks your AI is generating.",
              },
              {
                title: "Collaborator Tracking",
                desc: "Know exactly who contributed to which file.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      i === 0
                        ? "bg-blue-400"
                        : i === 1
                        ? "bg-purple-400"
                        : "bg-emerald-400"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{item.title}</h4>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
// ==========================================
// 🚀 FINAL CTA
// ==========================================
const GetStartedSection = () => {
  return (
    <section className="py-32 relative bg-[#020617] overflow-hidden flex items-center justify-center">
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: `url("${NOISE_BG}")` }}
      ></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
        <Reveal>
          <div className="relative rounded-[2.5rem] border border-white/10 bg-[#0f172a]/50 backdrop-blur-2xl overflow-hidden p-12 md:p-24 text-center group">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-[128px] group-hover:bg-purple-500/40 transition-colors duration-1000" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/30 rounded-full blur-[128px] group-hover:bg-cyan-500/40 transition-colors duration-1000" />

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-cyan-500/20 rotate-3 group-hover:rotate-6 transition-transform duration-500"
              >
                <Rocket className="w-10 h-10 text-white fill-white" />
              </motion.div>

              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Ready to code at the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
                  speed of thought?
                </span>
              </h2>

              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of developers using DevDialogue to build, deploy,
                and scale faster than ever before.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleLoginNavigation}
                  className="relative group/btn px-8 py-4 bg-white text-black text-lg font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                  <span className="flex items-center gap-2 relative z-10">
                    Get Started Now <ChevronRight className="w-5 h-5" />
                  </span>
                </button>

                <button
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-4 rounded-xl text-slate-300 font-medium hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Explore Features
                </button>
              </div>

              <div className="absolute top-10 left-10 animate-float opacity-30 hidden md:block">
                <Code2 className="w-12 h-12 text-cyan-500 rotate-12" />
              </div>
              <div className="absolute bottom-10 right-10 animate-float-delayed opacity-30 hidden md:block">
                <Terminal className="w-12 h-12 text-purple-500 -rotate-12" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ==========================================
// 🦶 FOOTER (With Custom Logo)
// ==========================================
const Footer = () => {
  return (
    <footer className="relative bg-[#020617] pt-24 pb-12 overflow-hidden border-t border-white/5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              {/* Replaced Terminal Icon with Custom Logo */}
              <div className="w-8 h-8 flex items-center justify-center">
                <img
                  src={logo}
                  alt="DevDialogue Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                DevDialogue
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The world's first chat-native IDE. Build, deploy, and scale your
              applications at the speed of conversation.
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Stay in the loop
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition-all w-full placeholder-slate-600"
                />
                <button className="bg-white text-black px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-cyan-50 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 lg:pl-12">
            <div>
              <h4 className="font-bold text-white mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                {[
                  "Real-time Chat",
                  "AI Assistant",
                  "Cloud Runtime",
                  "Team Insights",
                  "Enterprise",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-cyan-400 transition-colors flex items-center gap-1 group"
                    >
                      {item}
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                {["About Us", "Careers", "Blog", "Contact", "Partners"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="hover:text-cyan-400 transition-colors flex items-center gap-1 group"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                  "Security",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="hover:text-cyan-400 transition-colors flex items-center gap-1 group"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} DevDialogue Inc. All rights
            reserved.
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/5 border border-green-500/20">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-[10px] font-medium text-green-400 uppercase tracking-wider">
              All systems normal
            </span>
          </div>

          <div className="flex gap-6 text-slate-400">
            <Github className="w-5 h-5 hover:text-white cursor-pointer transition-colors hover:scale-110 transform duration-200" />
            <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors hover:scale-110 transform duration-200" />
            <Disc className="w-5 h-5 hover:text-white cursor-pointer transition-colors hover:scale-110 transform duration-200" />
          </div>
        </div>
      </div>
    </footer>
  );
};

// ==========================================
// 🚀 MAIN LANDING PAGE
// ==========================================
const LandingPage = () => {
  return (
    <div className="bg-[#020617] min-h-screen text-white font-sans selection:bg-cyan-500/30">
      <Navbar />
      <HeroSection />
      <StandardChatSection />
      <NeuralChatSection />
      <FileTreeSection />
      <ExecutionSection />
      <DashboardFeatureSection />
      <GetStartedSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
