import React, { useContext, useState, useEffect, useMemo } from "react";
import { UserContext } from "../Context/user.context.jsx";
import axios from "../Config/axios";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Loader from "../components/Loader"; // <--- IMPORTING YOUR NEW LOADER

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// --- GLOW CARD ---
const GlowCard = ({ children, className = "", onClick }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -4, scale: 1.015 }}
    transition={{ type: "spring", stiffness: 100, damping: 15 }}
    onClick={onClick}
    className={`relative rounded-[2rem] border border-[#1a1f2e] bg-[#0f131a] p-6 overflow-hidden cursor-pointer group z-20
                hover:border-cyan-500/50 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:bg-[#141820]
                transition-all duration-700 ease-out ${className}`}
  >
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
    <div className="relative h-full z-10 flex flex-col">{children}</div>
  </motion.div>
);

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Data States
  const [project, setProject] = useState([]);
  const [invites, setInvites] = useState([]);
  const [activityData, setActivityData] = useState([]); // [NEW] Stores graph data
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectName, setProjectName] = useState("");

  // Mouse Follower
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 35, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 35, stiffness: 150 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // --- FETCH DATA (Parallel Requests) ---
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true); // Ensure loader starts
      try {
        const [projectRes, dashboardRes] = await Promise.all([
          axios.get("/project/all"),
          axios.get("/user/dashboard"), // [NEW] Fetching real activity stats
        ]);

        if (isMounted) {
          setProject(projectRes.data.projects);
          setInvites(projectRes.data.invites || []);
          setActivityData(dashboardRes.data.activityChartData || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          // Keep loader for at least 800ms to let animation play
          setTimeout(() => setIsLoading(false), 800);
        }
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- CALCULATE DYNAMIC ACTIVITY LEVEL ---
  const activityLevel = useMemo(() => {
    if (!activityData || activityData.length === 0) {
      return {
        label: "Quiet",
        color: "#64748b",
        badgeBg: "bg-gray-500/10",
        badgeText: "text-gray-400",
        percent: "0%",
      };
    }

    // Sum activity from the last 7 days
    const last7Days = activityData.slice(-7);
    const totalActivity = last7Days.reduce((acc, curr) => acc + curr.count, 0);

    // Define Thresholds
    if (totalActivity === 0) {
      return {
        label: "Quiet",
        color: "#64748b",
        badgeBg: "bg-gray-500/10",
        badgeText: "text-gray-400",
        percent: "0%",
      };
    } else if (totalActivity < 5) {
      return {
        label: "Low",
        color: "#06b6d4",
        badgeBg: "bg-cyan-500/10",
        badgeText: "text-cyan-400",
        percent: "+12%",
      };
    } else if (totalActivity < 10) {
      return {
        label: "Medium",
        color: "#f59e0b",
        badgeBg: "bg-amber-500/10",
        badgeText: "text-amber-400",
        percent: "+45%",
      };
    } else {
      return {
        label: "High",
        color: "#ef4444",
        badgeBg: "bg-red-500/10",
        badgeText: "text-red-400",
        percent: "+88%",
      };
    }
  }, [activityData]);

  // --- HANDLERS ---
  function createProject(e) {
    e.preventDefault();
    axios
      .post("/project/create", { name: projectName })
      .then((res) => {
        setProject((prev) => [...prev, res.data]);
        setIsModalOpen(false);
        setProjectName("");
      })
      .catch((error) => console.log(error));
  }

  const handleAccept = async (projectId) => {
    try {
      await axios.put("/project/accept-invite", { projectId });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (projectId) => {
    try {
      await axios.put("/project/reject-invite", { projectId });
      setInvites((prev) => prev.filter((i) => i._id !== projectId));
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteProject = (e, proj) => {
    e.stopPropagation();
    setProjectToDelete(proj);
    setIsDeleteModalOpen(true);
  };

  const executeDeleteOrLeave = async () => {
    if (!projectToDelete) return;
    const isOwner = projectToDelete.owner === user._id;
    setProject((prev) => prev.filter((p) => p._id !== projectToDelete._id));
    setIsDeleteModalOpen(false);
    try {
      if (isOwner)
        await axios.delete(`/project/delete`, {
          data: { projectId: projectToDelete._id },
        });
      else
        await axios.put(`/project/leave`, { projectId: projectToDelete._id });
    } catch (error) {
      alert("Failed to remove project");
      window.location.reload();
    }
  };

  // --- SHOW LOADER IF LOADING ---
  if (isLoading) return <Loader />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans selection:bg-cyan-500/30 flex items-center justify-center overflow-hidden relative">
      {/* Cursor Follower */}
      <motion.div
        style={{
          left: smoothX,
          top: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="fixed pointer-events-none w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[80px] z-0"
      />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/05 rounded-full blur-[150px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[80rem] h-[85vh] grid grid-cols-1 md:grid-cols-4 grid-rows-6 gap-4 md:gap-6"
      >
        {/* 1. Create Project */}
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

        {/* 2. DYNAMIC ACTIVITY WAVE (Option 2 Updated) */}
        <GlowCard className="col-span-1 row-span-2 relative overflow-hidden group">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">
                Activity Level
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Real-time intensity
              </p>
            </div>
            <div
              className="p-2 rounded-full shadow-[0_0_15px_currentColor] text-white"
              style={{
                backgroundColor: `${activityLevel.color}20`,
                color: activityLevel.color,
              }}
            >
              <i className="ri-pulse-line text-lg animate-pulse"></i>
            </div>
          </div>

          {/* Dynamic Wave Animation */}
          <div className="absolute bottom-0 left-0 right-0 h-24 w-full pointer-events-none z-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 50"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={activityLevel.color}
                    stopOpacity="0.5"
                  />
                  <stop
                    offset="100%"
                    stopColor={activityLevel.color}
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,25 C30,10 70,40 100,25 L100,50 L0,50 Z"
                fill="url(#waveGradient)"
                animate={{
                  d: [
                    "M0,25 C30,10 70,40 100,25 L100,50 L0,50 Z",
                    "M0,25 C30,40 70,10 100,25 L100,50 L0,50 Z",
                    "M0,25 C30,10 70,40 100,25 L100,50 L0,50 Z",
                  ],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M0,25 C30,10 70,40 100,25"
                fill="none"
                stroke={activityLevel.color}
                strokeWidth="0.5"
                animate={{
                  d: [
                    "M0,25 C30,10 70,40 100,25",
                    "M0,25 C30,40 70,10 100,25",
                    "M0,25 C30,10 70,40 100,25",
                  ],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>

          {/* Status Text (Bottom Left, Above Wave) */}
          <div className="absolute bottom-4 left-6 z-20">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {activityLevel.label}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border border-current ${activityLevel.badgeBg} ${activityLevel.badgeText}`}
              >
                {activityLevel.percent}
              </span>
            </div>
          </div>
        </GlowCard>

        {/* 3. Inbox */}
        <GlowCard className="col-span-1 md:col-span-2 row-span-4 overflow-hidden">
          <div className="flex justify-between items-center mb-6 z-10 relative">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Inbox</h2>
              <p className="text-xs text-neutral-500">Pending invitations</p>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 rounded-full text-xs font-medium text-cyan-400 border border-cyan-500/20">
              {invites.length} New
            </span>
          </div>
          <div className="relative flex-1 overflow-hidden -mx-6 px-6 h-full">
            <div className="space-y-2 overflow-y-auto h-full custom-scrollbar pb-4">
              {invites.length > 0 ? (
                invites.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#141820] border border-[#1f2533] hover:bg-[#1a1f2e] hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-lg text-white">
                        <i className="ri-mail-unread-line"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-200">
                          {invite.name}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Invited to collaborate
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(invite._id)}
                        className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                      >
                        <i className="ri-check-line text-lg"></i>
                      </button>
                      <button
                        onClick={() => handleReject(invite._id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                      >
                        <i className="ri-close-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-neutral-600 mt-2 relative">
                  <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 border border-cyan-500/20 rounded-full"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: i * 0.8,
                          ease: "linear",
                        }}
                      />
                    ))}
                    <div className="relative z-10 w-12 h-12 bg-[#1f2533] rounded-full flex items-center justify-center border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                      <i className="ri-radar-line text-xl text-cyan-400"></i>
                    </div>
                  </div>
                  <p className="text-xs font-mono tracking-widest text-cyan-500/60 uppercase">
                    Scanning for invites...
                  </p>
                </div>
              )}
            </div>
          </div>
        </GlowCard>

        {/* 4. Projects List */}
        <GlowCard className="col-span-1 md:col-span-2 row-span-4 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-end mb-6 relative z-10 shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Projects</h2>
              <p className="text-sm text-neutral-500">
                Recent activity & deployments
              </p>
            </div>
            <div className="px-3 py-1 bg-[#1a1f2e] rounded-lg border border-[#2a3040] text-xs text-neutral-400">
              {project.length} Active
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden -mx-2 px-2 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar max-h-full pb-4">
              {project.map((proj) => (
                <div
                  key={proj._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${proj._id}`);
                  }}
                  className="group/project relative p-4 rounded-xl bg-[#141820] border border-[#1f2533] cursor-pointer hover:bg-[#1a1f2e] overflow-hidden transition-all duration-300 hover:border-cyan-500/30 flex flex-col justify-between h-[100px]"
                >
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1f2533] flex items-center justify-center text-neutral-400 group-hover/project:text-cyan-400 group-hover/project:bg-cyan-500/10 transition-all shrink-0">
                        <i className="ri-code-s-slash-line text-lg"></i>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-neutral-200 group-hover/project:text-white transition-colors truncate">
                          {proj.name}
                        </h3>
                        <p className="text-[10px] text-neutral-500">
                          Last active recently
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => confirmDeleteProject(e, proj)}
                      className="w-8 h-8 rounded-full border border-transparent hover:border-red-500/30 flex items-center justify-center opacity-0 group-hover/project:opacity-100 transition-all duration-200 bg-[#1f2533] text-gray-500 hover:text-red-500 hover:bg-red-500/10 z-20"
                    >
                      <i
                        className={
                          proj.owner === user?._id
                            ? "ri-delete-bin-line text-sm"
                            : "ri-logout-box-r-line text-sm"
                        }
                      ></i>
                    </button>
                  </div>
                  <div className="relative z-10 mt-auto pt-3 flex items-center gap-2 text-[10px] text-neutral-500 font-medium border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <i className="ri-user-line"></i> {proj.users.length}{" "}
                      members
                    </span>
                  </div>
                </div>
              ))}
              {project.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center h-40 text-neutral-600 mt-2">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative mb-4"
                  >
                    <i className="ri-folder-add-line text-5xl text-blue-500/40 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"></i>
                  </motion.div>
                  <p className="text-sm font-medium text-gray-500">
                    No active projects
                  </p>
                </div>
              )}
            </div>
          </div>
        </GlowCard>

        {/* 5. Dashboard */}
        <GlowCard className="col-span-1 row-span-2 justify-between relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                Dashboard
              </h3>
              <p className="text-xs text-gray-500">Quick Overview</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/dashboard");
              }}
              className="p-1.5 rounded-lg bg-[#1f2533] text-cyan-400 hover:text-white hover:bg-cyan-600 transition-all"
            >
              <i className="ri-arrow-right-up-line text-lg"></i>
            </button>
          </div>
          <div className="z-10 relative mt-auto space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#141820] border border-[#1f2533]">
              <span className="text-xs text-gray-400">Total Projects</span>
              <span className="text-sm font-bold text-white">
                {project.length}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#141820] border border-[#1f2533]">
              <span className="text-xs text-gray-400">Invites</span>
              <span className="text-sm font-bold text-cyan-400">
                {invites.length}
              </span>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
        </GlowCard>

        {/* 6. Profile */}
        <GlowCard
          className="col-span-1 row-span-2 justify-between text-center"
          onClick={() => navigate("/profile")}
        >
          <div className="flex flex-col items-center mt-4">
            <div className="relative mb-4 group/avatar">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-[3px] shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-shadow duration-500">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-full h-full rounded-full border-2 border-[#0b0f19] object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#0f131a] flex items-center justify-center text-4xl text-neutral-200">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
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
            <i className="ri-settings-3-line"></i> View Settings
          </button>
        </GlowCard>
      </motion.div>

      {/* --- MODALS --- */}
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
              className="bg-[#0f131a] border border-[#1f2533] w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              <h2 className="text-2xl font-bold text-white mb-8">
                New Project
              </h2>
              <form onSubmit={createProject}>
                <div className="mb-8">
                  <label className="block text-sm font-bold text-neutral-300 mb-3">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-[#141820] border border-[#1f2533] text-white rounded-xl py-4 px-4 focus:outline-none focus:border-cyan-500 transition-all placeholder-neutral-600"
                    placeholder="e.g. Quantum Dashboard"
                    required
                    autoFocus
                  />
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
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 z-[60] flex justify-center items-center p-4"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0f131a] border border-red-900/50 w-full max-w-sm p-6 rounded-2xl shadow-2xl relative overflow-hidden z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <i
                    className={`text-3xl text-red-500 ${
                      projectToDelete?.owner === user?._id
                        ? "ri-delete-bin-line"
                        : "ri-logout-box-r-line"
                    }`}
                  ></i>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {projectToDelete?.owner === user?._id
                    ? "Delete Project?"
                    : "Leave Project?"}
                </h2>
                <div className="flex gap-3 w-full mt-6">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-[#1a1f2e] text-white text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDeleteOrLeave}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-900/20"
                  >
                    {projectToDelete?.owner === user?._id ? "Delete" : "Leave"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Home;
