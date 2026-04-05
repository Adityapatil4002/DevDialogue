import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../Context/user.context.jsx";
import axios from "../Config/axios.js";
import { useNavigate } from "react-router-dom";
import { authClient } from "../Config/auth-client.js";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Corners = ({ color = "white/20" }) => (
  <>
    {[
      "top-0 left-0 border-l border-t",
      "top-0 right-0 border-r border-t",
      "bottom-0 left-0 border-l border-b",
      "bottom-0 right-0 border-r border-b",
    ].map((c, i) => (
      <div key={i} className={`absolute w-3 h-3 border-${color} ${c}`} />
    ))}
  </>
);

const PulseDot = () => (
  <span className="relative inline-flex items-center justify-center">
    <span className="absolute w-3 h-3 rounded-full bg-white opacity-10 animate-ping" />
    <span className="relative w-[5px] h-[5px] rounded-full bg-white/60" />
  </span>
);

const ShimmerLine = () => (
  <div className="relative h-px bg-[#1a1a1a] overflow-hidden flex-shrink-0 my-px">
    <motion.div
      className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{ x: ["-4rem", "100%"] }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 1,
      }}
    />
  </div>
);

const CellLabel = ({ children }) => (
  <div className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#444] mb-4 flex-shrink-0">
    {children}
  </div>
);

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}) => (
  <motion.div variants={item} className="flex flex-col gap-1.5">
    <label className="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#444]">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2 text-[11px] text-white placeholder-[#2a2a2a] focus:outline-none focus:border-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-mono"
    />
  </motion.div>
);

const StatBox = ({ label, value }) => (
  <motion.div
    variants={item}
    whileHover={{ borderColor: "#2a2a2a", y: -1 }}
    className="bg-[#080808] border border-[#1a1a1a] p-3 relative overflow-hidden transition-all"
  >
    <div className="text-[8px] tracking-[0.16em] uppercase text-[#444] font-mono mb-1">
      {label}
    </div>
    <div className="text-[22px] font-semibold leading-none tracking-[-0.03em] text-white tabular-nums">
      {value}
    </div>
    <motion.div
      className="absolute bottom-0 left-0 h-[1px] bg-white/10"
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    />
  </motion.div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <motion.div
    variants={item}
    className="flex items-center justify-between py-3 border-b border-[#111] last:border-b-0"
  >
    <div>
      <div className="text-[11px] text-white font-mono">{label}</div>
      {description && (
        <div className="text-[9px] text-[#444] mt-0.5">{description}</div>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 border transition-colors flex-shrink-0 ${
        checked ? "border-white/30 bg-white/10" : "border-[#222] bg-transparent"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-[3px] w-[10px] h-[10px] bg-white transition-colors ${
          checked ? "left-[calc(100%-13px)]" : "left-[3px]"
        }`}
      />
    </button>
  </motion.div>
);

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isViewingImage, setIsViewingImage] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [feedback, setFeedback] = useState({
    rating: 0,
    category: "general",
    message: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    company: "",
    jobTitle: "",
    socials: { github: "", twitter: "", linkedin: "", discord: "" },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    projectInvites: true,
    weeklyDigest: false,
    soundEffects: false,
    compactMode: false,
    showOnlineStatus: true,
  });

  useEffect(() => {
    if (user) {
      setImgError(false);
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        company: user.company || "",
        jobTitle: user.jobTitle || "",
        socials: user.socials || {
          github: "",
          twitter: "",
          linkedin: "",
          discord: "",
        },
      });
    }
  }, [user]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setLoading(true);
    try {
      const res = await axios.post("/user/upload-avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      setImgError(false);
      showMessage("success", "Photo updated.");
      setIsAvatarMenuOpen(false);
    } catch {
      showMessage("error", "Failed to upload.");
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
      showMessage("success", "Photo removed.");
      setIsAvatarMenuOpen(false);
    } catch {
      showMessage("error", "Failed to remove.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const handleSocialChange = (platform, value) => {
    setFormData((p) => ({
      ...p,
      socials: { ...p.socials, [platform]: value },
    }));
  };
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
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
      showMessage("success", "Profile updated.");
    } catch {
      showMessage("error", "Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword)
      return showMessage("error", "Passwords don't match.");
    setLoading(true);
    try {
      await axios.put("/user/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      showMessage("success", "Password changed.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showMessage("error", err.response?.data?.error || "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? This is irreversible.")) return;
    setLoading(true);
    try {
      await axios.delete("/user/delete");
      setUser(null);
      navigate("/");
    } catch {
      showMessage("error", "Failed to delete account.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      navigate("/");
    } catch {
      showMessage("error", "Failed to sign out.");
    }
  };

  const submitFeedback = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showMessage("success", "Feedback sent. Thank you.");
      setFeedback({ rating: 0, category: "general", message: "" });
    }, 1200);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "Profile" },
    { id: "socials", label: "Socials" },
    { id: "preferences", label: "Preferences" },
    { id: "feedback", label: "Feedback" },
    { id: "security", label: "Security" },
  ];

  const saveLabel = {
    overview: null,
    profile: "Save",
    socials: "Save",
    preferences: "Save",
    feedback: "Send",
    security: "Update",
  };

  const handleSave = () => {
    if (activeTab === "profile" || activeTab === "socials") saveSettings();
    else if (activeTab === "security") updatePassword();
    else if (activeTab === "feedback")
      submitFeedback({ preventDefault: () => {} });
    else if (activeTab === "preferences")
      showMessage("success", "Preferences saved.");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans flex flex-col selection:bg-white/10">
      {/* NAV */}
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex-shrink-0 flex items-center justify-between px-6 h-11 border-b border-[#1a1a1a] bg-[#050505] z-50"
      >
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] border border-[#222] flex items-center justify-center">
            <span className="text-[9px] font-bold tracking-widest text-[#555]">
              DD
            </span>
          </div>
          <span className="text-[13px] font-semibold tracking-[0.06em]">
            Dev<span className="text-[#555] font-normal">Dialogue</span>
          </span>
          <span className="text-[#333] font-mono text-[11px] ml-1">/</span>
          <span className="text-[9px] tracking-[0.18em] uppercase text-[#333] font-mono">
            profile
          </span>
        </div>
        <div className="flex items-center gap-5">
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`text-[10px] font-mono px-3 py-1 border flex items-center gap-2 ${
                  message.type === "success"
                    ? "border-white/10 text-white/50"
                    : "border-red-500/20 text-red-400"
                }`}
              >
                {message.type === "success" ? "✓" : "⚠"} {message.text}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#444]">
            <PulseDot />
            <span className="tracking-wider">online</span>
          </div>
          <motion.button
            onClick={() => navigate("/home")}
            whileHover={{ x: -2 }}
            className="text-[10px] tracking-[0.1em] uppercase text-[#555] hover:text-white transition-colors flex items-center gap-1.5"
          >
            ← Workspace
          </motion.button>
        </div>
      </motion.nav>

      {/* BODY */}
      <div className="flex flex-1 min-h-0">
        {/* SIDEBAR */}
        <motion.aside
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-52 flex-shrink-0 border-r border-[#1a1a1a] flex flex-col bg-[#050505]"
        >
          {/* Avatar + user info */}
          <div className="p-4 border-b border-[#1a1a1a] relative">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

            {/* Big avatar */}
            <div
              className="relative cursor-pointer group mb-3 mx-auto w-fit"
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            >
              {!imgError && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  onError={() => setImgError(true)}
                  className="w-16 h-16 object-cover border border-[#2a2a2a]"
                />
              ) : (
                <div className="w-16 h-16 bg-[#111] border border-[#222] flex items-center justify-center text-[20px] font-semibold text-[#ccc]">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[8px] text-white font-mono tracking-wider">
                  EDIT
                </span>
              </div>

              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#050505] flex items-center justify-center">
                <div className="w-2 h-2 bg-white/60" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-[12px] font-semibold text-white truncate">
                {user?.name || "Developer"}
              </div>
              <div className="text-[9px] font-mono text-[#444] truncate mt-0.5">
                {user?.email}
              </div>
              {formData.jobTitle && (
                <div className="text-[9px] font-mono text-[#555] mt-0.5 truncate">
                  {formData.jobTitle}
                </div>
              )}
              {formData.location && (
                <div className="text-[9px] font-mono text-[#333] mt-0.5 truncate">
                  ◎ {formData.location}
                </div>
              )}
            </div>

            {/* Avatar dropdown */}
            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-4 mt-1 w-44 bg-[#0a0a0a] border border-[#1a1a1a] z-50 overflow-hidden"
                >
                  <Corners />
                  {user?.avatar && !imgError && (
                    <button
                      onClick={() => {
                        setIsViewingImage(true);
                        setIsAvatarMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-[#777] hover:text-white hover:bg-[#111] transition-all"
                    >
                      → View photo
                    </button>
                  )}
                  <button
                    onClick={() => {
                      fileInputRef.current.click();
                      setIsAvatarMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-[#777] hover:text-white hover:bg-[#111] transition-all"
                  >
                    → Change photo
                  </button>
                  {user?.avatar && !imgError && (
                    <button
                      onClick={handleDeleteAvatar}
                      className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-red-500/60 hover:text-red-400 hover:bg-red-500/5 transition-all border-t border-[#1a1a1a]"
                    >
                      → Remove photo
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tabs */}
          <nav className="flex flex-col p-2 gap-px flex-1 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-full text-left px-4 py-2.5 text-[10px] tracking-[0.1em] uppercase font-semibold transition-all ${
                  activeTab === tab.id
                    ? "text-white bg-[#0f0f0f] border border-[#222]"
                    : "text-[#444] hover:text-[#888] border border-transparent"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-white"
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="p-2 border-t border-[#1a1a1a] flex flex-col gap-px">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-[10px] tracking-[0.1em] uppercase font-semibold text-[#444] hover:text-red-400 transition-colors"
            >
              → Sign out
            </button>
          </div>
        </motion.aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Tab bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 h-11 border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#444]">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
              {activeTab === "overview" && (
                <span className="text-[9px] font-mono text-[#333]">
                  · read only
                </span>
              )}
            </div>
            {saveLabel[activeTab] && (
              <motion.button
                onClick={handleSave}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="text-[9px] tracking-[0.12em] uppercase font-semibold text-black bg-white px-4 py-1.5 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block w-3 h-3 border border-black border-t-transparent rounded-full"
                  />
                ) : (
                  "↑"
                )}
                {saveLabel[activeTab]}
              </motion.button>
            )}
          </div>

          {/* Scrollable body */}
          <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-[#2a2a2a]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                {/* ── OVERVIEW TAB ── */}
                {activeTab === "overview" && (
                  <div className="h-full grid grid-cols-3 grid-rows-2 gap-px bg-[#1a1a1a]">
                    {/* Identity cell */}
                    <div className="bg-[#0a0a0a] p-5 relative overflow-hidden flex flex-col">
                      <Corners />
                      <CellLabel>Identity</CellLabel>
                      <div className="flex items-start gap-4 mb-4">
                        {!imgError && user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Avatar"
                            onError={() => setImgError(true)}
                            className="w-14 h-14 object-cover border border-[#2a2a2a] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-[#111] border border-[#222] flex items-center justify-center text-[18px] font-semibold text-[#ccc] flex-shrink-0">
                            {getInitials(user?.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[18px] font-semibold text-white leading-none mb-1 truncate">
                            {user?.name || "Developer"}
                          </div>
                          <div className="text-[10px] font-mono text-[#555] truncate">
                            {user?.email}
                          </div>
                          {formData.jobTitle && (
                            <div className="text-[10px] font-mono text-[#444] mt-1 truncate">
                              {formData.jobTitle}
                            </div>
                          )}
                          {formData.company && (
                            <div className="text-[10px] font-mono text-[#333] truncate">
                              @ {formData.company}
                            </div>
                          )}
                        </div>
                      </div>
                      {formData.bio && (
                        <p className="text-[11px] font-mono text-[#555] leading-relaxed line-clamp-3">
                          {formData.bio}
                        </p>
                      )}
                      {formData.location && (
                        <div className="mt-auto pt-3 text-[9px] font-mono text-[#333] flex items-center gap-1.5">
                          <span>◎</span> {formData.location}
                        </div>
                      )}
                    </div>

                    {/* Stats cell */}
                    <div className="bg-[#0a0a0a] p-5 relative overflow-hidden flex flex-col">
                      <Corners />
                      <CellLabel>Stats</CellLabel>
                      <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 gap-px flex-1"
                      >
                        <StatBox
                          label="Projects"
                          value={user?.projectCount ?? 0}
                        />
                        <StatBox
                          label="Collaborators"
                          value={user?.collaboratorCount ?? 0}
                        />
                        <StatBox label="Files" value={user?.fileCount ?? 0} />
                        <StatBox
                          label="Days Active"
                          value={user?.daysActive ?? 1}
                        />
                      </motion.div>
                    </div>

                    {/* Socials cell */}
                    <div className="bg-[#0a0a0a] p-5 relative overflow-hidden flex flex-col">
                      <Corners />
                      <CellLabel>Socials</CellLabel>
                      <div className="flex flex-col gap-[3px]">
                        {[
                          {
                            key: "github",
                            label: "GitHub",
                            prefix: "github.com/",
                          },
                          { key: "twitter", label: "Twitter", prefix: "@" },
                          {
                            key: "linkedin",
                            label: "LinkedIn",
                            prefix: "linkedin.com/in/",
                          },
                          { key: "discord", label: "Discord", prefix: "" },
                        ].map(({ key, label, prefix }) => (
                          <div
                            key={key}
                            className={`flex items-center gap-3 px-3 py-2 border border-[#111] ${formData.socials?.[key] ? "opacity-100" : "opacity-30"}`}
                          >
                            <span className="text-[9px] tracking-[0.14em] uppercase text-[#444] font-mono w-14 flex-shrink-0">
                              {label}
                            </span>
                            <span className="text-[10px] font-mono text-[#666] truncate">
                              {formData.socials?.[key]
                                ? `${prefix}${formData.socials[key]}`
                                : "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                      {formData.website && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 border border-[#111]">
                          <span className="text-[9px] tracking-[0.14em] uppercase text-[#444] font-mono w-14 flex-shrink-0">
                            Web
                          </span>
                          <span className="text-[10px] font-mono text-[#666] truncate">
                            {formData.website}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Account info cell */}
                    <div className="bg-[#0a0a0a] p-5 relative overflow-hidden flex flex-col">
                      <Corners />
                      <CellLabel>Account</CellLabel>
                      <div className="flex flex-col gap-[3px]">
                        {[
                          { label: "Email", value: user?.email },
                          {
                            label: "Member since",
                            value: user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "en-US",
                                  { month: "short", year: "numeric" },
                                )
                              : "—",
                          },
                          {
                            label: "User ID",
                            value: user?._id
                              ? `#${user._id.slice(-8).toUpperCase()}`
                              : "—",
                          },
                          { label: "Status", value: "Active" },
                          { label: "Plan", value: "Free" },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between py-2 border-b border-[#0f0f0f]"
                          >
                            <span className="text-[9px] tracking-[0.14em] uppercase text-[#333] font-mono">
                              {label}
                            </span>
                            <span className="text-[10px] font-mono text-[#666]">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick actions cell */}
                    <div className="bg-[#0a0a0a] p-5 relative overflow-hidden flex flex-col">
                      <Corners />
                      <CellLabel>Quick Actions</CellLabel>
                      <div className="flex flex-col gap-px flex-1">
                        {[
                          { label: "Edit Profile", tab: "profile" },
                          { label: "Update Socials", tab: "socials" },
                          { label: "Preferences", tab: "preferences" },
                          { label: "Change Password", tab: "security" },
                          { label: "Send Feedback", tab: "feedback" },
                        ].map(({ label, tab }) => (
                          <motion.button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            whileHover={{ x: 4 }}
                            className="text-left px-3 py-2.5 border border-[#111] text-[10px] font-mono text-[#555] hover:text-white hover:border-[#222] transition-all flex items-center justify-between group"
                          >
                            <span>{label}</span>
                            <motion.span
                              className="text-[#333] group-hover:text-white transition-colors"
                              animate={{ x: [0, 2, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.8,
                                ease: "easeInOut",
                              }}
                            >
                              →
                            </motion.span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Activity cell */}
                    <div className="bg-[#0a0a0a] p-5 relative overflow-hidden flex flex-col">
                      <Corners />
                      <CellLabel>Recent Activity</CellLabel>
                      <div className="flex flex-col gap-[3px] flex-1">
                        {[
                          { action: "Profile viewed", time: "Just now" },
                          { action: "Session started", time: "Today" },
                          {
                            action: "Account created",
                            time: user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "—",
                          },
                        ].map(({ action, time }, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-center justify-between px-3 py-2.5 border border-[#111]"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-[4px] h-[4px] bg-white/30" />
                              <span className="text-[10px] font-mono text-[#666]">
                                {action}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-[#333]">
                              {time}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#111] flex items-center gap-2">
                        <PulseDot />
                        <span className="text-[9px] font-mono text-[#333] tracking-wider">
                          session active
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PROFILE TAB ── */}
                {activeTab === "profile" && (
                  <div className="p-5 max-w-2xl">
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-px"
                    >
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative">
                        <Corners />
                        <CellLabel>Personal Information</CellLabel>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                          />
                          <Input
                            label="Job Title"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleInputChange}
                            placeholder="Software Engineer"
                          />
                          <Input
                            label="Company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Acme Corp"
                          />
                          <Input
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="San Francisco, CA"
                          />
                        </div>
                        <Input
                          label="Website"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://yoursite.com"
                        />
                        <motion.div
                          variants={item}
                          className="flex flex-col gap-1.5 mt-4"
                        >
                          <label className="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#444]">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Tell us about yourself..."
                            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2.5 text-[11px] text-white placeholder-[#2a2a2a] focus:outline-none focus:border-[#333] transition-colors font-mono resize-none"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* ── SOCIALS TAB ── */}
                {activeTab === "socials" && (
                  <div className="p-5 max-w-xl">
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-px"
                    >
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative">
                        <Corners />
                        <CellLabel>Social Links</CellLabel>
                        <div className="flex flex-col gap-4">
                          <Input
                            label="GitHub"
                            name="github"
                            value={formData.socials.github}
                            onChange={(e) =>
                              handleSocialChange("github", e.target.value)
                            }
                            placeholder="username"
                          />
                          <Input
                            label="Twitter / X"
                            name="twitter"
                            value={formData.socials.twitter}
                            onChange={(e) =>
                              handleSocialChange("twitter", e.target.value)
                            }
                            placeholder="handle"
                          />
                          <Input
                            label="LinkedIn"
                            name="linkedin"
                            value={formData.socials.linkedin}
                            onChange={(e) =>
                              handleSocialChange("linkedin", e.target.value)
                            }
                            placeholder="username"
                          />
                          <Input
                            label="Discord"
                            name="discord"
                            value={formData.socials.discord}
                            onChange={(e) =>
                              handleSocialChange("discord", e.target.value)
                            }
                            placeholder="username#0000"
                          />
                          <Input
                            label="Website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://yoursite.com"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* ── PREFERENCES TAB ── */}
                {activeTab === "preferences" && (
                  <div className="p-5 max-w-xl">
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-px"
                    >
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative">
                        <Corners />
                        <CellLabel>Notifications</CellLabel>
                        <div>
                          <Toggle
                            label="Email notifications"
                            description="Receive updates via email"
                            checked={preferences.emailNotifications}
                            onChange={(v) =>
                              setPreferences((p) => ({
                                ...p,
                                emailNotifications: v,
                              }))
                            }
                          />
                          <Toggle
                            label="Project invites"
                            description="Get notified of new invitations"
                            checked={preferences.projectInvites}
                            onChange={(v) =>
                              setPreferences((p) => ({
                                ...p,
                                projectInvites: v,
                              }))
                            }
                          />
                          <Toggle
                            label="Weekly digest"
                            description="Summary of activity every week"
                            checked={preferences.weeklyDigest}
                            onChange={(v) =>
                              setPreferences((p) => ({ ...p, weeklyDigest: v }))
                            }
                          />
                        </div>
                      </div>
                      <ShimmerLine />
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative">
                        <Corners />
                        <CellLabel>Interface</CellLabel>
                        <div>
                          <Toggle
                            label="Compact mode"
                            description="Reduce spacing across the UI"
                            checked={preferences.compactMode}
                            onChange={(v) =>
                              setPreferences((p) => ({ ...p, compactMode: v }))
                            }
                          />
                          <Toggle
                            label="Sound effects"
                            description="Play sounds on interactions"
                            checked={preferences.soundEffects}
                            onChange={(v) =>
                              setPreferences((p) => ({ ...p, soundEffects: v }))
                            }
                          />
                          <Toggle
                            label="Show online status"
                            description="Let others see when you're active"
                            checked={preferences.showOnlineStatus}
                            onChange={(v) =>
                              setPreferences((p) => ({
                                ...p,
                                showOnlineStatus: v,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* ── FEEDBACK TAB ── */}
                {activeTab === "feedback" && (
                  <div className="p-5 max-w-xl">
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                    >
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative">
                        <Corners />
                        <CellLabel>Send Feedback</CellLabel>
                        <form
                          onSubmit={submitFeedback}
                          className="flex flex-col gap-4"
                        >
                          <motion.div
                            variants={item}
                            className="flex flex-col gap-2"
                          >
                            <label className="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#444]">
                              Rating
                            </label>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    setFeedback({ ...feedback, rating: star })
                                  }
                                  className={`w-7 h-7 border text-[11px] transition-all ${star <= feedback.rating ? "border-white bg-white text-black" : "border-[#2a2a2a] text-[#444] hover:border-[#444]"}`}
                                >
                                  ★
                                </button>
                              ))}
                              <span className="text-[10px] font-mono text-[#444] ml-1">
                                {feedback.rating > 0
                                  ? `${feedback.rating}/5`
                                  : "—"}
                              </span>
                            </div>
                          </motion.div>
                          <motion.div
                            variants={item}
                            className="flex flex-col gap-2"
                          >
                            <label className="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#444]">
                              Category
                            </label>
                            <div className="flex gap-px">
                              {["General", "Bug", "Feature", "Other"].map(
                                (cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() =>
                                      setFeedback({
                                        ...feedback,
                                        category: cat.toLowerCase(),
                                      })
                                    }
                                    className={`px-3 py-2 text-[9px] tracking-[0.1em] uppercase font-semibold transition-all ${feedback.category === cat.toLowerCase() ? "bg-white text-black" : "bg-[#0a0a0a] border border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#2a2a2a]"}`}
                                  >
                                    {cat}
                                  </button>
                                ),
                              )}
                            </div>
                          </motion.div>
                          <motion.div
                            variants={item}
                            className="flex flex-col gap-2"
                          >
                            <label className="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#444]">
                              Message
                            </label>
                            <textarea
                              required
                              value={feedback.message}
                              onChange={(e) =>
                                setFeedback({
                                  ...feedback,
                                  message: e.target.value,
                                })
                              }
                              rows="5"
                              placeholder="Type your message here..."
                              className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2.5 text-[11px] text-white placeholder-[#2a2a2a] focus:outline-none focus:border-[#333] transition-colors font-mono resize-none"
                            />
                          </motion.div>
                        </form>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === "security" && (
                  <div className="p-5 max-w-md">
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-px"
                    >
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative">
                        <Corners />
                        <CellLabel>Change Password</CellLabel>
                        <div className="flex flex-col gap-4">
                          <Input
                            label="Current Password"
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                          />
                          <Input
                            label="New Password"
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                          />
                          <Input
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <ShimmerLine />
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative">
                        <Corners />
                        <CellLabel>Sessions</CellLabel>
                        <div className="flex flex-col gap-[3px]">
                          {[
                            {
                              label: "Current session",
                              device: "This browser",
                              status: "active",
                            },
                          ].map(({ label, device, status }, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between px-3 py-2.5 border border-[#111]"
                            >
                              <div>
                                <div className="text-[10px] font-mono text-white">
                                  {label}
                                </div>
                                <div className="text-[9px] font-mono text-[#444]">
                                  {device}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <PulseDot />
                                <span className="text-[9px] font-mono text-[#444]">
                                  {status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <ShimmerLine />
                      <div className="bg-[#0a0a0a] border border-red-500/10 p-5 relative">
                        {[
                          "top-0 left-0 border-l border-t",
                          "top-0 right-0 border-r border-t",
                          "bottom-0 left-0 border-l border-b",
                          "bottom-0 right-0 border-r border-b",
                        ].map((c, i) => (
                          <div
                            key={i}
                            className={`absolute w-3 h-3 border-red-500/20 ${c}`}
                          />
                        ))}
                        <div className="text-[9px] font-semibold tracking-[0.18em] uppercase text-red-500/50 mb-2">
                          Danger Zone
                        </div>
                        <p className="text-[10px] font-mono text-[#444] mb-4 leading-relaxed">
                          Permanently remove your account and all associated
                          data. This cannot be undone.
                        </p>
                        <button
                          onClick={deleteAccount}
                          className="text-[9px] tracking-[0.12em] uppercase font-semibold text-red-400 border border-red-500/20 px-4 py-2 hover:bg-red-500/10 transition-all"
                        >
                          Delete Account
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* LIGHTBOX */}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsViewingImage(false)}
                className="absolute -top-8 right-0 text-[10px] font-mono text-[#555] hover:text-white tracking-wider uppercase transition-colors"
              >
                ✕ close
              </button>
              <img
                src={user.avatar}
                alt="Full Avatar"
                className="max-h-[80vh] border border-[#2a2a2a]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
