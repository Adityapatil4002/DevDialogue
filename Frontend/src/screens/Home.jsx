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
  useInView,
} from "framer-motion";
import Loader from "../components/Loader";
import { authClient } from "../Config/auth-client.js";

/* ───────── Subtle Noise ───────── */
const NoiseBG = () => (
  <svg className="pointer-events-none fixed inset-0 z-0 w-full h-full opacity-[0.025]">
    <filter id="noiseFilter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.9"
        numOctaves="4"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

/* ───────── Orchestration ───────── */
const orchestrate = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cellReveal = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
  },
};

/* ───────── Tooltip (Fixed positioning via portal-like approach) ───────── */
const Tooltip = ({ label, children, position = "top" }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tipRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = position === "top" ? rect.top - 8 : rect.bottom + 8;

    // Clamp so tooltip never leaves viewport
    const tipW = 120; // approximate
    x = Math.max(tipW / 2 + 8, Math.min(window.innerWidth - tipW / 2 - 8, x));
    y = Math.max(32, Math.min(window.innerHeight - 32, y));

    setCoords({ x, y });
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => {
        updatePosition();
        setShow(true);
      }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            ref={tipRef}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: coords.x,
              top: coords.y,
              transform:
                position === "top"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0%)",
            }}
            className="z-[9999] pointer-events-none whitespace-nowrap bg-[#1a1a1a] text-white/90 text-[10px] font-medium tracking-wide px-2.5 py-1.5 rounded-lg border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

/* ───────── Cell Label ───────── */
const CellLabel = ({ children, right }) => (
  <div className="flex items-center justify-between mb-3 flex-shrink-0">
    <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/45">
      {children}
    </span>
    {right}
  </div>
);

/* ───────── Bento Cell ───────── */
const Cell = ({ children, className = "", onClick, span = "" }) => (
  <motion.div
    variants={cellReveal}
    onClick={onClick}
    className={`relative bg-[#0a0a0a] rounded-2xl border border-white/[0.06] p-5 flex flex-col overflow-hidden
                transition-colors duration-300 hover:border-white/[0.12] hover:bg-[#0d0d0d]
                ${onClick ? "cursor-pointer" : ""} ${span} ${className}`}
  >
    <div className="relative z-10 flex flex-col flex-1 min-h-0">{children}</div>
  </motion.div>
);

/* ───────── Animated Counter ───────── */
const AnimNum = ({ value, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, value, spring]);
  useEffect(() => {
    const unsub = display.on("change", (v) => setDisplayVal(v));
    return unsub;
  }, [display]);

  return (
    <span ref={ref} className={className}>
      {displayVal}
    </span>
  );
};

/* ───────── Icon Components ───────── */
const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const FolderIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);

const InboxIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </svg>
);

const ChartIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const UserIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const GridIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const LogOutIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const TrashIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const UsersIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const ActivityIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const TargetIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

