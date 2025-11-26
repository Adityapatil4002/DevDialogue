import userModel from "../Models/user.model.js";
import projectModel from "../Models/project.model.js";

export const createUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const hashedPassword = await userModel.hashPassword(password);
  const user = await userModel.create({
    email,
    password: hashedPassword,
  });
  return user;
};

export const getAllUsers = async ({ userId }) => {
  const users = await userModel.find({
    _id: { $ne: userId },
  });
  return users;
};

// --- [NEW] Dashboard Logic Engine ---
export const getDashboardStats = async (userId) => {
  // 1. Fetch all projects involving the user
  const projects = await projectModel
    .find({ users: userId })
    .populate("users", "email");

  // 2. Calculate Basic Stats
  const totalProjects = projects.length;

  // Calculate unique collaborators (excluding the current user)
  const collaboratorSet = new Set();
  projects.forEach((project) => {
    project.users.forEach((u) => {
      if (u._id.toString() !== userId.toString()) {
        collaboratorSet.add(u.email);
      }
    });
  });
  const totalCollaborators = collaboratorSet.size;

  // 3. Calculate File & Language Stats
  let totalFiles = 0;
  const languageMap = {};

  // Helper to recursively traverse file tree
  const traverseTree = (tree) => {
    for (const key in tree) {
      if (tree[key].file) {
        totalFiles++;
        const ext = key.split(".").pop() || "plaintext";
        const lang = getLanguageName(ext);
        languageMap[lang] = (languageMap[lang] || 0) + 1;
      } else if (tree[key].directory) {
        traverseTree(tree[key].directory);
      } else if (typeof tree[key] === "object" && !tree[key].file) {
        // Fallback for flat structure objects (just in case)
        traverseTree(tree[key]);
      }
    }
  };

  projects.forEach((project) => {
    if (project.fileTree) {
      traverseTree(project.fileTree);
    }
  });

  // Format language stats for the chart (Top 5 + Others)
  const sortedLanguages = Object.entries(languageMap).sort(
    ([, a], [, b]) => b - a
  );

  const topLanguages = sortedLanguages
    .slice(0, 5)
    .map(([label, data]) => ({ label, data }));

  const otherCount = sortedLanguages
    .slice(5)
    .reduce((sum, [, data]) => sum + data, 0);

  if (otherCount > 0) {
    topLanguages.push({ label: "Other", data: otherCount });
  }

  // 4. Calculate 30-Day Activity (Project Creation Trend)
  const activityMap = {};
  const today = new Date();

  // Initialize last 30 days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    activityMap[d.toISOString().split("T")[0]] = 0;
  }

  // Populate actual data
  projects.forEach((project) => {
    if (project.createdAt) {
      const dateStr = new Date(project.createdAt).toISOString().split("T")[0];
      if (activityMap[dateStr] !== undefined) {
        activityMap[dateStr]++;
      }
    }
  });

  const activityChartData = Object.keys(activityMap).map((date) => ({
    date,
    count: activityMap[date],
  }));

  return {
    totalProjects,
    totalCollaborators,
    totalFiles,
    languageStats: topLanguages,
    activityChartData,
  };
};

// Internal Helper
const getLanguageName = (ext) => {
  const map = {
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    html: "HTML",
    css: "CSS",
    scss: "CSS",
    json: "JSON",
    md: "Markdown",
    py: "Python",
    java: "Java",
    c: "C",
    cpp: "C++",
    go: "Go",
    rs: "Rust",
    php: "PHP",
    rb: "Ruby",
    sql: "SQL",
  };
  return map[ext.toLowerCase()] || "Other";
};

const userService = {
  createUser,
  getAllUsers,
  getDashboardStats,
};

export default userService;
