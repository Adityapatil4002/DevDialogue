import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Code2,
  MessageSquare,
  Play,
  ArrowRight,
  Zap,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility for clean classes ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Animated Grid Background Component ---
const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dark Base */}
      <div className="absolute inset-0 bg-[#020617]" />

      {/* Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(to right, #4f46e5 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Moving Vertical Beams */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`v-${i}`}
          initial={{ top: "-10%", left: `${20 + i * 30}%`, opacity: 0 }}
          animate={{ top: "120%", opacity: [0, 1, 0] }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "linear",
            delay: i * 2,
          }}
          className="absolute w-[1px] h-[40%] bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-[1px]"
        />
      ))}

      {/* Moving Horizontal Beams */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`h-${i}`}
          initial={{ left: "-10%", top: `${30 + i * 20}%`, opacity: 0 }}
          animate={{ left: "120%", opacity: [0, 1, 0] }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "linear",
            delay: i * 1.5,
          }}
          className="absolute h-[1px] w-[40%] bg-gradient-to-r from-transparent via-purple-400 to-transparent blur-[1px]"
        />
      ))}

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-[#020617]/80" />
    </div>
  );
};

// --- Mock Data ---
const cards = [
  {
    id: 1,
    type: "chat",
    title: "Chat Interface",
    color: "blue",
    icon: <MessageSquare className="w-4 h-4 text-blue-400" />,
    content: (
      <div className="space-y-4 font-mono text-xs">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shadow-lg border border-slate-600">
            <span className="text-white font-bold text-[10px]">YOU</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-2xl rounded-tl-none border border-slate-700 shadow-sm backdrop-blur-sm text-slate-300">
            <span className="text-blue-400 font-bold glow-text">@ai</span>{" "}
            create a scraping script for{" "}
            <span className="text-white">finance_data</span>
          </div>
        </div>
        <div className="flex gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg border border-indigo-500 shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="bg-indigo-950/50 border border-indigo-500/30 p-3 rounded-2xl rounded-tr-none text-indigo-200 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Processing request...
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    type: "code",
    title: "Code Generation",
    color: "purple",
    icon: <Code2 className="w-4 h-4 text-purple-400" />,
    content: (
      <div className="font-mono text-[10px] leading-relaxed text-slate-400 relative">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <span className="text-purple-300">scraper.py</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            PYTHON
          </span>
        </div>
        <div className="opacity-90">
          <p>
            <span className="text-pink-400">import</span> pandas{" "}
            <span className="text-pink-400">as</span> pd
          </p>
          <p>
            <span className="text-pink-400">import</span> requests
          </p>
          <p className="h-2"></p>
          <p>
            <span className="text-blue-400">def</span>{" "}
            <span className="text-yellow-300">fetch_data</span>():
          </p>
          <p className="pl-4">
            url ={" "}
            <span className="text-green-400">"https://api.finance..."</span>
          </p>
          <p className="pl-4">res = requests.get(url)</p>
          <p className="pl-4">
            <span className="text-pink-400">return</span> pd.DataFrame(res)
            <span className="animate-pulse w-1.5 h-3 bg-white inline-block ml-0.5 align-middle"></span>
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    type: "terminal",
    title: "Live Execution",
    color: "green",
    icon: <Terminal className="w-4 h-4 text-green-400" />,
    content: (
      <div className="font-mono text-xs text-slate-300 h-full flex flex-col">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
          <span className="ml-auto text-[9px] text-slate-500">bash</span>
        </div>
        <div className="space-y-1">
          <p className="text-green-400 flex items-center gap-2">
            <span className="text-slate-500">$</span> python scraper.py
          </p>
          <p className="text-slate-400 text-[10px] italic">
            {" "}
            Installing dependencies...
          </p>
          <div className="mt-2 p-2 bg-black/40 rounded border border-white/5 text-[10px]">
            <p className="text-white">Success! Dataframe created.</p>
            <p className="text-slate-400">Rows: 1,402 | Cols: 12</p>
          </div>
          <p className="text-green-400 mt-2">✨ Done in 1.2s</p>
        </div>
      </div>
    ),
  },
];

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Faster Cycle: 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const getCardStyle = (index) => {
    const position = (index - activeIndex + cards.length) % cards.length;

    // Position 0 = Front
    if (position === 0) {
      return {
        zIndex: 30,
        y: 0,
        scale: 1,
        opacity: 1,
        rotateX: 0,
        filter: "blur(0px) brightness(1)",
        boxShadow: "0 20px 50px -10px rgba(0,0,0,0.6)",
      };
    }
    // Position 1 = Middle
    if (position === 1) {
      return {
        zIndex: 20,
        y: -40,
        scale: 0.9,
        opacity: 0.7,
        rotateX: 5,
        filter: "blur(2px) brightness(0.7)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
      };
    }
    // Position 2 = Back
    return {
      zIndex: 10,
      y: -80,
      scale: 0.8,
      opacity: 0.4,
      rotateX: 10,
      filter: "blur(4px) brightness(0.5)",
      boxShadow: "none",
    };
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-hidden relative selection:bg-indigo-500/30">
      <AnimatedGrid />

      {/* --- Navbar --- */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center"
      >
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-slate-800 to-black border border-slate-700 rounded-xl flex items-center justify-center">
              <Terminal className="text-indigo-400 w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            DevDialogue
          </span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          {["Features", "Docs", "Pricing", "Blog"].map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-white transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-500 transition-all group-hover:w-full"></span>
            </a>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block">
            Log in
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
          >
            Start Building
          </motion.button>
        </div>
      </motion.nav>

      {/* --- Main Content --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 lg:pt-24 pb-32 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* --- Left Side: Copy --- */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            <Zap className="w-3 h-3 fill-indigo-300" />
            <span>AI Native Development Environment</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-5xl lg:text-7xl font-bold leading-[1.1] text-white tracking-tight"
          >
            Turn Conversation <br />
            into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
              Execution.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
          >
            Why just chat when you can deploy?{" "}
            <strong className="text-indigo-300">DevDialogue</strong> allows you
            to prompt{" "}
            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white font-mono text-sm">
              @ai
            </span>{" "}
            to generate scripts, create files, and{" "}
            <span className="text-white border-b border-indigo-500 border-dashed">
              run backend code
            </span>{" "}
            directly from the interface.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
              Start for free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl font-bold text-white border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats / Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="pt-8 border-t border-white/5 flex gap-8 justify-center lg:justify-start"
          >
            <div>
              <p className="text-2xl font-bold text-white">10k+</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">
                Developers
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1.2s</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">
                Latency
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest">
                Uptime
              </p>
            </div>
          </motion.div>
        </div>

        {/* --- Right Side: The Supercharged Card Animation --- */}
        <div className="flex-1 w-full flex justify-center lg:justify-end relative h-[600px] items-center perspective-[2000px]">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>

          <div className="relative w-full max-w-[420px] h-[280px]">
            <AnimatePresence>
              {cards.map((card, index) => {
                const style = getCardStyle(index);

                return (
                  <motion.div
                    key={card.id}
                    initial={false}
                    animate={style}
                    transition={{
                      duration: 0.6,
                      ease: [0.23, 1, 0.32, 1], // Custom cubic-bezier for "snappy" feel
                      type: "spring",
                      stiffness: 150,
                      damping: 20,
                    }}
                    className={cn(
                      "absolute inset-0 rounded-2xl border bg-[#0f172a] overflow-hidden",
                      card.color === "blue" &&
                        "border-blue-500/30 shadow-blue-900/20",
                      card.color === "purple" &&
                        "border-purple-500/30 shadow-purple-900/20",
                      card.color === "green" &&
                        "border-green-500/30 shadow-green-900/20"
                    )}
                    style={{
                      transformOrigin: "top center",
                    }}
                  >
                    {/* Glossy Header */}
                    <div className="h-10 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between px-4">
                      <div className="flex items-center gap-2">
                        {card.icon}
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          {card.title}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {/* Fake window controls */}
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50"></div>
                      </div>
                    </div>

                    {/* Card Content with subtle inner glow */}
                    <div className="p-6 h-full relative bg-gradient-to-b from-transparent to-black/40">
                      {card.content}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Floating Status Indicator next to cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -right-12 top-10 hidden xl:flex flex-col gap-2"
            >
              {["Input", "Generate", "Run"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      backgroundColor:
                        activeIndex === i ? "#818cf8" : "#334155",
                      scale: activeIndex === i ? 1.2 : 1,
                    }}
                    className="w-2 h-2 rounded-full"
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      activeIndex === i ? "text-indigo-400" : "text-slate-600"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeroSection;