/* ════════════════════════════════════════════════════════════ */
/*                            HOME                              */
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
    <main className="h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-white/15 flex flex-col relative">
      <NoiseBG />

      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-50 flex-shrink-0 flex items-center justify-between px-5 h-[52px] border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <span className="text-[9px] font-black tracking-wider text-black">
              DD
            </span>
          </div>
          <span className="text-[14px] font-semibold tracking-tight">
            Dev<span className="text-white/35 font-normal">Dialogue</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip label="Analytics & insights" position="bottom">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-[11px] font-medium tracking-wide text-white/50 hover:text-white/90 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]"
            >
              Dashboard
            </button>
          </Tooltip>
          <Tooltip label="Manage account" position="bottom">
            <button
              onClick={() => navigate("/profile")}
              className="text-[11px] font-medium tracking-wide text-white/50 hover:text-white/90 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]"
            >
              Profile
            </button>
          </Tooltip>
        </div>
      </motion.nav>

      {/* ─── BENTO GRID ─── */}
      <motion.div
        variants={orchestrate}
        initial="hidden"
        animate="show"
        className="relative z-10 flex-1 grid grid-cols-12 grid-rows-6 gap-2.5 p-2.5 min-h-0"
      >
        {/* ┌─ 1. NEW PROJECT ─┐ */}
        <Cell
          onClick={() => setModal(true)}
          span="col-span-3 row-span-3"
          className="group border-dashed border-white/[0.08] hover:border-white/[0.2] items-center text-center"
        >
          <div className="w-full text-left">
            <CellLabel>Create</CellLabel>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="w-14 h-14 rounded-2xl border border-dashed border-white/15 flex items-center justify-center text-white/25 group-hover:border-white/40 group-hover:text-white/70 group-hover:bg-white/[0.03] transition-all duration-300">
              <PlusIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[14px] font-medium text-white/70 group-hover:text-white/90 transition-colors">
                New Project
              </div>
              <div className="text-[10px] text-white/30 mt-1 tracking-wider uppercase">
                Click to initialize
              </div>
            </div>
          </div>
        </Cell>

        {/* ┌─ 2. ACTIVITY ─┐ */}
        <Cell span="col-span-3 row-span-3" className="flex flex-col">
          <CellLabel
            right={
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/40" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400/80" />
                </span>
                <span className="text-[9px] font-medium text-white/30 tracking-wider">
                  LIVE
                </span>
              </div>
            }
          >
            Activity
          </CellLabel>
          <div className="flex flex-col flex-1 min-h-0 justify-between">
            <div>
              <div className="text-[42px] font-semibold leading-none tracking-tight tabular-nums text-white">
                <AnimNum value={total} />
              </div>
              <div className="text-[11px] text-white/35 mt-1 font-mono flex items-center gap-1.5">
                <ChartIcon className="w-3 h-3 text-white/25" />
                commits · 13 days
              </div>
            </div>

            <div className="flex items-end gap-[3px] h-[60px] w-full mt-auto">
              {week.map((d, i) => {
                const h = Math.max(10, ((d.count ?? 0) / maxVal) * 100);
                const intensity = (d.count ?? 0) / maxVal;
                return (
                  <Tooltip key={i} label={`${d.count ?? 0} commits`}>
                    <motion.div
                      className="flex-1 rounded-sm"
                      style={{
                        height: 6,
                        background:
                          intensity > 0.6
                            ? "rgba(255,255,255,0.85)"
                            : intensity > 0.3
                              ? "rgba(255,255,255,0.4)"
                              : "rgba(255,255,255,0.1)",
                      }}
                      animate={{ height: `${h}%` }}
                      transition={{
                        delay: 0.3 + i * 0.04,
                        duration: 0.6,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </Cell>

        {/* ┌─ 3. INBOX ─┐ */}
        <Cell span="col-span-6 row-span-3">
          <CellLabel
            right={
              invites.length > 0 && (
                <span className="bg-white/90 text-black text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {invites.length}
                </span>
              )
            }
          >
            Inbox
          </CellLabel>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-white/8 [&::-webkit-scrollbar-thumb]:rounded-full">
            {invites.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <InboxIcon className="w-5 h-5 text-white/20" />
                </div>
                <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/25">
                  No pending invites
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <AnimatePresence mode="popLayout">
                  {invites.map((invite, idx) => (
                    <motion.div
                      key={invite._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.97,
                        transition: { duration: 0.15 },
                      }}
                      transition={{
                        delay: idx * 0.04,
                        duration: 0.35,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.015] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[11px] font-semibold text-white/70 flex-shrink-0">
                          {invite.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] text-white/80 font-medium truncate">
                            {invite.name}
                          </div>
                          <div className="text-[9px] text-white/30 mt-0.5 tracking-wider uppercase font-medium">
                            Invite request
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Tooltip label="Accept">
                          <button
                            onClick={() => handleAccept(invite._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                          >
                            <CheckIcon className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                        <Tooltip label="Decline">
                          <button
                            onClick={() => handleReject(invite._id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Cell>

        {/* ┌─ 4. PROJECTS ─┐ */}
        <Cell span="col-span-6 row-span-3">
          <CellLabel
            right={
              <span className="text-[10px] font-medium text-white/40 tabular-nums">
                {project.length} total
              </span>
            }
          >
            Projects
          </CellLabel>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-white/8 [&::-webkit-scrollbar-thumb]:rounded-full">
            {project.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <FolderIcon className="w-5 h-5 text-white/20" />
                </div>
                <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/25">
                  No repositories yet
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <AnimatePresence>
                  {project.map((proj, idx) => (
                    <motion.div
                      key={proj._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{
                        delay: idx * 0.03,
                        duration: 0.4,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                      onClick={() => navigate(`/project/${proj._id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] bg-white/[0.015] hover:bg-white/[0.03] cursor-pointer group transition-colors relative"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[11px] font-semibold text-white/60 flex-shrink-0 group-hover:bg-white group-hover:text-black transition-all duration-300">
                        {proj.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-white/80 font-medium truncate group-hover:text-white transition-colors">
                          {proj.name}
                        </div>
                        <div className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          {proj.users?.length ?? 0} members
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Stacked avatars on hover */}
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {proj.users?.slice(0, 3).map((u, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[#0d0d0d] text-[7px] text-white/70 flex items-center justify-center font-semibold -ml-1.5 first:ml-0"
                            >
                              {u.email?.[0]?.toUpperCase()}
                            </div>
                          ))}
                        </div>
                        <Tooltip
                          label={
                            proj.owner?.toString() === user?._id?.toString()
                              ? "Delete"
                              : "Leave"
                          }
                        >
                          <button
                            onClick={(e) => confirmDelete(e, proj)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <TrashIcon />
                          </button>
                        </Tooltip>
                        <ArrowRightIcon className="w-3.5 h-3.5 text-white/15 group-hover:text-white/50 transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Cell>

        {/* ┌─ 5. OVERVIEW ─┐ */}
        <Cell span="col-span-3 row-span-3" className="flex flex-col">
          <CellLabel>Overview</CellLabel>
          <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1">
            {[
              { k: "Projects", v: project.length, Icon: FolderIcon },
              { k: "Requests", v: invites.length, Icon: InboxIcon },
              {
                k: "Members",
                v: project.reduce((a, p) => a + (p.users?.length ?? 0), 0),
                Icon: UsersIcon,
              },
              { k: "Active", v: project.length, Icon: TargetIcon },
            ].map(({ k, v, Icon }, i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex flex-col justify-center bg-white/[0.02] border border-white/[0.05] rounded-xl px-3.5 py-2.5 hover:border-white/[0.1] hover:bg-white/[0.035] transition-colors"
              >
                <div className="text-[9px] font-medium tracking-[0.14em] uppercase text-white/35 mb-1.5 flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-white/30" />
                  {k}
                </div>
                <div className="text-[24px] font-semibold text-white leading-none tracking-tight">
                  <AnimNum value={v} />
                </div>
              </motion.div>
            ))}
          </div>
        </Cell>

        {/* ┌─ 6. PROFILE ─┐ */}
        <Cell
          span="col-span-3 row-span-3"
          className="flex flex-col justify-between"
        >
          <CellLabel>Profile</CellLabel>

          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white text-black text-[22px] font-bold flex items-center justify-center">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center min-w-0 px-2">
              <div className="text-[16px] font-semibold text-white truncate leading-tight">
                {user?.email?.split("@")[0]}
              </div>
              <div className="text-[11px] text-white/35 truncate mt-1 font-mono bg-white/[0.03] px-2 py-0.5 rounded-md inline-block">
                {user?.email}
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="mt-3 pt-3 border-t border-white/[0.06] text-[10px] font-medium tracking-[0.12em] uppercase text-white/40 hover:text-white/80 transition-colors flex items-center justify-center gap-2 w-full pb-0.5"
          >
            <LogOutIcon className="w-3.5 h-3.5" />
            Sign out
          </button>
        </Cell>
      </motion.div>

      {/* ─── CREATE MODAL ─── */}
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
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              className="relative z-10 bg-[#0e0e0e] border border-white/[0.08] rounded-2xl w-full max-w-md p-7 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.9)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[11px] font-medium tracking-[0.15em] uppercase text-white/50 mb-6 flex items-center gap-2">
                <FolderIcon className="w-3.5 h-3.5 text-white/40" />
                New Project
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
                    className={`w-full bg-white/[0.03] border rounded-xl px-4 py-3 text-white text-[14px] font-medium focus:outline-none placeholder-white/20 transition-colors duration-200 ${
                      createErr
                        ? "border-red-400/40 focus:border-red-400/60"
                        : "border-white/[0.08] focus:border-white/[0.25]"
                    }`}
                    placeholder="Enter project name..."
                    required
                    autoFocus
                  />
                </div>
                <AnimatePresence>
                  {createErr && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-red-400/80 font-mono mb-5 flex items-center gap-2 bg-red-400/[0.06] p-2.5 rounded-lg border border-red-400/[0.1]"
                    >
                      <XIcon className="w-3 h-3 flex-shrink-0" />
                      {createErr}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="flex justify-end items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setModal(false);
                      setCreateErr("");
                      setProjName("");
                    }}
                    className="text-[11px] font-medium tracking-wide text-white/45 hover:text-white/80 transition-colors px-4 py-2.5 rounded-xl hover:bg-white/[0.04]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[11px] font-semibold tracking-wide text-black bg-white px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors"
                  >
                    Create Project
                  </button>
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
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="relative z-10 bg-[#0e0e0e] border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.9)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[11px] font-medium tracking-[0.15em] uppercase text-white/60 mb-3 flex items-center gap-2">
                <TrashIcon className="w-3.5 h-3.5 text-white/40" />
                {toDelete?.owner?.toString() === user?._id?.toString()
                  ? "Delete project"
                  : "Leave project"}
              </div>
              <p className="text-[13px] text-white/50 mb-7 leading-relaxed">
                {toDelete?.owner?.toString() === user?._id?.toString() ? (
                  <>
                    Permanently delete{" "}
                    <span className="text-white/90 font-medium">
                      "{toDelete?.name}"
                    </span>
                    ? This action cannot be undone.
                  </>
                ) : (
                  <>
                    Leave{" "}
                    <span className="text-white/90 font-medium">
                      "{toDelete?.name}"
                    </span>
                    ? You'll need a new invite to rejoin.
                  </>
                )}
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setDelete(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-[11px] font-medium text-white/50 hover:text-white/80 hover:border-white/[0.15] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={execDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white text-[11px] font-semibold transition-colors"
                >
                  {toDelete?.owner?.toString() === user?._id?.toString()
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
