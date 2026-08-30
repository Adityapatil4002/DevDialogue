import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
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
import { authClient } from "../Config/auth-client.js";

/* ---------- Animation Variants ---------- */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ---------- Tooltip ---------- */
const Tooltip = ({ label, children, position = "top" }) => {
  const [show, setShow] = useState(false);
  const positions = {
    top: "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+8px)] left-1/2 -translate-x-1/2",
    left: "right-[calc(100%+8px)] top-1/2 -translate-y-1/2",
    right: "left-[calc(100%+8px)] top-1/2 -translate-y-1/2",
  };
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{
              opacity: 0,
              y: position === "top" ? 4 : -4,
              scale: 0.95,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "top" ? 4 : -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positions[position]} z-[200] pointer-events-none whitespace-nowrap bg-white text-black text-[9px] font-mono tracking-wider uppercase px-2 py-1 rounded-[4px] shadow-lg`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

/* ---------- Small UI Bits ---------- */
const PulseDot = () => (
  <span className="relative inline-flex items-center justify-center">
    <span className="absolute w-3 h-3 rounded-full bg-white/20 animate-ping" />
    <span className="relative w-[6px] h-[6px] rounded-full bg-white" />
  </span>
);

const CellLabel = ({ children, right }) => (
  <div className="flex items-center justify-between mb-4 flex-shrink-0">
    <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#666]">
      {children}
    </span>
    {right}
  </div>
);

const Mag = ({ children, onClick, className = "", type = "button" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 15, stiffness: 150 });
  const sy = useSpring(y, { damping: 15, stiffness: 150 });
  return (
    <motion.button
      ref={ref}
      type={type}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.25);
        y.set((e.clientY - r.top - r.height / 2) * 0.25);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

/* ---------- Bento Cell ---------- */
const Cell = ({ children, className = "", onClick, span = "", delay = 0 }) => (
  <motion.div
    variants={item}
    onClick={onClick}
    whileHover={{ y: -2, transition: { duration: 0.25 } }}
    className={`relative bg-[#0b0b0b] rounded-2xl border border-[#1a1a1a] p-5 flex flex-col overflow-hidden
                transition-[border-color,box-shadow] duration-300 hover:border-[#2e2e2e] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_40px_-20px_rgba(0,0,0,0.8)]
                ${onClick ? "cursor-pointer" : ""} ${span} ${className}`}
  >
    {/* Subtle inner glow on hover */}
    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent" />
    {children}
  </motion.div>
);

const Home = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [project, setProject] = useState([]);
  const [invites, setInvites] = useState([]);
  const [activityData, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModal] = useState(false);
  const [isDeleteOpen, setDelete] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [projName, setProjName] = useState("");
  const [createErr, setCreateErr] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          axios.get("/project/all"),
          axios.get("/user/dashboard"),
        ]);
        if (!live) return;
        setProject(pRes.data.projects);
        setInvites(pRes.data.invites || []);
        setActivity(dRes.data.activityChartData || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (live) setTimeout(() => setIsLoading(false), 350);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const week = useMemo(() => activityData.slice(-13), [activityData]);
  const total = useMemo(
    () => week.reduce((a, b) => a + (b.count ?? 0), 0),
    [week],
  );
  const maxVal = useMemo(
    () => Math.max(...week.map((d) => d.count ?? 0), 1),
    [week],
  );

  async function createProject(e) {
    e.preventDefault();
    setCreateErr("");
    try {
      const res = await axios.post("/project/create", { name: projName });
      setProject((p) => [...p, res.data]);
      setModal(false);
      setProjName("");
    } catch (err) {
      const m = err.response?.data || err.message;
      setCreateErr(
        typeof m === "string" && m.toLowerCase().includes("unique")
          ? "Name already taken."
          : m || "Failed to create project.",
      );
    }
  }

  const handleAccept = async (id) => {
    try {
      await axios.put("/project/accept-invite", { projectId: id });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };
  const handleReject = async (id) => {
    try {
      await axios.put("/project/reject-invite", { projectId: id });
      setInvites((p) => p.filter((i) => i._id !== id));
    } catch (e) {
      console.error(e);
    }
  };
  const confirmDelete = (e, proj) => {
    e.stopPropagation();
    setToDelete(proj);
    setDelete(true);
  };
  const execDelete = async () => {
    if (!toDelete) return;
    const own = toDelete.owner?.toString() === user?._id?.toString();
    setProject((p) => p.filter((x) => x._id !== toDelete._id));
    setDelete(false);
    try {
      own
        ? await axios.delete("/project/delete", {
            data: { projectId: toDelete._id },
          })
        : await axios.put("/project/leave", { projectId: toDelete._id });
    } catch {
      alert("Failed");
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
    <main className="min-h-screen w-screen bg-[#050505] text-white font-sans selection:bg-white/10 flex flex-col overflow-hidden">
      {/* Ambient gradient background */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.35]">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/[0.02] blur-[120px] rounded-full" />
      </div>

      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-50 flex-shrink-0 flex items-center justify-between px-6 h-12 border-b border-[#141414] bg-[#050505]/80 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-7 h-7 rounded-lg border border-[#222] bg-[#0a0a0a] flex items-center justify-center"
          >
            <span className="text-[9px] font-bold tracking-widest text-white">
              DD
            </span>
          </motion.div>
          <span className="text-[13px] font-semibold tracking-[0.06em]">
            Dev<span className="text-[#666] font-normal">Dialogue</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[
            ["Dashboard", "/dashboard", "View analytics"],
            ["Profile", "/profile", "Account settings"],
          ].map(([label, path, tip]) => (
            <Tooltip key={path} label={tip} position="bottom">
              <motion.button
                onClick={() => navigate(path)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="text-[11px] tracking-[0.08em] uppercase text-[#777] hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/[0.03]"
              >
                {label}
              </motion.button>
            </Tooltip>
          ))}
        </div>
      </motion.nav>

      {/* BENTO GRID */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex-1 grid grid-cols-6 grid-rows-6 gap-3 p-3 min-h-0"
      >
        {/* 1. CREATE — top-left compact */}
        <Cell
          onClick={() => setModal(true)}
          span="col-span-2 row-span-2"
          className="!bg-gradient-to-br from-[#0d0d0d] to-[#080808] items-center justify-center gap-4 group border-dashed"
        >
          <Tooltip label="Create new project" position="top">
            <motion.div
              className="w-14 h-14 rounded-xl border border-[#242424] bg-[#0a0a0a] flex items-center justify-center text-[#777] text-2xl font-light group-hover:border-white/40 group-hover:text-white transition-colors duration-300"
              whileHover={{ rotate: 90, scale: 1.08 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              +
            </motion.div>
          </Tooltip>
          <div className="text-center">
            <div className="text-[13px] font-semibold text-white/90 mb-1 tracking-tight">
              New Project
            </div>
            <div className="text-[9px] tracking-[0.18em] uppercase text-[#555]">
              Click to initialize
            </div>
          </div>
        </Cell>

        {/* 2. ACTIVITY */}
        <Cell span="col-span-2 row-span-3">
          <CellLabel
            right={
              <Tooltip label="System online">
                <PulseDot />
              </Tooltip>
            }
          >
            Activity
          </CellLabel>
          <motion.div
            key={total}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[56px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-white mb-1"
          >
            {total}
          </motion.div>
          <div className="text-[10px] font-mono text-[#555] mb-4">
            commits · past 13 days
          </div>
          <div className="relative flex items-end gap-[4px] h-[70px] mt-auto mb-3">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1a1a1a]" />
            {week.map((d, i) => {
              const h = Math.max(4, ((d.count ?? 0) / maxVal) * 70);
              const hi = (d.count ?? 0) > maxVal * 0.6;
              const mi = (d.count ?? 0) > maxVal * 0.3;
              return (
                <Tooltip key={i} label={`${d.count ?? 0} commits`}>
                  <motion.div
                    className={`w-[10px] rounded-sm cursor-pointer relative
                      ${hi ? "bg-white" : mi ? "bg-[#666]" : "bg-[#242424]"}`}
                    style={{ height: 4 }}
                    animate={{ height: h }}
                    transition={{
                      delay: 0.5 + i * 0.04,
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ filter: "brightness(1.4)", scaleY: 1.08 }}
                  />
                </Tooltip>
              );
            })}
          </div>
          <div className="relative h-px bg-[#1a1a1a] mb-3 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ["-2.5rem", "100%"] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1.2,
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#555]">
            <PulseDot />
            <span className="tracking-wider uppercase">Realtime sync</span>
          </div>
        </Cell>

        {/* 3. PROJECTS — big bento */}
        <Cell span="col-span-2 row-span-6">
          <CellLabel
            right={
              <Tooltip label="Active projects">
                <span className="text-[9px] font-mono text-[#666] px-2 py-0.5 rounded-md bg-white/[0.03] border border-[#1a1a1a]">
                  {project.length}
                </span>
              </Tooltip>
            }
          >
            Projects
          </CellLabel>
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-[#2a2a2a] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {project.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl border border-[#1a1a1a] flex items-center justify-center text-[#333]"
                >
                  ◇
                </motion.div>
                <span className="text-[9px] tracking-[0.18em] uppercase text-[#444] font-mono">
                  no repositories
                </span>
              </div>
            ) : (
              <AnimatePresence>
                {project.map((proj, idx) => (
                  <motion.div
                    key={proj._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.04, duration: 0.35 }}
                    onClick={() => navigate(`/project/${proj._id}`)}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 mb-1.5 rounded-lg border border-transparent hover:border-[#1e1e1e] hover:bg-white/[0.02] cursor-pointer group relative"
                  >
                    <div className="w-9 h-9 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] flex items-center justify-center text-[10px] font-bold font-mono text-[#888] flex-shrink-0 group-hover:border-[#333] group-hover:text-white transition-colors">
                      {proj.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-[#d0d0d0] font-medium truncate group-hover:text-white transition-colors">
                        {proj.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#555] mt-0.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-white/40" />
                        {proj.users?.length ?? 0} members
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex">
                        {proj.users?.slice(0, 3).map((u, i) => (
                          <Tooltip key={i} label={u.email || "member"}>
                            <div className="w-[20px] h-[20px] rounded-full bg-[#1a1a1a] border border-[#0a0a0a] text-[8px] text-[#aaa] flex items-center justify-center font-semibold -ml-1.5 first:ml-0">
                              {u.email?.[0]?.toUpperCase()}
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                      <Tooltip label="Remove" position="left">
                        <button
                          onClick={(e) => confirmDelete(e, proj)}
                          className="text-[12px] text-[#444] hover:text-red-400 transition-colors w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-500/10"
                        >
                          ⊘
                        </button>
                      </Tooltip>
                    </div>
                    <motion.span
                      className="text-[#333] group-hover:text-white transition-colors text-[13px]"
                      animate={{ x: [0, 2, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </Cell>

        {/* 4. INBOX */}
        <Cell span="col-span-2 row-span-4">
          <CellLabel
            right={
              invites.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="bg-white text-black text-[9px] font-bold font-mono px-2 py-[2px] rounded-md min-w-[20px] text-center"
                >
                  {invites.length}
                </motion.span>
              )
            }
          >
            Inbox
          </CellLabel>
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-[#2a2a2a] [&::-webkit-scrollbar-thumb]:rounded-full">
            {invites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center gap-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-10 h-10 rounded-xl border border-[#1a1a1a] flex items-center justify-center text-[#333]"
                >
                  ✓
                </motion.div>
                <span className="text-[9px] tracking-[0.18em] uppercase text-[#444] font-mono">
                  all clear
                </span>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {invites.map((invite, idx) => (
                  <motion.div
                    key={invite._id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    transition={{
                      delay: idx * 0.06,
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <motion.div
                        className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-[11px] font-semibold text-[#aaa] flex-shrink-0"
                        whileHover={{ scale: 1.08, rotate: 3 }}
                      >
                        {invite.name?.[0]?.toUpperCase()}
                      </motion.div>
                      <div className="min-w-0">
                        <div className="text-[13px] text-[#d0d0d0] font-medium truncate group-hover:text-white transition-colors">
                          {invite.name}
                        </div>
                        <div className="text-[9px] tracking-[0.1em] uppercase text-[#555] mt-0.5 flex items-center gap-1.5">
                          <motion.span
                            className="w-1 h-1 rounded-full bg-white/50"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1.8 }}
                          />
                          Invite pending
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Tooltip label="Accept">
                        <Mag
                          onClick={() => handleAccept(invite._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-[#666] hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors"
                        >
                          ✓
                        </Mag>
                      </Tooltip>
                      <Tooltip label="Reject">
                        <Mag
                          onClick={() => handleReject(invite._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-[#666] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                        >
                          ✕
                        </Mag>
                      </Tooltip>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </Cell>

        {/* 5. PROFILE */}
        <Cell
          onClick={() => navigate("/profile")}
          span="col-span-2 row-span-3"
          className="group"
        >
          <CellLabel
            right={
              <Tooltip label="Signed in">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </Tooltip>
            }
          >
            Profile
          </CellLabel>
          <div className="flex items-center gap-4">
            <motion.div
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#242424] text-[20px] font-semibold text-white flex items-center justify-center group-hover:border-[#333] transition-colors"
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ duration: 0.25 }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-white truncate">
                {user?.email?.split("@")[0]}
              </div>
              <div className="text-[10px] font-mono text-[#555] truncate">
                {user?.email}
              </div>
            </div>
          </div>
          <Tooltip label="Sign out of your account" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className="mt-auto pt-3 border-t border-[#1a1a1a] text-[10px] tracking-[0.12em] uppercase text-[#666] hover:text-red-400 transition-colors flex items-center gap-1.5 w-full text-left bg-transparent"
            >
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                →
              </motion.span>
              Sign out
            </button>
          </Tooltip>
        </Cell>

        {/* 6. OVERVIEW */}
        <Cell span="col-span-2 row-span-3">
          <CellLabel
            right={
              <span className="text-[9px] font-mono text-[#555] tracking-wider">
                LIVE
              </span>
            }
          >
            Overview
          </CellLabel>
          <div className="grid grid-cols-2 gap-2 mt-auto">
            {[
              {
                k: "Projects",
                v: project.length,
                icon: "▣",
                tip: "Total projects",
              },
              {
                k: "Requests",
                v: invites.length,
                icon: "◈",
                tip: "Pending invites",
              },
              {
                k: "Members",
                v: project.reduce((a, p) => a + (p.users?.length ?? 0), 0),
                icon: "◉",
                tip: "Team members across projects",
              },
              {
                k: "Active",
                v: project.length,
                icon: "◎",
                tip: "Active workspaces",
              },
            ].map(({ k, v, icon, tip }, i) => (
              <Tooltip key={k} label={tip}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.35 + i * 0.07,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ y: -3 }}
                  className="w-full bg-[#080808] border border-[#181818] rounded-xl px-3 py-3 hover:border-[#2a2a2a] transition-colors cursor-default"
                >
                  <div className="text-[9px] tracking-[0.12em] uppercase text-[#555] font-mono mb-1.5 flex items-center gap-1.5">
                    <span className="text-[11px] text-white/60">{icon}</span>
                    {k}
                  </div>
                  <motion.div
                    className="text-[26px] font-semibold text-white leading-none tracking-[-0.03em]"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.5 + i * 0.07,
                      type: "spring",
                      stiffness: 260,
                      damping: 18,
                    }}
                  >
                    {v}
                  </motion.div>
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </Cell>
      </motion.div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => {
              setModal(false);
              setCreateErr("");
              setProjName("");
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 bg-[#0b0b0b] border border-[#222] rounded-2xl w-full max-w-md p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[9px] tracking-[0.18em] uppercase text-[#666] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-sm bg-white/50" />
                Initialize project
              </div>
              <form onSubmit={createProject}>
                <div className="relative mb-6">
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => {
                      setProjName(e.target.value);
                      setCreateErr("");
                    }}
                    className={`w-full bg-transparent border-b py-3 text-white text-[15px] font-medium focus:outline-none placeholder-[#333] transition-colors ${createErr ? "border-red-500/50" : "border-[#222] focus:border-white/60"}`}
                    placeholder="project-name"
                    required
                    autoFocus
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-px bg-white"
                    animate={{ width: projName ? "100%" : "0%" }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <AnimatePresence>
                  {createErr && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-red-400 font-mono mb-5 flex items-center gap-1.5"
                    >
                      ⚠ {createErr}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="flex justify-end items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setModal(false);
                      setCreateErr("");
                      setProjName("");
                    }}
                    className="text-[11px] tracking-[0.1em] uppercase text-[#666] hover:text-white transition-colors px-4 py-2.5 rounded-lg hover:bg-white/[0.03]"
                  >
                    Cancel
                  </button>
                  <Mag
                    type="submit"
                    className="text-[11px] tracking-[0.08em] uppercase font-semibold text-black bg-white px-6 py-2.5 rounded-lg hover:bg-[#e5e5e5] transition-colors relative overflow-hidden"
                  >
                    Create
                  </Mag>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            onClick={() => setDelete(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 bg-[#0b0b0b] border border-[#252525] rounded-2xl w-full max-w-sm p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[9px] tracking-[0.18em] uppercase text-white/80 mb-3 font-semibold">
                {toDelete?.owner?.toString() === user?._id?.toString()
                  ? "Delete project"
                  : "Leave project"}
              </div>
              <p className="text-[12px] text-[#777] font-mono mb-7 leading-relaxed">
                {toDelete?.owner?.toString() === user?._id?.toString()
                  ? `Permanently delete "${toDelete?.name}"?`
                  : `Leave "${toDelete?.name}"?`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDelete(false)}
                  className="flex-1 py-2.5 rounded-lg border border-[#222] text-[11px] uppercase tracking-[0.08em] text-[#666] hover:text-white hover:border-[#333] transition-colors"
                >
                  Cancel
                </button>
                <Mag
                  onClick={execDelete}
                  className="flex-1 py-2.5 rounded-lg bg-white text-black text-[11px] uppercase tracking-[0.08em] font-semibold hover:bg-[#e5e5e5] transition-colors"
                >
                  {toDelete?.owner?.toString() === user?._id?.toString()
                    ? "Delete"
                    : "Leave"}
                </Mag>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Home;
