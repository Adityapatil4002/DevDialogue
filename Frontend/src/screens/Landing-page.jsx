import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// --- Import your component ---
import LiquidEther from "../components/LiquidEther";

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- 🎬 ANIMATION WRAPPER (Scroll Reveal) ---
// Wraps content to fade in smoothly as user scrolls
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

// --- Stagger Container for Cards ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// ==========================================
// 🌌 HERO SECTION (Optimized)
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

// --- Hero Cards (Same logic as before) ---
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
// 🧭 NAVBAR
// ==========================================
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenu(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b",
        scrolled
          ? "bg-[#020617]/80 backdrop-blur-lg border-white/10 py-4"
          : "bg-transparent border-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => window.scrollTo(0, 0)}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Terminal className="text-white w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            DevDialogue
          </span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => scrollTo("chat")}
            className="hover:text-cyan-400 transition-colors"
          >
            Chat
          </button>
          <button
            onClick={() => scrollTo("features")}
            className="hover:text-cyan-400 transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            className="hover:text-cyan-400 transition-colors"
          >
            Pricing
          </button>
        </div>

        <div className="hidden md:flex gap-4 items-center">
          <button className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2">
            Log in
          </button>
          <button className="text-sm font-bold text-white border border-white/20 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
            Start Building
          </button>
          <button className="bg-cyan-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
            Get Started
          </button>
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="text-white"
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#020617] border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl">
          <button
            onClick={() => scrollTo("chat")}
            className="text-left text-slate-300 py-2"
          >
            Chat
          </button>
          <button
            onClick={() => scrollTo("features")}
            className="text-left text-slate-300 py-2"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            className="text-left text-slate-300 py-2"
          >
            Pricing
          </button>
          <hr className="border-white/10" />
          <button className="text-center font-bold text-white border border-white/20 bg-white/5 py-3 rounded-lg">
            Start Building
          </button>
          <button className="text-center font-bold bg-cyan-500 text-black py-3 rounded-lg">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};
