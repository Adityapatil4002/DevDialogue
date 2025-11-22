import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- 🌌 NEW BACKGROUND: Meteor Star Field ---
const MeteorBackground = () => {
  // Generate static stars
  const stars = [...Array(40)].map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020617] pointer-events-none">
      {/* Radial Gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#020617] to-[#020617] opacity-60"></div>

      {/* Twinkling Stars */}
      {stars.map((star, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
          }}
        />
      ))}

      {/* Shooting Meteors (Data Beams) */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`meteor-${i}`}
          initial={{ top: -100, left: "100%", opacity: 0 }}
          animate={{ top: "100%", left: "-20%", opacity: [0, 1, 0] }}
          transition={{
            duration: Math.random() * 2 + 2, // Random speed between 2-4s
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
          className="absolute w-[300px] h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -rotate-45"
          style={{
            boxShadow: "0 0 20px 2px rgba(34, 211, 238, 0.3)",
          }}
        />
      ))}
    </div>
  );
};

// --- 1️⃣ ANIMATION: Chat Interface ---
const ChatCardContent = ({ isActive }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isActive) {
      setStep(0);
      const t1 = setTimeout(() => setStep(1), 300); // User msg
      const t2 = setTimeout(() => setStep(2), 1000); // AI Thinking
      const t3 = setTimeout(() => setStep(3), 2500); // AI Reply
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
      {/* User Msg */}
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

      {/* AI Response */}
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
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
              />
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
              />
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

// --- 2️⃣ ANIMATION: Code Typing ---
const CodeCardContent = ({ isActive }) => {
  const [visibleLines, setVisibleLines] = useState(0);

  // The code lines to display
  const lines = [
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
  ];

  useEffect(() => {
    if (isActive) {
      setVisibleLines(0);
      // Fast typing effect: reveal one line every 300ms
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
  }, [isActive]);

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
            {/* Blinking Cursor on the last visible line */}
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

// --- 3️⃣ ANIMATION: Terminal Execution ---
const TerminalCardContent = ({ isActive }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (isActive) {
      setLogs([]);
      // Sequence of logs
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
        ))}
        {/* Blinking cursor at the bottom */}
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

// --- MAIN COMPONENT ---
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

  // Mouse Spotlight Logic
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

  // Cycle cards every 4 seconds (Enough time for animations to finish)
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
      className="min-h-screen bg-[#020617] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 group"
      onMouseMove={handleMouseMove}
    >
      {/* New Meteor Background */}
      <MeteorBackground />

      {/* Cursor Spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at var(--x) var(--y), rgba(34, 211, 238, 0.08), transparent 40%)`,
        }}
      >
        <motion.div
          className="w-full h-full"
          style={{ "--x": springX, "--y": springY }}
        />
      </motion.div>

      {/* Navbar (Tight spacing: py-4) */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Terminal className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            DevDialogue
          </span>
        </motion.div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          {["Features", "Docs", "Pricing"].map((item) => (
            <motion.a
              key={item}
              href="#"
              whileHover={{ scale: 1.05, color: "#fff" }}
              whileTap={{ scale: 0.95 }}
              className="hover:text-cyan-400 transition-colors"
            >
              {item}
            </motion.a>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="text-sm font-medium text-slate-300 hover:text-white hidden sm:block"
          >
            Log in
          </motion.a>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(34,211,238,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-cyan-500 text-black px-5 py-2 rounded-lg text-sm font-bold hover:bg-cyan-400 transition-all"
          >
            Get Started
          </motion.button>
        </div>
      </nav>

      {/* Main Content (Tight spacing: pt-8) */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8 lg:pt-12 pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Left Text */}
        <div className="flex-1 text-center lg:text-left space-y-6">
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
            className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-white tracking-tight"
          >
            Turn Conversation <br />
            into{" "}
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
            production-ready code, create files, and{" "}
            <span className="text-white border-b border-cyan-500 border-dashed">
              run backend logic
            </span>{" "}
            in real-time.
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(139,92,246,0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              Start Building
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(30, 41, 59, 0.8)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl font-bold text-slate-200 border border-slate-700 bg-slate-900/50 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              View Demo
            </motion.button>
          </div>
        </div>

        {/* Right Animated Cards */}
        <div className="flex-1 w-full flex justify-center lg:justify-end relative h-[650px] items-center perspective-[2000px]">
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[600px] h-[600px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative w-full max-w-[500px] h-[350px]">
            <AnimatePresence>
              {cards.map((card, index) => {
                const style = getCardStyle(index);
                const isCurrent = index === activeIndex;

                return (
                  <motion.div
                    key={card.id}
                    initial={false}
                    animate={style}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                    className={cn(
                      "absolute inset-0 rounded-2xl border bg-[#0B1120] overflow-hidden",
                      card.theme === "cyan" && "border-cyan-500/30",
                      card.theme === "violet" && "border-violet-500/30",
                      card.theme === "green" && "border-green-500/30"
                    )}
                    style={{ transformOrigin: "top center" }}
                  >
                    <div className="h-11 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between px-5">
                      <div className="flex items-center gap-3">
                        {card.icon}
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          {card.title}
                        </span>
                      </div>
                      <div className="flex gap-2 opacity-50">
                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                      </div>
                    </div>

                    <div className="p-6 h-full bg-gradient-to-b from-transparent to-[#000000]/50">
                      {/* CONDITIONAL CONTENT RENDERING BASED ON TYPE */}
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

            {/* Steps Indicators */}
            <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-8 z-0">
              {["Input", "Generate", "Run"].map((step, i) => {
                const isActive = activeIndex === i;
                return (
                  <div
                    key={step}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                    onClick={() => setActiveIndex(i)}
                  >
                    <div className="relative">
                      {isActive && (
                        <motion.div
                          layoutId="activeGlow"
                          className="absolute inset-0 bg-cyan-500 blur-md opacity-50 rounded-full"
                        />
                      )}
                      <motion.div
                        animate={{
                          backgroundColor: isActive ? "#22d3ee" : "#1e293b",
                          scale: isActive ? 1.2 : 1,
                        }}
                        className="w-3 h-3 rounded-full relative z-10 border border-slate-700"
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest transition-colors",
                        isActive ? "text-cyan-400" : "text-slate-600"
                      )}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeroSection;
