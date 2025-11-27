import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
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
  Eye,
  Trash2,
  Upload,
  X,
  MessageSquare, // New icon for Feedback
  Star,
  Send,
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
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

// --- ANIMATED BACKGROUND ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-[#030712] pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
  </div>
);

// --- REUSABLE COMPONENTS ---
const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0d1117] border border-gray-800 hover:border-gray-700 transition-colors">
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
  <motion.div variants={itemVariants} className="space-y-2">
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
        } pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:border-gray-700`}
      />
    </div>
  </motion.div>
);

const SectionCard = ({ title, description, children }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="bg-[#0d1117]/60 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6 md:p-8 hover:border-gray-700 transition-colors duration-500"
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
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Avatar States
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isViewingImage, setIsViewingImage] = useState(false);
  const [imgError, setImgError] = useState(false); // [NEW] Handles broken images

  // Feedback State [NEW]
  const [feedback, setFeedback] = useState({
    rating: 0,
    category: "general",
    message: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    socials: { github: "", twitter: "", linkedin: "" },
    settings: {
      theme: "dracula",
      fontSize: 14,
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
      setImgError(false); // Reset error state on user load
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        socials: user.socials || { github: "", twitter: "", linkedin: "" },
        settings: {
          theme: user.settings?.theme || "dracula",
          fontSize: user.settings?.fontSize || 14,
          wordWrap: user.settings?.wordWrap ?? true,
          showLineNumbers: user.settings?.showLineNumbers ?? true,
        },
      });
    }
  }, [user]);

  // --- AVATAR LOGIC ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);
    try {
      const res = await axios.post("/user/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      setImgError(false);
      showMessage("success", "Profile photo updated!");
      setIsAvatarMenuOpen(false);
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Remove profile photo?")) return;
    setLoading(true);
    try {
      const res = await axios.delete("/user/delete-avatar");
      setUser(res.data.user);
      setImgError(false);
      showMessage("success", "Profile photo removed.");
      setIsAvatarMenuOpen(false);
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to remove photo");
    } finally {
      setLoading(false);
    }
  };

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
      const res = await axios.put("/user/update", formData);
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
    if (passwordData.newPassword !== passwordData.confirmPassword)
      return showMessage("error", "Passwords don't match");
    setLoading(true);
    try {
      await axios.put("/user/change-password", {
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

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    setLoading(true);
    try {
      await axios.delete("/user/delete");
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error(error);
      showMessage("error", "Failed to delete account");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get("/user/logout");
      setUser(null);
      navigate("/");
    } catch (e) {
      console.log(e);
    }
  };

  // [NEW] Mock Feedback Submit
  const submitFeedback = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showMessage("success", "Feedback sent! Thank you.");
      setFeedback({ rating: 0, category: "general", message: "" });
    }, 1500);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // --- TAB CONFIG ---
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Editor", icon: Code },
    { id: "feedback", label: "Feedback", icon: MessageSquare }, // Replaced AI
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 font-sans flex overflow-hidden selection:bg-blue-500/30">
      <AnimatedBackground />

      {/* --- SIDEBAR --- */}
      <aside className="w-20 lg:w-72 bg-[#0b0f19]/80 backdrop-blur-xl border-r border-gray-800 flex flex-col z-20 transition-all duration-300">
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

        {/* --- USER CARD (Sidebar) --- */}
        <div className="p-4 lg:p-6 flex flex-col items-center lg:items-start border-b border-gray-800 relative">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />

          <div className="relative">
            <div
              className="relative group cursor-pointer"
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>

              {/* SMART AVATAR: Shows Initials if Image Fails */}
              {!imgError && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  onError={() => setImgError(true)} // Fix for broken image
                  className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-full border-2 border-[#0b0f19] object-cover"
                />
              ) : (
                <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl lg:text-2xl shadow-lg border-2 border-[#0b0f19]">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-1.5 border border-gray-700 z-10">
                <Camera size={12} className="text-white" />
              </div>
            </div>

            {/* --- DROPDOWN MENU --- */}
            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-3 w-48 bg-[#161b22] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  {user?.avatar && !imgError && (
                    <button
                      onClick={() => {
                        setIsViewingImage(true);
                        setIsAvatarMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-800 flex items-center gap-2 text-gray-200"
                    >
                      <Eye size={16} className="text-blue-400" /> View Image
                    </button>
                  )}
                  <button
                    onClick={() => {
                      fileInputRef.current.click();
                      setIsAvatarMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-800 flex items-center gap-2 text-gray-200"
                  >
                    <Upload size={16} className="text-green-400" /> Change Image
                  </button>
                  {(user?.avatar || imgError) && (
                    <button
                      onClick={handleDeleteAvatar}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-red-500/10 flex items-center gap-2 text-red-400 border-t border-gray-700"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
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

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-gray-500 transition-all duration-300"
          >
            <LogOut size={20} />{" "}
            <span className="hidden lg:block font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative overflow-y-auto h-full z-10">
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
                  )}{" "}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
            {activeTab !== "security" && activeTab !== "feedback" && (
              <button
                onClick={saveSettings}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}{" "}
                <span className="hidden sm:inline">Save Changes</span>
              </button>
            )}
          </div>
        </div>

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
              {/* PROFILE TAB */}
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
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Tell us about yourself..."
                        className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none hover:border-gray-700"
                      />
                    </motion.div>
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

              {/* EDITOR TAB */}
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

              {/* [NEW] FEEDBACK TAB */}
              {activeTab === "feedback" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 flex flex-col justify-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold mb-4">
                        We value your opinion.
                      </h2>
                      <p className="text-blue-100 mb-6">
                        Help us make DevDialogue better for everyone. Share your
                        ideas, report bugs, or just say hello!
                      </p>
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xs"
                          >
                            User
                          </div>
                        ))}
                        <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/30 flex items-center justify-center text-xs">
                          +2k
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                  </div>

                  <SectionCard
                    title="Send Feedback"
                    description="Let us know what you think."
                  >
                    <form onSubmit={submitFeedback} className="space-y-4">
                      <div className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setFeedback({ ...feedback, rating: star })
                            }
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              size={24}
                              className={
                                star <= feedback.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-600"
                              }
                            />
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">
                          Category
                        </label>
                        <div className="flex gap-2">
                          {["General", "Bug", "Feature"].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() =>
                                setFeedback({
                                  ...feedback,
                                  category: cat.toLowerCase(),
                                })
                              }
                              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                feedback.category === cat.toLowerCase()
                                  ? "bg-blue-600 border-blue-500 text-white"
                                  : "bg-[#0d1117] border-gray-800 text-gray-400 hover:border-gray-600"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        required
                        value={feedback.message}
                        onChange={(e) =>
                          setFeedback({ ...feedback, message: e.target.value })
                        }
                        rows="4"
                        placeholder="Type your message here..."
                        className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader className="animate-spin" size={18} />
                        ) : (
                          <Send size={18} />
                        )}{" "}
                        Send Feedback
                      </button>
                    </form>
                  </SectionCard>
                </div>
              )}

              {/* SECURITY TAB */}
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
                      onClick={deleteAccount}
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

      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {isViewingImage && user?.avatar && !imgError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsViewingImage(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsViewingImage(false)}
                className="absolute -top-12 right-0 p-2 bg-gray-800/50 rounded-full hover:bg-gray-700 text-white transition-colors"
              >
                <X size={24} />
              </button>
              <img
                src={user.avatar}
                alt="Full Avatar"
                className="rounded-2xl shadow-2xl border-2 border-gray-800 max-h-[85vh]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
