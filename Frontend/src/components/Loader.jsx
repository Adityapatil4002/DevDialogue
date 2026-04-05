import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const loadingSteps = [
  "Initializing runtime...",
  "Mounting file system...",
  "Connecting socket mesh...",
  "Awakening AI core...",
  "Preparing environment...",
];

const Loader = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev,
      );
    }, 800);
    return () => clearInterval(timer);
  }, []);

  const progress = ((currentStep + 1) / loadingSteps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] text-white font-sans overflow-hidden"
    >
      {/* SPINNER */}
      <div className="relative w-10 h-10 mb-8">
        <motion.div
          className="absolute inset-0 border border-white/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-t border-white/60"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-[3px] h-[3px] bg-white"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* STATUS BLOCK */}
      <div className="w-[260px] flex flex-col gap-4">
        {/* Step text */}
        <div className="h-5 flex items-center">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <span className="text-[10px] font-mono text-[#444] tabular-nums flex-shrink-0">
              {String(currentStep + 1).padStart(2, "0")}
            </span>
            <span className="w-px h-3 bg-[#222] flex-shrink-0" />
            <span className="text-[10px] font-mono text-[#666] tracking-wide">
              {loadingSteps[currentStep]}
            </span>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="relative h-px w-full bg-[#1a1a1a] overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-white"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            animate={{ x: ["-2.5rem", "260px"] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 0.3,
            }}
          />
        </div>

        {/* Segmented step indicators */}
        <div className="flex items-center gap-[5px]">
          {loadingSteps.map((_, i) => (
            <div
              key={i}
              className="h-px flex-1 bg-[#1a1a1a] relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i <= currentStep ? 1 : 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                  delay: i * 0.04,
                }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-[#333] tracking-[0.16em] uppercase">
            system init
          </span>
          <motion.span
            key={Math.round(progress)}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[9px] font-mono text-[#444] tabular-nums"
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
