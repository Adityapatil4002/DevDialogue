import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../Context/user.context";
import axios from "../Config/axios";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// --- GLOW CARD COMPONENT ---
const GlowCard = ({ children, className = "", onClick }) => {
  return (
    <motion.div
      variants={itemVariants}
      // --- HOVER PHYSICS UPDATE ---
      // Reduced scale slightly (1.015) so it doesn't jump too much
      whileHover={{ y: -4, scale: 1.015 }}
      // Stiffness: 100 (Was 300) -> Makes it softer/slower
      // Damping: 15 -> Removes the "bounciness" for a smooth float
      transition={{ type: "spring", stiffness: 100, damping: 15, mass: 1 }}
      onClick={onClick}
      // Changed duration-500 to duration-700 for slower color fade
      className={`relative rounded-[2rem] border border-[#1a1f2e] bg-[#0f131a] p-6 overflow-hidden cursor-pointer group z-20
                 hover:border-cyan-500/50 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:bg-[#141820]
                 transition-all duration-700 ease-out
                 ${className}`}
    >
      {/* Noise texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
      <div className="relative h-full z-10 flex flex-col">{children}</div>
    </motion.div>
  );
};

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  // --- MOUSE FOLLOWER LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoother trailing effect (increased damping)
  const springConfig = { damping: 35, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // --- API LOGIC ---
  function createProject(e) {
    e.preventDefault();
    axios
      .post("/project/create", { name: projectName })
      .then((res) => {
        setProject((prevProjects) => [...prevProjects, res.data]);
        setIsModalOpen(false);
        setProjectName("");
      })
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    axios
      .get("/project/all")
      .then((res) => setProject(res.data.projects))
      .catch((err) => console.log(err));
  }, []);

  const collaborators = [
    { name: "Dev_Alex", status: "online" },
    { name: "CodeMaster", status: "busy" },
    { name: "Sarah_JS", status: "offline" },
    { name: "React_Pro", status: "online" },
    { name: "Backend_Guy", status: "busy" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans selection:bg-cyan-500/30 flex items-center justify-center overflow-hidden relative">
      {/* --- GLOBAL CURSOR FOLLOWER (The "Flashlight") --- */}
      <motion.div
        style={{
          left: smoothX,
          top: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="fixed pointer-events-none w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[80px] z-0"
      />

      {/* Static Background Ambiance */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/05 rounded-full blur-[150px]" />
      </div>

      {/* --- Main Grid --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[80rem] h-[85vh] grid grid-cols-1 md:grid-cols-4 grid-rows-6 gap-4 md:gap-6"
      >
        {/* 1. New Project */}
        <GlowCard
          className="col-span-1 row-span-2 group"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="h-full flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a1f2e] flex items-center justify-center mb-4 border border-[#2a3040] group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-colors duration-500">
              <i className="ri-add-line text-3xl text-neutral-400 group-hover:text-cyan-400 transition-colors duration-500"></i>
            </div>
            <h2 className="text-xl font-bold text-neutral-200 group-hover:text-white transition-colors duration-500">
              Create Project
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              Start a new collaborative workspace.
            </p>
          </div>
        </GlowCard>

        {/* 2. AI Credits */}
        <GlowCard className="col-span-1 row-span-2 justify-between">
          <div className="flex justify-between items-start">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
              AI Credits
            </h2>
            <i className="ri-flashlight-fill text-cyan-400 text-lg shadow-[0_0_15px_rgba(6,182,212,0.6)]"></i>
          </div>
          <div className="space-y-4 mt-auto">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-mono font-bold text-white tracking-tighter">
                2,450
              </span>
            </div>
            <div className="w-full bg-[#1a1f2e] h-2 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "45%" }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600"
              ></motion.div>
            </div>
            <span className="text-xs text-neutral-500">
              45% used of 5,000 total quota.
            </span>
          </div>
        </GlowCard>

        {/* 3. Collaborators */}
        <GlowCard className="col-span-1 md:col-span-2 row-span-4 overflow-hidden">
          <div className="flex justify-between items-center mb-6 z-10 relative">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Team Members
              </h2>
              <p className="text-xs text-neutral-500">Active contributors</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 rounded-full text-xs font-medium text-cyan-400 border border-cyan-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Live Info
            </span>
          </div>

          <div className="relative flex-1 overflow-hidden -mx-6 px-6 mask-gradient-vertical">
            <motion.div
              animate={{ y: ["0%", "-33.33%"] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="space-y-2"
            >
              {[...collaborators, ...collaborators, ...collaborators].map(
                (user, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#141820] border border-[#1f2533] hover:bg-[#1a1f2e] hover:border-cyan-500/30 transition-all duration-200 group/item"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-[#0a0a0a] border border-[#2a3040] flex items-center justify-center text-sm font-bold text-neutral-300 group-hover/item:text-cyan-400 transition-colors">
                        {user.name[0]}
                      </div>
                      {user.status === "online" && (
                        <div className="absolute bottom-0 right-0">
                          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#141820]"></span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-200 group-hover/item:text-white">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 uppercase tracking-wider mt-0.5 font-medium">
                        {user.status}
                      </div>
                    </div>
                    <i className="ri-more-2-fill text-neutral-600 opacity-0 group-hover/item:opacity-100 transition-opacity"></i>
                  </div>
                )
              )}
            </motion.div>
          </div>
        </GlowCard>

        {/* 4. Projects List */}
        <GlowCard className="col-span-1 md:col-span-2 row-span-4 relative overflow-hidden">
          <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Projects</h2>
              <p className="text-sm text-neutral-500">
                Recent activity & deployments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar relative z-10 -mx-2 px-2">
            {project.map((proj) => (
              <div
                key={proj._id}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/project/${proj._id}`);
                }}
                className="group/project relative p-4 rounded-xl bg-[#141820] border border-[#1f2533] cursor-pointer hover:bg-[#1a1f2e] overflow-hidden transition-all duration-300 hover:border-cyan-500/30"
              >
                <div className="relative z-10 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1f2533] flex items-center justify-center text-neutral-400 group-hover/project:text-cyan-400 group-hover/project:bg-cyan-500/10 transition-all">
                      <i className="ri-code-s-slash-line text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-200 group-hover/project:text-white transition-colors mb-1">
                        {proj.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
                        <span className="flex items-center gap-1 bg-[#1f2533] px-2 py-0.5 rounded-md">
                          <i className="ri-user-line"></i> {proj.users.length}
                        </span>
                        <span>Updated just now</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-0 -translate-x-4 group-hover/project:opacity-100 group-hover/project:translate-x-0 transition-all duration-300 bg-[#1f2533] text-cyan-400">
                    <i className="ri-arrow-right-line text-lg"></i>
                  </div>
                </div>
              </div>
            ))}

            {project.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-600 border-2 border-dashed border-[#1f2533] rounded-2xl bg-[#141820]/50">
                <i className="ri-folder-add-line text-4xl mb-3 opacity-50"></i>
                <p className="text-base font-medium">No active projects</p>
                <p className="text-sm opacity-70">Create one to get started.</p>
              </div>
            )}
          </div>
        </GlowCard>

        {/* 5. System Status */}
        <GlowCard className="col-span-1 row-span-2 justify-center relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
          <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-4">
            System Status
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
            </div>
            <span className="text-white font-bold text-xl">Operational</span>
          </div>
          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono border-t border-[#1f2533] pt-4">
            <span>API LATENCY</span>
            <span className="text-emerald-400 font-bold">24ms • Stable</span>
          </div>
        </GlowCard>

        {/* 6. User Profile */}
        <GlowCard className="col-span-1 row-span-2 justify-between text-center">
          <div className="flex flex-col items-center mt-4">
            <div className="relative mb-4 group/avatar">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[3px] shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover/avatar:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-shadow duration-500">
                <div className="w-full h-full rounded-full bg-[#0f131a] flex items-center justify-center overflow-hidden">
                  <i className="ri-user-3-fill text-4xl text-neutral-200"></i>
                </div>
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#0f131a] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f131a]"></div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white truncate w-full">
              {user?.email?.split("@")[0] || "Developer"}
            </h3>
            <p className="text-sm text-cyan-400 font-medium mb-2">
              Pro Workspace
            </p>
          </div>

          <button className="w-full py-3 rounded-xl bg-[#1a1f2e] hover:bg-[#2a3040] text-white text-sm font-medium transition-colors border border-[#2a3040] hover:border-cyan-500/30 flex items-center justify-center gap-2">
            <i className="ri-settings-3-line"></i>
            View Settings
          </button>
        </GlowCard>
      </motion.div>

      {/* --- Modal (Unchanged) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex justify-center items-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              className="bg-[#0f131a] border border-[#1f2533] w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">New Project</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-[#1a1f2e] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#2a3040] transition-colors"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={createProject}>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-neutral-300 mb-3">
                    Project Name
                  </label>
                  <div className="relative">
                    <i className="ri-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"></i>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full bg-[#141820] border border-[#1f2533] text-white rounded-xl py-4 pl-10 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-neutral-600 text-base font-medium"
                      placeholder="e.g. Quantum Dashboard"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  >
                    <span>Create Project</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .mask-gradient-vertical {
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 10%,
            black 90%,
            transparent 100%
          );
        }
      `}</style>
    </main>
  );
};

export default Home;
