import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../Context/user.context.jsx";
import axios from "../Config/axios.js";
import { useNavigate } from "react-router-dom";
import { authClient } from "../Config/auth-client.js";

/* ───────── Animations ───────── */
const orchestrate = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
  },
};

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

/* ───────── Helpers ───────── */
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const UserIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const SettingsIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
const LinkIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);
const MessageIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const LockIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const GridIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const LogOutIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const CameraIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const MapPinIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const StarIcon = ({ className = "w-4 h-4", filled = false }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const SaveIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const SendIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const AlertIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);
const EyeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/* ───────── UI Primitives ───────── */
const CellLabel = ({ children, right }) => (
  <div className="flex items-center justify-between mb-3 flex-shrink-0">
    <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/40">
      {children}
    </span>
    {right}
  </div>
);

const Cell = ({ children, className = "" }) => (
  <motion.div
    variants={fadeUp}
    className={`relative bg-[#0a0a0a] rounded-2xl border border-white/[0.06] p-5 flex flex-col overflow-hidden transition-colors duration-300 hover:border-white/[0.1] ${className}`}
  >
    {children}
  </motion.div>
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
  <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
    <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[12px] text-white placeholder-white/20 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    />
  </motion.div>
);

const StatBox = ({ label, value }) => (
  <motion.div
    variants={fadeUp}
    className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 hover:border-white/[0.1] hover:bg-white/[0.035] transition-colors"
  >
    <div className="text-[9px] tracking-[0.14em] uppercase text-white/35 font-mono mb-1.5">
      {label}
    </div>
    <div className="text-[22px] font-semibold leading-none tracking-tight text-white tabular-nums">
      {value}
    </div>
  </motion.div>
);

