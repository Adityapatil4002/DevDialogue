import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]"
    >
      {/* 1. Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      {/* 2. The Spinner Construction */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer Ring (Slow, Cyan) */}
        <motion.span
          className="absolute w-full h-full border-2 border-cyan-500/20 border-t-cyan-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle Ring (Fast, Blue, Reverse) */}
        <motion.span
          className="absolute w-16 h-16 border-2 border-blue-500/20 border-b-blue-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner Core (Breathing) */}
        <motion.div
          className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.8)]"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 3. Technical Text */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <h3 className="text-white font-bold tracking-[0.3em] text-xs uppercase">
          Initializing
        </h3>
        <div className="flex gap-1">
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            className="w-1 h-1 bg-cyan-500 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            className="w-1 h-1 bg-cyan-500 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            className="w-1 h-1 bg-cyan-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
