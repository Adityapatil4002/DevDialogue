import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Cpu, Network, Terminal, Sparkles } from "lucide-react";

const Loader = () => {
  const [currentStep, setCurrentStep] = useState(0);

  // Loading steps tailored to your Project's Tech Stack
  const loadingSteps = [
    {
      text: "Initializing WebContainer Runtime...",
      icon: <Terminal size={14} />,
    },
    { text: "Mounting Virtual File System...", icon: <Code2 size={14} /> },
    { text: "Connecting to Socket.io Mesh...", icon: <Network size={14} /> },
    { text: "Awakening Gemini 2.0 Flash...", icon: <Sparkles size={14} /> },
    { text: "Optimizing DevDialogue Environment...", icon: <Cpu size={14} /> },
  ];

  useEffect(() => {
    // Cycle through the loading steps
    const timer = setInterval(() => {
      setCurrentStep((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev
      );
    }, 800); // Change text every 800ms

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617] text-white font-sans overflow-hidden"
    >
      {/* --- BACKGROUND EFFECTS --- */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* --- CENTER PIECE: THE "CORE" --- */}
      <div className="relative flex items-center justify-center w-40 h-40 mb-12">
        {/* 1. Outer Tech Ring (Dashed) */}
        <motion.svg
          className="absolute w-full h-full text-slate-700"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity }}
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        </motion.svg>

        {/* 2. Middle Energy Ring (Cyan/Violet Gradient) */}
        <motion.div
          className="absolute w-32 h-32 rounded-full border-2 border-transparent border-t-cyan-500 border-l-violet-500"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          style={{ filter: "drop-shadow(0 0 8px rgba(6,182,212,0.5))" }}
        />

        {/* 3. Inner Pulsing Circle */}
        <motion.div
          className="absolute w-24 h-24 rounded-full border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* 4. Central Icon (Code Brackets) */}
        <motion.div
          className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-violet-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Code2
            size={48}
            className="text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          />
        </motion.div>
      </div>

      {/* --- LOADING STATUS (TERMINAL STYLE) --- */}
      <div className="w-[320px] relative z-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-2 px-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            DevDialogue
          </h2>
          <span className="text-xs font-mono text-cyan-500/80 animate-pulse">
            v2.0.0
          </span>
        </div>

        {/* Glassmorphic Status Bar */}
        <div className="relative overflow-hidden bg-slate-900/50 border border-slate-700/50 rounded-lg backdrop-blur-md p-4 shadow-2xl">
          {/* Scanline overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none bg-[length:100%_4px]" />

          <div className="flex flex-col space-y-3">
            {/* Progress Bar */}
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                initial={{ width: "0%" }}
                animate={{
                  width: `${((currentStep + 1) / loadingSteps.length) * 100}%`,
                }}
                transition={{ ease: "easeInOut" }}
              />
            </div>

            {/* Dynamic Text Output */}
            <div className="h-6 flex items-center space-x-2 text-sm font-mono text-slate-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-cyan-400">
                    {loadingSteps[currentStep].icon}
                  </span>
                  <span>{loadingSteps[currentStep].text}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Decorative System ID */}
        <div className="mt-3 text-center">
          <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
            System Ready //{" "}
            <span className="text-violet-500/70">Waiting for Input</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
