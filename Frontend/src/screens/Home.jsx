import React, { useContext, useState, useEffect, useMemo } from "react";
import { UserContext } from "../Context/user.context";
import axios from "../Config/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../components/Loader";
import { authClient } from "../Config/auth-client.js";

// --- STAGGER VARIANTS ---
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};

// --- CELL WRAPPER ---
const Cell = ({ children, className = "", onClick, span = "" }) => (
  <motion.div
    variants={item}
    onClick={onClick}
    className={`bg-[#0a0a0a] p-6 flex flex-col relative overflow-hidden
                hover:bg-[#0f0f0f] transition-colors duration-150
                ${onClick ? "cursor-pointer" : ""}
                ${span} ${className}`}
  >
    {children}
  </motion.div>
);

const Label = ({ children, right }) => (
  <div className="flex items-center justify-between mb-4">
    <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#555]">
      {children}
    </span>
    {right && (
      <span className="text-[10px] font-mono text-[#444]">{right}</span>
    )}
  </div>
);

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [project, setProject] = useState([]);
  const [invites, setInvites] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [createError, setCreateError] = useState("");

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
        console.error("Failed to fetch data:", err);
      } finally {
        if (isMounted) setTimeout(() => setIsLoading(false), 600);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activityWeek = useMemo(() => activityData.slice(-13), [activityData]);
  const activityTotal = useMemo(
    () => activityWeek.reduce((a, b) => a + (b.count ?? 0), 0),
    [activityWeek],
  );
  const activityMax = useMemo(
    () => Math.max(...activityWeek.map((d) => d.count ?? 0), 1),
    [activityWeek],
  );

  async function createProject(e) {
    e.preventDefault();
    setCreateError("");
    try {
      const res = await axios.post("/project/create", { name: projectName });
      setProject((prev) => [...prev, res.data]);
      setIsModalOpen(false);
      setProjectName("");
    } catch (error) {
      const msg = error.response?.data || error.message;
      setCreateError(
        typeof msg === "string" && msg.toLowerCase().includes("unique")
          ? "This project name is already taken."
          : msg || "Failed to create project.",
      );
    }
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
    const isOwner = projectToDelete.owner?.toString() === user?._id?.toString();
    setProject((prev) => prev.filter((p) => p._id !== projectToDelete._id));
    setIsDeleteModalOpen(false);
    try {
      if (isOwner) {
        await axios.delete("/project/delete", {
          data: { projectId: projectToDelete._id },
        });
      } else {
        await axios.put("/project/leave", { projectId: projectToDelete._id });
      }
    } catch {
      alert("Failed to delete/leave project");
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setUser(null);
    navigate("/login");
  };

  if (isLoading) return <Loader />;

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white/10">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <span className="text-[13px] font-medium tracking-[0.04em] text-white">
          Dev<span className="text-[#555]">Dialogue</span>
        </span>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[12px] tracking-[0.04em] text-[#555] hover:text-white transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="text-[12px] tracking-[0.04em] text-[#555] hover:text-white transition-colors"
          >
            Profile
          </button>
        </div>
      </nav>

      {/* GRID */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-4 gap-px bg-[#1a1a1a] border-x border-b border-[#1a1a1a]"
      >
        {/* CREATE PROJECT */}
        <Cell
          onClick={() => setIsModalOpen(true)}
          className="min-h-[160px] !bg-transparent border border-dashed border-[#1f1f1f] m-px
                     hover:border-[#333] hover:!bg-[#080808] items-center justify-center gap-3"
        >
          <div
            className="w-10 h-10 border border-[#2a2a2a] flex items-center justify-center
                         text-[#555] text-xl group-hover:border-[#555] transition-colors"
          >
            +
          </div>
          <span className="text-[10px] tracking-[0.1em] uppercase text-[#555]">
            New project
          </span>
        </Cell>

        {/* ACTIVITY */}
        <Cell>
          <Label
            right={
              <span className="w-[6px] h-[6px] rounded-full bg-emerald-500 inline-block animate-pulse" />
            }
          >
            Activity
          </Label>
          <div className="text-[52px] font-medium text-white leading-none tracking-[-0.03em] tabular-nums mb-2">
            {activityTotal}
          </div>
          <div className="text-[11px] font-mono text-[#555] mb-4">
            commits this week
          </div>
          {/* Bar chart */}
          <div className="flex items-end gap-[3px] h-[56px] mt-auto mb-4">
            {activityWeek.map((d, i) => {
              const h = Math.max(4, ((d.count ?? 0) / activityMax) * 56);
              const isHigh = (d.count ?? 0) > activityMax * 0.6;
              const isMid = (d.count ?? 0) > activityMax * 0.3;
              return (
                <div
                  key={i}
                  className={`flex-1 transition-all duration-300
                    ${isHigh ? "bg-[#ddd]" : isMid ? "bg-[#555]" : "bg-[#222]"}`}
                  style={{ height: `${h}px` }}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#555]">
            <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
            online
          </div>
        </Cell>

        {/* PROJECTS — 2 cols, 2 rows */}
        <Cell span="col-span-2 row-span-2" className="min-h-[320px]">
          <Label right={`${project.length} active`}>Projects</Label>
          <div className="flex flex-col divide-y divide-[#181818] flex-1 overflow-y-auto">
            {project.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <div className="w-[100px] h-px bg-[#1f1f1f]" />
                <div className="w-[70px] h-px bg-[#1f1f1f]" />
                <span className="text-[10px] tracking-[0.15em] uppercase text-[#444] font-mono mt-2">
                  no repositories
                </span>
              </div>
            ) : (
              project.map((proj) => (
                <div
                  key={proj._id}
                  onClick={() => navigate(`/project/${proj._id}`)}
                  className="flex items-center justify-between py-3 hover:pl-2 transition-all duration-150 cursor-pointer group"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="text-[13px] text-[#ddd] font-medium truncate group-hover:text-white transition-colors">
                      {proj.name}
                    </div>
                    <div className="text-[11px] font-mono text-[#444] mt-[2px]">
                      {proj.users?.length ?? 0} members
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {proj.users?.slice(0, 3).map((u, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-full bg-[#222] border border-[#111] text-[8px] text-[#888]
                                     flex items-center justify-center -ml-1 first:ml-0"
                        >
                          {u.email?.[0]?.toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={(e) => confirmDeleteProject(e, proj)}
                      className="text-[#333] hover:text-red-500 transition-colors text-[13px]"
                    >
                      {proj.owner?.toString() === user?._id?.toString()
                        ? "⊘"
                        : "→"}
                    </button>
                    <span className="text-[#444] group-hover:text-white transition-colors text-[13px]">
                      →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Cell>

        {/* INBOX — 2 cols, 2 rows */}
        <Cell span="col-span-2 row-span-2">
          <Label right={`${invites.length} pending`}>Inbox</Label>
          <div className="flex flex-col gap-2 flex-1">
            {invites.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <div className="w-[120px] h-px bg-[#1f1f1f]" />
                <div className="w-[80px] h-px bg-[#1f1f1f]" />
                <div className="w-[100px] h-px bg-[#1f1f1f]" />
                <span className="text-[10px] tracking-[0.15em] uppercase text-[#444] font-mono mt-2">
                  all clear
                </span>
              </div>
            ) : (
              <AnimatePresence>
                {invites.map((invite) => (
                  <motion.div
                    key={invite._id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="flex items-center justify-between p-3 border border-[#1a1a1a] hover:border-[#333] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 bg-[#1a1a1a] border border-[#2a2a2a] text-[12px] text-[#888]
                                     flex items-center justify-center font-medium"
                      >
                        {invite.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] text-[#ddd] font-medium">
                          {invite.name}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.08em] text-[#555] mt-[2px]">
                          Collaboration invite
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(invite._id)}
                        className="w-7 h-7 text-[#555] hover:text-emerald-500 hover:bg-emerald-500/10
                                   transition-colors text-[14px] flex items-center justify-center"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleReject(invite._id)}
                        className="w-7 h-7 text-[#555] hover:text-red-500 hover:bg-red-500/10
                                   transition-colors text-[14px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </Cell>

        {/* PROFILE */}
        <Cell onClick={() => navigate("/profile")} className="min-h-[160px]">
          <Label>Profile</Label>
          <div
            className="w-11 h-11 bg-[#1a1a1a] border border-[#2a2a2a] text-[18px] font-medium text-[#ddd]
                         flex items-center justify-center mb-4"
          >
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="text-[16px] text-white font-medium">
            {user?.email?.split("@")[0]}
          </div>
          <div className="text-[11px] font-mono text-[#555] mt-1">
            {user?.email}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="mt-auto pt-4 text-[10px] tracking-[0.1em] uppercase text-[#444]
                       hover:text-red-500 transition-colors flex items-center gap-2 w-fit"
          >
            → Sign out
          </button>
        </Cell>

        {/* OVERVIEW STATS */}
        <Cell>
          <Label>Overview</Label>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            {[
              { key: "Projects", val: project.length },
              { key: "Requests", val: invites.length },
              {
                key: "Members",
                val: project.reduce((a, p) => a + (p.users?.length ?? 0), 0),
              },
              { key: "Repos", val: project.length },
            ].map(({ key, val }) => (
              <div
                key={key}
                className="bg-[#111] border border-[#1a1a1a] p-2.5 hover:border-[#333] transition-colors"
              >
                <div className="text-[9px] tracking-[0.12em] uppercase text-[#555] font-mono mb-1.5">
                  {key}
                </div>
                <div className="text-[22px] font-medium text-white leading-none tracking-[-0.02em]">
                  {val}
                </div>
              </div>
            ))}
          </div>
        </Cell>
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsModalOpen(false);
              setCreateError("");
              setProjectName("");
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative z-10 bg-[#0a0a0a] border border-[#222] w-full max-w-md p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] tracking-[0.12em] uppercase text-[#555] mb-6">
                New project
              </div>
              <form onSubmit={createProject}>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setCreateError("");
                  }}
                  className={`w-full bg-transparent border-b py-3 text-white text-[15px]
                             focus:outline-none placeholder-[#333] transition-colors
                             ${createError ? "border-red-500/50" : "border-[#2a2a2a] focus:border-[#555]"}`}
                  placeholder="project-name"
                  required
                  autoFocus
                />
                {createError && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[11px] text-red-500/80 font-mono mt-3"
                  >
                    {createError}
                  </motion.p>
                )}
                <div className="flex justify-end items-center gap-6 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCreateError("");
                      setProjectName("");
                    }}
                    className="text-[12px] text-[#555] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[12px] font-medium text-black bg-white px-5 py-2
                               hover:bg-[#ddd] transition-colors tracking-[0.04em]"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 bg-[#0a0a0a] border border-[#2a1a1a] w-full max-w-sm p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] tracking-[0.12em] uppercase text-[#555] mb-4">
                {projectToDelete?.owner?.toString() === user?._id?.toString()
                  ? "Delete project"
                  : "Leave project"}
              </div>
              <p className="text-[13px] text-[#888] mb-8 font-mono">
                {projectToDelete?.owner?.toString() === user?._id?.toString()
                  ? `Permanently delete "${projectToDelete?.name}"?`
                  : `Leave "${projectToDelete?.name}"?`}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 border border-[#2a2a2a] text-[12px] text-[#666]
                             hover:text-white hover:border-[#444] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeleteOrLeave}
                  className="flex-1 py-2.5 bg-red-600/10 border border-red-500/30 text-[12px]
                             text-red-500 hover:bg-red-600/20 transition-colors"
                >
                  {projectToDelete?.owner?.toString() === user?._id?.toString()
                    ? "Delete"
                    : "Leave"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Home;
