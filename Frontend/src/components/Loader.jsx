import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const loadingSteps = [
  { text: "Initializing runtime", detail: "booting kernel" },
  { text: "Mounting file system", detail: "indexing modules" },
  { text: "Connecting socket mesh", detail: "handshake complete" },
  { text: "Awakening AI core", detail: "neural warmup" },
  { text: "Preparing environment", detail: "finalizing" },
];

/* ───────── Noise ───────── */
const NoiseBG = () => (
  <svg className="pointer-events-none fixed inset-0 z-0 w-full h-full opacity-[0.025]">
    <filter id="loaderNoise">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.9"
        numOctaves="4"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#loaderNoise)" />
  </svg>
);

const Loader = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev,
      );
    }, 800);
    return () => clearInterval(timer);
  }, []);

  // Tick for the animated hex/bytes stream
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 90);
    return () => clearInterval(t);
  }, []);

  const progress = ((currentStep + 1) / loadingSteps.length) * 100;

  // Random-ish hex stream (deterministic per tick so React stays stable)
  const hexStream = Array.from({ length: 14 }, (_, i) => {
    const n = (tick * 7 + i * 31) % 255;
    return n.toString(16).padStart(2, "0").toUpperCase();
  }).join(" ");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white font-sans overflow-hidden"
    >
      <NoiseBG />

      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.015] blur-[80px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* ─── CENTER ORB ─── */}
        <div className="relative w-24 h-24 mb-10">
          {/* Outer rotating ring with gradient dash */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="60 230"
            />
          </motion.svg>

          {/* Middle counter-rotating ring */}
          <motion.svg
            className="absolute inset-[10px] w-[calc(100%-20px)] h-[calc(100%-20px)]"
            viewBox="0 0 100 100"
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </motion.svg>

          {/* Inner progress ring */}
          <svg
            className="absolute inset-[18px] w-[calc(100%-36px)] h-[calc(100%-36px)] -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="276"
              initial={{ strokeDashoffset: 276 }}
              animate={{ strokeDashoffset: 276 - (276 * progress) / 100 }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.4))" }}
            />
          </svg>

          {/* Center pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative flex items-center justify-center"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute w-10 h-10 rounded-full bg-white/5"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <span className="text-[8px] font-black tracking-wider text-black">
                  DD
                </span>
              </div>
            </motion.div>
          </div>

          {/* Orbiting dots */}
          {[0, 120, 240].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-full h-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
              }}
            >
              <motion.div
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* ─── STATUS CARD ─── */}
        <div className="w-[320px] bg-[#0a0a0a]/60 border border-white/[0.06] rounded-2xl p-5 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400/80" />
              </span>
              <span className="text-[9px] font-medium tracking-[0.16em] uppercase text-white/40">
                System Boot
              </span>
            </div>
            <motion.span
              key={Math.round(progress)}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] font-mono text-white/70 tabular-nums font-semibold"
            >
              {Math.round(progress)}%
            </motion.span>
          </div>

          {/* Current step */}
          <div className="h-10 flex items-center mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                className="flex items-center gap-3 w-full"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-mono text-white/70 tabular-nums">
                    {String(currentStep + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[12px] text-white/85 font-medium truncate">
                    {loadingSteps[currentStep].text}
                  </span>
                  <span className="text-[10px] font-mono text-white/30 truncate">
                    {loadingSteps[currentStep].detail}
                  </span>
                </div>
                {/* Mini spinner */}
                <motion.div
                  className="w-3 h-3 rounded-full border border-white/15 border-t-white/70 flex-shrink-0"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Main progress bar */}
          <div className="relative h-[3px] w-full bg-white/[0.05] rounded-full overflow-hidden mb-4">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/70 to-white rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              style={{ boxShadow: "0 0 8px rgba(255,255,255,0.4)" }}
            />
            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ["-4rem", "320px"] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 0.3,
              }}
            />
          </div>

          {/* Segmented step dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {loadingSteps.map((_, i) => {
              const active = i <= currentStep;
              const current = i === currentStep;
              return (
                <div key={i} className="flex-1 relative">
                  <div className="h-[2px] w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: active ? 1 : 0 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.25, 1, 0.5, 1],
                        delay: i * 0.04,
                      }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                  {current && (
                    <motion.div
                      className="absolute -top-[1px] left-0 right-0 h-[4px] bg-white/40 rounded-full blur-sm"
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Hex data stream (live-feeling) */}
          <div className="relative h-[18px] overflow-hidden rounded-md bg-white/[0.02] border border-white/[0.04] px-2.5 flex items-center">
            <motion.div
              key={tick}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.1 }}
              className="text-[9px] font-mono text-white/35 tracking-wider whitespace-nowrap tabular-nums"
            >
              0x{hexStream}
            </motion.div>
            {/* Fade right edge */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* ─── BRANDING FOOTER ─── */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 flex items-center gap-2 text-[9px] font-mono text-white/20 tracking-[0.18em] uppercase"
        >
          <span>DevDialogue</span>
          <span className="text-white/10">·</span>
          <span>v1.0</span>
          <span className="text-white/10">·</span>
          <motion.span
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            loading
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Loader;
