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

// --- LOADER COMPONENT ---
const Loader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>
      <div className="relative flex items-center justify-center w-24 h-24">
        <motion.span
          className="absolute w-full h-full border-2 border-cyan-500/20 border-t-cyan-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute w-16 h-16 border-2 border-blue-500/20 border-b-blue-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="mt-8 flex flex-col items-center gap-2"></div>
      </div>
    </motion.div>
  );
};

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
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, mass: 1 }}
      onClick={onClick}
      className={`relative rounded-[2rem] border border-[#1a1f2e] bg-[#0f131a] p-6 overflow-hidden cursor-pointer group z-20
                  hover:border-cyan-500/50 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:bg-[#141820]
                  transition-all duration-700 ease-out
                  ${className}`}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
      <div className="relative h-full z-10 flex flex-col">{children}</div>
    </motion.div>
  );
};

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // --- MOUSE FOLLOWER LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
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

  // Fetch Projects AND Invites
  useEffect(() => {
    axios
      .get("/project/all")
      .then((res) => {
        setProject(res.data.projects);
        setInvites(res.data.invites || []);
        setTimeout(() => setIsLoading(false), 1000);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  const handleAccept = async (projectId) => {
    try {
      await axios.put("/project/accept-invite", { projectId });
      const acceptedProject = invites.find((i) => i._id === projectId);
      setInvites((prev) => prev.filter((i) => i._id !== projectId));
      setProject((prev) => [...prev, acceptedProject]);
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

  // [NEW] Project Deletion Logic
  const confirmDeleteProject = (e, proj) => {
    e.stopPropagation();
    setProjectToDelete(proj);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!projectToDelete) return;

    // Optimistic UI update (Remove immediately)
    setProject((prev) => prev.filter((p) => p._id !== projectToDelete._id));
    setIsDeleteModalOpen(false);

    try {
      // Assuming backend route is DELETE /project/delete
      // You might need to create this route in backend if not exists
      await axios.delete(`/project/delete`, {
        data: { projectId: projectToDelete._id },
      });
    } catch (error) {
      console.error("Failed to delete", error);
      // Revert if failed (Optional, but good practice)
      alert("Failed to delete project");
      window.location.reload();
    }
  };

  if (isLoading) return <Loader />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans selection:bg-cyan-500/30 flex items-center justify-center overflow-hidden relative">
      {/* --- GLOBAL CURSOR FOLLOWER --- */}
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

        {/* 3. INBOX (With Empty State Animation) */}
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

          {/* Removed .mask-gradient-vertical to show full borders */}
          <div className="relative flex-1 overflow-hidden -mx-6 px-6 h-full">
            <div className="space-y-2 overflow-y-auto h-full custom-scrollbar pb-4">
              {invites.length > 0 ? (
                invites.map((invite, i) => (
                  <div
                    key={invite._id}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#141820] border border-[#1f2533] hover:bg-[#1a1f2e] hover:border-cyan-500/30 transition-all duration-200 group/item"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-lg text-white">
                        <i className="ri-mail-unread-line"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-200 group-hover/item:text-white">
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
                // [NEW] Empty State Animation
                <div className="flex flex-col items-center justify-center h-full text-neutral-600 mt-4 relative overflow-hidden rounded-xl border border-dashed border-[#1f2533]">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#1f2533] to-transparent flex items-center justify-center mb-3">
                      <i className="ri-inbox-line text-3xl text-cyan-500/50"></i>
                    </div>
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs opacity-50">No pending requests</p>
                  </motion.div>

                  {/* Background Moving Mesh for Empty State */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"
                  />
                </div>
              )}
            </div>
          </div>
        </GlowCard>

        {/* 4. Projects List (With Deletion) */}
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

          {/* Removed .mask-gradient-vertical */}
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

                    {/* [NEW] Delete Button (Visible on Hover) */}
                    <button
                      onClick={(e) => confirmDeleteProject(e, proj)}
                      className="w-8 h-8 rounded-full border border-transparent hover:border-red-500/30 flex items-center justify-center opacity-0 group-hover/project:opacity-100 transition-all duration-200 bg-[#1f2533] text-gray-500 hover:text-red-500 hover:bg-red-500/10 z-20"
                      title="Delete Project"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
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
                <div className="col-span-full flex flex-col items-center justify-center h-40 text-neutral-600 border-2 border-dashed border-[#1f2533] rounded-2xl bg-[#141820]/50">
                  <i className="ri-folder-add-line text-3xl mb-2 opacity-50"></i>
                  <p className="text-sm font-medium">No active projects</p>
                </div>
              )}
            </div>
          </div>
        </GlowCard>

        {/* 5. DASHBOARD CARD (Updated Icon) */}
        <GlowCard className="col-span-1 row-span-2 justify-between relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <h3 className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">
                Dashboard
              </h3>
              <p className="text-xs text-gray-500">Quick Overview</p>
            </div>
            {/* [NEW] Arrow Icon linking to Dashboard page */}
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

        {/* 6. User Profile */}
        <GlowCard
          className="col-span-1 row-span-2 justify-between text-center"
          onClick={() => navigate("/profile")}
        >
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

      {/* --- CREATE PROJECT MODAL --- */}
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
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">New Project</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-[#1a1f2e] flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
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
                      className="w-full bg-[#141820] border border-[#1f2533] text-white rounded-xl py-4 pl-10 pr-4 focus:outline-none focus:border-cyan-500 transition-all placeholder-neutral-600"
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

      {/* --- DELETE CONFIRMATION MODAL (High Level) --- */}
      <AnimatePresence>
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
                  <i className="ri-alert-line text-3xl text-red-500"></i>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Delete Project?
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-bold">
                    "{projectToDelete?.name}"
                  </span>
                  ? <br />
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-[#1a1f2e] hover:bg-[#2a3040] text-white text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors shadow-lg shadow-red-900/20"
                  >
                    Delete
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
