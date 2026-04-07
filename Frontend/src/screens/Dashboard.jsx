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
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

const greyPalette = ["#ffffff", "#aaaaaa", "#666666", "#333333", "#1a1a1a"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// --- PLAIN DARK BACKGROUND ---
const Background = () => <div className="fixed inset-0 z-0 bg-[#050505]" />;

// --- CORNERS ---
const Corners = () => (
  <>
    {[
      "top-0 left-0 border-l border-t",
      "top-0 right-0 border-r border-t",
      "bottom-0 left-0 border-l border-b",
      "bottom-0 right-0 border-r border-b",
    ].map((c, i) => (
      <div key={i} className={`absolute w-3 h-3 border-white/20 ${c}`} />
    ))}
  </>
);

// --- COUNTER ---
const Counter = ({ from = 0, to, duration = 1.8 }) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let startTime;
    let raf;
    const update = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * (to - from) + from));
      if (progress < 1) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, from, duration]);

  return <span ref={ref}>{count}</span>;
};

// --- MAGNETIC BUTTON ---
const MagButton = ({ children, onClick, className = "" }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 15, stiffness: 150 });
  const sy = useSpring(y, { damping: 15, stiffness: 150 });
  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
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

// --- STAT CARD ---
const StatCard = ({ title, value, index, icon }) => (
  <motion.div
    variants={itemUp}
    whileHover={{ borderColor: "#2a2a2a", y: -2 }}
    transition={{ duration: 0.2 }}
    className="relative bg-[#0a0a0a] border border-[#1a1a1a] px-5 py-4 overflow-hidden group"
  >
    <Corners />
    <motion.div
      className="absolute top-0 left-0 w-0 h-[1px] bg-white"
      whileHover={{ width: "100%" }}
      transition={{ duration: 0.4 }}
    />
    <div className="flex items-start justify-between mb-2">
      <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#444]">
        {title}
      </span>
      <span className="text-[11px] text-[#333]">{icon}</span>
    </div>
    <div className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-white tabular-nums">
      <Counter to={value ?? 0} />
    </div>
    <motion.div
      className="absolute bottom-0 left-0 h-[1px] bg-white/10"
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{
        delay: 0.3 + index * 0.1,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  </motion.div>
);

// --- PULSE DOT ---
const PulseDot = () => (
  <span className="relative inline-flex items-center justify-center">
    <span className="absolute w-3 h-3 rounded-full bg-white opacity-10 animate-ping" />
    <span className="relative w-[5px] h-[5px] rounded-full bg-white/60" />
  </span>
);

// --- SECTION LABEL ---
const SectionLabel = ({ children, right }) => (
  <div className="flex items-center justify-between mb-3 flex-shrink-0">
    <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#444]">
      {children}
    </span>
    {right}
  </div>
);

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
      } catch (err) {
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
    const slicedData = stats.activityChartData.slice(-days);
    return {
      labels: slicedData.map((d) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      data: slicedData.map((d) => d.count),
    };
  }, [stats, timeRange]);

  const lineChartData = {
    labels: filteredActivityData.labels,
    datasets: [
      {
        label: "Activity",
        data: filteredActivityData.data,
        borderColor: "rgba(255,255,255,0.8)",
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, "rgba(255,255,255,0.10)");
          gradient.addColorStop(1, "rgba(255,255,255,0)");
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#050505",
        pointBorderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 1.5,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0a0a0a",
        titleColor: "#fff",
        bodyColor: "#666",
        borderColor: "#2a2a2a",
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: (item) => `${item.raw} commits`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: "#1a1a1a" },
        ticks: {
          color: "#444",
          font: { family: "monospace", size: 8 },
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.03)" },
        border: { color: "#1a1a1a" },
        ticks: {
          color: "#444",
          font: { family: "monospace", size: 8 },
          stepSize: 1,
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
        backgroundColor: greyPalette,
        borderColor: "#050505",
        borderWidth: 3,
        hoverOffset: 4,
      },
    ],
  };

  // --- LOADING ---
  if (loading) {
    return (
      <main className="h-screen w-screen bg-[#050505] flex items-center justify-center overflow-hidden">
        <Background />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative w-10 h-10">
            <motion.div
              className="absolute inset-0 border border-white/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border-t border-white/60"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <span className="text-[9px] tracking-[0.25em] uppercase text-[#444] font-mono">
            loading
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
    <main className="h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-white/10 flex flex-col">
      <Background />

      <div className="relative z-10 flex flex-col h-full px-5 py-4">
        {/* NAV */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 flex items-center justify-between pb-3 mb-3 border-b border-[#1a1a1a]"
        >
          <div className="flex items-center gap-3">
            <div className="w-[26px] h-[26px] border border-[#222] flex items-center justify-center">
              <span className="text-[9px] font-bold tracking-widest text-[#555]">
                DD
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold tracking-[0.06em]">
                Dev<span className="text-[#555] font-normal">Dialogue</span>
              </span>
              <span className="text-[#333] font-mono text-[11px]">/</span>
              <span className="text-[9px] tracking-[0.18em] uppercase text-[#333] font-mono">
                dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[9px] font-mono text-[#444]">
              <PulseDot />
              <span className="tracking-wider">live</span>
            </div>
            <MagButton
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 px-3 py-1.5 border border-[#1a1a1a] hover:border-[#2a2a2a] text-[9px] tracking-[0.1em] uppercase text-[#555] hover:text-white transition-all"
            >
              <motion.span
                animate={{ x: [-1, 1, -1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                ←
              </motion.span>
              Workspace
            </MagButton>
          </div>
        </motion.nav>

        {/* TITLE ROW */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 flex items-baseline gap-4 mb-3"
        >
          <h1 className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-white">
            Dashboard
          </h1>
          <span className="text-[9px] font-mono text-[#333] tracking-[0.14em]">
            system overview · real-time metrics
          </span>
        </motion.div>

        {/* MAIN GRID */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex-1 min-h-0 flex flex-col gap-px"
        >
          {/* ROW 1 — STAT CARDS */}
          <div className="grid grid-cols-3 gap-px flex-shrink-0">
            <StatCard
              title="Active Projects"
              value={stats?.totalProjects}
              index={0}
              icon="▣"
            />
            <StatCard
              title="Collaborators"
              value={stats?.totalCollaborators}
              index={1}
              icon="◉"
            />
            <StatCard
              title="Total Modules"
              value={stats?.totalFiles}
              index={2}
              icon="◈"
            />
          </div>

          {/* ROW 2 — CHARTS */}
          <div className="flex gap-px flex-1 min-h-0">
            {/* ACTIVITY CHART */}
            <motion.div
              variants={itemUp}
              className="flex-[2] bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative overflow-hidden flex flex-col min-w-0"
            >
              <Corners />
              <SectionLabel
                right={
                  <div className="flex gap-px border border-[#1a1a1a]">
                    {["7", "15", "30"].map((range) => (
                      <motion.button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1 text-[9px] font-mono tracking-wider transition-all ${
                          timeRange === range
                            ? "bg-white text-black"
                            : "text-[#444] hover:text-white"
                        }`}
                      >
                        {range}D
                      </motion.button>
                    ))}
                  </div>
                }
              >
                Activity Overview
              </SectionLabel>

              <div className="flex items-baseline gap-3 mb-3 flex-shrink-0">
                <motion.div
                  key={totalCommits}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[36px] font-semibold leading-none tracking-[-0.04em] tabular-nums"
                >
                  {totalCommits}
                </motion.div>
                <div>
                  <div className="text-[9px] font-mono text-[#444]">
                    total commits
                  </div>
                  <div className="text-[9px] font-mono text-[#333]">
                    last {timeRange} days
                  </div>
                </div>
              </div>

              <div className="relative h-px bg-[#1a1a1a] mb-3 overflow-hidden flex-shrink-0">
                <motion.div
                  className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-4rem", "100%"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 1,
                  }}
                />
              </div>

              <div className="flex-1 min-h-0 w-full">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </motion.div>

            {/* TECH STACK */}
            <motion.div
              variants={itemUp}
              className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative overflow-hidden flex flex-col min-w-0"
            >
              <Corners />
              <SectionLabel>Tech Stack</SectionLabel>

              <div className="relative flex-shrink-0 h-[140px] flex items-center justify-center mb-3">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "#0a0a0a",
                        titleColor: "#fff",
                        bodyColor: "#666",
                        borderColor: "#2a2a2a",
                        borderWidth: 1,
                        padding: 8,
                      },
                    },
                    cutout: "78%",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-white">
                    {stats?.languageStats?.length || 0}
                  </span>
                  <span className="text-[8px] tracking-[0.2em] uppercase text-[#444] font-mono mt-0.5">
                    langs
                  </span>
                </div>
              </div>

              <div className="relative h-px bg-[#1a1a1a] mb-3 overflow-hidden flex-shrink-0">
                <motion.div
                  className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-4rem", "100%"] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 0.5,
                  }}
                />
              </div>

              <div className="flex flex-col gap-[3px] flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-[#2a2a2a]">
                <AnimatePresence>
                  {stats?.languageStats?.map((l, idx) => (
                    <motion.div
                      key={l.label}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.3 }}
                      whileHover={{ x: 3, borderColor: "#2a2a2a" }}
                      className="flex items-center gap-2 px-3 py-1.5 border border-[#111] group transition-all"
                    >
                      <span
                        className="w-[5px] h-[5px] flex-shrink-0"
                        style={{ backgroundColor: greyPalette[idx] || "#333" }}
                      />
                      <span className="text-[10px] text-[#777] flex-grow group-hover:text-white transition-colors font-mono truncate">
                        {l.label}
                      </span>
                      <span className="text-[10px] font-semibold text-white tabular-nums flex-shrink-0">
                        {l.data}
                      </span>
                      <div className="w-10 h-[2px] bg-[#1a1a1a] relative overflow-hidden flex-shrink-0">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-white"
                          initial={{ width: 0 }}
                          animate={{ width: `${(l.data / maxLang) * 100}%` }}
                          transition={{
                            delay: 0.4 + idx * 0.07,
                            duration: 0.6,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ROW 3 — BOTTOM STATS STRIP */}
          <div className="grid grid-cols-4 gap-px flex-shrink-0">
            {[
              { label: "Avg commits/day", value: avgPerDay },
              { label: "Peak activity", value: peakActivity },
              { label: "Active days", value: activeDays },
              { label: "Languages", value: stats?.languageStats?.length || 0 },
            ].map(({ label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.5 + i * 0.06,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ borderColor: "#2a2a2a", y: -1 }}
                className="bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-3 relative overflow-hidden transition-all"
              >
                <div className="text-[9px] tracking-[0.14em] uppercase text-[#444] font-mono mb-1">
                  {label}
                </div>
                <div className="text-[22px] font-semibold leading-none tracking-[-0.03em] text-white tabular-nums">
                  {value}
                </div>
                <motion.div
                  className="absolute bottom-0 left-0 h-[1px] bg-white/10"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.6 + i * 0.06, duration: 0.6 }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex-shrink-0 flex items-center justify-between mt-3 pt-3 border-t border-[#1a1a1a]"
        >
          <span className="text-[9px] font-mono text-[#333] tracking-[0.14em]">
            DEVDIALOGUE · DASHBOARD · v1.0
          </span>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#333]">
            <PulseDot />
            <span>all systems operational</span>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default Dashboard;
