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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const PulseDot = () => (
  <span className="relative inline-flex items-center justify-center">
    <span className="absolute w-3 h-3 rounded-full bg-emerald-500 opacity-20 animate-ping" />
    <span className="relative w-[6px] h-[6px] rounded-full bg-emerald-500" />
  </span>
);

const CellLabel = ({ children, right }) => (
  <div className="flex items-center justify-between mb-[14px] flex-shrink-0">
    <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#444]">
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
        x.set((e.clientX - r.left - r.width / 2) * 0.28);
        y.set((e.clientY - r.top - r.height / 2) * 0.28);
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

const Cell = ({ children, className = "", onClick, span = "" }) => (
  <motion.div
    variants={item}
    onClick={onClick}
    whileHover={{ borderColor: "#2a2a2a" }}
    transition={{ duration: 0.2 }}
    className={`bg-[#0a0a0a] p-5 flex flex-col border border-[#1a1a1a] relative overflow-hidden
                ${onClick ? "cursor-pointer" : ""} ${span} ${className}`}
  >
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
    <main className="h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-white/10 flex flex-col">
      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex-shrink-0 flex items-center justify-between px-6 h-11 border-b border-[#1a1a1a] bg-[#050505] z-50"
      >
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] border border-[#222] flex items-center justify-center">
            <span className="text-[9px] font-bold tracking-widest text-[#555]">
              DD
            </span>
          </div>
          <span className="text-[13px] font-semibold tracking-[0.06em]">
            Dev<span className="text-[#555] font-normal">Dialogue</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          {[
            ["Dashboard", "/dashboard"],
            ["Profile", "/profile"],
          ].map(([label, path]) => (
            <motion.button
              key={path}
              onClick={() => navigate(path)}
              className="text-[11px] tracking-[0.08em] uppercase text-[#555] hover:text-white transition-colors relative group"
            >
              {label}
              <span className="absolute -bottom-px left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-250" />
            </motion.button>
          ))}
        </div>
      </motion.nav>

      {/* GRID */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 grid grid-cols-4 grid-rows-2 gap-px bg-[#1a1a1a] min-h-0"
      >
        {/* 1. CREATE */}
        <Cell
          onClick={() => setModal(true)}
          className="!bg-[#050505] border-dashed hover:!bg-[#080808] items-center justify-center gap-3 group"
        >
          <motion.div
            className="w-10 h-10 border border-[#222] flex items-center justify-center text-[#555] text-xl font-light transition-colors group-hover:border-[#444]"
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.25 }}
          >
            +
          </motion.div>
          <span className="text-[10px] tracking-[0.12em] uppercase text-[#444] group-hover:text-[#777] transition-colors">
            New project
          </span>
        </Cell>

        {/* 2. ACTIVITY */}
        <Cell>
          <CellLabel right={<PulseDot />}>Activity</CellLabel>
          <motion.div
            key={total}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[52px] font-semibold leading-none tracking-[-0.04em] tabular-nums text-white mb-1"
          >
            {total}
          </motion.div>
          <div className="text-[10px] font-mono text-[#444] mb-3">
            commits this week
          </div>
          <div className="relative flex items-end gap-[3px] h-[52px] mt-auto mb-3">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1a1a1a]" />
            {week.map((d, i) => {
              const h = Math.max(4, ((d.count ?? 0) / maxVal) * 52);
              const hi = (d.count ?? 0) > maxVal * 0.6;
              const mi = (d.count ?? 0) > maxVal * 0.3;
              return (
                <motion.div
                  key={i}
                  className={`flex-1 cursor-pointer group/b relative
                    ${hi ? "bg-white" : mi ? "bg-[#555]" : "bg-[#222]"}`}
                  style={{ height: 4 }}
                  animate={{ height: h }}
                  transition={{
                    delay: 0.4 + i * 0.04,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  whileHover={{ filter: "brightness(1.5)", scaleY: 1.1 }}
                >
                  <div className="absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 bg-white text-black text-[8px] font-mono px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover/b:opacity-100 transition-opacity pointer-events-none">
                    {d.count ?? 0}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="relative h-px bg-[#1a1a1a] mb-3 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ["-2rem", "100%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1,
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#444]">
            <PulseDot />
            <span className="tracking-wider">system online</span>
          </div>
        </Cell>

        {/* 3. PROJECTS 2×2 */}
        <Cell span="col-span-2 row-span-2">
          <CellLabel
            right={
              <span className="text-[9px] font-mono text-[#444]">
                {project.length} active
              </span>
            }
          >
            Projects
          </CellLabel>
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-[#2a2a2a]">
            {project.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                {[100, 70, 90].map((w, i) => (
                  <motion.div
                    key={i}
                    className="h-px bg-[#1a1a1a]"
                    style={{ width: w }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  />
                ))}
                <span className="text-[9px] tracking-[0.18em] uppercase text-[#333] font-mono mt-2">
                  no repositories
                </span>
              </div>
            ) : (
              <AnimatePresence>
                {project.map((proj, idx) => (
                  <motion.div
                    key={proj._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/project/${proj._id}`)}
                    className="flex items-center justify-between py-[18px] border-b border-[#111] last:border-b-0 cursor-pointer group relative hover:pl-2.5 transition-all duration-150 overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-bottom" />
                    <div className="w-7 h-7 border border-[#1a1a1a] bg-[#050505] flex items-center justify-center text-[10px] font-bold font-mono text-[#555] flex-shrink-0 group-hover:border-[#333] group-hover:text-white transition-all">
                      {proj.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 mx-2.5">
                      <div className="text-[13px] text-[#ccc] font-medium truncate group-hover:text-white transition-colors">
                        {proj.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#444] mt-0.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#333]" />
                        {proj.users?.length ?? 0} members
                        <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                        active
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="flex">
                        {proj.users?.slice(0, 3).map((u, i) => (
                          <div
                            key={i}
                            className="w-[18px] h-[18px] bg-[#1a1a1a] border border-[#111] text-[8px] text-[#666] flex items-center justify-center font-semibold -ml-1 first:ml-0"
                          >
                            {u.email?.[0]?.toUpperCase()}
                          </div>
                        ))}
                        {proj.users?.length > 3 && (
                          <div className="w-[18px] h-[18px] bg-[#1a1a1a] border border-[#111] text-[7px] font-mono text-[#555] flex items-center justify-center -ml-1">
                            +{proj.users.length - 3}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => confirmDelete(e, proj)}
                        className="text-[11px] text-[#333] hover:text-red-500 transition-colors w-5 h-5 flex items-center justify-center"
                      >
                        ⊘
                      </button>
                      <motion.span
                        className="text-[#333] group-hover:text-white transition-colors text-[13px]"
                        animate={{ x: [0, 3, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.8,
                          ease: "easeInOut",
                        }}
                      >
                        →
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </Cell>

        {/* 4. INBOX 2×2 */}
        <Cell span="col-span-2 row-span-2">
          <CellLabel
            right={
              invites.length > 0 && (
                <motion.span
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="bg-white text-black text-[9px] font-bold font-mono px-[6px] py-[1px] min-w-[18px] text-center"
                >
                  {invites.length}
                </motion.span>
              )
            }
          >
            Inbox
          </CellLabel>
          <div className="flex flex-col gap-[6px] flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-[#2a2a2a]">
            {invites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 flex flex-col items-center justify-center gap-2 opacity-30"
              >
                {[120, 80, 100].map((w, i) => (
                  <motion.div
                    key={i}
                    className="h-px bg-[#1f1f1f]"
                    style={{ width: w }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  />
                ))}
                <span className="text-[9px] tracking-[0.18em] uppercase text-[#444] font-mono mt-2">
                  all clear
                </span>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {invites.map((invite, idx) => (
                  <motion.div
                    key={invite._id}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                    transition={{
                      delay: idx * 0.07,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-center justify-between p-2.5 border border-[#1a1a1a] hover:border-[#2a2a2a] hover:-translate-x-1 transition-all duration-150 group relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/20"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: idx * 0.07 + 0.15, duration: 0.3 }}
                      style={{ transformOrigin: "top" }}
                    />
                    <div className="flex items-center gap-3 flex-1 min-w-0 relative z-10">
                      <motion.div
                        className="w-[26px] h-[26px] bg-[#111] border border-[#222] flex items-center justify-center text-[10px] font-semibold text-[#888] flex-shrink-0"
                        whileHover={{ scale: 1.08 }}
                      >
                        {invite.name?.[0]?.toUpperCase()}
                      </motion.div>
                      <div>
                        <div className="text-[13px] text-[#ccc] font-medium group-hover:text-white transition-colors">
                          {invite.name}
                        </div>
                        <div className="text-[9px] tracking-[0.1em] uppercase text-[#444] mt-0.5 flex items-center gap-1.5">
                          <motion.span
                            className="w-1 h-1 rounded-full bg-white/40"
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ repeat: Infinity, duration: 1.8 }}
                          />
                          Collaboration invite
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 relative z-10">
                      <Mag
                        onClick={() => handleAccept(invite._id)}
                        className="w-7 h-7 flex items-center justify-center text-[13px] text-[#444] hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all"
                      >
                        ✓
                      </Mag>
                      <Mag
                        onClick={() => handleReject(invite._id)}
                        className="w-7 h-7 flex items-center justify-center text-[13px] text-[#444] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                      >
                        ✕
                      </Mag>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </Cell>

        {/* 5. PROFILE */}
        <Cell onClick={() => navigate("/profile")} className="group">
          <CellLabel>Profile</CellLabel>
          <motion.div
            className="w-10 h- bg-[#111] border border-[#222] text-[16px] font-semibold text-[#ccc] flex items-center justify-center mb-3.5 group-hover:border-[#333] transition-all"
            whileHover={{ scale: 1.04, rotate: 3 }}
          >
            {user?.email?.charAt(0).toUpperCase()}
          </motion.div>
          <div className="text-[15px] font-semibold text-white mb-1">
            {user?.email?.split("@")[0]}
          </div>
          <div className="text-[10px] font-mono text-[#444]">{user?.email}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="mt-auto pt-3 border-t border-[#1a1a1a] text-[9px] tracking-[0.12em] uppercase text-[#444] hover:text-red-400 transition-colors flex items-center gap-1.5 w-full text-left bg-transparent"
          >
            → Sign out
          </button>
        </Cell>

        {/* 6. OVERVIEW */}
        <Cell>
          <CellLabel>Overview</CellLabel>
          <div className="grid grid-cols-2 gap-1.5 mt-auto">
            {[
              { k: "Projects", v: project.length, icon: "▣" },
              { k: "Requests", v: invites.length, icon: "◈" },
              {
                k: "Members",
                v: project.reduce((a, p) => a + (p.users?.length ?? 0), 0),
                icon: "◉",
              },
              { k: "Active", v: project.length, icon: "◎" },
            ].map(({ k, v, icon }, i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + i * 0.07,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -2, borderColor: "#2a2a2a" }}
                className="bg-[#050505] border border-[#1a1a1a] px-3 py-2.5 transition-colors"
              >
                <div className="text-[9px] tracking-[0.12em] uppercase text-[#444] font-mono mb-1.5 flex items-center gap-1.5">
                  <span className="text-[10px]">{icon}</span>
                  {k}
                </div>
                <motion.div
                  className="text-[26px] font-semibold text-white leading-none tracking-[-0.03em]"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.45 + i * 0.07,
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                >
                  {v}
                </motion.div>
              </motion.div>
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
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 bg-[#0a0a0a] border border-[#222] w-full max-w-md p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                "top-0 left-0 border-l border-t",
                "top-0 right-0 border-r border-t",
                "bottom-0 left-0 border-l border-b",
                "bottom-0 right-0 border-r border-b",
              ].map((c, i) => (
                <div
                  key={i}
                  className={`absolute w-4 h-4 border-white/20 ${c}`}
                />
              ))}
              <div className="text-[9px] tracking-[0.18em] uppercase text-[#555] mb-7 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/20" />
                Initialize project
              </div>
              <form onSubmit={createProject}>
                <div className="relative mb-7">
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => {
                      setProjName(e.target.value);
                      setCreateErr("");
                    }}
                    className={`w-full bg-transparent border-b py-3 text-white text-[15px] font-medium focus:outline-none placeholder-[#2a2a2a] transition-colors ${createErr ? "border-red-500/40" : "border-[#222] focus:border-[#555]"}`}
                    placeholder="project-name"
                    required
                    autoFocus
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-px bg-white"
                    animate={{ width: projName ? "100%" : "0%" }}
                    transition={{ duration: 0.25 }}
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
                <div className="flex justify-end items-center gap-5">
                  <button
                    type="button"
                    onClick={() => {
                      setModal(false);
                      setCreateErr("");
                      setProjName("");
                    }}
                    className="text-[11px] tracking-[0.1em] uppercase text-[#555] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <Mag
                    type="submit"
                    className="text-[11px] tracking-[0.08em] uppercase font-semibold text-black bg-white px-6 py-2.5 hover:bg-[#e0e0e0] transition-colors relative overflow-hidden"
                  >
                    Create
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                      }}
                    />
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
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 bg-[#0a0a0a] border border-red-500/20 w-full max-w-sm p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[9px] tracking-[0.18em] uppercase text-red-400 mb-3 font-semibold">
                {toDelete?.owner?.toString() === user?._id?.toString()
                  ? "Delete project"
                  : "Leave project"}
              </div>
              <p className="text-[12px] text-[#666] font-mono mb-7 leading-relaxed">
                {toDelete?.owner?.toString() === user?._id?.toString()
                  ? `Permanently delete "${toDelete?.name}"?`
                  : `Leave "${toDelete?.name}"?`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDelete(false)}
                  className="flex-1 py-2.5 border border-[#222] text-[11px] uppercase tracking-[0.08em] text-[#555] hover:text-white hover:border-[#333] transition-all"
                >
                  Cancel
                </button>
                <Mag
                  onClick={execDelete}
                  className="flex-1 py-2.5 bg-red-500/10 border border-red-500/30 text-[11px] uppercase tracking-[0.08em] text-red-400 hover:bg-red-500/20 transition-all"
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
