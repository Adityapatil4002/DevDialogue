import React, { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../Context/user.context";
import axios from "../Config/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- Refined Spotlight Card ---
// 1. Reduced spotlight intensity (opacity)
// 2. Added hover 'pop' and 'glow' effects
const SpotlightCard = ({ children, className = "", onClick }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      // Entrance Animation
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      // Hover Pop & Glow Animation
      whileHover={{
        scale: 1.015,
        boxShadow: "0px 10px 30px -10px rgba(6, 182, 212, 0.2)",
        borderColor: "rgba(6, 182, 212, 0.3)",
      }}
      className={`relative rounded-3xl border border-neutral-800 bg-neutral-900/50 overflow-hidden cursor-pointer transition-colors duration-300 group z-0 hover:z-10 ${className}`}
    >
      {/* 
         Subtle Spotlight Gradient 
         - Changed opacity from 0.15 to 0.05 for a much softer feel
      */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(6,182,212,0.06), transparent 40%)`,
        }}
      />
      {/* 
         Border Highlight Gradient 
         - Changed opacity from 0.4 to 0.15
      */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(6,182,212,0.15), transparent 40%)`,
        }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
};

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  // --- API Logic ---
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

  // --- Mock Data ---
  const collaborators = [
    { name: "Dev_Alex", status: "online" },
    { name: "CodeMaster", status: "busy" },
    { name: "Sarah_JS", status: "offline" },
    { name: "React_Pro", status: "online" },
    { name: "Backend_Guy", status: "busy" },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6 font-sans selection:bg-cyan-500/30 flex items-center justify-center">
      {/* --- Main Grid --- */}
      <div className="w-full max-w-7xl h-[90vh] grid grid-cols-1 md:grid-cols-4 grid-rows-6 gap-5">
        {/* 1. New Project */}
        <SpotlightCard
          className="col-span-1 row-span-2 flex flex-col justify-between p-6 hover:bg-neutral-900/80"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors duration-300">
            <i className="ri-add-line text-xl text-neutral-400 group-hover:text-cyan-400"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-200">New Project</h2>
            <p className="text-sm text-neutral-500 mt-1 group-hover:text-neutral-400 transition-colors">
              Create a new workspace
            </p>
          </div>
        </SpotlightCard>

        {/* 2. AI Credits */}
        <SpotlightCard className="col-span-1 row-span-2 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-bold text-neutral-200">AI Credits</h2>
            <i className="ri-flashlight-line text-cyan-400"></i>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">2,450</span>
              <span className="text-xs text-neutral-500">/ 5,000</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-cyan-500 h-full w-[45%] shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
            </div>
          </div>
        </SpotlightCard>

        {/* 3. Collaborators (Continuous Scroll) */}
        <SpotlightCard className="col-span-2 row-span-4 p-6 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4 z-10 relative">
            <h2 className="text-xl font-bold text-neutral-200">
              Collaborators
            </h2>
            <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-cyan-400 border border-neutral-700">
              Active Team
            </span>
          </div>

          <div className="relative flex-1 overflow-hidden mask-gradient">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-neutral-900/0 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-neutral-900/0 to-transparent z-10 pointer-events-none"></div>

            <motion.div
              animate={{ y: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="space-y-3"
            >
              {[...collaborators, ...collaborators, ...collaborators].map(
                (user, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/20 border border-neutral-800/50 hover:bg-neutral-800 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-900 to-blue-900 border border-blue-700/30 flex items-center justify-center text-xs font-bold text-cyan-100">
                      {user.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-200">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-1 uppercase tracking-wide">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === "online"
                              ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                              : "bg-neutral-600"
                          }`}
                        ></span>
                        {user.status}
                      </div>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </div>
        </SpotlightCard>

        {/* 4. Projects (Main List) */}
        <SpotlightCard className="col-span-2 row-span-4 p-6 relative overflow-hidden flex flex-col">
          {/* Background Atmosphere */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500 rounded-full blur-[60px]"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-600 rounded-full blur-[60px]"></div>
          </div>

          <h2 className="text-xl font-bold text-neutral-200 mb-6 relative z-10">
            Your Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {project.map((proj) => (
              <div
                key={proj._id}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/project/${proj._id}`);
                }}
                className="group p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 cursor-pointer hover:border-cyan-500/40 hover:bg-neutral-900 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-neutral-200 truncate pr-2 group-hover:text-cyan-400 transition-colors">
                    {proj.name}
                  </h3>
                  <i className="ri-arrow-right-up-line text-neutral-600 group-hover:text-cyan-400 transition-colors"></i>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-4">
                  <div className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 flex items-center gap-1">
                    <i className="ri-user-line text-[10px]"></i>
                    <span>{proj.users.length}</span>
                  </div>
                  <span>Updated recently</span>
                </div>
              </div>
            ))}
            {project.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center h-40 text-neutral-600">
                <i className="ri-code-box-line text-3xl mb-2 opacity-50"></i>
                <p>No active projects</p>
              </div>
            )}
          </div>
        </SpotlightCard>

        {/* 5. Connectivity */}
        <SpotlightCard className="col-span-1 row-span-2 p-6 flex flex-col justify-center">
          <h3 className="text-neutral-400 text-sm font-medium mb-3">
            System Status
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            </div>
            <span className="text-neutral-200 font-medium">Operational</span>
          </div>
          <div className="w-full bg-neutral-900 rounded border border-neutral-800 p-2 mt-2">
            <p className="text-[10px] text-neutral-500 font-mono">
              Ping: 24ms • Stable
            </p>
          </div>
        </SpotlightCard>

        {/* 6. Profile / Protection */}
        <SpotlightCard className="col-span-1 row-span-2 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-cyan-500/50 transition-colors">
            <i className="ri-user-3-fill text-xl text-neutral-400 group-hover:text-cyan-400 transition-colors"></i>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-neutral-200 font-bold truncate text-sm">
              {user?.email?.split("@")[0] || "User"}
            </h3>
            <p className="text-xs text-neutral-600 mb-1">Developer</p>
          </div>
        </SpotlightCard>
      </div>

      {/* --- Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0a0a0a] border border-neutral-800 w-full max-w-md p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 to-blue-600"></div>

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-white">
                  Initialize Project
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>

              <form onSubmit={createProject}>
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-neutral-600 text-sm"
                    placeholder="e.g. My Next.js App"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Home;
