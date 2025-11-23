import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useInView,
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
  Globe,
  Shield,
  LayoutTemplate,
  Database,
  FolderTree,
  FileCode,
  Users,
  PlayCircle,
  Laptop,
  Github,
  Twitter,
  Disc,
  Command,
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// --- Import your component ---
import LiquidEther from "../components/LiquidEther";

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ==========================================
// 🌌 HERO SECTION (UNTOUCHED & OPTIMIZED)
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

// ... (Exact same Hero Card contents as before) ...
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
          <span className="text-cyan-400 font-bold">@ai</span> build a{" "}
          <span className="text-violet-400">file_upload</span> endpoint
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
                <span>Code generated successfully.</span>
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
            <span className="text-violet-400">app</span>.post(
            <span className="text-green-400">"/upload"</span>,{" "}
            <span className="text-cyan-400">async</span> (req, res) ={">"} {"{"}
          </>
        ),
        indent: 0,
      },
      {
        html: (
          <>
            <span className="text-slate-500">// Check permissions</span>
          </>
        ),
        indent: 1,
      },
      {
        html: (
          <>
            <span className="text-cyan-400">if</span> (!req.user){" "}
            <span className="text-violet-400">throw</span> Error;
          </>
        ),
        indent: 1,
      },
      {
        html: (
          <>
            <span className="text-cyan-400">const</span> file = req.files.doc;
          </>
        ),
        indent: 1,
      },
      {
        html: (
          <>
            <span className="text-violet-400">await</span> s3.upload(file);
          </>
        ),
        indent: 1,
      },
      {
        html: (
          <>
            res.json({"{"} status: <span className="text-green-400">"ok"</span>{" "}
            {"}"});
          </>
        ),
        indent: 1,
      },
      { html: <>{"}"});</>, indent: 0 },
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
        <span className="text-violet-300">backend.js</span>
        <span className="text-[9px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
          JS
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
        { text: "> node backend.js", color: "text-white", delay: 200 },
        {
          text: "[info] Initializing S3 client...",
          color: "text-slate-400",
          delay: 800,
        },
        {
          text: "[info] Middlewares loaded",
          color: "text-slate-400",
          delay: 1400,
        },
        {
          text: "[success] Database connected (2ms)",
          color: "text-green-400",
          delay: 2200,
        },
        {
          text: "Server listening on port 8080 🚀",
          color: "text-cyan-300",
          delay: 2800,
        },
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
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Terminal className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">DevDialogue</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          {["Features", "Docs", "Pricing"].map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-cyan-400 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
        <button className="bg-cyan-500 text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]">
          Get Started
        </button>
      </nav>
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 h-full justify-center">
        <div className="flex-1 text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-md text-cyan-300 text-xs font-bold uppercase tracking-wider"
          >
            <Zap className="w-3 h-3 fill-cyan-300" />
            <span>AI-Native Backend Generation</span>
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
            production-ready code, create files, and run backend logic in
            real-time.
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
// 🔌 INTEGRATION MARQUEE
// ==========================================
const TechMarquee = () => (
  <div className="py-10 bg-[#020617] border-y border-white/5 relative overflow-hidden">
    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10" />
    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10" />
    <div className="flex gap-16 animate-marquee whitespace-nowrap items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
      {[
        "Node.js",
        "Python",
        "React",
        "Docker",
        "AWS",
        "Firebase",
        "PostgreSQL",
        "MongoDB",
        "Go",
        "Redis",
        "Node.js",
        "Python",
        "React",
        "Docker",
        "AWS",
        "Firebase",
      ].map((tech, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-xl font-bold text-slate-300"
        >
          <Globe className="w-5 h-5" /> {tech}
        </div>
      ))}
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { animation: marquee 30s linear infinite; }`}</style>
  </div>
);

// ==========================================
// 🧠 FEATURE 1: THE @ai INVOCATION (Group Sync)
// ==========================================
const NeuralChatSection = () => {
  return (
    <section className="py-32 relative bg-[#020617] overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/5 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3 h-3" /> Collaboration First
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
            chat. The AI understands your project context, answers architectural
            questions, and generates solutions where you are discussing them.
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
        </motion.div>

        {/* Visual: Chat UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-white/10 bg-[#0B1120] shadow-2xl overflow-hidden"
        >
          {/* Mock Header */}
          <div className="h-12 border-b border-white/5 bg-white/5 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-bold text-slate-300">
                # backend-architecture
              </span>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#0B1120]" />
              <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-[#0B1120]" />
              <div className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-[#0B1120] flex items-center justify-center text-[10px] font-bold">
                AI
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="p-6 space-y-6 min-h-[400px]">
            {/* Message 1 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                JD
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">
                  John Doe • 10:23 AM
                </div>
                <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none text-slate-300 text-sm">
                  Guys, how do we handle the S3 upload presigned URLs?
                </div>
              </div>
            </div>

            {/* Message 2 (User invoking AI) */}
            <div className="flex gap-4 flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                ME
              </div>
              <div className="space-y-1 text-right">
                <div className="text-xs text-slate-500">You • 10:24 AM</div>
                <div className="bg-violet-900/50 border border-violet-500/30 p-3 rounded-lg rounded-tr-none text-white text-sm text-left">
                  <span className="text-cyan-400 font-bold">@ai</span> generate
                  a utility function for S3 presigned URLs using AWS SDK v3.
                </div>
              </div>
            </div>

            {/* Message 3 (AI Reply) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
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
                    Here is the function using{" "}
                    <code className="bg-slate-800 px-1 rounded">
                      @aws-sdk/client-s3
                    </code>
                    :
                  </p>
                  <div className="bg-black/50 p-3 rounded border border-white/5 font-mono text-xs text-slate-400 overflow-hidden relative">
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                      <div className="w-2 h-2 rounded-full bg-slate-600" />
                    </div>
                    <span className="text-violet-400">import</span>{" "}
                    {"{ getSignedUrl }"}{" "}
                    <span className="text-violet-400">from</span>{" "}
                    "@aws-sdk/s3-request-presigner";
                    <br />
                    <span className="text-cyan-400">const</span> command ={" "}
                    <span className="text-violet-400">new</span>{" "}
                    PutObjectCommand(params);
                    <br />
                    <span className="text-green-400">
                      // ... generating secure link
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 text-xs rounded border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" /> Insert to Project
                    </button>
                    <button className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700 hover:bg-slate-700 transition-colors">
                      Copy Code
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==========================================
// 📂 FEATURE 2: GENERATIVE FILE TREE
// ==========================================
const FileTreeSection = () => {
  return (
    <section className="py-32 relative bg-[#020617] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Visual: Holographic File Tree */}
        <motion.div
          initial={{ opacity: 0, rotateX: 10 }}
          whileInView={{ opacity: 1, rotateX: 0 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1 relative rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-6 lg:p-10 shadow-2xl"
          style={{ perspective: "1000px" }}
        >
          {/* Floating Particles */}
          <div className="absolute inset-0 z-0 overflow-hidden">
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
              <span>/src (Generated)</span>
            </div>

            {/* Tree Animation */}
            {[
              {
                name: "controllers",
                type: "folder",
                depth: 1,
                color: "text-blue-400",
              },
              {
                name: "authController.ts",
                type: "file",
                depth: 2,
                color: "text-slate-300",
              },
              {
                name: "userController.ts",
                type: "file",
                depth: 2,
                color: "text-green-300",
              }, // New file
              {
                name: "models",
                type: "folder",
                depth: 1,
                color: "text-blue-400",
              },
              {
                name: "User.ts",
                type: "file",
                depth: 2,
                color: "text-slate-300",
              },
              {
                name: "routes",
                type: "folder",
                depth: 1,
                color: "text-blue-400",
              },
              {
                name: "api.ts",
                type: "file",
                depth: 2,
                color: "text-slate-300",
              },
              {
                name: "utils",
                type: "folder",
                depth: 1,
                color: "text-blue-400",
              },
              {
                name: "s3Helper.ts",
                type: "file",
                depth: 2,
                color: "text-green-300",
              }, // New file
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
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
        </motion.div>

        {/* Text Content */}
        <div className="order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-green-300 text-xs font-bold uppercase tracking-wider">
            <LayoutTemplate className="w-3 h-3" /> Full Scaffolding
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
            Don't just write functions. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              Generate Architectures.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Snippet generation is the past. DevDialogue can understand your
            intent and generate entire{" "}
            <strong className="text-white">File Trees</strong>. It creates
            folders, separates concerns (Controllers, Models, Routes), and links
            them automatically.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-white/5 text-sm text-slate-300">
            <span className="text-cyan-400 font-bold">@ai</span> create a CRUD
            backend structure for a blog app with Authentication.
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 🚀 FEATURE 3: LIVE EXECUTION ENVIRONMENT
// ==========================================
const ExecutionSection = () => {
  return (
    <section className="py-32 relative bg-[#020617] border-t border-white/5 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Text */}
        <div className="space-y-6">
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
            <strong className="text-white">Execute</strong> it instantly. Need
            changes? Edit the code directly in the generated block.
          </p>
          <button className="flex items-center gap-2 text-pink-400 font-bold hover:gap-3 transition-all">
            Try the Sandbox <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Visual: IDE Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-white/10 bg-[#1e1e2e] shadow-2xl overflow-hidden font-mono text-sm"
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#181825]">
            <div className="flex gap-4">
              <span className="text-xs text-slate-400 px-2 py-1 bg-white/5 rounded">
                script.js
              </span>
              <span className="text-xs text-slate-500 px-2 py-1">
                output.log
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded hover:bg-green-500/20 transition-colors border border-green-500/20">
                <Play className="w-3 h-3 fill-current" /> RUN
              </button>
            </div>
          </div>

          {/* Editor & Terminal Split */}
          <div className="grid grid-rows-2 h-[350px]">
            {/* Code Editor (Top) */}
            <div className="p-4 text-slate-300 border-b border-white/5 bg-[#1e1e2e] overflow-hidden">
              <div className="flex">
                <div className="flex flex-col text-slate-600 mr-4 select-none">
                  {/* Line Numbers */}
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
                <div className="leading-relaxed">
                  <span className="text-pink-400">function</span>{" "}
                  <span className="text-blue-400">calculateLoad</span>(users){" "}
                  {"{"}
                  <br />
                  &nbsp;&nbsp;<span className="text-pink-400">const</span>{" "}
                  active = users.<span className="text-blue-400">filter</span>(u
                  ={">"} u.isActive);
                  <br />
                  &nbsp;&nbsp;
                  <span className="text-slate-500">
                    // User can edit this line manually
                  </span>
                  <br />
                  &nbsp;&nbsp;<span className="text-pink-400">return</span>{" "}
                  active.length * <span className="text-orange-400">1.5</span>;
                  <br />
                  {"}"}
                  <br />
                  <span className="text-blue-400">console</span>.log(
                  <span className="text-green-400">"Load:"</span>,
                  calculateLoad(data));
                </div>
              </div>
            </div>

            {/* Terminal Output (Bottom) */}
            <div className="bg-[#11111b] p-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Terminal className="w-3 h-3" />
                <span>Console Output</span>
              </div>
              <div className="space-y-1">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-300"
                >
                  {">"} node script.js
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="text-green-400"
                >
                  Load: 450.5
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-slate-500"
                >
                  Process exited with code 0
                </motion.div>
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-4 bg-slate-500 mt-1"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ==========================================
// 🦶 CTA & FOOTER
// ==========================================
const Footer = () => (
  <footer className="border-t border-white/10 bg-[#020617] pt-20 pb-10 px-6 relative overflow-hidden">
    {/* Background Mesh */}
    <div
      className="absolute inset-0 z-0 opacity-10"
      style={{
        backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    />

    <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">
      <h2 className="text-5xl font-extrabold mb-8 tracking-tight">
        Stop switching context. <br /> Start shipping.
      </h2>
      <button className="bg-white text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)] mb-20">
        Get Early Access
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-8 text-left border-t border-white/10 pt-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-violet-600 rounded flex items-center justify-center">
              <Terminal className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-xl">DevDialogue</span>
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
                Manifesto
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-400">
                Collaboration
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-400">
                Security
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
                Changelog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-cyan-400">
                Community Discord
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

      <div className="mt-12 w-full flex justify-between items-center text-xs text-slate-600">
        <p>© 2024 DevDialogue Inc.</p>
        <div className="flex gap-4">
          <Github className="w-4 h-4 hover:text-white cursor-pointer" />
          <Twitter className="w-4 h-4 hover:text-white cursor-pointer" />
          <Disc className="w-4 h-4 hover:text-white cursor-pointer" />
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
      <HeroSection />
      <TechMarquee />
      <NeuralChatSection />
      <FileTreeSection />
      <ExecutionSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
