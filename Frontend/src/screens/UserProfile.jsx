import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  Lock,
  Code,
  Zap,
  Layout,
  LogOut,
  Save,
  Loader,
  ArrowLeft,
  Github,
  Twitter,
  Globe,
  CheckCircle2,
  Menu,
  AlertTriangle,
} from "lucide-react";
import { UserContext } from "../Context/user.context.jsx";
import axios from "../Config/axios.js";
import { useNavigate } from "react-router-dom";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// --- REUSABLE COMPONENTS ---

const RadioSelection = ({
  selected,
  value,
  onSelect,
  title,
  description,
  icon: Icon,
}) => (
  <div
    onClick={() => onSelect(value)}
    className={`relative flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 group
      ${
        selected === value
          ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
          : "bg-[#141820] border-[#1f2533] hover:border-gray-600"
      }`}
  >
    <div
      className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors
      ${
        selected === value
          ? "border-cyan-500"
          : "border-gray-600 group-hover:border-gray-400"
      }`}
    >
      {selected === value && (
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
      )}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        {Icon && (
          <Icon
            size={16}
            className={selected === value ? "text-cyan-400" : "text-gray-400"}
          />
        )}
        <h4
          className={`font-semibold text-sm ${
            selected === value ? "text-white" : "text-gray-300"
          }`}
        >
          {title}
        </h4>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  </div>
);

const InputGroup = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-500 transition-colors"
        />
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-[#0a0a0a] border border-[#1f2533] rounded-xl py-3.5 ${
          Icon ? "pl-11" : "pl-4"
        } pr-4 text-sm text-white placeholder-gray-600 
          focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all hover:border-gray-700`}
      />
    </div>
  </div>
);

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // General Profile Data
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    socials: { github: "", twitter: "", linkedin: "" },
    settings: {
      theme: "dracula",
      fontSize: 14,
      aiModel: "gemini-pro",
      wordWrap: true,
      showLineNumbers: true,
    },
  });

  // Separate State for Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load Initial Data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        socials: user.socials || { github: "", twitter: "", linkedin: "" },
        settings: {
          theme: user.settings?.theme || "dracula",
          fontSize: user.settings?.fontSize || 14,
          aiModel: user.settings?.aiModel || "gemini-pro",
          wordWrap: user.settings?.wordWrap ?? true,
          showLineNumbers: user.settings?.showLineNumbers ?? true,
        },
      });
    }
  }, [user]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      settings: { ...prev.settings, [key]: value },
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [platform]: value },
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // 1. Save General Settings
  const saveSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.put("/users/update", formData);
      setUser(res.data.user);
      setMessage({ type: "success", text: "Settings updated successfully" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to update settings" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 2. Change Password
  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords don't match" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    if (passwordData.newPassword.length < 3) {
      setMessage({ type: "error", text: "Password too short" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    try {
      await axios.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: "success", text: "Password changed successfully" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to change password",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 3. Delete Account
  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;

    setLoading(true);
    try {
      await axios.delete("/users/delete");
      setUser(null);
      navigate("/"); // Redirect to landing
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to delete account" });
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get("/users/logout");
      setUser(null);
      navigate("/");
    } catch (e) {
      console.log(e);
    }
  };

  const tabs = [
    {
      id: "profile",
      label: "General Settings",
      icon: User,
      desc: "Update your profile details",
    },
    {
      id: "preferences",
      label: "Editor Preferences",
      icon: Code,
      desc: "Customize your coding environment",
    },
    {
      id: "ai",
      label: "AI Configuration",
      icon: Zap,
      desc: "Manage AI models and usage",
    },
    {
      id: "security",
      label: "Security",
      icon: Lock,
      desc: "Password and account protection",
    },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-200 font-sans overflow-hidden selection:bg-cyan-500/30">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-[#0f131a] border-r border-[#1f2533] flex flex-col flex-shrink-0 z-20">
        {/* Logo / Back */}
        <div className="h-16 flex items-center px-6 border-b border-[#1f2533]">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <div className="p-1.5 rounded-lg bg-[#141820] border border-[#1f2533] group-hover:border-cyan-500/50 transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="font-semibold text-sm">Back to Home</span>
          </button>
        </div>

        {/* User Mini Profile */}
        <div className="p-6 border-b border-[#1f2533]">
          <div className="flex items-center gap-3 mb-1">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${user?.name}&background=0D8ABC&color=fff`
              }
              alt="User"
              className="w-10 h-10 rounded-full border border-[#1f2533]"
            />
            <div className="overflow-hidden">
              <h3 className="font-bold text-white text-sm truncate">
                {user?.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <h4 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">
            Settings Menu
          </h4>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group
                 ${
                   activeTab === tab.id
                     ? "bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                     : "hover:bg-[#141820] border border-transparent"
                 }`}
            >
              <div
                className={`mt-0.5 p-1.5 rounded-lg ${
                  activeTab === tab.id
                    ? "bg-cyan-500 text-black"
                    : "bg-[#1f2533] text-gray-400 group-hover:text-white"
                }`}
              >
                <tab.icon size={16} />
              </div>
              <div>
                <span
                  className={`block text-sm font-semibold ${
                    activeTab === tab.id
                      ? "text-cyan-400"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  {tab.label}
                </span>
                <span className="text-[11px] text-gray-500 leading-tight">
                  {tab.desc}
                </span>
              </div>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#1f2533]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-semibold hover:bg-red-500/10 hover:border-red-500/40 transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0a]">
        {/* Header */}
        <header className="h-16 border-b border-[#1f2533] flex items-center justify-between px-8 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Settings</span>
            <span className="text-gray-700">/</span>
            <span className="text-white font-medium">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Message Toast */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2
                          ${
                            message.type === "success"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <AlertTriangle size={12} />
                  )}{" "}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button (Only show on tabs that use the main save function) */}
            {activeTab !== "security" && (
              <button
                onClick={saveSettings}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                <span>Save Changes</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="text-gray-500">
                Update your preferences and settings here.
              </p>
            </div>

            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* --- 1. PROFILE TAB --- */}
              {activeTab === "profile" && (
                <>
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <InputGroup
                      label="Display Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      icon={User}
                    />
                    <InputGroup
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Tokyo, Japan"
                      icon={Globe}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Tell us a little bit about yourself..."
                      className="w-full bg-[#0a0a0a] border border-[#1f2533] rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none"
                    />
                  </motion.div>

                  {/* Socials */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-sm font-bold text-white mb-4 border-b border-[#1f2533] pb-2">
                      Social Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup
                        label="GitHub"
                        name="github"
                        value={formData.socials.github}
                        onChange={(e) =>
                          handleSocialChange("github", e.target.value)
                        }
                        placeholder="username"
                        icon={Github}
                      />
                      <InputGroup
                        label="Twitter"
                        name="twitter"
                        value={formData.socials.twitter}
                        onChange={(e) =>
                          handleSocialChange("twitter", e.target.value)
                        }
                        placeholder="handle"
                        icon={Twitter}
                      />
                    </div>
                  </motion.div>
                </>
              )}

              {/* --- 2. PREFERENCES TAB --- */}
              {activeTab === "preferences" && (
                <>
                  <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-sm font-bold text-white mb-2">
                      Editor Theme
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <RadioSelection
                        selected={formData.settings.theme}
                        value="dracula"
                        onSelect={(v) => handleSettingChange("theme", v)}
                        title="Dracula (Default)"
                        description="A dark theme for many editors, terminals, and shells."
                        icon={Menu}
                      />
                      <RadioSelection
                        selected={formData.settings.theme}
                        value="monokai"
                        onSelect={(v) => handleSettingChange("theme", v)}
                        title="Monokai Vivid"
                        description="High contrast theme with vivid colors."
                        icon={Menu}
                      />
                      <RadioSelection
                        selected={formData.settings.theme}
                        value="github-dark"
                        onSelect={(v) => handleSettingChange("theme", v)}
                        title="GitHub Dark"
                        description="The classic GitHub dark mode experience."
                        icon={Github}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="pt-6 border-t border-[#1f2533]"
                  >
                    <h3 className="text-sm font-bold text-white mb-4">
                      Editor Behavior
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-[#0f131a] border border-[#1f2533] flex items-center justify-between">
                        <div className="text-sm text-gray-300">Word Wrap</div>
                        <input
                          type="checkbox"
                          checked={formData.settings.wordWrap}
                          onChange={(e) =>
                            handleSettingChange("wordWrap", e.target.checked)
                          }
                          className="accent-cyan-500 w-5 h-5 cursor-pointer"
                        />
                      </div>
                      <div className="p-4 rounded-xl bg-[#0f131a] border border-[#1f2533] flex items-center justify-between">
                        <div className="text-sm text-gray-300">
                          Show Line Numbers
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.settings.showLineNumbers}
                          onChange={(e) =>
                            handleSettingChange(
                              "showLineNumbers",
                              e.target.checked
                            )
                          }
                          className="accent-cyan-500 w-5 h-5 cursor-pointer"
                        />
                      </div>
                    </div>
                  </motion.div>
                </>
              )}

              {/* --- 3. AI CONFIGURATION --- */}
              {activeTab === "ai" && (
                <>
                  <motion.div
                    variants={itemVariants}
                    className="p-6 rounded-2xl bg-gradient-to-br from-[#0f131a] to-[#0a0a0a] border border-[#1f2533] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Zap size={120} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">
                      Current Usage
                    </h3>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-4xl font-mono font-bold text-white">
                        45,200
                      </span>
                      <span className="text-sm text-gray-500 mb-1">
                        / 100,000 tokens
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1f2533] rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 w-[45%] rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Plan resets in 12 days.
                    </p>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="space-y-4 pt-4"
                  >
                    <h3 className="text-sm font-bold text-white">
                      Select AI Model
                    </h3>
                    <RadioSelection
                      selected={formData.settings.aiModel}
                      value="gemini-pro"
                      onSelect={(v) => handleSettingChange("aiModel", v)}
                      title="Gemini 1.5 Pro"
                      description="Best balance of speed and reasoning capabilities."
                      icon={Zap}
                    />
                    <RadioSelection
                      selected={formData.settings.aiModel}
                      value="gpt-4"
                      onSelect={(v) => handleSettingChange("aiModel", v)}
                      title="GPT-4 Turbo"
                      description="Highest accuracy for complex code generation."
                      icon={Zap}
                    />
                  </motion.div>
                </>
              )}

              {/* --- 4. SECURITY (Functional) --- */}
              {activeTab === "security" && (
                <>
                  <motion.div variants={itemVariants} className="space-y-6">
                    <InputGroup
                      label="Current Password"
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      icon={Lock}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup
                        label="New Password"
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        icon={Lock}
                      />
                      <InputGroup
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        icon={Lock}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={updatePassword}
                        disabled={loading}
                        className="px-6 py-2 bg-[#1f2533] hover:bg-[#2a3040] text-white text-xs font-bold rounded-lg transition-colors border border-gray-700 flex items-center gap-2"
                      >
                        {loading ? (
                          <Loader className="animate-spin" size={14} />
                        ) : null}{" "}
                        Update Password
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="pt-8 border-t border-[#1f2533] mt-8"
                  >
                    <div className="p-4 rounded-xl border border-red-900/30 bg-red-900/5 flex items-center justify-between">
                      <div>
                        <h4 className="text-red-400 font-bold text-sm">
                          Delete Account
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Permanently remove your account and data.
                        </p>
                      </div>
                      <button
                        onClick={deleteAccount}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg border border-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
