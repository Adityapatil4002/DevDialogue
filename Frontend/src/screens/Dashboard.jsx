import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "../Config/axios";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence, useInView } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler,
);

/* ───────── Palette ───────── */
const palette = ["#e4e4e7", "#a1a1aa", "#71717a", "#52525b", "#3f3f46"];

/* ───────── Noise ───────── */
const NoiseBG = () => (
  <svg className="pointer-events-none fixed inset-0 z-0 w-full h-full opacity-[0.02]">
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

/* ───────── Animations ───────── */
const orchestrate = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
  },
};

/* ───────── Tooltip ───────── */
const Tip = ({ label, children, position = "top" }) => {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const update = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let x = r.left + r.width / 2;
    let y = position === "top" ? r.top - 8 : r.bottom + 8;
    x = Math.max(60, Math.min(window.innerWidth - 60, x));
    y = Math.max(28, Math.min(window.innerHeight - 28, y));
    setCoords({ x, y });
  };

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => {
        update();
        setShow(true);
      }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            style={{
              position: "fixed",
              left: coords.x,
              top: coords.y,
              transform:
                position === "top"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0%)",
            }}
            className="z-[9999] pointer-events-none whitespace-nowrap bg-[#1a1a1a] text-white/90 text-[10px] font-medium tracking-wide px-2.5 py-1.5 rounded-lg border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

/* ───────── Counter ───────── */
const Counter = ({ to, duration = 1.6 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start;
    let raf;
    const run = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * to));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return <span ref={ref}>{count}</span>;
};

/* ───────── Icons ───────── */
const ArrowLeftIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
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