// ==========================================
// 💬 SECTION 2: STANDARD CHAT (The Foundation)
// ==========================================
const StandardChatSection = () => {
    return (
        <section id="chat" className="py-32 bg-[#020617] relative overflow-hidden">
            {/* Subtle Background Gradient */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                
                {/* LEFT: Info/Text */}
                <Reveal>
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                            <MessageCircle className="w-3 h-3" /> Real-time Sync
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Built for Teams, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Ready for Code.</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Before the AI magic happens, it's a powerful communication platform. 
                            Organize discussions in channels, share code snippets with syntax highlighting, and sync with your team in real-time.
                        </p>
                        
                        {/* Feature List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {[
                                "Threaded Conversations", 
                                "Code Syntax Highlighting", 
                                "Secure Direct Messages", 
                                "File Sharing"
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

                {/* RIGHT: Animated Visualization */}
                <Reveal delay={0.2} className="relative">
                    <div className="relative rounded-xl border border-white/10 bg-[#0B1120] shadow-2xl overflow-hidden flex h-[450px]">
                        
                        {/* Sidebar (Channels) */}
                        <div className="w-64 bg-[#0f172a]/50 border-r border-white/5 flex flex-col hidden sm:flex">
                            <div className="p-4 border-b border-white/5 font-bold text-slate-200 flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px]">D</div>
                                DevTeam
                            </div>
                            <div className="p-3 space-y-1">
                                <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Channels</div>
                                {["general", "announcements", "engineering", "design"].map((channel, i) => (
                                    <motion.div 
                                        key={channel}
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors text-sm",
                                            channel === "engineering" ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                        )}
                                    >
                                        <span className="opacity-50">#</span> {channel}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Main Chat Area */}
                        <div className="flex-1 flex flex-col bg-[#0B1120]">
                            {/* Chat Header */}
                            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0B1120]/50 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 text-lg">#</span>
                                    <span className="font-bold text-white">engineering</span>
                                </div>
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <div key={i} className={`w-6 h-6 rounded-full border-2 border-[#0B1120] bg-slate-${i*200+400}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Messages Area (Animated) */}
                            <div className="flex-1 p-6 space-y-6 overflow-hidden flex flex-col justify-end pb-8">
                                
                                {/* Message 1: Sarah */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    viewport={{ once: true }}
                                    className="flex gap-4"
                                >
                                    <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-xs font-bold text-white mt-1">S</div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-slate-200 text-sm">Sarah Chen</span>
                                            <span className="text-[10px] text-slate-500">10:02 AM</span>
                                        </div>
                                        <p className="text-slate-400 text-sm mt-1">Just pushed the new WebSocket service to staging. Can someone verify the connection stability?</p>
                                    </div>
                                </motion.div>

                                {/* Message 2: Mike */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 }} // Delays to look like real conversation
                                    viewport={{ once: true }}
                                    className="flex gap-4"
                                >
                                    <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold text-white mt-1">M</div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-slate-200 text-sm">Mike Ross</span>
                                            <span className="text-[10px] text-slate-500">10:05 AM</span>
                                        </div>
                                        <p className="text-slate-400 text-sm mt-1">On it. Logs are looking clean so far. 🟢</p>
                                    </div>
                                </motion.div>

                                {/* Typing Indicator (Appears then disappears) */}
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: 2.5, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="flex gap-4 items-end"
                                >
                                    <div className="w-8 h-8 rounded bg-pink-500 flex items-center justify-center text-xs font-bold text-white">E</div>
                                    <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                    </div>
                                </motion.div>

                                {/* Message 3: Elena (Appears last) */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 4.0 }} // Appears after "typing"
                                    viewport={{ once: true }}
                                    className="flex gap-4"
                                >
                                    <div className="w-8 h-8 rounded bg-pink-500 flex items-center justify-center text-xs font-bold text-white mt-1">E</div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-slate-200 text-sm">Elena Fisher</span>
                                            <span className="text-[10px] text-slate-500">10:08 AM</span>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-1">
                                            <code className="text-xs font-mono text-cyan-400">
                                                GET /ws/health 200 OK (12ms)
                                            </code>
                                        </div>
                                        <p className="text-slate-400 text-sm mt-1">Latency looks amazing! Great job team. 🚀</p>
                                    </div>
                                </motion.div>

                            </div>
                        </div>

                    </div>
                    
                    {/* Decorative Elements behind */}
                    <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
                    <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
                </Reveal>

            </div>
        </section>
    );
};
// ==========================================
// 🧠 FEATURE 3: THE @ai INVOCATION
// ==========================================
const NeuralChatSection = () => {
  return (
    <section id="features" className="py-32 relative bg-[#020617]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
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

        {/* Visual: Chat UI */}
        <Reveal
          delay={0.2}
          className="relative rounded-2xl border border-white/10 bg-[#0B1120] shadow-2xl overflow-hidden"
        >
          <div className="h-12 border-b border-white/5 bg-white/5 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-bold text-slate-300">
                # dev-team
              </span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#0B1120]" />
              <div className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-[#0B1120] flex items-center justify-center text-[10px] font-bold">
                AI
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 min-h-[400px]">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                JD
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  John Doe • 10:23 AM
                </div>
                <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none text-slate-300 text-sm">
                  We need a function to validate email addresses before sending
                  the invite.
                </div>
              </div>
            </div>

            <div className="flex gap-4 flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                ME
              </div>
              <div className="space-y-1 text-right">
                <div className="text-xs text-slate-500">You • 10:24 AM</div>
                <div className="bg-violet-900/50 border border-violet-500/30 p-3 rounded-lg rounded-tr-none text-white text-sm text-left">
                  <span className="text-cyan-400 font-bold">@ai</span> generate
                  a regex utility for email validation in TypeScript.
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-900 border border-cyan-500 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="space-y-2 w-full">
                <div className="text-xs text-cyan-500 font-bold">
                  DevDialogue AI • 10:24 AM
                </div>
                <div className="bg-[#0f172a] border border-cyan-500/20 p-4 rounded-lg rounded-tl-none text-slate-300 text-sm w-full shadow-lg">
                  <p className="mb-3">
                    Here is a robust email validation function:
                  </p>
                  <div className="bg-black/50 p-3 rounded border border-white/5 font-mono text-xs text-slate-400 overflow-hidden relative">
                    <span className="text-violet-400">export const</span>{" "}
                    <span className="text-blue-400">isValidEmail</span> =
                    (email: <span className="text-orange-400">string</span>):{" "}
                    <span className="text-orange-400">boolean</span> ={">"}{" "}
                    {"{"}
                    <br />
                    &nbsp;&nbsp;<span className="text-violet-400">
                      const
                    </span>{" "}
                    re ={" "}
                    <span className="text-green-400">
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    </span>
                    ;<br />
                    &nbsp;&nbsp;<span className="text-violet-400">
                      return
                    </span>{" "}
                    re.test(email);
                    <br />
                    {"}"};
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 text-xs rounded border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" /> Insert
                    </button>
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
// 📂 FEATURE 4: GENERATIVE FILE TREE
// ==========================================
const FileTreeSection = () => {
  return (
    <section className="py-32 relative bg-[#020617] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <Reveal
          className="order-2 lg:order-1 relative rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 lg:p-10 shadow-2xl"
          style={{ perspective: "1000px" }}
        >
          {/* Particles */}
          <div className="absolute inset-0 z-0 overflow-hidden opacity-20">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -100], opacity: [0, 0.5, 0] }}
                transition={{
                  duration: Math.random() * 5 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute bg-violet-500 w-0.5 h-10 rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: "100%" }}
              />
            ))}
          </div>

          <div className="relative z-10 space-y-2 font-mono text-sm">
            <div className="flex items-center gap-2 text-slate-400 mb-4 border-b border-white/5 pb-2">
              <FolderTree className="w-4 h-4 text-violet-400" />
              <span>/project-root (Generated)</span>
            </div>

            {/* Tree Animation */}
            {[
              { name: "src", type: "folder", depth: 0, color: "text-blue-400" },
              {
                name: "components",
                type: "folder",
                depth: 1,
                color: "text-blue-400",
              },
              {
                name: "Button.tsx",
                type: "file",
                depth: 2,
                color: "text-slate-300",
              },
              {
                name: "Navbar.tsx",
                type: "file",
                depth: 2,
                color: "text-green-300",
              },
              {
                name: "hooks",
                type: "folder",
                depth: 1,
                color: "text-blue-400",
              },
              {
                name: "useAuth.ts",
                type: "file",
                depth: 2,
                color: "text-slate-300",
              },
              {
                name: "pages",
                type: "folder",
                depth: 1,
                color: "text-blue-400",
              },
              {
                name: "index.tsx",
                type: "file",
                depth: 2,
                color: "text-slate-300",
              },
              { name: "api", type: "folder", depth: 0, color: "text-blue-400" },
              {
                name: "server.js",
                type: "file",
                depth: 1,
                color: "text-green-300",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 hover:bg-white/5 p-1 rounded cursor-pointer transition-colors"
                style={{ paddingLeft: `${item.depth * 20}px` }}
              >
                {item.type === "folder" ? (
                  <div className="w-4 h-4 bg-slate-700 rounded" />
                ) : (
                  <FileCode className="w-4 h-4 text-slate-500" />
                )}
                <span className={item.color}>{item.name}</span>
                {item.color.includes("green") && (
                  <span className="ml-auto text-[9px] bg-green-500/20 text-green-400 px-1.5 rounded border border-green-500/30">
                    NEW
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </Reveal>

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
      </div>
    </section>
  );
};

// ==========================================
// 🚀 FEATURE 5: LIVE EXECUTION
// ==========================================
const ExecutionSection = () => {
  return (
    <section className="py-32 relative bg-[#020617] border-t border-white/5 overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none" />

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
              <button className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded hover:bg-green-500/20 transition-colors border border-green-500/20">
                <Play className="w-3 h-3 fill-current" /> RUN
              </button>
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
              <div className="space-y-1">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-300"
                >
                  {">"} python script.py
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.0 }}
                  className="text-green-400"
                >
                  Factorial of 5 is: 120
                </motion.div>
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
// 💎 PRICING SECTION
// ==========================================
const PricingCard = ({ tier, price, features, recommended }) => (
  <motion.div
    variants={itemVariants}
    className={cn(
      "relative p-8 rounded-2xl border flex flex-col h-full",
      recommended
        ? "bg-slate-900/80 border-cyan-500/50 shadow-[0_0_40px_rgba(34,211,238,0.1)]"
        : "bg-white/5 border-white/10"
    )}
  >
    {recommended && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        Most Popular
      </div>
    )}
    <h3 className="text-lg font-medium text-slate-300 mb-2">{tier}</h3>
    <div className="text-4xl font-bold text-white mb-6">
      {price}
      <span className="text-sm text-slate-500 font-normal">/mo</span>
    </div>
    <div className="space-y-4 mb-8 flex-1">
      {features.map((feat, i) => (
        <div key={i} className="flex items-start gap-3 text-sm text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          {feat}
        </div>
      ))}
    </div>
    <button
      className={cn(
        "w-full py-3 rounded-lg font-bold text-sm transition-all",
        recommended
          ? "bg-cyan-500 text-black hover:bg-cyan-400"
          : "bg-white/10 text-white hover:bg-white/20"
      )}
    >
      Choose {tier}
    </button>
  </motion.div>
);

const PricingSection = () => {
  return (
    <section
      id="pricing"
      className="py-32 px-6 bg-[#020617] border-t border-white/5"
    >
      <Reveal className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
        <p className="text-slate-400">
          Start building for free. Upgrade for power.
        </p>
      </Reveal>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
      >
        <PricingCard
          tier="Starter"
          price="$0"
          features={[
            "Unlimited Chat History",
            "50 AI Generations/mo",
            "Basic Execution Sandbox",
            "Community Support",
          ]}
        />
        <PricingCard
          tier="Developer"
          price="$15"
          recommended={true}
          features={[
            "Unlimited AI Generations",
            "Advanced File Tree Generation",
            "Private Projects",
            "Priority Support",
          ]}
        />
        <PricingCard
          tier="Team"
          price="$49"
          features={[
            "Everything in Developer",
            "Team Context Sharing",
            "SSO & Audit Logs",
            "Dedicated Server",
          ]}
        />
      </motion.div>
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
          <button className="bg-white text-black px-12 py-4 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:scale-105 duration-200">
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
      <PricingSection />
      <GetStartedSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