const Toggle = ({ label, description, checked, onChange }) => (
  <motion.div
    variants={fadeUp}
    className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-b-0"
  >
    <div className="flex-1 min-w-0 pr-4">
      <div className="text-[12px] text-white/85 font-medium">{label}</div>
      {description && (
        <div className="text-[10px] text-white/35 mt-0.5">{description}</div>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full border transition-colors flex-shrink-0 ${
        checked
          ? "border-white/30 bg-white/80"
          : "border-white/[0.1] bg-white/[0.03]"
      }`}
      style={{ height: "22px" }}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute top-[2px] w-4 h-4 rounded-full ${
          checked ? "bg-black" : "bg-white/40"
        }`}
      />
    </button>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════ */
/*                        USER PROFILE                          */
/* ════════════════════════════════════════════════════════════ */

const UserProfile = () => {
  const { user, setUser, aiUsage, refreshAiUsage } = useContext(UserContext);
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

  useEffect(() => {
    if (!refreshAiUsage) return;
    refreshAiUsage();
    const interval = setInterval(() => {
      refreshAiUsage();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshAiUsage]);

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
    { id: "overview", label: "Overview", Icon: GridIcon },
    { id: "profile", label: "Profile", Icon: UserIcon },
    { id: "socials", label: "Socials", Icon: LinkIcon },
    { id: "preferences", label: "Preferences", Icon: SettingsIcon },
    { id: "feedback", label: "Feedback", Icon: MessageIcon },
    { id: "security", label: "Security", Icon: LockIcon },
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
    <div className="h-screen w-screen overflow-hidden bg-[#050505] text-white font-sans flex flex-col selection:bg-white/15 relative">
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
              profile
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`text-[10px] font-medium px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                  message.type === "success"
                    ? "border-emerald-400/20 text-emerald-300 bg-emerald-400/[0.05]"
                    : "border-red-400/20 text-red-300 bg-red-400/[0.05]"
                }`}
              >
                {message.type === "success" ? (
                  <CheckIcon className="w-3 h-3" />
                ) : (
                  <AlertIcon className="w-3 h-3" />
                )}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400/80" />
            </span>
            <span className="text-[9px] font-medium text-white/30 tracking-wider">
              ONLINE
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

      {/* ─── BODY ─── */}
      <div className="relative z-10 flex flex-1 min-h-0">
        {/* ─── SIDEBAR ─── */}
        <motion.aside
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="w-60 flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#070707]"
        >
          {/* Avatar + user info */}
          <div className="p-5 border-b border-white/[0.06] relative">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

            <div
              className="relative cursor-pointer group mb-3 mx-auto w-fit"
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            >
              {!imgError && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  onError={() => setImgError(true)}
                  className="w-16 h-16 rounded-2xl object-cover border border-white/[0.08]"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white text-black border border-white/[0.1] flex items-center justify-center text-[22px] font-bold">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <CameraIcon className="w-5 h-5 text-white/90" />
              </div>

              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#070707] rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-[13px] font-semibold text-white truncate">
                {user?.name || "Developer"}
              </div>
              <div className="text-[10px] text-white/40 truncate mt-0.5 font-mono">
                {user?.email}
              </div>
              {formData.jobTitle && (
                <div className="text-[10px] text-white/50 mt-1.5 truncate">
                  {formData.jobTitle}
                </div>
              )}
              {formData.location && (
                <div className="text-[10px] text-white/30 mt-1 truncate flex items-center justify-center gap-1">
                  <MapPinIcon className="w-3 h-3" />
                  {formData.location}
                </div>
              )}
            </div>

            {/* Avatar dropdown */}
            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-5 right-5 mt-1 bg-[#0e0e0e] border border-white/[0.08] rounded-xl z-50 overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                >
                  {user?.avatar && !imgError && (
                    <button
                      onClick={() => {
                        setIsViewingImage(true);
                        setIsAvatarMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-[11px] text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-2.5"
                    >
                      <EyeIcon className="w-3.5 h-3.5" /> View photo
                    </button>
                  )}
                  <button
                    onClick={() => {
                      fileInputRef.current.click();
                      setIsAvatarMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-[11px] text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center gap-2.5"
                  >
                    <CameraIcon className="w-3.5 h-3.5" /> Change photo
                  </button>
                  {user?.avatar && !imgError && (
                    <button
                      onClick={handleDeleteAvatar}
                      className="w-full text-left px-3.5 py-2.5 text-[11px] text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.05] transition-colors border-t border-white/[0.05] flex items-center gap-2.5"
                    >
                      <TrashIcon className="w-3.5 h-3.5" /> Remove photo
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tabs */}
          <nav className="flex flex-col p-2 gap-0.5 flex-1 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.Icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-2.5 ${
                    isActive
                      ? "text-white bg-white/[0.06]"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.03]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tabIndicator"
                      className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-white rounded-r-full"
                      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                    />
                  )}
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-white/40"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-2 border-t border-white/[0.06]">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-medium text-white/40 hover:text-red-400 hover:bg-red-400/[0.05] transition-colors flex items-center gap-2.5"
            >
              <LogOutIcon className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </motion.aside>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Tab bar */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 h-[52px] border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-white/90 tracking-tight">
                {tabs.find((t) => t.id === activeTab)?.label}
              </span>
              {activeTab === "overview" && (
                <span className="text-[10px] font-mono text-white/25 ml-1">
                  · read only
                </span>
              )}
            </div>
            {saveLabel[activeTab] && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="text-[11px] font-semibold text-black bg-white px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block w-3 h-3 border border-black/70 border-t-transparent rounded-full"
                  />
                ) : saveLabel[activeTab] === "Send" ? (
                  <SendIcon className="w-3 h-3" />
                ) : (
                  <SaveIcon className="w-3 h-3" />
                )}
                {saveLabel[activeTab]}
              </button>
            )}
          </div>

          {/* Scrollable body */}
          <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-white/8 [&::-webkit-scrollbar-thumb]:rounded-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                className="h-full"
              >
                {/* ── OVERVIEW TAB ── */}
                {activeTab === "overview" && (
                  <motion.div
                    variants={orchestrate}
                    initial="hidden"
                    animate="show"
                    className="h-full grid grid-cols-3 grid-rows-2 gap-2.5 p-2.5"
                  >
                    {/* Identity */}
                    <Cell>
                      <CellLabel>Identity</CellLabel>
                      <div className="flex items-start gap-3.5 mb-3">
                        {!imgError && user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt="Avatar"
                            onError={() => setImgError(true)}
                            className="w-14 h-14 rounded-2xl object-cover border border-white/[0.08] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-white text-black border border-white/[0.1] flex items-center justify-center text-[20px] font-bold flex-shrink-0">
                            {getInitials(user?.name)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[17px] font-semibold text-white leading-tight mb-1 truncate">
                            {user?.name || "Developer"}
                          </div>
                          <div className="text-[10px] text-white/40 truncate font-mono">
                            {user?.email}
                          </div>
                          {formData.jobTitle && (
                            <div className="text-[10px] text-white/50 mt-1 truncate">
                              {formData.jobTitle}
                              {formData.company && (
                                <span className="text-white/25">
                                  {" "}
                                  @ {formData.company}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {formData.bio && (
                        <p className="text-[11px] text-white/50 leading-relaxed line-clamp-3">
                          {formData.bio}
                        </p>
                      )}
                      {formData.location && (
                        <div className="mt-auto pt-3 text-[10px] text-white/30 flex items-center gap-1.5">
                          <MapPinIcon className="w-3 h-3" /> {formData.location}
                        </div>
                      )}
                    </Cell>

                    {/* Stats */}
                    <Cell>
                      <CellLabel>Stats</CellLabel>
                      <motion.div
                        variants={orchestrate}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-2 gap-2 flex-1"
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
                    </Cell>

                    {/* AI Usage */}
                    <Cell>
                      <CellLabel
                        right={
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                              aiUsage?.isLimited
                                ? "bg-red-400/[0.08] text-red-400 border border-red-400/[0.15]"
                                : "bg-emerald-400/[0.08] text-emerald-400 border border-emerald-400/[0.15]"
                            }`}
                          >
                            {aiUsage?.isLimited ? "LIMITED" : "ACTIVE"}
                          </span>
                        }
                      >
                        AI Usage
                      </CellLabel>

                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <div className="text-[26px] font-semibold leading-none tracking-tight text-white tabular-nums">
                            {aiUsage?.remaining ?? 0}
                          </div>
                          <div className="text-[9px] tracking-[0.14em] uppercase text-white/35 font-mono mt-1.5">
                            Requests left
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] font-mono text-white/55">
                            {aiUsage?.used ?? 0}/{aiUsage?.limit ?? 20}
                          </div>
                          <div className="text-[9px] font-mono text-white/25 mt-0.5">
                            resets in {aiUsage?.resetInHuman || "Now"}
                          </div>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${aiUsage?.percentageUsed ?? 0}%`,
                          }}
                          transition={{
                            duration: 0.6,
                            ease: [0.25, 1, 0.5, 1],
                          }}
                          className={`h-full rounded-full ${
                            aiUsage?.isLimited
                              ? "bg-red-400/70"
                              : aiUsage?.percentageUsed >= 80
                                ? "bg-yellow-400/70"
                                : "bg-white/80"
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        {[
                          { label: "Plan", value: "Free" },
                          {
                            label: "Hourly limit",
                            value: aiUsage?.limit ?? 20,
                          },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex items-center justify-between py-1.5"
                          >
                            <span className="text-[10px] tracking-wider text-white/35 font-mono">
                              {label}
                            </span>
                            <span className="text-[10px] font-mono text-white/60">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-3 text-[10px] text-white/35 leading-relaxed">
                        {aiUsage?.isLimited
                          ? `Limit reached. Resets in ${aiUsage?.resetInHuman}.`
                          : `${aiUsage?.remaining ?? 0} request(s) remaining.`}
                      </div>
                    </Cell>

                    {/* Account */}
                    <Cell>
                      <CellLabel>Account</CellLabel>
                      <div className="flex flex-col gap-0.5">
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
                            className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-b-0"
                          >
                            <span className="text-[10px] tracking-wider text-white/35 font-mono">
                              {label}
                            </span>
                            <span className="text-[10px] font-mono text-white/60 truncate ml-3">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Cell>

                    {/* Quick Actions */}
                    <Cell>
                      <CellLabel>Quick Actions</CellLabel>
                      <div className="flex flex-col gap-1 flex-1">
                        {[
                          {
                            label: "Edit Profile",
                            tab: "profile",
                            Icon: UserIcon,
                          },
                          {
                            label: "Update Socials",
                            tab: "socials",
                            Icon: LinkIcon,
                          },
                          {
                            label: "Preferences",
                            tab: "preferences",
                            Icon: SettingsIcon,
                          },
                          {
                            label: "Change Password",
                            tab: "security",
                            Icon: LockIcon,
                          },
                          {
                            label: "Send Feedback",
                            tab: "feedback",
                            Icon: MessageIcon,
                          },
                        ].map(({ label, tab, Icon }) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="text-left px-3 py-2 rounded-lg text-[11px] text-white/55 hover:text-white hover:bg-white/[0.04] transition-all flex items-center justify-between group"
                          >
                            <span className="flex items-center gap-2.5">
                              <Icon className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 transition-colors" />
                              {label}
                            </span>
                            <ArrowRightIcon className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </Cell>

                    {/* Recent Activity */}
                    <Cell>
                      <CellLabel
                        right={
                          <div className="flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/40" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/80" />
                            </span>
                            <span className="text-[9px] font-mono text-white/35 tracking-wider">
                              live
                            </span>
                          </div>
                        }
                      >
                        Recent Activity
                      </CellLabel>
                      <div className="flex flex-col gap-1.5 flex-1">
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
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.06 }}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                              <span className="text-[11px] text-white/60">
                                {action}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-white/30">
                              {time}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </Cell>
                  </motion.div>
                )}

                {/* ── PROFILE TAB ── */}
                {activeTab === "profile" && (
                  <div className="p-5 max-w-2xl">
                    <motion.div
                      variants={orchestrate}
                      initial="hidden"
                      animate="show"
                    >
                      <Cell>
                        <CellLabel>Personal Information</CellLabel>
                        <div className="grid grid-cols-2 gap-3 mb-3">
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
                        <div className="mb-3">
                          <Input
                            label="Website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="https://yoursite.com"
                          />
                        </div>
                        <motion.div
                          variants={fadeUp}
                          className="flex flex-col gap-1.5"
                        >
                          <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Tell us about yourself..."
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[12px] text-white placeholder-white/20 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.04] transition-colors resize-none"
                          />
                        </motion.div>
                      </Cell>
                    </motion.div>
                  </div>
                )}

                {/* ── SOCIALS TAB ── */}
                {activeTab === "socials" && (
                  <div className="p-5 max-w-xl">
                    <motion.div
                      variants={orchestrate}
                      initial="hidden"
                      animate="show"
                    >
                      <Cell>
                        <CellLabel>Social Links</CellLabel>
                        <div className="flex flex-col gap-3">
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
                      </Cell>
                    </motion.div>
                  </div>
                )}

                {/* ── PREFERENCES TAB ── */}
                {activeTab === "preferences" && (
                  <div className="p-5 max-w-xl flex flex-col gap-2.5">
                    <motion.div
                      variants={orchestrate}
                      initial="hidden"
                      animate="show"
                    >
                      <Cell>
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
                      </Cell>
                    </motion.div>
                    <motion.div
                      variants={orchestrate}
                      initial="hidden"
                      animate="show"
                    >
                      <Cell>
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
                      </Cell>
                    </motion.div>
                  </div>
                )}

                {/* ── FEEDBACK TAB ── */}
                {activeTab === "feedback" && (
                  <div className="p-5 max-w-xl">
                    <motion.div
                      variants={orchestrate}
                      initial="hidden"
                      animate="show"
                    >
                      <Cell>
                        <CellLabel>Send Feedback</CellLabel>
                        <form
                          onSubmit={submitFeedback}
                          className="flex flex-col gap-4"
                        >
                          <motion.div
                            variants={fadeUp}
                            className="flex flex-col gap-2"
                          >
                            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
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
                                  className={`w-9 h-9 rounded-lg border transition-colors flex items-center justify-center ${
                                    star <= feedback.rating
                                      ? "border-white/20 bg-white/[0.08] text-yellow-300"
                                      : "border-white/[0.06] text-white/25 hover:border-white/[0.15] hover:text-white/50"
                                  }`}
                                >
                                  <StarIcon
                                    className="w-4 h-4"
                                    filled={star <= feedback.rating}
                                  />
                                </button>
                              ))}
                              <span className="text-[11px] font-mono text-white/35 ml-2">
                                {feedback.rating > 0
                                  ? `${feedback.rating}/5`
                                  : "—"}
                              </span>
                            </div>
                          </motion.div>

                          <motion.div
                            variants={fadeUp}
                            className="flex flex-col gap-2"
                          >
                            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
                              Category
                            </label>
                            <div className="flex gap-1.5 flex-wrap">
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
                                    className={`px-3.5 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                                      feedback.category === cat.toLowerCase()
                                        ? "bg-white text-black"
                                        : "bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/90 hover:border-white/[0.15]"
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                ),
                              )}
                            </div>
                          </motion.div>

                          <motion.div
                            variants={fadeUp}
                            className="flex flex-col gap-1.5"
                          >
                            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
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
                              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[12px] text-white placeholder-white/20 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.04] transition-colors resize-none"
                            />
                          </motion.div>
                        </form>
                      </Cell>
                    </motion.div>
                  </div>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === "security" && (
                  <div className="p-5 max-w-md flex flex-col gap-2.5">
                    <motion.div
                      variants={orchestrate}
                      initial="hidden"
                      animate="show"
                    >
                      <Cell>
                        <CellLabel>Change Password</CellLabel>
                        <div className="flex flex-col gap-3">
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
                      </Cell>
                    </motion.div>

                    <motion.div
                      variants={orchestrate}
                      initial="hidden"
                      animate="show"
                    >
                      <Cell>
                        <CellLabel>Active Sessions</CellLabel>
                        <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-white/60" />
                            </div>
                            <div>
                              <div className="text-[12px] text-white/90 font-medium">
                                Current session
                              </div>
                              <div className="text-[10px] text-white/35 font-mono">
                                This browser
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/40" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400/80" />
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400/80">
                              active
                            </span>
                          </div>
                        </div>
                      </Cell>
                    </motion.div>

                    <motion.div
                      variants={orchestrate}
                      initial="hidden"
                      animate="show"
                    >
                      <div className="relative bg-red-500/[0.03] rounded-2xl border border-red-500/[0.15] p-5">
                        <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-red-400/80 mb-2 flex items-center gap-2">
                          <AlertIcon className="w-3.5 h-3.5" /> Danger Zone
                        </div>
                        <p className="text-[11px] text-white/45 mb-4 leading-relaxed">
                          Permanently remove your account and all associated
                          data. This cannot be undone.
                        </p>
                        <button
                          onClick={deleteAccount}
                          className="text-[11px] font-semibold text-white bg-red-500/90 hover:bg-red-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
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

      {/* ─── LIGHTBOX ─── */}
      <AnimatePresence>
        {isViewingImage && user?.avatar && !imgError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsViewingImage(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsViewingImage(false)}
                className="absolute -top-10 right-0 text-[11px] font-medium text-white/60 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <XIcon className="w-3.5 h-3.5" /> Close
              </button>
              <img
                src={user.avatar}
                alt="Full Avatar"
                className="max-h-[80vh] rounded-2xl border border-white/[0.1]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