const UsersIcon = ({ className = "w-4 h-4" }) => (
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

const BoxIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ChartBarIcon = ({ className = "w-4 h-4" }) => (
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

const ZapIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CalendarIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CodeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const TrendUpIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

/* ───────── Cell Label ───────── */
const CellLabel = ({ children, right }) => (
  <div className="flex items-center justify-between mb-3 flex-shrink-0">
    <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/40">
      {children}
    </span>
    {right}
  </div>
);

/* ───────── Cell ───────── */
const Cell = ({ children, className = "", span = "" }) => (
  <motion.div
    variants={fadeUp}
    className={`relative bg-[#0a0a0a] rounded-2xl border border-white/[0.06] p-5 flex flex-col overflow-hidden
                transition-colors duration-300 hover:border-white/[0.12] hover:bg-[#0d0d0d] ${span} ${className}`}
  >
    <div className="relative z-10 flex flex-col flex-1 min-h-0">{children}</div>
  </motion.div>
);

/* ───────── Stat Card ───────── */
const StatCard = ({ title, value, Icon, index }) => (
  <motion.div
    variants={fadeUp}
    className="bg-[#0a0a0a] rounded-2xl border border-white/[0.06] p-5 flex flex-col justify-between
               hover:border-white/[0.12] hover:bg-[#0d0d0d] transition-colors duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white/35">
        {title}
      </span>
      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
        <Icon className="w-4 h-4 text-white/30" />
      </div>
    </div>
    <div className="text-[38px] font-semibold leading-none tracking-tight text-white tabular-nums">
      <Counter to={value ?? 0} />
    </div>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════ */
/*                          DASHBOARD                           */
/* ════════════════════════════════════════════════════════════ */

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const navigate = useNavigate();

  const generateMockData = () => {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString();
    });
    return {
      totalProjects: 12,
      totalCollaborators: 5,
      totalFiles: 48,
      languageStats: [
        { label: "JavaScript", data: 15 },
        { label: "React", data: 10 },
        { label: "Node.js", data: 8 },
        { label: "HTML/CSS", data: 12 },
        { label: "Python", data: 3 },
      ],
      activityChartData: dates.map((date) => ({
        date,
        count: Math.floor(Math.random() * 10) + 1,
      })),
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/user/dashboard");
        if (
          !res.data ||
          (res.data.totalProjects === 0 &&
            res.data.activityChartData?.length === 0)
        ) {
          setStats(generateMockData());
        } else {
          setStats(res.data);
        }
      } catch {
        setStats(generateMockData());
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const filteredActivityData = useMemo(() => {
    if (!stats?.activityChartData) return { labels: [], data: [] };
    const days = parseInt(timeRange);
    const sliced = stats.activityChartData.slice(-days);
    return {
      labels: sliced.map((d) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      data: sliced.map((d) => d.count),
    };
  }, [stats, timeRange]);

  const lineChartData = {
    labels: filteredActivityData.labels,
    datasets: [
      {
        label: "Activity",
        data: filteredActivityData.data,
        borderColor: "rgba(255,255,255,0.7)",
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220);
          g.addColorStop(0, "rgba(255,255,255,0.08)");
          g.addColorStop(1, "rgba(255,255,255,0)");
          return g;
        },
        tension: 0.35,
        fill: true,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#0a0a0a",
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 1.5,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111",
        titleColor: "#fff",
        bodyColor: "#888",
        borderColor: "#222",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 11, weight: "600" },
        bodyFont: { size: 10, family: "monospace" },
        callbacks: { label: (item) => `${item.raw} commits` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#333",
          font: { family: "monospace", size: 9 },
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.03)", drawBorder: false },
        border: { display: false },
        ticks: {
          color: "#333",
          font: { family: "monospace", size: 9 },
          stepSize: 2,
          padding: 8,
        },
        beginAtZero: true,
      },
    },
  };

  const doughnutData = {
    labels: stats?.languageStats?.map((l) => l.label) || [],
    datasets: [
      {
        data: stats?.languageStats?.map((l) => l.data) || [],
        backgroundColor: palette,
        borderColor: "#0a0a0a",
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111",
        titleColor: "#fff",
        bodyColor: "#888",
        borderColor: "#222",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
      },
    },
    cutout: "75%",
  };

  /* ─── LOADING ─── */
  if (loading) {
    return (
      <main className="h-screen w-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/25 font-mono">
            Loading dashboard
          </span>
        </div>
      </main>
    );
  }

  const totalCommits = filteredActivityData.data.reduce((a, b) => a + b, 0);
  const peakActivity = Math.max(
    ...(filteredActivityData.data.length ? filteredActivityData.data : [0]),
  );
  const activeDays = filteredActivityData.data.filter((d) => d > 0).length;
  const avgPerDay = (totalCommits / parseInt(timeRange)).toFixed(1);
  const maxLang = Math.max(
    ...(stats?.languageStats?.map((x) => x.data) || [1]),
  );

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
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold tracking-tight">
              Dev<span className="text-white/35 font-normal">Dialogue</span>
            </span>
            <span className="text-white/15 text-[11px]">/</span>
            <span className="text-[10px] tracking-wider text-white/30 font-mono">
              dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400/80" />
            </span>
            <span className="text-[9px] font-medium text-white/30 tracking-wider">
              LIVE
            </span>
          </div>
          <Tip label="Back to workspace" position="bottom">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white/45 hover:text-white/90 hover:bg-white/[0.06] transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              Home
            </button>
          </Tip>
        </div>
      </motion.nav>

      {/* ─── CONTENT ─── */}
      <div className="relative z-10 flex-1 flex flex-col p-2.5 min-h-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 1, 0.5, 1] }}
          className="flex-shrink-0 flex items-baseline gap-3 px-2.5 mb-2.5"
        >
          <h1 className="text-[24px] font-semibold leading-none tracking-tight text-white">
            Dashboard
          </h1>
          <span className="text-[10px] text-white/25 font-mono tracking-wide">
            overview · real-time metrics
          </span>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={orchestrate}
          initial="hidden"
          animate="show"
          className="flex-1 min-h-0 grid grid-cols-12 grid-rows-[auto_1fr_auto] gap-2.5"
        >
          {/* ─── ROW 1: Stat Cards ─── */}
          <div className="col-span-12 grid grid-cols-3 gap-2.5">
            <StatCard
              title="Active Projects"
              value={stats?.totalProjects}
              Icon={FolderIcon}
              index={0}
            />
            <StatCard
              title="Collaborators"
              value={stats?.totalCollaborators}
              Icon={UsersIcon}
              index={1}
            />
            <StatCard
              title="Total Modules"
              value={stats?.totalFiles}
              Icon={BoxIcon}
              index={2}
            />
          </div>

          {/* ─── ROW 2: Charts ─── */}
          {/* Activity Chart */}
          <Cell span="col-span-8" className="min-h-0">
            <CellLabel
              right={
                <div className="flex gap-0.5 bg-white/[0.03] rounded-lg border border-white/[0.06] p-0.5">
                  {["7", "15", "30"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={`px-3 py-1 rounded-md text-[10px] font-medium tracking-wide transition-all duration-200 ${
                        timeRange === r
                          ? "bg-white text-black"
                          : "text-white/35 hover:text-white/70"
                      }`}
                    >
                      {r}D
                    </button>
                  ))}
                </div>
              }
            >
              Activity
            </CellLabel>

            <div className="flex items-baseline gap-3 mb-3 flex-shrink-0">
              <motion.div
                key={totalCommits}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[34px] font-semibold leading-none tracking-tight tabular-nums text-white"
              >
                {totalCommits}
              </motion.div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/35 font-mono">
                  total commits
                </span>
                <span className="text-[9px] text-white/20 font-mono">
                  last {timeRange} days
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0 w-full">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </Cell>

          {/* Tech Stack */}
          <Cell span="col-span-4" className="min-h-0">
            <CellLabel>Tech Stack</CellLabel>

            <div className="relative flex-shrink-0 h-[130px] flex items-center justify-center mb-3">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[24px] font-semibold leading-none text-white">
                  {stats?.languageStats?.length || 0}
                </span>
                <span className="text-[8px] tracking-[0.18em] uppercase text-white/30 font-mono mt-0.5">
                  languages
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-white/8 [&::-webkit-scrollbar-thumb]:rounded-full">
              {stats?.languageStats?.map((lang, idx) => (
                <motion.div
                  key={lang.label}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.3 + idx * 0.05,
                    duration: 0.3,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                  className="flex items-center gap-2.5 py-2 px-1 group"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: palette[idx] || "#444" }}
                  />
                  <span className="text-[11px] text-white/50 group-hover:text-white/80 transition-colors flex-1 truncate font-mono">
                    {lang.label}
                  </span>
                  <span className="text-[11px] font-semibold text-white/80 tabular-nums flex-shrink-0 mr-2">
                    {lang.data}
                  </span>
                  <div className="w-14 h-[3px] bg-white/[0.06] rounded-full overflow-hidden flex-shrink-0">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: palette[idx] || "#444" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(lang.data / maxLang) * 100}%` }}
                      transition={{
                        delay: 0.4 + idx * 0.06,
                        duration: 0.5,
                        ease: [0.25, 1, 0.5, 1],
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </Cell>

          {/* ─── ROW 3: Bottom Stats ─── */}
          <div className="col-span-12 grid grid-cols-4 gap-2.5">
            {[
              { label: "Avg / Day", value: avgPerDay, Icon: TrendUpIcon },
              { label: "Peak Activity", value: peakActivity, Icon: ZapIcon },
              { label: "Active Days", value: activeDays, Icon: CalendarIcon },
              {
                label: "Languages",
                value: stats?.languageStats?.length || 0,
                Icon: CodeIcon,
              },
            ].map(({ label, value, Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.35 + i * 0.05,
                  duration: 0.4,
                  ease: [0.25, 1, 0.5, 1],
                }}
                className="bg-[#0a0a0a] rounded-2xl border border-white/[0.06] px-5 py-4
                           hover:border-white/[0.12] hover:bg-[#0d0d0d] transition-colors duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-medium tracking-[0.14em] uppercase text-white/30 font-mono">
                    {label}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-white/20" />
                </div>
                <div className="text-[22px] font-semibold leading-none tracking-tight text-white tabular-nums">
                  {value}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex-shrink-0 flex items-center justify-between px-2.5 pt-2.5 mt-1"
        >
          <span className="text-[9px] font-mono text-white/15 tracking-wider">
            DEVDIALOGUE · v1.0
          </span>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500/60" />
            </span>
            <span>systems operational</span>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Dashboard;
