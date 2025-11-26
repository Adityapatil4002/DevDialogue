import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  Lock,
  Zap,
  LogOut,
  Save,
  Loader,
  ArrowLeft,
  Github,
  Twitter,
  Linkedin,
  MapPin,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Code,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { UserContext } from "../Context/user.context.jsx";
import axios from "../Config/axios.js";
import { useNavigate } from "react-router-dom";

// --- ANIMATED BACKGROUND COMPONENT ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-[#030712] pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/10 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[120px]" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
  </div>
);

// --- REUSABLE COMPONENTS ---

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0d1117] border border-gray-800">
    <span className="text-sm text-gray-300 font-medium">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full p-1 transition-colors duration-300 ${
        checked ? "bg-blue-600" : "bg-gray-700"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`w-5 h-5 rounded-full bg-white shadow-md ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
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
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="relative group">
      {Icon && (
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors z-10"
        />
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-[#0d1117] border border-gray-800 rounded-xl py-3.5 ${
          Icon ? "pl-11" : "pl-4"
        } pr-4 text-sm text-white placeholder-gray-600 
        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 
        disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300`}
      />
    </div>
  </div>
);

const SectionCard = ({ title, description, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-[#0d1117]/60 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6 md:p-8"
  >
    <div className="mb-6 border-b border-gray-800 pb-4">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
    <div className="space-y-6">{children}</div>
  </motion.div>
);

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- STATE MANAGEMENT ---
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

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.put("/users/update", formData);
      setUser(res.data.user);
      showMessage("success", "Profile updated successfully");
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showMessage("error", "Passwords don't match");
    }
    setLoading(true);
    try {
      await axios.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showMessage("success", "Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.error || "Failed to change password"
      );
    } finally {
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

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // --- MENU ITEMS ---
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Editor", icon: Code },
    { id: "ai", label: "AI Settings", icon: Zap },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 font-sans flex overflow-hidden selection:bg-blue-500/30">
      <AnimatedBackground />

      {/* --- SIDEBAR --- */}
      <aside className="w-20 lg:w-72 bg-[#0b0f19]/80 backdrop-blur-xl border-r border-gray-800 flex flex-col z-20 transition-all duration-300">
        {/* Header */}
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-800">
          <button
            onClick={() => navigate("/home")}
            className="p-2 rounded-xl hover:bg-gray-800 transition-colors group flex items-center gap-3"
          >
            <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
              <ArrowLeft size={20} />
            </div>
            <span className="hidden lg:block font-bold text-white group-hover:text-blue-400 transition-colors">
              Back
            </span>
          </button>
        </div>

        {/* User Card (Initials Version) */}
        <div className="p-4 lg:p-6 flex flex-col items-center lg:items-start border-b border-gray-800">
          <div className="relative group cursor-pointer mb-3 lg:mb-0">
            <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl lg:text-2xl shadow-lg border-2 border-[#0b0f19] group-hover:scale-105 transition-transform duration-300">
              {getInitials(user?.name)}
            </div>
          </div>
          <div className="mt-3 text-center lg:text-left hidden lg:block">
            <h3 className="font-bold text-white text-lg truncate max-w-[200px]">
              {user?.name || "Developer"}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Mail size={10} /> {user?.email}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600/10 border border-blue-500/20 rounded-xl"
                  transition={{ type: "spring", duration: 0.6 }}
                />
              )}
              <div
                className={`relative z-10 p-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-400"
                    : "group-hover:text-gray-200"
                }`}
              >
                <tab.icon size={20} />
              </div>
              <span className="relative z-10 hidden lg:block font-medium">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-gray-500 transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="hidden lg:block font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative overflow-y-auto h-full z-10">
        {/* Top Bar / Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#030712]/80 backdrop-blur-lg border-b border-gray-800 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-gray-500">Manage your settings</p>
          </div>

          <div className="flex items-center gap-4">
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${
                    message.type === "success"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab !== "security" && (
              <button
                onClick={saveSettings}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                <span className="hidden sm:inline">Save Changes</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* ---------------- PROFILE TAB ---------------- */}
              {activeTab === "profile" && (
                <>
                  <SectionCard
                    title="Personal Information"
                    description="This information will be displayed publicly."
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputGroup
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        icon={User}
                        placeholder="John Doe"
                      />
                      <InputGroup
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        icon={MapPin}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Tell us about yourself..."
                        className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                      />
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Online Presence"
                    description="Where can people find you?"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputGroup
                        label="GitHub"
                        name="github"
                        value={formData.socials.github}
                        onChange={(e) =>
                          handleSocialChange("github", e.target.value)
                        }
                        icon={Github}
                        placeholder="username"
                      />
                      <InputGroup
                        label="Twitter / X"
                        name="twitter"
                        value={formData.socials.twitter}
                        onChange={(e) =>
                          handleSocialChange("twitter", e.target.value)
                        }
                        icon={Twitter}
                        placeholder="handle"
                      />
                      <InputGroup
                        label="LinkedIn"
                        name="linkedin"
                        value={formData.socials.linkedin}
                        onChange={(e) =>
                          handleSocialChange("linkedin", e.target.value)
                        }
                        icon={Linkedin}
                        placeholder="username"
                      />
                    </div>
                  </SectionCard>
                </>
              )}

              {/* ---------------- PREFERENCES TAB ---------------- */}
              {activeTab === "preferences" && (
                <>
                  <SectionCard
                    title="Theme & Appearance"
                    description="Customize your coding environment."
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["dracula", "monokai", "github-dark"].map((theme) => (
                        <div
                          key={theme}
                          onClick={() => handleSettingChange("theme", theme)}
                          className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                            formData.settings.theme === theme
                              ? "bg-blue-600/10 border-blue-500/50"
                              : "bg-[#0d1117] border-gray-800 hover:border-gray-600"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              formData.settings.theme === theme
                                ? "border-blue-500"
                                : "border-gray-600"
                            }`}
                          >
                            {formData.settings.theme === theme && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <span className="capitalize text-sm font-medium text-white">
                            {theme.replace("-", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Editor Settings"
                    description="Fine-tune the code editor behavior."
                  >
                    <div className="space-y-4">
                      <Toggle
                        label="Word Wrap"
                        checked={formData.settings.wordWrap}
                        onChange={(v) => handleSettingChange("wordWrap", v)}
                      />
                      <Toggle
                        label="Show Line Numbers"
                        checked={formData.settings.showLineNumbers}
                        onChange={(v) =>
                          handleSettingChange("showLineNumbers", v)
                        }
                      />
                      <div className="p-4 bg-[#0d1117] rounded-xl border border-gray-800">
                        <label className="text-sm text-gray-300 font-medium mb-2 block">
                          Font Size
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="24"
                          value={formData.settings.fontSize}
                          onChange={(e) =>
                            handleSettingChange(
                              "fontSize",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>10px</span>
                          <span className="text-blue-400 font-bold">
                            {formData.settings.fontSize}px
                          </span>
                          <span>24px</span>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </>
              )}

              {/* ---------------- AI SETTINGS TAB ---------------- */}
              {activeTab === "ai" && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 p-8">
                    <div className="absolute top-0 right-0 p-10 opacity-20 text-blue-300">
                      <Zap size={150} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                      Token Usage
                    </h3>
                    <div className="flex items-baseline gap-2 mb-4 relative z-10">
                      <span className="text-5xl font-mono font-bold text-blue-400">
                        45,200
                      </span>
                      <span className="text-gray-400 font-medium">
                        / 100,000
                      </span>
                    </div>
                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden relative z-10 backdrop-blur-sm">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "45%" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                    <p className="text-xs text-blue-200/70 mt-3 relative z-10">
                      Your quota resets on Dec 1st, 2025.
                    </p>
                  </div>

                  <SectionCard
                    title="Model Configuration"
                    description="Choose the brain behind your assistant."
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["gemini-pro", "gpt-4"].map((model) => (
                        <div
                          key={model}
                          onClick={() => handleSettingChange("aiModel", model)}
                          className={`group cursor-pointer p-5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                            formData.settings.aiModel === model
                              ? "bg-blue-600/10 border-blue-500/50"
                              : "bg-[#0d1117] border-gray-800 hover:border-gray-700"
                          }`}
                        >
                          <div className="flex justify-between items-start relative z-10">
                            <div>
                              <h4
                                className={`font-bold ${
                                  formData.settings.aiModel === model
                                    ? "text-blue-400"
                                    : "text-white"
                                }`}
                              >
                                {model === "gemini-pro"
                                  ? "Gemini 1.5 Pro"
                                  : "GPT-4 Turbo"}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {model === "gemini-pro"
                                  ? "Best for speed & reasoning."
                                  : "High accuracy coding."}
                              </p>
                            </div>
                            {formData.settings.aiModel === model && (
                              <CheckCircle2
                                className="text-blue-500"
                                size={20}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ---------------- SECURITY TAB ---------------- */}
              {activeTab === "security" && (
                <>
                  <SectionCard
                    title="Password Update"
                    description="Ensure your account uses a strong password."
                  >
                    <div className="space-y-6 max-w-md">
                      <InputGroup
                        label="Current Password"
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        icon={Lock}
                        placeholder="••••••••"
                      />
                      <InputGroup
                        label="New Password"
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        icon={Lock}
                        placeholder="••••••••"
                      />
                      <InputGroup
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        icon={Lock}
                        placeholder="••••••••"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={updatePassword}
                          disabled={loading}
                          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded-lg border border-gray-700 transition-all"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </SectionCard>

                  <div className="p-6 rounded-2xl border border-red-900/30 bg-red-900/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-red-400 font-bold flex items-center gap-2">
                        <AlertTriangle size={18} /> Danger Zone
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Permanently remove your account and all associated data.
                      </p>
                    </div>
                    <button
                      onClick={deleteAccount} // Use your delete handler
                      className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-lg border border-red-500/20 transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
