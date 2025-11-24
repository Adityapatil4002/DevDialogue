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
  LogIn,
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// --- Import your components ---
// Note: Keeping LiquidEther as per your original file.
// If you don't have this, you can remove the component usage in HeroSection.
import LiquidEther from "../components/LiquidEther";

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Navigation Helper ---
const handleLoginNavigation = () => {
  // Navigate to login page
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
// 🧭 NEW NAVBAR COMPONENT
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
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "About", href: "#" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-[#020617]/80 backdrop-blur-md border-white/10 py-4"
          : "bg-transparent border-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo(0, 0)}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Terminal className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">
            DevDialogue
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
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
                  onClick={() => setMobileMenuOpen(false)}
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
// 💬 SECTION 2: LIVE GROUP CHAT (Continuous Animation)
// ==========================================
const StandardChatSection = () => {
  // --- Animation Logic ---
  
  // 1. A pool of realistic developer messages to cycle through
  const messagePool = [
    { user: "Sarah", avatar: "S", color: "bg-indigo-500", text: "Did you push the hotfix to staging?" },
    { user: "Mike", avatar: "M", color: "bg-emerald-500", text: "Yeah, building right now. 🚀" },
    { user: "Elena", avatar: "E", color: "bg-pink-500", text: "The API latency is looking much better." },
    { user: "David", avatar: "D", color: "bg-cyan-500", text: "Can someone review PR #420?" },
    { user: "Sarah", avatar: "S", color: "bg-indigo-500", text: "On it! Giving it a look." },
    { user: "System", avatar: "🤖", color: "bg-slate-600", text: "Deployment successful: v2.4.0-beta" },
    { user: "Mike", avatar: "M", color: "bg-emerald-500", text: "Great work everyone! taking a break." },
    { user: "Elena", avatar: "E", color: "bg-pink-500", text: "Don't forget to update the documentation." },
  ];

  // 2. Initial state with a few messages
  const [messages, setMessages] = useState(messagePool.slice(0, 3));
  
  // 3. The Heartbeat: Add a message every 2 seconds
  useEffect(() => {
    let poolIndex = 3;
    const interval = setInterval(() => {
      poolIndex = (poolIndex + 1) % messagePool.length;
      const newMessage = { ...messagePool[poolIndex], id: Date.now() }; // Unique ID is crucial for animation

      setMessages((prevMessages) => {
        // Keep strictly 4 messages to ensure the container doesn't overflow
        const newHistory = [...prevMessages, newMessage];
        if (newHistory.length > 4) {
          return newHistory.slice(1); // Remove the oldest (top) message
        }
        return newHistory;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="chat" className="py-32 bg-[#020617] relative overflow-hidden">
      {/* Background Glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* LEFT COLUMN: Text Content */}
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
                <div key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* RIGHT COLUMN: The Split Visualization */}
        <Reveal delay={0.2} className="relative">
          {/* Main App Window Container */}
          <div className="relative rounded-xl border border-white/10 bg-[#0f172a] shadow-2xl overflow-hidden flex h-[500px] w-full max-w-lg mx-auto lg:mx-0">
            
            {/* --- SIDEBAR: GROUPS & CHANNELS (Left Side) --- */}
            <div className="w-[30%] bg-[#0B1120] border-r border-white/5 flex flex-col">
              {/* Sidebar Header */}
              <div className="h-14 border-b border-white/5 flex items-center px-4">
                <div className="font-bold text-slate-200 text-xs tracking-wide uppercase opacity-70">Workspaces</div>
              </div>
              
              <div className="flex-1 p-3 space-y-6">
                
                {/* 1. Groups Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 cursor-pointer">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                      D
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-bold text-indigo-200">DevTeam</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                      M
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-bold text-slate-300">Marketing</div>
                    </div>
                  </div>
                </div>

                {/* 2. Channels Section */}
                <div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase mb-2 block px-1">Channels</span>
                   <ul className="space-y-1">
                      {["general", "engineering", "design", "random"].map(channel => (
                        <div 
                          key={channel} 
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs",
                            channel === "engineering" ? "bg-white/10 text-white font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                          )}
                        >
                          <span className="opacity-50">#</span> {channel}
                        </div>
                      ))}
                   </ul>
                </div>
              </div>
            </div>

            {/* --- MAIN CHAT AREA (Right Side) --- */}
            <div className="flex-1 flex flex-col bg-[#0f172a] relative">
              {/* Chat Header */}
              <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0f172a]/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">#</span>
                  <span className="font-bold text-slate-200 text-sm">engineering</span>
                </div>
                <div className="flex -space-x-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full border border-[#0f172a] bg-slate-600" />
                  ))}
                </div>
              </div>

              {/* Message Feed Container */}
              <div className="flex-1 p-4 overflow-hidden flex flex-col justify-end">
                
                {/* Top Fade Gradient for smooth exit */}
                <div className="absolute top-14 left-0 right-0 h-16 bg-gradient-to-b from-[#0f172a] to-transparent z-10 pointer-events-none" />

                <div className="space-y-4 relative z-0">
                  <AnimatePresence initial={false} mode="popLayout">
                    {messages.map((msg) => (
                      <motion.div
                        layout // Enables smooth sliding up
                        key={msg.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex gap-3 group"
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg mt-0.5", msg.color)}>
                          {msg.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                              {msg.user}
                            </span>
                            <span className="text-[10px] text-slate-600">
                              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed break-words">
                            {msg.text}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Persistent "Someone is typing" indicator */}
                <div className="h-6 mt-3 flex items-center gap-2 pl-11">
                  <div className="flex gap-1">
                    <motion.div 
                      animate={{ y: [0, -3, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} 
                      className="w-1 h-1 bg-slate-500 rounded-full" 
                    />
                    <motion.div 
                      animate={{ y: [0, -3, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} 
                      className="w-1 h-1 bg-slate-500 rounded-full" 
                    />
                    <motion.div 
                      animate={{ y: [0, -3, 0] }} 
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} 
                      className="w-1 h-1 bg-slate-500 rounded-full" 
                    />
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium">Someone is typing...</span>
                </div>
              </div>

              {/* Input Area (Visual Only) */}
              <div className="p-4 pt-0">
                <div className="h-10 bg-slate-800/50 rounded-lg border border-white/5 flex items-center px-3 gap-2">
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center">
                    <span className="text-[10px] text-slate-500">+</span>
                  </div>
                  <div className="text-xs text-slate-600">Message #engineering...</div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -z-10 top-20 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px]" />
          <div className="absolute -z-10 bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-[80px]" />

        </Reveal>
      </div>
    </section>
  );
};

// ==========================================
// 🧠 FEATURE 3: THE @ai INVOCATION (Continuous Animation)
// ==========================================
const NeuralChatSection = () => {
  // --- Animation Sequence State ---
  const [step, setStep] = useState(0); 
  const [typedCode, setTypedCode] = useState("");
  
  // The code snippet to be typed out
  const fullCode = `const Button = ({ children, variant }) => {
  return (
    <button className={\`btn-\${variant}\`}>
      {children}
    </button>
  );
};`;

  // --- Master Timeline Loop ---
  useEffect(() => {
    let timeout;
    
    const runSequence = () => {
      // Step 0: Initial Pause (Empty/Reset)
      setStep(0);
      setTypedCode("");
      
      // Step 1: John sends a message
      timeout = setTimeout(() => setStep(1), 1000);
      
      // Step 2: User invokes @ai
      timeout = setTimeout(() => setStep(2), 2500);
      
      // Step 3: AI appears & starts typing
      timeout = setTimeout(() => setStep(3), 3500);
      
      // Step 4: End of typing (Wait time before reset)
      // Note: Typing duration is handled in the effect below, 
      // this timeout controls how long we view the result.
      timeout = setTimeout(runSequence, 9000); 
    };

    runSequence();
    
    // Cleanup on unmount
    return () => clearTimeout(timeout);
  }, []);

  // --- Typewriter Effect Logic ---
  useEffect(() => {
    if (step === 3) {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex <= fullCode.length) {
          setTypedCode(fullCode.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 30); // Typing speed (ms per char)
      return () => clearInterval(typeInterval);
    }
  }, [step]);

  return (
    <section id="features" className="py-32 relative bg-[#020617]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* LEFT SIDE: Description */}
        <Reveal>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3" /> Collaboration First
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
              chat. The AI understands your project context, answers
              architectural questions, and generates solutions where you are
              discussing them.
            </p>
            <ul className="space-y-4 pt-4">
              {[
                "Context-aware answers based on chat history",
                "Multi-user collaboration with AI support",
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

        {/* RIGHT SIDE: Animated Visualization */}
        <Reveal
          delay={0.2}
          className="relative rounded-2xl border border-white/10 bg-[#0B1120] shadow-2xl overflow-hidden min-h-[480px] flex flex-col"
        >
          {/* Header */}
          <div className="h-12 border-b border-white/5 bg-white/5 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-bold text-slate-300">
                # dev-team
              </span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#0B1120] flex items-center justify-center text-xs font-bold text-white">JD</div>
              <motion.div
                animate={{ borderColor: ["#0B1120", "#22d3ee", "#0B1120"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-cyan-500 border-2 flex items-center justify-center text-[10px] font-bold"
              >
                AI
              </motion.div>
            </div>
          </div>

          {/* Chat Content Area */}
          <div className="p-6 space-y-6 flex-1 relative">
            
            {/* 1. Normal Team Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">
                JD
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  John Doe • 10:23 AM
                </div>
                <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none text-slate-300 text-sm">
                  We need a reusable Button component for the new dashboard.
                </div>
              </div>
            </motion.div>

            {/* 2. User @ai Invocation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
              className="flex gap-4 flex-row-reverse"
            >
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">
                ME
              </div>
              <div className="space-y-1 text-right">
                <div className="text-xs text-slate-500">You • 10:24 AM</div>
                <div className="bg-violet-900/50 border border-violet-500/30 p-3 rounded-lg rounded-tr-none text-white text-sm text-left inline-block">
                  <span className="text-cyan-400 font-bold">@ai</span> create a React Button component with variants.
                </div>
              </div>
            </motion.div>

            {/* 3. AI Response (Typewriter) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 10 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-900 border border-cyan-500 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="space-y-2 w-full max-w-[85%]">
                <div className="text-xs text-cyan-500 font-bold flex items-center gap-2">
                  DevDialogue AI • 10:24 AM
                  {step === 3 && typedCode.length < fullCode.length && (
                     <span className="text-[10px] text-slate-500 animate-pulse">thinking...</span>
                  )}
                </div>
                
                {/* AI Card */}
                <div className="bg-[#0f172a] border border-cyan-500/20 p-4 rounded-lg rounded-tl-none text-slate-300 text-sm w-full shadow-lg relative overflow-hidden group">
                  {/* Subtle Scanline Effect */}
                  <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="bg-black/50 p-3 rounded border border-white/5 font-mono text-xs text-slate-400 overflow-hidden relative min-h-[120px]">
                    <pre className="whitespace-pre-wrap font-mono">
                        {/* Render highlighted code roughly (simplified for animation) */}
                        <span className="text-violet-400">{typedCode.includes('const') ? 'const' : ''}</span>
                        {typedCode.replace('const', '')}
                        
                        {/* Blinking Cursor */}
                        {step === 3 && (
                            <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-1.5 h-3 bg-cyan-400 ml-1 align-middle"
                            />
                        )}
                    </pre>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 text-xs rounded border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
                    >
                      <PlayCircle className="w-3 h-3" /> Insert Code
                    </motion.button>
                  </div>
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
// 📂 FEATURE 4: GENERATIVE FILE TREE (Continuous Animation)
// ==========================================
const FileTreeSection = () => {
  // Define the file structure to generate
  const treeItems = [
    { id: 1, name: "src", type: "folder", depth: 0, color: "text-blue-400" },
    { id: 2, name: "components", type: "folder", depth: 1, color: "text-blue-400" },
    { id: 3, name: "Button.tsx", type: "file", depth: 2, color: "text-yellow-300" },
    { id: 4, name: "Navbar.tsx", type: "file", depth: 2, color: "text-yellow-300" },
    { id: 5, name: "Card.tsx", type: "file", depth: 2, color: "text-yellow-300" },
    { id: 6, name: "hooks", type: "folder", depth: 1, color: "text-blue-400" },
    { id: 7, name: "useAuth.ts", type: "file", depth: 2, color: "text-cyan-300" },
    { id: 8, name: "pages", type: "folder", depth: 1, color: "text-blue-400" },
    { id: 9, name: "index.tsx", type: "file", depth: 2, color: "text-cyan-300" },
    { id: 10, name: "dashboard.tsx", type: "file", depth: 2, color: "text-cyan-300" },
    { id: 11, name: "api", type: "folder", depth: 0, color: "text-green-400" },
    { id: 12, name: "server.js", type: "file", depth: 1, color: "text-slate-300" },
  ];

  const [visibleCount, setVisibleCount] = useState(0);

  // Animation Loop: Increment visible items one by one
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        // If all files are shown, wait a bit then reset
        if (prev >= treeItems.length) {
          setTimeout(() => setVisibleCount(0), 4000); // 4s pause before reset
          return prev;
        }
        return prev + 1;
      });
    }, 400); // Speed of file creation (ms)

    return () => clearInterval(interval);
  }, [treeItems.length]);

  return (
    <section className="py-32 relative bg-[#020617] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* RIGHT SIDE: Text Info (Order 2 on Mobile, 2 on Desktop) */}
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

        {/* LEFT SIDE: Animation (Order 1 on Mobile, 1 on Desktop) */}
        <Reveal
          className="order-2 lg:order-1 relative rounded-xl border border-white/10 bg-[#0B1120] p-6 lg:p-8 shadow-2xl min-h-[500px] flex flex-col"
          style={{ perspective: "1000px" }}
        >
          {/* Header */}
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

          {/* Tree Visualization */}
          <div className="relative z-10 space-y-1 font-mono text-sm flex-1 overflow-hidden">
            <AnimatePresence>
              {treeItems.slice(0, visibleCount).map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                  className="relative group"
                >
                  {/* Connector Lines (Simple Indentation visuals) */}
                  {item.depth > 0 && (
                    <div 
                        className="absolute left-0 top-0 bottom-0 border-l border-white/10" 
                        style={{ left: `${(item.depth * 20) - 10}px` }} 
                    />
                  )}
                  
                  <div 
                    className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded cursor-pointer transition-colors"
                    style={{ paddingLeft: `${item.depth * 20}px` }}
                  >
                    {/* Icon */}
                    {item.type === "folder" ? (
                      <div className="w-4 h-4 text-blue-400/80 fill-current">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                           <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.422.422 1.012.659 1.59.659h4.319a3 3 0 0 1 3 3v.761A4.49 4.49 0 0 0 19.5 9h-15a4.49 4.49 0 0 0-3 1.146Z" />
                        </svg>
                      </div>
                    ) : (
                      <FileCode className="w-4 h-4 text-slate-500" />
                    )}
                    
                    {/* Name */}
                    <span className={item.color}>{item.name}</span>

                    {/* "Just Created" Flash Effect */}
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="ml-auto text-[9px] text-green-400 font-bold px-2 py-0.5 bg-green-500/10 rounded"
                    >
                        CREATED
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Empty State / Reset State Placeholder */}
            {visibleCount === 0 && (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                    <div className="flex items-center gap-2">
                         <span className="w-2 h-2 bg-slate-600 rounded-full animate-pulse" />
                         Initializing generator...
                    </div>
                </div>
            )}
          </div>
          
          {/* Status Footer */}
          <div className="mt-6 pt-4 border-t border-white/5 text-xs font-mono text-slate-500 flex items-center gap-2 h-8">
            <span className="text-green-500 font-bold">{">"}</span>
            {visibleCount < treeItems.length ? (
                <span>
                    creating <span className="text-slate-300">{treeItems[visibleCount]?.name || '...'}</span>
                </span>
            ) : (
                <span className="text-green-400">Generation complete. 12 files created.</span>
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
// 🚀 FEATURE 5: LIVE EXECUTION (Continuous Animation)
// ==========================================
const ExecutionSection = () => {
  // State for continuous execution loop
  const [executionState, setExecutionState] = useState(0); // 0: Waiting, 1: Running, 2: Output, 3: Reset

  useEffect(() => {
    // Loop cycle: Wait -> Run -> Show Output -> Clear
    const interval = setInterval(() => {
      setExecutionState((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 relative bg-[#020617] border-t border-white/5 overflow-hidden">
      {/* Background Pulse */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-500/5 text-pink-300 text-xs font-bold uppercase tracking-wider">
            <Play className="w-3 h-3" /> Interactive Runtime
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            Write. Run. Fix. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">
              Inside the Chat.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Why switch to VS Code to test a logic snippet? DevDialogue comes
            with a built-in sandbox. The AI generates code, and you can{" "}
            <strong className="text-white">Execute</strong> it instantly. Works
            for JavaScript, Python, and more.
          </p>
        </Reveal>

        <Reveal
          delay={0.2}
          className="rounded-xl border border-white/10 bg-[#1e1e2e] shadow-2xl overflow-hidden font-mono text-sm"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#181825]">
            <div className="flex gap-4">
              <span className="text-xs text-slate-400 px-2 py-1 bg-white/5 rounded">
                script.py
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                animate={
                  executionState === 1
                    ? { scale: 0.95, opacity: 0.8 }
                    : { scale: 1, opacity: 1 }
                }
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded transition-colors border",
                  executionState === 1
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20"
                )}
              >
                <Play className="w-3 h-3 fill-current" />{" "}
                {executionState === 1 ? "RUNNING..." : "RUN"}
              </motion.button>
            </div>
          </div>

          <div className="grid grid-rows-2 h-[300px]">
            <div className="p-4 text-slate-300 border-b border-white/5 bg-[#1e1e2e] overflow-hidden leading-relaxed">
              <span className="text-pink-400">def</span>{" "}
              <span className="text-blue-400">factorial</span>(n):
              <br />
              &nbsp;&nbsp;<span className="text-pink-400">if</span> n =={" "}
              <span className="text-orange-400">0</span>:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-pink-400">return</span>{" "}
              <span className="text-orange-400">1</span>
              <br />
              &nbsp;&nbsp;<span className="text-pink-400">else</span>:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span className="text-pink-400">return</span> n * factorial(n-
              <span className="text-orange-400">1</span>)<br />
              <br />
              <span className="text-blue-400">print</span>(
              <span className="text-green-400">
                f"Factorial of 5 is: {"{factorial(5)}"} "
              </span>
              )
            </div>

            <div className="bg-[#11111b] p-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Terminal className="w-3 h-3" />
                <span>Console Output</span>
              </div>
              <div className="space-y-1 min-h-[60px]">
                {/* Simulated execution steps */}
                {executionState >= 1 && executionState < 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-300"
                  >
                    {">"} python script.py
                  </motion.div>
                )}
                {executionState === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400"
                  >
                    Factorial of 5 is: 120
                  </motion.div>
                )}

                {/* Blinking Cursor */}
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-4 bg-slate-500 mt-1"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ==========================================
// 💎 CYBER PRICING SECTION
// ==========================================
const CyberPricingCard = ({ tier, price, features, recommended, annual }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className={cn(
        "relative p-1 rounded-2xl group transition-all duration-300",
        recommended
          ? "scale-105 z-10"
          : "scale-100 opacity-90 hover:opacity-100"
      )}
    >
      {/* Animated Gradient Border */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-xl",
          recommended
            ? "from-cyan-500 via-purple-500 to-pink-500 animate-spin-slow"
            : "from-slate-700 to-slate-500"
        )}
      />

      <div
        className={cn(
          "relative h-full bg-[#0B1120] rounded-xl p-8 border backdrop-blur-xl flex flex-col",
          recommended
            ? "border-cyan-500/50 shadow-[0_0_50px_-12px_rgba(34,211,238,0.2)]"
            : "border-white/10"
        )}
      >
        {recommended && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
            Recommended
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
            {tier}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-white">
              ${annual ? price * 10 : price}
            </span>
            <span className="text-slate-500 font-medium">
              /{annual ? "yr" : "mo"}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8 flex-1">
          {features.map((feat, i) => (
            <div
              key={i}
              className="flex items-start gap-3 text-sm text-slate-300"
            >
              <Check
                className={cn(
                  "w-4 h-4 shrink-0 mt-0.5",
                  recommended ? "text-cyan-400" : "text-slate-500"
                )}
              />
              {feat}
            </div>
          ))}
        </div>

        <button
          className={cn(
            "w-full py-4 rounded-lg font-bold text-sm tracking-wide transition-all relative overflow-hidden group/btn",
            recommended
              ? "bg-white text-black hover:bg-cyan-50"
              : "bg-white/5 text-white hover:bg-white/10"
          )}
        >
          <span className="relative z-10">Select {tier}</span>
          {recommended && (
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

const CyberPricingSection = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className="py-32 px-6 bg-[#020617] border-t border-white/5 relative overflow-hidden"
    >
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <Reveal className="text-center mb-16 relative z-10">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Choose your computing power.
        </h2>
        <div className="flex items-center justify-center gap-4 text-sm font-medium">
          <span className={!annual ? "text-white" : "text-slate-500"}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className="w-12 h-6 rounded-full bg-slate-800 border border-white/10 relative p-1 transition-colors hover:border-cyan-500/50"
          >
            <motion.div
              animate={{ x: annual ? 24 : 0 }}
              className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
          </button>
          <span className={annual ? "text-white" : "text-slate-500"}>
            Yearly{" "}
            <span className="text-cyan-400 text-xs ml-1">(Save 20%)</span>
          </span>
        </div>
      </Reveal>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <CyberPricingCard
          tier="Starter"
          price={0}
          features={[
            "Unlimited Chat History",
            "50 AI Generations/mo",
            "Basic Execution Sandbox",
            "Community Support",
          ]}
          annual={annual}
        />
        <CyberPricingCard
          tier="Pro"
          price={29}
          recommended={true}
          features={[
            "Unlimited Generations",
            "Advanced File Tree",
            "Private Projects",
            "Priority Support",
            "GPT-4 Access",
          ]}
          annual={annual}
        />
        <CyberPricingCard
          tier="Team"
          price={99}
          features={[
            "Everything in Pro",
            "Team Context Sharing",
            "SSO & Audit Logs",
            "Dedicated Server",
            "Custom Models",
          ]}
          annual={annual}
        />
      </div>
    </section>
  );
};

// ==========================================
// 🚀 FINAL CTA (Get Started)
// ==========================================
const GetStartedSection = () => {
  return (
    <section className="py-32 px-6 text-center relative overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/10 pointer-events-none" />
      <Reveal>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl font-extrabold mb-6 tracking-tight">
            Ready to code at the speed of thought?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Join thousands of developers using DevDialogue to build faster.
          </p>
          <button
            onClick={handleLoginNavigation}
            className="bg-white text-black px-12 py-4 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:scale-105 duration-200"
          >
            Get Started Now
          </button>
        </div>
      </Reveal>
    </section>
  );
};

// ==========================================
// 🦶 FOOTER
// ==========================================
const Footer = () => (
  <footer className="border-t border-white/10 bg-[#020617] pt-20 pb-10 px-6 relative overflow-hidden">
    <div className="relative z-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-8 text-left mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-violet-600 rounded flex items-center justify-center">
              <Terminal className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-xl text-white">DevDialogue</span>
          </div>
          <p className="text-sm text-slate-500">
            The chat that codes with you.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <a href="#" className="hover:text-cyan-400">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-400">
                Integrations
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-400">
                Pricing
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <a href="#" className="hover:text-cyan-400">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-400">
                API Reference
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-400">
                Community
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <a href="#" className="hover:text-cyan-400">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-400">
                Terms
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 w-full flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
        <p>© 2024 DevDialogue Inc. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Github className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
          <Twitter className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
          <Disc className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  </footer>
);

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
      <CyberPricingSection />
      <GetStartedSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
