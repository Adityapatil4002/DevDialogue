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

/* ───────── Noise Texture SVG ───────── */
const NoiseBG = () => (
  <svg className="pointer-events-none fixed inset-0 z-0 w-full h-full opacity-[0.035]">
    <filter id="noiseFilter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.8"
        numOctaves="4"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

/* ───────── Advanced Variants ───────── */
const orchestrate = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

const cellReveal = {
  hidden: { opacity: 0, y: 20, scale: 0.97, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ───────── Tooltip ───────── */
const Tooltip = ({ label, children, position = "top" }) => {
  const [show, setShow] = useState(false);
  const pos = {
    top: "bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+10px)] left-1/2 -translate-x-1/2",
    left: "right-[calc(100%+10px)] top-1/2 -translate-y-1/2",
    right: "left-[calc(100%+10px)] top-1/2 -translate-y-1/2",
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
              scale: 0.85,
              y: position === "top" ? 6 : -6,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: position === "top" ? 6 : -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className={`absolute ${pos[position]} z-[200] pointer-events-none whitespace-nowrap bg-white text-black text-[9px] font-medium tracking-wider uppercase px-2.5 py-1.5 rounded-md shadow-[0_10px_40px_-4px_rgba(0,0,0,0.8)]`}
          >
            <span
              className={`absolute w-1.5 h-1.5 bg-white rotate-45 ${position === "top" ? "-bottom-[3px] left-1/2 -translate-x-1/2" : position === "bottom" ? "-top-[3px] left-1/2 -translate-x-1/2" : ""}`}
            />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

/* ───────── Pulse ───────── */
const PulseDot = () => (
  <span className="relative inline-flex items-center justify-center">
    <motion.span
      className="absolute w-3 h-3 rounded-full bg-white/40"
      animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
    />
    <span className="relative w-[6px] h-[6px] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
  </span>
);

/* ───────── Cell Label ───────── */
const CellLabel = ({ children, right, tip }) => (
  <div className="flex items-center justify-between mb-4 flex-shrink-0 z-20">
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/60">
        {children}
      </span>
      {tip && (
        <Tooltip label={tip}>
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/[0.05] border border-white/[0.1] text-white/40 hover:text-white hover:bg-white/[0.15] cursor-help text-[9px] font-mono transition-all">
            i
          </span>
        </Tooltip>
      )}
    </div>
    {right}
  </div>
);

/* ───────── Magnetic Button ───────── */
const Mag = ({ children, onClick, className = "", type = "button" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 12, stiffness: 180 });
  const sy = useSpring(y, { damping: 12, stiffness: 180 });
  const rotateX = useTransform(sy, [-10, 10], [5, -5]);
  const rotateY = useTransform(sx, [-10, 10], [-5, 5]);
  return (
    <motion.button
      ref={ref}
      type={type}
      style={{ x: sx, y: sy, rotateX, rotateY }}
      onMouseMove={(e) => {
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.3);
        y.set((e.clientY - r.top - r.height / 2) * 0.3);
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

/* ───────── Bento Cell with Cursor Glow ───────── */
const Cell = ({ children, className = "", onClick, span = "" }) => {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouse = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  };

  return (
    <motion.div
      ref={ref}
      variants={cellReveal}
      onClick={onClick}
      onMouseMove={handleMouse}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative bg-[#080808] rounded-[16px] border border-white/[0.08] p-5 flex flex-col overflow-hidden shadow-lg shadow-black/50
                  transition-all duration-500 hover:border-white/[0.18] hover:bg-[#0c0c0c] hover:shadow-[0_0_30px_rgba(255,255,255,0.03)]
                  ${onClick ? "cursor-pointer" : ""} ${span} ${className}`}
    >
      {/* Cursor-following glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[16px] opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) =>
              `radial-gradient(400px circle at ${x}px ${y}px, rgba(255,255,255,0.04), transparent 50%)`,
          ),
        }}
      />
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        {children}
      </div>
    </motion.div>
  );
};

/* ───────── Animated Counter ───────── */
const AnimNum = ({ value, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
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
    <motion.span ref={ref} className={className}>
      {displayVal}
    </motion.span>
  );
};

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
    <main className="h-screen w-screen overflow-hidden bg-[#030303] text-white font-sans selection:bg-white/15 flex flex-col relative">
      <NoiseBG />

      {/* Subtle ambient background glow for an attractive visible look */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-white/[0.015] blur-[100px] rounded-full pointer-events-none" />

      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-50 flex-shrink-0 flex items-center justify-between px-6 h-14 border-b border-white/[0.06] bg-[#030303]/60 backdrop-blur-xl"
      >
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] font-black tracking-wider text-black">
              DD
            </span>
          </motion.div>
          <span className="text-[15px] font-semibold tracking-tight">
            Dev<span className="text-white/40 font-normal">Dialogue</span>
          </span>
        </motion.div>

        <div className="flex items-center gap-1.5">
          {[
            ["Dashboard", "/dashboard", "View analytics & insights"],
            ["Profile", "/profile", "Manage your account"],
          ].map(([label, path, tip]) => (
            <Tooltip key={path} label={tip} position="bottom">
              <motion.button
                onClick={() => navigate(path)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="text-[11px] font-bold tracking-[0.08em] uppercase text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/[0.08]"
              >
                {label}
              </motion.button>
            </Tooltip>
          ))}
        </div>
      </motion.nav>

      {/* ─── BENTO GRID ─── */}
      <motion.div
        variants={orchestrate}
        initial="hidden"
        animate="show"
        className="relative z-10 flex-1 grid grid-cols-12 grid-rows-6 gap-3 p-3 min-h-0"
      >
        {/* ┌─ 1. NEW PROJECT (Top-Left, Small, Centered) ─┐ */}
        <Cell
          onClick={() => setModal(true)}
          span="col-span-3 row-span-3"
          className="group border-dashed border-white/[0.1] hover:border-white/[0.3] flex flex-col items-center text-center"
        >
          <div className="w-full">
            <CellLabel tip="Create and initialize a new project workspace">
              Create
            </CellLabel>
          </div>
          <div className="flex flex-col items-center justify-center flex-1 gap-4 w-full">
            <motion.div
              className="w-16 h-16 rounded-[2rem] border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 text-3xl font-light group-hover:border-white/60 group-hover:text-white group-hover:bg-white/[0.03] transition-all duration-500"
              whileHover={{ rotate: 90, scale: 1.05 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              +
            </motion.div>
            <div>
              <div className="text-[15px] font-semibold text-white/80 group-hover:text-white transition-colors">
                New Project
              </div>
              <div className="text-[11px] text-white/40 mt-1 tracking-wider uppercase group-hover:text-white/60 transition-colors">
                Click to initialize
              </div>
            </div>
          </div>
        </Cell>

        {/* ┌─ 2. ACTIVITY (Top-Middle, Small, Good layout) ─┐ */}
        <Cell span="col-span-3 row-span-3" className="flex flex-col">
          <CellLabel
            tip="Monitor your recent repository commit activity"
            right={
              <div className="flex items-center gap-2">
                <Tooltip label="Live data feed">
                  <PulseDot />
                </Tooltip>
                <span className="text-[9px] font-bold font-mono text-white/40 tracking-wider">
                  LIVE
                </span>
              </div>
            }
          >
            Activity
          </CellLabel>
          <div className="flex flex-col flex-1 min-h-0 justify-between mt-1">
            <div className="flex flex-col">
              <div className="text-[48px] font-bold leading-none tracking-[-0.03em] tabular-nums text-white">
                <AnimNum value={total} />
              </div>
              <div className="text-[12px] text-white/40 mt-1.5 font-mono">
                commits · 13d
              </div>
            </div>

            <div className="flex items-end gap-[4px] h-[70px] w-full pb-1 mt-auto">
              {week.map((d, i) => {
                const h = Math.max(8, ((d.count ?? 0) / maxVal) * 100);
                const intensity = (d.count ?? 0) / maxVal;
                return (
                  <Tooltip key={i} label={`${d.count ?? 0} commits`}>
                    <motion.div
                      className="flex-1 rounded-sm cursor-pointer relative"
                      style={{
                        height: 8,
                        background:
                          intensity > 0.6
                            ? "white"
                            : intensity > 0.3
                              ? "rgba(255,255,255,0.6)"
                              : "rgba(255,255,255,0.15)",
                      }}
                      animate={{ height: `${h}%` }}
                      transition={{
                        delay: 0.6 + i * 0.05,
                        duration: 0.7,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover={{
                        background: "white",
                        scaleX: 1.2,
                        transition: { duration: 0.15 },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </Cell>

        {/* ┌─ 3. INBOX (Top-Right, Big) ─┐ */}
        <Cell span="col-span-6 row-span-3">
          <CellLabel
            tip="Manage and respond to pending project invitations"
            right={
              invites.length > 0 && (
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  className="bg-white text-black text-[10px] font-bold font-mono px-2.5 py-[2px] rounded-md min-w-[24px] text-center"
                >
                  {invites.length}
                </motion.span>
              )
            }
          >
            Inbox
          </CellLabel>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {invites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="h-full flex flex-col items-center justify-center gap-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-3xl text-white/20"
                >
                  ✓
                </motion.div>
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/30 font-mono">
                  All Clear
                </span>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-1">
                <AnimatePresence mode="popLayout">
                  {invites.map((invite, idx) => (
                    <motion.div
                      key={invite._id}
                      layout
                      initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{
                        opacity: 0,
                        scale: 0.95,
                        filter: "blur(4px)",
                        transition: { duration: 0.2 },
                      }}
                      transition={{
                        delay: idx * 0.05,
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <motion.div
                          className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-[12px] font-bold text-white/90 flex-shrink-0"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {invite.name?.[0]?.toUpperCase()}
                        </motion.div>
                        <div className="min-w-0">
                          <div className="text-[13px] text-white/90 font-medium truncate group-hover:text-white transition-colors">
                            {invite.name}
                          </div>
                          <div className="text-[10px] text-white/40 mt-1 flex items-center gap-1.5 tracking-wider uppercase font-bold">
                            <motion.span
                              className="w-1.5 h-1.5 rounded-full bg-white/50"
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                            Invite Request
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1.5 ml-2">
                        <Tooltip label="Accept invite">
                          <Mag
                            onClick={() => handleAccept(invite._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-white/50 hover:text-white hover:bg-white/15 border border-transparent hover:border-white/20 transition-all bg-white/[0.03]"
                          >
                            ✓
                          </Mag>
                        </Tooltip>
                        <Tooltip label="Decline invite">
                          <Mag
                            onClick={() => handleReject(invite._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] text-white/40 hover:text-[#ff4444] hover:bg-[#ff4444]/10 border border-transparent hover:border-[#ff4444]/20 transition-all bg-white/[0.03]"
                          >
                            ✕
                          </Mag>
                        </Tooltip>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </Cell>

        {/* ┌─ 4. PROJECTS (Bottom-Left, Big) ─┐ */}
        <Cell span="col-span-6 row-span-3">
          <CellLabel
            tip="Access and manage your active repositories"
            right={
              <Tooltip label="Total active projects">
                <span className="text-[11px] font-bold font-mono text-white/70 px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.1]">
                  {project.length}
                </span>
              </Tooltip>
            }
          >
            Projects
          </CellLabel>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {project.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 90, 180, 270, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-xl border border-white/[0.1] flex items-center justify-center text-white/30 text-xl bg-white/[0.02]"
                >
                  ◇
                </motion.div>
                <span className="text-[11px] tracking-[0.2em] font-bold uppercase text-white/30 font-mono">
                  No Repositories
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-1">
                <AnimatePresence>
                  {project.map((proj, idx) => (
                    <motion.div
                      key={proj._id}
                      layout
                      initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                      transition={{
                        delay: idx * 0.04,
                        duration: 0.45,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      onClick={() => navigate(`/project/${proj._id}`)}
                      whileHover={{
                        y: -2,
                        backgroundColor: "rgba(255,255,255,0.04)",
                      }}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] hover:border-white/[0.15] bg-white/[0.015] cursor-pointer group relative transition-all"
                    >
                      {/* Left accent bar */}
                      <motion.div
                        className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ scaleY: 0 }}
                        whileHover={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                      />

                      <motion.div
                        className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[12px] font-bold font-mono text-white/80 flex-shrink-0 group-hover:bg-white group-hover:text-black transition-all duration-300"
                        whileHover={{ scale: 1.08, rotate: 4 }}
                      >
                        {proj.name?.slice(0, 2).toUpperCase()}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] text-white/90 font-semibold truncate group-hover:text-white transition-colors">
                          {proj.name}
                        </div>
                        <div className="text-[11px] text-white/40 mt-1 flex items-center gap-1.5 font-mono">
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full bg-white/50"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          {proj.users?.length ?? 0} members
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {proj.users?.slice(0, 3).map((u, i) => (
                            <Tooltip key={i} label={u.email || "member"}>
                              <motion.div
                                initial={{ x: 8, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="w-6 h-6 rounded-full bg-[#1a1a1a] border-2 border-[#0a0a0a] text-[8px] text-white/90 flex items-center justify-center font-bold -ml-2 first:ml-0 z-10"
                              >
                                {u.email?.[0]?.toUpperCase()}
                              </motion.div>
                            </Tooltip>
                          ))}
                        </div>
                        <Tooltip
                          label={
                            proj.owner?.toString() === user?._id?.toString()
                              ? "Delete project"
                              : "Leave project"
                          }
                          position="left"
                        >
                          <motion.button
                            onClick={(e) => confirmDelete(e, proj)}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-[12px] text-white/30 hover:text-white hover:bg-white/15 transition-all w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 bg-white/[0.03]"
                          >
                            ✕
                          </motion.button>
                        </Tooltip>
                        <motion.span
                          className="text-white/20 group-hover:text-white/70 transition-colors text-[14px] ml-1"
                          animate={{ x: [0, 4, 0] }}
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
              </div>
            )}
          </div>
        </Cell>

        {/* ┌─ 5. OVERVIEW (Bottom-Middle, Small, Fit 4 evenly) ─┐ */}
        <Cell span="col-span-3 row-span-3" className="flex flex-col">
          <CellLabel tip="A quick high-level statistics overview">
            Overview
          </CellLabel>
          <div className="grid grid-cols-2 grid-rows-2 gap-2.5 flex-1 w-full h-full">
            {[
              {
                k: "Projects",
                v: project.length,
                icon: "▣",
                tip: "Total created projects",
              },
              {
                k: "Requests",
                v: invites.length,
                icon: "◈",
                tip: "Pending incoming invites",
              },
              {
                k: "Members",
                v: project.reduce((a, p) => a + (p.users?.length ?? 0), 0),
                icon: "◉",
                tip: "Teammates across all projects",
              },
              {
                k: "Active",
                v: project.length,
                icon: "◎",
                tip: "Currently active workspaces",
              },
            ].map(({ k, v, icon, tip }, i) => (
              <Tooltip key={k} label={tip}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.3 + i * 0.08,
                    type: "spring",
                    stiffness: 200,
                    damping: 16,
                  }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="flex flex-col justify-center h-full w-full bg-white/[0.025] border border-white/[0.06] rounded-xl px-4 py-2 hover:border-white/[0.15] hover:bg-white/[0.05] transition-all cursor-default"
                >
                  <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-white/40 font-mono mb-2 flex items-center gap-1.5">
                    <span className="text-[11px] text-white/60">{icon}</span>
                    {k}
                  </div>
                  <div className="text-[26px] font-bold text-white leading-none tracking-tight">
                    <AnimNum value={v} />
                  </div>
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </Cell>

        {/* ┌─ 6. PROFILE (Bottom-Right, Small, Good layout) ─┐ */}
        <Cell
          span="col-span-3 row-span-3"
          className="group flex flex-col justify-between"
        >
          <CellLabel tip="Manage your account profile and session settings">
            Profile
          </CellLabel>

          <div className="flex flex-col items-center justify-center flex-1 gap-3 mt-2">
            <motion.div
              className="w-16 h-16 rounded-[1.25rem] bg-white text-black text-[26px] font-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </motion.div>
            <div className="text-center min-w-0 px-2">
              <div className="text-[17px] font-bold text-white truncate leading-tight tracking-tight">
                {user?.email?.split("@")[0]}
              </div>
              <div className="text-[12px] text-white/40 truncate mt-1.5 font-mono bg-white/[0.05] px-2.5 py-0.5 rounded-md inline-block border border-white/[0.05]">
                {user?.email}
              </div>
            </div>
          </div>

          <Tooltip label="Securely end your session" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className="mt-4 pt-3.5 border-t border-white/[0.08] text-[11px] font-bold tracking-[0.15em] uppercase text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2.5 w-full bg-transparent group/lo hover:bg-white/[0.02] rounded-b-lg pb-1"
            >
              <motion.span
                className="inline-block text-[14px]"
                animate={{ x: [0, 4, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                →
              </motion.span>
              Sign out
            </button>
          </Tooltip>
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
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.92, y: 20, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 bg-[#0c0c0c] border border-white/[0.1] rounded-2xl w-full max-w-md p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner accents */}
              {[
                "top-3 left-3",
                "top-3 right-3",
                "bottom-3 left-3",
                "bottom-3 right-3",
              ].map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className={`absolute w-1.5 h-1.5 rounded-full bg-white/20 ${c}`}
                />
              ))}

              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/60 mb-7 flex items-center gap-2.5">
                <motion.span
                  className="w-2.5 h-2.5 rounded-[3px] bg-white/40"
                  animate={{ rotate: [0, 90] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                Initialize Project
              </div>
              <form onSubmit={createProject}>
                <div className="relative mb-7 group/input">
                  <input
                    type="text"
                    value={projName}
                    onChange={(e) => {
                      setProjName(e.target.value);
                      setCreateErr("");
                    }}
                    className={`w-full bg-transparent border-b-2 py-3 text-white text-[16px] font-medium focus:outline-none placeholder-white/20 transition-colors duration-300 ${createErr ? "border-white/40" : "border-white/[0.1] focus:border-white/60"}`}
                    placeholder="Enter project name..."
                    required
                    autoFocus
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 h-[2px] bg-white rounded-full"
                    animate={{ width: projName ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <AnimatePresence>
                  {createErr && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, y: -5 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -5 }}
                      className="text-[12px] text-white/70 font-mono mb-6 flex items-center gap-2 bg-white/[0.05] p-3 rounded-lg border border-white/[0.05]"
                    >
                      <span className="text-white">⚠</span> {createErr}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="flex justify-end items-center gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setModal(false);
                      setCreateErr("");
                      setProjName("");
                    }}
                    className="text-[12px] font-bold tracking-[0.1em] uppercase text-white/50 hover:text-white transition-colors px-5 py-3 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/[0.1]"
                  >
                    Cancel
                  </motion.button>
                  <Mag
                    type="submit"
                    className="text-[12px] font-black tracking-[0.1em] uppercase text-black bg-white px-8 py-3 rounded-xl hover:bg-white/90 transition-colors relative overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <span className="relative z-10">Create</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.08] to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        ease: "linear",
                        repeatDelay: 1,
                      }}
                    />
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
              initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 bg-[#0c0c0c] border border-white/[0.1] rounded-2xl w-full max-w-sm p-7 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/80 mb-4 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-white/50" />
                {toDelete?.owner?.toString() === user?._id?.toString()
                  ? "Delete project"
                  : "Leave project"}
              </div>
              <p className="text-[13px] text-white/60 font-mono mb-8 leading-relaxed">
                {toDelete?.owner?.toString() === user?._id?.toString() ? (
                  <>
                    Permanently delete{" "}
                    <span className="text-white font-bold px-1 bg-white/[0.05] rounded border border-white/[0.1]">
                      "{toDelete?.name}"
                    </span>
                    ?
                  </>
                ) : (
                  <>
                    Leave{" "}
                    <span className="text-white font-bold px-1 bg-white/[0.05] rounded border border-white/[0.1]">
                      "{toDelete?.name}"
                    </span>
                    ?
                  </>
                )}
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDelete(false)}
                  className="flex-1 py-3 rounded-xl border border-white/[0.1] text-[11px] font-bold uppercase tracking-[0.1em] text-white/60 hover:text-white hover:border-white/30 hover:bg-white/[0.03] transition-all"
                >
                  Cancel
                </motion.button>
                <Mag
                  onClick={execDelete}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-[11px] uppercase tracking-[0.1em] font-black hover:bg-white/90 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
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
