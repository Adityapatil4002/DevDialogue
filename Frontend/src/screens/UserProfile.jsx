import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../Context/user.context.jsx";
import axios from "../Config/axios.js";
import { useNavigate } from "react-router-dom";
import { authClient } from "../Config/auth-client.js";

// --- ANIMATION VARIANTS ---
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

// --- HELPERS ---
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

// --- PULSE DOT ---
const PulseDot = () => (
  <span className="relative inline-flex items-center justify-center">
    <span className="absolute w-3 h-3 rounded-full bg-white opacity-10 animate-ping" />
    <span className="relative w-[5px] h-[5px] rounded-full bg-white/60" />
  </span>
);

// --- CELL LABEL ---
const CellLabel = ({ children }) => (
  <div className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#444] mb-4 flex-shrink-0">
    {children}
  </div>
);

// --- INPUT ---
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
      className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2.5 text-[12px] text-white placeholder-[#333] focus:outline-none focus:border-[#444] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-mono"
    />
  </motion.div>
);

// --- SHIMMER LINE ---
const ShimmerLine = () => (
  <div className="relative h-px bg-[#1a1a1a] overflow-hidden flex-shrink-0">
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

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
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
    socials: { github: "", twitter: "", linkedin: "" },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setImgError(false);
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        socials: user.socials || { github: "", twitter: "", linkedin: "" },
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
      showMessage("success", "Profile photo updated.");
      setIsAvatarMenuOpen(false);
    } catch {
      showMessage("error", "Failed to upload photo.");
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
    } catch {
      showMessage("error", "Failed to remove photo.");
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
      showMessage("error", "Failed to update profile.");
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
      showMessage(
        "error",
        err.response?.data?.error || "Failed to change password.",
      );
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
    { id: "profile", label: "Profile" },
    { id: "feedback", label: "Feedback" },
    { id: "security", label: "Security" },
  ];

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
          {/* Message toast */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`text-[10px] font-mono px-3 py-1.5 border flex items-center gap-2 ${
                  message.type === "success"
                    ? "border-white/10 text-white/60"
                    : "border-red-500/20 text-red-400"
                }`}
              >
                <span>{message.type === "success" ? "✓" : "⚠"}</span>
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 text-[9px] font-mono text-[#444]">
            <PulseDot />
            <span className="tracking-wider">online</span>
          </div>

          <motion.button
            onClick={() => navigate("/home")}
            className="text-[10px] tracking-[0.1em] uppercase text-[#555] hover:text-white transition-colors flex items-center gap-1.5"
            whileHover={{ x: -2 }}
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
          className="w-56 flex-shrink-0 border-r border-[#1a1a1a] flex flex-col bg-[#050505]"
        >
          {/* Avatar block */}
          <div className="p-5 border-b border-[#1a1a1a] relative">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="relative cursor-pointer flex-shrink-0 group"
                onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              >
                {!imgError && user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    onError={() => setImgError(true)}
                    className="w-10 h-10 object-cover border border-[#2a2a2a]"
                  />
                ) : (
                  <div className="w-10 h-10 bg-[#111] border border-[#222] flex items-center justify-center text-[14px] font-semibold text-[#ccc]">
                    {getInitials(user?.name)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[8px] text-white font-mono tracking-wider">
                    EDIT
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-white truncate">
                  {user?.name || "Developer"}
                </div>
                <div className="text-[10px] font-mono text-[#444] truncate">
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Avatar menu */}
            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-5 mt-1 w-44 bg-[#0a0a0a] border border-[#1a1a1a] z-50 overflow-hidden"
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
          <nav className="flex flex-col p-3 gap-px flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-full text-left px-4 py-2.5 text-[10px] tracking-[0.1em] uppercase font-semibold transition-all ${
                  activeTab === tab.id
                    ? "text-white bg-[#111] border border-[#2a2a2a]"
                    : "text-[#444] hover:text-[#888] border border-transparent"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tabIndicator"
                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-white"
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Sign out */}
          <div className="p-3 border-t border-[#1a1a1a]">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-[10px] tracking-[0.1em] uppercase font-semibold text-[#444] hover:text-red-400 transition-colors"
            >
              → Sign out
            </button>
          </div>
        </motion.aside>

        {/* MAIN */}
        <main className="flex-1 min-w-0 flex flex-col min-h-0 bg-[#050505]">
          {/* Tab header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 h-11 border-b border-[#1a1a1a]">
            <span className="text-[9px] font-semibold tracking-[0.18em] uppercase text-[#444]">
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
            {activeTab !== "security" && activeTab !== "feedback" && (
              <motion.button
                onClick={saveSettings}
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
                Save
              </motion.button>
            )}
            {activeTab === "security" && (
              <motion.button
                onClick={updatePassword}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="text-[9px] tracking-[0.12em] uppercase font-semibold text-black bg-white px-4 py-1.5 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
              >
                Update
              </motion.button>
            )}
            {activeTab === "feedback" && (
              <motion.button
                onClick={submitFeedback}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="text-[9px] tracking-[0.12em] uppercase font-semibold text-black bg-white px-4 py-1.5 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
              >
                Send
              </motion.button>
            )}
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:bg-[#2a2a2a]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* ── PROFILE TAB ── */}
                {activeTab === "profile" && (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-px max-w-2xl"
                  >
                    {/* Personal info block */}
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
                          label="Location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                      <motion.div
                        variants={item}
                        className="flex flex-col gap-1.5"
                      >
                        <label className="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#444]">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="Tell us about yourself..."
                          className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2.5 text-[12px] text-white placeholder-[#333] focus:outline-none focus:border-[#444] transition-colors font-mono resize-none"
                        />
                      </motion.div>
                    </div>

                    <ShimmerLine />

                    {/* Socials block */}
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative">
                      <Corners />
                      <CellLabel>Online Presence</CellLabel>
                      <div className="grid grid-cols-3 gap-4">
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
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── FEEDBACK TAB ── */}
                {activeTab === "feedback" && (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="max-w-2xl"
                  >
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 relative">
                      <Corners />
                      <CellLabel>Send Feedback</CellLabel>

                      <form
                        onSubmit={submitFeedback}
                        className="flex flex-col gap-4"
                      >
                        {/* Rating */}
                        <motion.div
                          variants={item}
                          className="flex flex-col gap-2"
                        >
                          <label className="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#444]">
                            Rating
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setFeedback({ ...feedback, rating: star })
                                }
                                className={`w-7 h-7 border text-[11px] transition-all ${
                                  star <= feedback.rating
                                    ? "border-white bg-white text-black"
                                    : "border-[#2a2a2a] text-[#444] hover:border-[#444]"
                                }`}
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

                        {/* Category */}
                        <motion.div
                          variants={item}
                          className="flex flex-col gap-2"
                        >
                          <label className="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#444]">
                            Category
                          </label>
                          <div className="flex gap-px">
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
                                className={`px-4 py-2 text-[9px] tracking-[0.1em] uppercase font-semibold transition-all ${
                                  feedback.category === cat.toLowerCase()
                                    ? "bg-white text-black"
                                    : "bg-[#0a0a0a] border border-[#1a1a1a] text-[#444] hover:text-white hover:border-[#2a2a2a]"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </motion.div>

                        {/* Message */}
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
                            className="w-full bg-[#0a0a0a] border border-[#1a1a1a] px-3 py-2.5 text-[12px] text-white placeholder-[#333] focus:outline-none focus:border-[#444] transition-colors font-mono resize-none"
                          />
                        </motion.div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === "security" && (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-px max-w-md"
                  >
                    {/* Password block */}
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

                    {/* Danger zone */}
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
                      <div className="text-[9px] font-semibold tracking-[0.18em] uppercase text-red-500/50 mb-3">
                        Danger Zone
                      </div>
                      <p className="text-[11px] font-mono text-[#444] mb-4">
                        Permanently remove your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <button
                        onClick={deleteAccount}
                        className="text-[9px] tracking-[0.12em] uppercase font-semibold text-red-400 border border-red-500/20 px-4 py-2 hover:bg-red-500/10 transition-all"
                      >
                        Delete Account
                      </button>
                    </div>
                  </motion.div>
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
              transition={{ duration: 0.25 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsViewingImage(false)}
                className="absolute -top-10 right-0 text-[10px] font-mono text-[#555] hover:text-white tracking-wider uppercase transition-colors"
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
