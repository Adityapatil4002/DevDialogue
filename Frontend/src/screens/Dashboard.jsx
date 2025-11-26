import React, { useEffect, useState, useMemo } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

// --- REGISTER CHARTJS ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

// --- COMPONENTS ---

// 1. The "Living" Background Component
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-[#030712]">
    <style>{`
      @keyframes float {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
    `}</style>
    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[120px] animate-[float_12s_ease-in-out_infinite_reverse]" />
    <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] bg-cyan-900/10 rounded-full blur-[100px] animate-[float_15s_ease-in-out_infinite]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
  </div>
);

// 2. Number Counter Component
const Counter = ({ from, to, duration = 1.5 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      setCount(Math.floor(easeOut * (to - from) + from));
      if (progress < 1) animationFrame = requestAnimationFrame(updateCount);
    };
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [to, from, duration]);

  return <span>{count}</span>;
};

// 3. Stat Card
const StatCard = ({ title, value, icon, gradient }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="relative p-6 rounded-2xl bg-[#0d1117]/60 backdrop-blur-xl border border-white/5 overflow-hidden group shadow-xl"
  >
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
    />
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <h3 className="text-4xl font-bold text-white mb-1 tracking-tight">
          <Counter from={0} to={value} />
        </h3>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div
        className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20 text-white shadow-lg`}
      >
        <i className={`${icon} text-xl`}></i>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30"); // "7", "15", "30"
  const navigate = useNavigate();

  // --- MOCK DATA GENERATOR (Used if API returns empty/zeros) ---
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
        count: Math.floor(Math.random() * 10) + 1, // Random activity 1-10
      })),
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/user/dashboard");

        // CHECK: If data is empty/zero, use MOCK data for display purposes
        if (
          !res.data ||
          (res.data.totalProjects === 0 &&
            res.data.activityChartData?.length === 0)
        ) {
          console.log("Using Mock Data for Visuals");
          setStats(generateMockData());
        } else {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Using fallback data due to error", err);
        setStats(generateMockData());
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- FILTER CHART DATA LOGIC ---
  const filteredActivityData = useMemo(() => {
    if (!stats?.activityChartData) return { labels: [], data: [] };

    const days = parseInt(timeRange);
    const slicedData = stats.activityChartData.slice(-days); // Take last N days

    return {
      labels: slicedData.map((d) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      data: slicedData.map((d) => d.count),
    };
  }, [stats, timeRange]);

  // --- CHART OPTIONS ---
  const lineChartData = {
    labels: filteredActivityData.labels,
    datasets: [
      {
        label: "Contributions",
        data: filteredActivityData.data,
        borderColor: "#8b5cf6", // Purple
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.5)");
          gradient.addColorStop(1, "rgba(139, 92, 246, 0)");
          return gradient;
        },
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#030712",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 8,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#fff",
        bodyColor: "#a78bfa",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6b7280" } },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#6b7280" },
        beginAtZero: true,
      },
    },
  };

  const doughnutData = {
    labels: stats?.languageStats?.map((l) => l.label) || [],
    datasets: [
      {
        data: stats?.languageStats?.map((l) => l.data) || [],
        backgroundColor: [
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
          "#10b981",
          "#f59e0b",
        ],
        borderColor: "#030712",
        borderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  return (
    <main className="min-h-screen text-white font-sans selection:bg-purple-500/30 overflow-hidden relative">
      <AnimatedBackground />

      <div className="relative z-10 p-6 md:p-12 max-w-[1400px] mx-auto">
        {/* --- HEADER --- */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              DevDialogue Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Overview of your AI-generated architecture.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md transition-all text-sm font-bold shadow-lg"
          >
            <i className="ri-arrow-left-line"></i> Return to Workspace
          </motion.button>
        </motion.header>

        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* 1. KEY METRICS */}
            <StatCard
              title="Active Projects"
              value={stats?.totalProjects}
              icon="ri-folder-shield-2-line"
              gradient="from-blue-500 to-cyan-400"
            />
            <StatCard
              title="Collaborators"
              value={stats?.totalCollaborators}
              icon="ri-team-line"
              gradient="from-purple-500 to-pink-500"
            />
            <StatCard
              title="Total Modules"
              value={stats?.totalFiles}
              icon="ri-code-s-slash-line"
              gradient="from-emerald-400 to-teal-500"
            />

            {/* 2. ACTIVITY CHART WITH FILTERS */}
            <motion.div
              variants={itemVariants}
              className="md:col-span-2 min-h-[450px] bg-[#0d1117]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Activity Overview
                  </h3>
                  <p className="text-sm text-gray-400">
                    Code generation frequency
                  </p>
                </div>

                {/* DATE FILTER BUTTONS */}
                <div className="flex bg-[#030712] p-1 rounded-lg border border-white/10">
                  {["7", "15", "30"].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${
                        timeRange === range
                          ? "bg-purple-600 text-white shadow-lg"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {range}D
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[350px] w-full">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </motion.div>

            {/* 3. TECH STACK (Doughnut + List) */}
            <motion.div
              variants={itemVariants}
              className="min-h-[450px] bg-[#0d1117]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col"
            >
              <h3 className="text-xl font-bold text-white mb-1">Tech Stack</h3>
              <p className="text-sm text-gray-400 mb-6">
                Languages generated by AI
              </p>

              <div className="flex-grow flex flex-col items-center justify-center gap-8">
                <div className="h-[220px] w-full flex justify-center relative">
                  <Doughnut
                    data={doughnutData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } }, // Hide default legend
                      cutout: "75%",
                    }}
                  />
                  {/* Center Text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <span className="block text-4xl font-bold text-white">
                        {stats?.languageStats?.length || 0}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">
                        Langs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Custom List Legend */}
                <div className="w-full grid grid-cols-2 gap-2">
                  {stats?.languageStats?.map((l, idx) => (
                    <div
                      key={l.label}
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5"
                    >
                      <span
                        className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                        style={{
                          color:
                            doughnutData.datasets[0].backgroundColor[idx] ||
                            "#fff",
                          backgroundColor: "currentColor",
                        }}
                      ></span>
                      <span className="text-xs text-gray-300 flex-grow">
                        {l.label}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {l.data}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
