import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
import { UserContext } from "../Context/user.context";
import axios from "../Config/axios";
import { useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Loader from "../components/Loader";
import { authClient } from "../Config/auth-client.js";

/* ───────── Variants ───────── */
const orchestrate = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const cellReveal = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ───────── Tooltip ───────── */
const Tooltip = ({ label, children, position = "top" }) => {
  const [show, setShow] = useState(false);
  const pos = {
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
            initial={{ opacity: 0, scale: 0.85, y: position === "top" ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={`absolute ${pos[position]} z-[200] pointer-events-none whitespace-nowrap bg-white text-black text-[9px] font-semibold tracking-wider uppercase px-2 py-1 rounded-md shadow-lg`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

const PulseDot = () => (
  <span className="relative inline-flex items-center justify-center">
    <motion.span
      className="absolute w-3 h-3 rounded-full bg-white/40"
      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
    />
    <span className="relative w-[6px] h-[6px] rounded-full bg-white" />
  </span>
);

const CellLabel = ({ children, right }) => (
  <div className="flex items-center justify-between mb-2 flex-shrink-0">
    <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/60">
      {children}
    </span>
    {right}
  </div>
);

const Mag = ({ children, onClick, className = "", type = "button" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 12, stiffness: 180 });
  const sy = useSpring(y, { damping: 12, stiffness: 180 });
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
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

/* ───────── Cell (with cursor-glow) ───────── */
const Cell = ({ children, className = "", onClick, style }) => {
  const ref = useRef(null);
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const bg = useTransform(
    [mx, my],
    ([x, y]) => `radial-gradient(300px circle at ${x}px ${y}px, rgba(255,255,255,0.04), transparent 70%)`
  );

  return (
    <motion.div
      ref={ref}
      variants={cellReveal}
      onClick={onClick}
      style={style}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onMouseLeave={() => { mx.set(-100); my.set(-100); }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative bg-[#0a0a0a] rounded-xl border border-white/[0.07] hover:border-white/[0.15] flex flex-col overflow-hidden min-h-0 transition-colors duration-300
                  ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <motion.div className="pointer-events-none absolute inset-0 rounded-xl" style={{ background: bg }} />
      <div className="relative z-10 flex flex-col flex-1 min-h-0 p-4">
        {children}
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════════════════════════ */

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
    return () => { live = false; };
  }, []);

  const week = useMemo(() => activityData.slice(-13), [activityData]);
  const total = useMemo(() => week.reduce((a, b) => a + (b.count ?? 0), 0), [week]);
  const maxVal = useMemo(() => Math.max(...week.map((d) => d.count ?? 0), 1), [week]);

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
      setCreateErr(typeof m === "string" && m.toLowerCase().includes("unique") ? "Name already taken." : m || "Failed to create project.");
    }
  }

  const handleAccept = async (id) => {
    try { await axios.put("/project/accept-invite", { projectId: id }); window.location.reload(); } catch (e) { console.error(e); }
  };
  const handleReject = async (id) => {
    try { await axios.put("/project/reject-invite", { projectId: id }); setInvites((p) => p.filter((i) => i._id !== id)); } catch (e) { console.error(e); }
  };
  const confirmDelete = (e, proj) => { e.stopPropagation(); setToDelete(proj); setDelete(true); };
  const execDelete = async () => {
    if (!toDelete) return;
    const own = toDelete.owner?.toString() === user?._id?.toString();
    setProject((p) => p.filter((x) => x._id !== toDelete._id));
    setDelete(false);
    try {
      own ? await axios.delete("/project/delete", { data: { projectId: toDelete._id } }) : await axios.put("/project/leave", { projectId: toDelete._id });
    } catch { alert("Failed"); window.location.reload(); }
  };
  const handleLogout = async () => { await authClient.signOut(); setUser(null); navigate("/login"); };

  if (isLoading) return <Loader />;

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-white/15 flex flex-col">
      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex-shrink-0 flex items-center justify-between px-5 h-12 border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-xl z-50"
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"
          >
            <span className="text-[9px] font-black tracking-wider text-black">DD</span>
          </motion.div>
          <span className="text-[13px] font-semibold tracking-tight">
            Dev<span className="text-white/50 font-normal">Dialogue</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[
            ["Dashboard", "/dashboard", "View analytics"],
            ["Profile", "/profile", "Account settings"],
          ].map(([label, path, tip]) => (
            <Tooltip key={path} label={tip} position="bottom">
              <motion.button
                onClick={() => navigate(path)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="text-[11px] tracking-[0.06em] uppercase text-white/80 hover:text-white transition-colors px-3.5 py-1.5 rounded-lg hover:bg-white/[0.06]"
              >
                {label}
              </motion.button>
            </Tooltip>
          ))}
        </div>
      </motion.nav>

      {/* ─── BENTO GRID (fixed 12x6, guaranteed fit) ─── */}
      <motion.div
        variants={orchestrate}
        initial="hidden"
        animate="show"
        className="flex-1 min-h-0 grid gap-2.5 p-2.5"
        style={{
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gridTemplateRows: "repeat(6, minmax(0, 1fr))",
        }}
      >
        {/* PROFILE — top-left */}
        <Cell
          onClick={() => navigate("/profile")}
          style={{ gridColumn: "span 3", gridRow: "span 2" }}
          className="group"
        >
          <CellLabel right={<Tooltip label="Online"><PulseDot /></Tooltip>}>
            Profile
          </CellLabel>
          <div className="flex items-center gap-3 flex-1 min-h-0">
            <motion.div
              className="w-11 h-11 rounded-xl bg-white text-black text-[18px] font-bold flex items-center justify-center flex-shrink-0"
              whileHover={{ scale: 1.1, rotate: 6 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-white truncate leading-tight">
                {user?.email?.split("@")[0]}
              </div>
              <div className="text-[10px] text-white/50 truncate mt-0.5 font-mono">
                {user?.email}
              </div>
            </div>
          </div>
          <Tooltip label="End session" position="top">
            <button
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
              className="mt-2 pt-2 border-t border-white/[0.08] text-[10px] tracking-[0.1em] uppercase text-white/50 hover:text-white transition-colors flex items-center gap-2 w-full text-left bg-transparent flex-shrink-0"
            >
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              >
                →
              </motion.span>
              Sign out
            </button>
          </Tooltip>
        </Cell>

        {/* CREATE */}
        <Cell
          onClick={() => setModal(true)}
          style={{ gridColumn: "span 3", gridRow: "span 2" }}
          className="items-center justify-center gap-2 group border-dashed"
        >
          <Tooltip label="Create new project">
            <motion.div
              className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center text-white/40 text-2xl font-light group-hover:border-white/50 group-hover:text-white transition-colors duration-400"
              whileHover={{ rotate: 180, scale: 1.08 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              +
            </motion.div>
          </Tooltip>
          <div className="text-[13px] font-semibold text-white/90 mt-1">
            New Project
          </div>
          <div className="text-[9px] text-white/40 tracking-[0.16em] uppercase">
            Click to initialize
          </div>
        </Cell>

        {/* ACTIVITY */}
        <Cell style={{ gridColumn: "span 6", gridRow: "span 2" }}>
          <CellLabel
            right={
              <div className="flex items-center gap-2">
                <Tooltip label="Live"><PulseDot /></Tooltip>
                <span className="text-[9px] font-mono text-white/50 tracking-wider">LIVE</span>
              </div>
            }
          >
            Activity
          </CellLabel>
          <div className="flex items-end gap-4 flex-1 min-h-0">
            <div className="flex flex-col justify-end flex-shrink-0">
              <motion.div
                key={total}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[38px] font-bold leading-none tracking-tight tabular-nums text-white"
              >
                {total}
              </motion.div>
              <div className="text-[10px] text-white/50 mt-1 font-mono">
                commits · 13d
              </div>
            </div>
            <div className="flex-1 flex items-end gap-[3px] h-full min-w-0 pb-1">
              {week.map((d, i) => {
                const intensity = (d.count ?? 0) / maxVal;
                const h = Math.max(6, intensity * 100);
                return (
                  <Tooltip key={i} label={`${d.count ?? 0} commits`}>
                    <motion.div
                      className="flex-1 rounded-sm cursor-pointer"
                      style={{
                        background:
                          intensity > 0.6 ? "white"
                          : intensity > 0.3 ? "rgba(255,255,255,0.55)"
                          : "rgba(255,255,255,0.15)",
                      }}
                      initial={{ height: 6 }}
                      animate={{ height: `${h}%` }}
                      transition={{
                        delay: 0.5 + i * 0.04,
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover={{ background: "white", scaleX: 1.3 }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </Cell>

        {/* PROJECTS — big */}
        <Cell style={{ gridColumn: "span 7", gridRow: "span 4" }}>
          <CellLabel
            right={
              <Tooltip label="Active projects">
                <span className="text-[10px] font-mono text-white/60 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08]">
                  {project.length}
                </span>
              </Tooltip>
            }
          >
            Projects
          </CellLabel>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {project.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-xl border border-white/[0.1] flex items-center justify-center text-white/30 text-lg"
                >
                  ◇
                </motion.div>
                <span className="text-[10px] tracking-[0.18em] uppercase text-white/40 font-mono">
                  no repositories
                </span>
              </div>
            ) : (
              <AnimatePresence>
                {project.map((proj, idx) => (
                  <motion.div
                    key={proj._id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => navigate(`/project/${proj._id}`)}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-2.5 mb-1 rounded-xl border border-transparent hover:border-white/[0.08] hover:bg-white/[0.03] cursor-pointer group"
                  >
                    <motion.div
                      className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[11px] font-bold font-mono text-white/80 flex-shrink-0 group-hover:bg-white group-hover:text-black transition-colors duration-300"
                      whileHover={{ rotate: 3 }}
                    >
                      {proj.name?.slice(0, 2).toUpperCase()}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-white font-medium truncate">
                        {proj.name}
                      </div>
                      <div className="text-[10px] text-white/50 mt-0.5 flex items-center gap-1.5 font-mono">
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full bg-white/60"
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        {proj.users?.length ?? 0} members
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {proj.users?.slice(0, 3).map((u, i) => (
                          <Tooltip key={i} label={u.email || "member"}>
                            <div className="w-5 h-5 rounded-full bg-white/15 border-2 border-[#0a0a0a] text-[7px] text-white flex items-center justify-center font-bold -ml-1.5 first:ml-0">
                              {u.email?.[0]?.toUpperCase()}
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                      <Tooltip label="Remove" position="left">
                        <motion.button
                          onClick={(e) => confirmDelete(e, proj)}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-[11px] text-white/30 hover:text-white hover:bg-white/10 transition-all w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </motion.button>
                      </Tooltip>
                      <motion.span
                        className="text-white/30 group-hover:text-white transition-colors text-[13px]"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
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

        {/* OVERVIEW */}
        <Cell style={{ gridColumn: "span 2", gridRow: "span 2" }}>
          <CellLabel>Stats</CellLabel>
          <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0">
            {[
              { k: "Proj", v: project.length, tip: "Total projects" },
              { k: "Inv", v: invites.length, tip: "Pending invites" },
              { k: "Mem", v: project.reduce((a, p) => a + (p.users?.length ?? 0), 0), tip: "Team members" },
              { k: "Act", v: project.length, tip: "Active workspaces" },
            ].map(({ k, v, tip }, i) => (
              <Tooltip key={k} label={tip}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.07, type: "spring", stiffness: 240, damping: 18 }}
                  whileHover={{ y: -2, scale: 1.04 }}
                  className="w-full h-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-2 py-1.5 hover:border-white/[0.15] transition-colors flex flex-col justify-between cursor-default"
                >
                  <div className="text-[8px] tracking-[0.14em] uppercase text-white/50 font-mono">
                    {k}
                  </div>
                  <div className="text-[20px] font-bold text-white leading-none tracking-tight">
                    {v}
                  </div>
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </Cell>

        {/* INBOX */}
        <Cell style={{ gridColumn: "span 3", gridRow: "span 2" }}>
          <CellLabel
            right={
              invites.length > 0 && (
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  className="bg-white text-black text-[9px] font-bold font-mono px-1.5 py-[1px] rounded-md min-w-[18px] text-center"
                >
                  {invites.length}
                </motion.span>
              )
            }
          >
            Inbox
          </CellLabel>
          <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
            {invites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="h-full flex flex-col items-center justify-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="text-xl text-white/40"
                >
                  ✓
                </motion.div>
                <span className="text-[9px] tracking-[0.16em] uppercase text-white/40 font-mono">
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
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ delay: idx * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between p-2 rounded-lg border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <motion.div
                        className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {invite.name?.[0]?.toUpperCase()}
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] text-white font-medium truncate">
                          {invite.name}
                        </div>
                        <div className="text-[8px] text-white/50 mt-0.5 tracking-wider uppercase font-mono">
                          Invite
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Tooltip label="Accept">
                        <Mag
                          onClick={() => handleAccept(invite._id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] text-white/60 hover:text-black hover:bg-white transition-colors"
                        >
                          ✓
                        </Mag>
                      </Tooltip>
                      <Tooltip label="Decline">
                        <Mag
                          onClick={() => handleReject(invite._id)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] text-white/60 hover:text-white hover:bg-white/15 transition-colors"
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
      </motion.div>

      {/* ─── CREATE MODAL ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => { setModal(false); setCreateErr(""); setProjName(""); }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] tracking-[0.18em] uppercase text-white/60 mb-7 flex items-center gap-2">
                <motion.span
                  className="w-2 h-2 rounded-sm bg-white/50"
                  animate={{ rotate: [0, 90] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                Initialize project
              </div>
              <form onSubmit={createProject}>
                <div className="relative mb-6">
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => { setProjName(e.target.value); setCreateErr(""); }}
                    className={`w-full bg-transparent border-b-2 py-3 text-white text-[15px] font-medium focus:outline-none placeholder-white/20 transition-colors ${createErr ? "border-white/40" : "border-white/[0.1] focus:border-white/60"}`}
                    placeholder="project-name"
                    required
                    autoFocus
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-[2px] bg-white rounded-full"
                    animate={{ width: projName ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <AnimatePresence>
                  {createErr && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-white/70 font-mono mb-5 flex items-center gap-1.5"
                    >
                      ⚠ {createErr}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="flex justify-end items-center gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setModal(false); setCreateErr(""); setProjName(""); }}
                    className="text-[11px] tracking-[0.1em] uppercase text-white/60 hover:text-white transition-colors px-4 py-2.5 rounded-lg hover:bg-white/[0.05]"
                  >
                    Cancel
                  </motion.button>
                  <Mag
                    type="submit"
                    className="text-[11px] tracking-[0.08em] uppercase font-bold text-black bg-white px-6 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    Create
                  </Mag>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DELETE MODAL ─── */}
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
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-sm p-7 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] tracking-[0.18em] uppercase text-white mb-3 font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                {toDelete?.owner?.toString() === user?._id?.toString() ? "Delete project" : "Leave project"}
              </div>
              <p className="text-[12px] text-white/60 font-mono mb-7 leading-relaxed">
                {toDelete?.owner?.toString() === user?._id?.toString()
                  ? <>Permanently delete <span className="text-white font-semibold">"{toDelete?.name}"</span>?</>
                  : <>Leave <span className="text-white font-semibold">"{toDelete?.name}"</span>?</>}
              </p>
              <div className="flex gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDelete(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-[11px] uppercase tracking-[0.08em] text-white/60 hover:text-white hover:border-white/25 transition-all"
                >
                  Cancel
                </motion.button>
                <Mag
                  onClick={execDelete}
                  className="flex-1 py-2.5 rounded-lg bg-white text-black text-[11px] uppercase tracking-[0.08em] font-bold hover:bg-white/90 transition-colors"
                >
                  {toDelete?.owner?.toString() === user?._id?.toString() ? "Delete" : "Leave"}
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