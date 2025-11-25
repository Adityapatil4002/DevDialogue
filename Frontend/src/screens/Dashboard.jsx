import React, { useEffect, useState } from "react";
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
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// --- REUSABLE GLOW CARD COMPONENT (Same as Home.jsx) ---
const GlowCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={`relative rounded-[2rem] border border-[#1a1f2e] bg-[#0f131a] p-6 overflow-hidden group z-20 hover:border-cyan-500/50 transition-all duration-500 ${className}`}
  >
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
    <div className="relative h-full z-10 flex flex-col">{children}</div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/user/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // --- CHART DATA PREPARATION ---
  const lineChartData = {
    labels: stats?.activityChartData.map((d) => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: "New Projects",
        data: stats?.activityChartData.map((d) => d.count),
        borderColor: "#06b6d4", // cyan-500
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#06b6d4",
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1f2e",
        titleColor: "#fff",
        bodyColor: "#ccc",
        borderColor: "#06b6d4",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "#1a1f2e" },
        ticks: { color: "#6b7280", maxTicksLimit: 10 },
      },
      y: {
        grid: { color: "#1a1f2e" },
        ticks: { color: "#6b7280", stepSize: 1 },
        beginAtZero: true,
      },
    },
  };

  const doughnutData = {
    labels: stats?.languageStats.map((l) => l.label),
    datasets: [
      {
        data: stats?.languageStats.map((l) => l.data),
        backgroundColor: [
          "#06b6d4",
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
          "#f97316",
          "#10b981",
        ],
        borderColor: "#0f131a",
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { color: "#fff", boxWidth: 15 } },
    },
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      {/* Background Ambiance */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[80rem] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Your workspace overview & analytics.
            </p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1f2e] hover:bg-[#2a3040] text-gray-300 hover:text-white transition-colors border border-[#2a3040]"
          >
            <i className="ri-arrow-left-line"></i> Back to Home
          </button>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 1: Summary Cards */}
          <GlowCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Total Projects
                </p>
                <h3 className="text-4xl font-bold text-white mt-2">
                  {stats?.totalProjects}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                <i className="ri-folder-2-line text-2xl"></i>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="text-cyan-400 font-medium">All time</span> count
            </div>
          </GlowCard>

          <GlowCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Total Collaborators
                </p>
                <h3 className="text-4xl font-bold text-white mt-2">
                  {stats?.totalCollaborators}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <i className="ri-group-line text-2xl"></i>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Unique partners across projects
            </div>
          </GlowCard>

          <GlowCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Files</p>
                <h3 className="text-4xl font-bold text-white mt-2">
                  {stats?.totalFiles}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <i className="ri-file-code-line text-2xl"></i>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Code & assets in your workspace
            </div>
          </GlowCard>

          {/* Row 2: Charts */}
          {/* Activity Chart (Big Card) */}
          <GlowCard className="md:col-span-2 min-h-[400px]">
            <h3 className="text-lg font-bold mb-6">30-Day Project Activity</h3>
            <div className="flex-grow h-[300px]">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </GlowCard>

          {/* Language Breakdown (Smaller Card) */}
          <GlowCard className="min-h-[400px]">
            <h3 className="text-lg font-bold mb-6">Language Distribution</h3>
            <div className="flex-grow h-[300px] flex items-center justify-center relative">
              {stats?.languageStats.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="text-center text-gray-500 flex flex-col items-center">
                  <i className="ri-code-s-slash-line text-4xl mb-2 opacity-50"></i>
                  <p>No code detected yet.</p>
                </div>
              )}
            </div>
          </GlowCard>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
