import React, { useContext, useState, useEffect, useMemo } from "react";
import { UserContext } from "../Context/user.context";
import axios from "../Config/axios";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Loader from "../components/Loader";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
};

// --- GLOW CARD WRAPPER ---
const GlowCard = ({ children, className = "", onClick }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
    onClick={onClick}
    className={`relative rounded-3xl border border-[#1a1f2e] bg-[#0b0f19]/60 backdrop-blur-2xl p-6 overflow-hidden cursor-pointer group z-20
                hover:border-blue-500/30 transition-all duration-500 ease-out ${className}`}
  >
    {/* Clean Background - No Grids */}
    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    <div className="relative h-full z-10 flex flex-col">{children}</div>
  </motion.div>
);

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Data States
  const [project, setProject] = useState([]);
  const [invites, setInvites] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectName, setProjectName] = useState("");

  // Mouse Follower
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400, mass: 0.8 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400, mass: 0.8 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // --- FETCH DATA ---
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [projectRes, dashboardRes] = await Promise.all([
          axios.get("/project/all"),
          axios.get("/user/dashboard"),
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
          setTimeout(() => setIsLoading(false), 800);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- CALCULATE ACTIVITY ---
  const activityLevel = useMemo(() => {
    if (!activityData || activityData.length === 0)
      return {
        label: "Quiet",
        color: "#64748b",
        badgeBg: "bg-slate-800",
        percent: "0%",
      };
    const total = activityData
      .slice(-7)
      .reduce((acc, curr) => acc + curr.count, 0);
    if (total === 0)
      return {
        label: "Quiet",
        color: "#64748b",
        badgeBg: "bg-slate-800",
        percent: "0%",
      };
    if (total < 5)
      return {
        label: "Low",
        color: "#0ea5e9",
        badgeBg: "bg-sky-900/50",
        percent: "+12%",
      };
    if (total < 10)
      return {
        label: "Medium",
        color: "#f59e0b",
        badgeBg: "bg-amber-900/50",
        percent: "+45%",
      };
    return {
      label: "High",
      color: "#ef4444",
      badgeBg: "bg-red-900/50",
      percent: "+88%",
    };
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
      alert("Failed");
      window.location.reload();
    }
  };

  if (isLoading) return <Loader />;

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-blue-500/30 flex items-center justify-center overflow-hidden relative">
      {/* Background Gradient Blob */}
      <motion.div
        style={{
          left: smoothX,
          top: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="fixed pointer-events-none w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-transparent blur-[80px] z-0 mix-blend-screen"
      />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[85rem] h-[85vh] grid grid-cols-1 md:grid-cols-4 grid-rows-6 gap-6"
      >
        {/* 1. CREATE PROJECT */}
        <GlowCard
          className="col-span-1 row-span-2 group"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="h-full flex flex-col justify-center items-center text-center relative">
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border border-white/10 rounded-full"
              />
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl rotate-45 shadow-[0_0_40px_rgba(59,130,246,0.4)] flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                <i className="ri-add-line text-3xl text-white -rotate-45 group-hover:-rotate-90 transition-transform duration-500"></i>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
              Initialize
            </h2>
            <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase font-medium">
              New Workspace
            </p>
          </div>
        </GlowCard>

        {/* 2. ACTIVITY LEVEL */}
        <GlowCard className="col-span-1 row-span-2 relative overflow-hidden group">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Activity
              </h2>
              <p className="text-xs text-gray-600 mt-1">Real-time intensity</p>
            </div>
            <div className="p-2 rounded-full bg-white/5 text-white/80">
              <i className="ri-pulse-line text-lg"></i>
            </div>
          </div>
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
          <div className="absolute bottom-6 left-6 z-20">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-white tracking-tighter">
                {activityLevel.label}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-md text-white ${activityLevel.badgeBg}`}
              >
                {activityLevel.percent}
              </span>
            </div>
          </div>
        </GlowCard>

        {/* 3. INBOX (Requests) - WITH NEW EMPTY STATE ANIMATION */}
        <GlowCard className="col-span-1 md:col-span-2 row-span-4 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8 z-10 relative">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              >
                <i className="ri-mail-send-line text-xl"></i>
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">Requests</h2>
                <p className="text-xs text-gray-500 font-medium">
                  Pending Invitations
                </p>
              </div>
            </div>
            {invites.length > 0 && (
              <span className="w-6 h-6 flex items-center justify-center bg-white text-black text-[10px] font-bold rounded-full shadow-lg shadow-white/20">
                {invites.length}
              </span>
            )}
          </div>

          <div className="relative flex-1 overflow-hidden h-full">
            <div className="space-y-3 overflow-y-auto h-full custom-scrollbar pr-2">
              {invites.length > 0 ? (
                invites.map((invite, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 100,
                    }}
                    key={invite._id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group shadow-sm hover:shadow-purple-900/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                        {invite.name?.[0] || "U"}
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                          {invite.name}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                          Collaboration Invite
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(invite._id)}
                        className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black flex items-center justify-center transition-colors"
                      >
                        <i className="ri-check-line"></i>
                      </button>
                      <button
                        onClick={() => handleReject(invite._id)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-black flex items-center justify-center transition-colors"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                /* --- NEW RADAR SCANNING ANIMATION --- */
                <div className="h-full flex flex-col items-center justify-center relative">
                  <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    {/* Pulsing Ripples */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 0.3, 0], scale: [0.5, 1.8] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 1,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-full border border-purple-500/30"
                      />
                    ))}

                    {/* Rotating Scanner Dashed */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 rounded-full border border-dashed border-gray-600/30"
                    />

                    {/* Counter Rotating Inner */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-4 rounded-full border border-dotted border-purple-500/20"
                    />

                    {/* Center Icon */}
                    <div className="relative z-10 w-16 h-16 rounded-full bg-[#1a1f2e] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                      <i className="ri-radar-line text-2xl text-purple-400/80"></i>
                    </div>

                    {/* Scanning Beam */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent z-0"
                    />
                  </div>

                  <p className="text-xs font-mono tracking-widest text-gray-500 animate-pulse">
                    All caught up
                  </p>
                </div>
              )}
            </div>
          </div>
        </GlowCard>

        {/* 4. PROJECTS */}
        <GlowCard className="col-span-1 md:col-span-2 row-span-4 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <i className="ri-folder-shield-2-line text-xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Projects</h2>
                <p className="text-xs text-gray-500 font-medium">
                  Active Workspaces
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden h-full">
            <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 h-full pb-4">
              {project.map((proj, i) => (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={proj._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${proj._id}`);
                  }}
                  className="group relative p-4 rounded-2xl bg-[#13161c] border border-[#252a3d] hover:border-blue-500/50 hover:bg-[#1a1f2e] transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0b0f19] flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-blue-600 transition-all shadow-inner">
                      <i className="ri-code-box-line text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                        {proj.name}
                      </h3>
                      <p className="text-[10px] text-gray-500">
                        Last edited just now
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {proj.users?.slice(0, 3).map((u, idx) => (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#13161c] flex items-center justify-center text-[8px] text-white font-bold"
                        >
                          {u.email?.[0]?.toUpperCase() || "U"}
                        </div>
                      ))}
                      {proj.users.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-[#13161c] flex items-center justify-center text-[8px] text-gray-400">
                          +{proj.users.length - 3}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => confirmDeleteProject(e, proj)}
                      className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-500 flex items-center justify-center transition-colors"
                    >
                      <i
                        className={
                          proj.owner === user?._id
                            ? "ri-delete-bin-line"
                            : "ri-logout-box-r-line"
                        }
                      ></i>
                    </button>
                  </div>
                </motion.div>
              ))}

              {project.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600">
                  <i className="ri-folder-add-line text-4xl opacity-20 mb-2"></i>
                  <p className="text-xs font-mono">No repositories found</p>
                </div>
              )}
            </div>
          </div>
        </GlowCard>

        {/* 5. DASHBOARD */}
        <GlowCard className="col-span-1 row-span-2 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="text-sm font-bold text-white">Dashboard</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                System Overview
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/dashboard");
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="ri-arrow-right-up-line"></i>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2 flex-1 relative z-10">
            <div className="bg-[#13161c] border border-white/5 rounded-2xl p-3 flex flex-col justify-between group hover:border-blue-500/20 transition-colors">
              <div className="flex justify-between items-start">
                <i className="ri-folder-3-line text-blue-400"></i>
                <span className="text-[10px] text-gray-500">PROJS</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {project.length}
              </div>
            </div>
            <div className="bg-[#13161c] border border-white/5 rounded-2xl p-3 flex flex-col justify-between group hover:border-purple-500/20 transition-colors">
              <div className="flex justify-between items-start">
                <i className="ri-mail-star-line text-purple-400"></i>
                <span className="text-[10px] text-gray-500">REQS</span>
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {invites.length}
              </div>
            </div>
          </div>

          <div className="mt-3 relative z-10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-emerald-500 font-mono tracking-wider">
              SYSTEM ONLINE
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent opacity-20 pointer-events-none"></div>
        </GlowCard>

        {/* 6. PROFILE */}
        <GlowCard
          className="col-span-1 row-span-2 text-center p-0 overflow-hidden group bg-gradient-to-b from-[#13161c] to-[#0b0f19]"
          onClick={() => navigate("/profile")}
        >
          <div className="h-full flex flex-col items-center justify-center p-6 relative z-10">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-[#1a1f2e] border-2 border-gray-700/50 shadow-2xl flex items-center justify-center overflow-hidden group-hover:border-white/40 transition-all duration-300">
                <span className="text-3xl font-black bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              {/* Online Dot */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#0b0f19] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>

            {/* Simple Username */}
            <h3 className="text-xl font-bold text-white tracking-tight">
              @{user?.email?.split("@")[0] || "User"}
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Authorized Personnel
            </p>
          </div>
        </GlowCard>
      </motion.div>

      {/* --- MODALS (Unchanged) --- */}
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
