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
            className="z-[9999] hidden md:block pointer-events-none whitespace-nowrap bg-[#1a1a1a] text-white/90 text-[10px] font-medium tracking-wide px-2.5 py-1.5 rounded-lg border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
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

/* Icons added specifically for Mobile layout */
const ChevronLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRightIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
const BellIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);
const HomeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
const FolderIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);
const ActivityIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
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
  <motion.div variants={fadeUp} className="flex flex-col gap-1.5 w-full">
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
  const [mobileView, setMobileView] = useState("main"); // For Mobile stack navigation
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
    { id: "profile", label: "Personal Information", Icon: UserIcon },
    { id: "socials", label: "Social Links", Icon: LinkIcon },
    { id: "preferences", label: "Preferences", Icon: SettingsIcon },
    { id: "security", label: "Security", Icon: LockIcon },
    { id: "feedback", label: "Send Feedback", Icon: MessageIcon },
  ];

  const saveLabel = {
    overview: null,
    profile: "Save",
    socials: "Save",
    preferences: "Save",
    feedback: "Send",
    security: "Update",
  };

  const handleSave = (tab) => {
    const targetTab = tab || activeTab;
    if (targetTab === "profile" || targetTab === "socials") saveSettings();
    else if (targetTab === "security") updatePassword();
    else if (targetTab === "feedback")
      submitFeedback({ preventDefault: () => {} });
    else if (targetTab === "preferences")
      showMessage("success", "Preferences saved.");
  };

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#050505] text-white font-sans flex flex-col selection:bg-white/15 relative">
      <NoiseBG />

      {/* Global Toast for Mobile (and backup for desktop) */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden fixed top-6 left-1/2 -translate-x-1/2 z-[100] text-[11px] font-medium px-4 py-2 rounded-xl border flex items-center gap-2 shadow-2xl backdrop-blur-md ${
              message.type === "success"
                ? "border-emerald-400/20 text-emerald-300 bg-[#0a0a0a]/90"
                : "border-red-400/20 text-red-300 bg-[#0a0a0a]/90"
            }`}
          >
            {message.type === "success" ? (
              <CheckIcon className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertIcon className="w-4 h-4 text-red-400" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*                       DESKTOP LAYOUT                         */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 w-full relative z-10">
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

        <div className="flex flex-1 min-h-0">
          <motion.aside
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="w-60 flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#070707]"
          >
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
                    {tab.label === "Personal Information"
                      ? "Profile"
                      : tab.label === "Social Links"
                        ? "Socials"
                        : tab.label === "Send Feedback"
                          ? "Feedback"
                          : tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="p-2 border-t border-white/[0.06]">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-medium text-white/40 hover:text-red-400 hover:bg-red-400/[0.05] transition-colors flex items-center gap-2.5"
              >
                <LogOutIcon className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </motion.aside>

          <main className="flex-1 min-w-0 flex flex-col min-h-0">
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
                  onClick={() => handleSave()}
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
                  {activeTab === "overview" && (
                    <motion.div
                      variants={orchestrate}
                      initial="hidden"
                      animate="show"
                      className="h-full grid grid-cols-3 grid-rows-2 gap-2.5 p-2.5"
                    >
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
                            <MapPinIcon className="w-3 h-3" />{" "}
                            {formData.location}
                          </div>
                        )}
                      </Cell>

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

                      <Cell>
                        <CellLabel
                          right={
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${aiUsage?.isLimited ? "bg-red-400/[0.08] text-red-400 border border-red-400/[0.15]" : "bg-emerald-400/[0.08] text-emerald-400 border border-emerald-400/[0.15]"}`}
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
                            className={`h-full rounded-full ${aiUsage?.isLimited ? "bg-red-400/70" : aiUsage?.percentageUsed >= 80 ? "bg-yellow-400/70" : "bg-white/80"}`}
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
                                setPreferences((p) => ({
                                  ...p,
                                  weeklyDigest: v,
                                }))
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
                                setPreferences((p) => ({
                                  ...p,
                                  compactMode: v,
                                }))
                              }
                            />
                            <Toggle
                              label="Sound effects"
                              description="Play sounds on interactions"
                              checked={preferences.soundEffects}
                              onChange={(v) =>
                                setPreferences((p) => ({
                                  ...p,
                                  soundEffects: v,
                                }))
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
                                    className={`w-9 h-9 rounded-lg border transition-colors flex items-center justify-center ${star <= feedback.rating ? "border-white/20 bg-white/[0.08] text-yellow-300" : "border-white/[0.06] text-white/25 hover:border-white/[0.15] hover:text-white/50"}`}
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
                                      className={`px-3.5 py-2 rounded-lg text-[11px] font-medium transition-colors ${feedback.category === cat.toLowerCase() ? "bg-white text-black" : "bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/90 hover:border-white/[0.15]"}`}
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
                            <TrashIcon className="w-3.5 h-3.5" /> Delete Account
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
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/*                       MOBILE LAYOUT                          */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col flex-1 min-h-0 w-full relative z-10 bg-[#050505]">
        {/* Dynamic Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 h-14 bg-[#050505]">
          {mobileView === "main" ? (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                  <span className="text-[10px] font-black tracking-wider text-black">
                    DD
                  </span>
                </div>
                <span className="text-[15px] font-semibold tracking-tight">
                  DevDialogue
                </span>
              </div>
              <div className="flex items-center gap-4">
                <BellIcon className="w-5 h-5 text-white/70" />
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                  {getInitials(user?.name)}
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setMobileView("main")}
                className="flex items-center gap-1.5 text-white/70 active:text-white transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                <span className="text-[15px] font-medium">
                  {tabs.find((t) => t.id === mobileView)?.label || "Profile"}
                </span>
              </button>
              {saveLabel[mobileView] && (
                <button
                  onClick={() => handleSave(mobileView)}
                  disabled={loading}
                  className="text-[12px] font-semibold text-black bg-white px-3 py-1.5 rounded-lg active:bg-white/80 transition-colors disabled:opacity-50 flex items-center gap-1.5"
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
                  ) : (
                    saveLabel[mobileView]
                  )}
                </button>
              )}
            </>
          )}
        </header>

        {/* Dynamic Body Content */}
        <div className="flex-1 overflow-y-auto pb-24 [&::-webkit-scrollbar]:hidden">
          {/* ── MOBILE MAIN MENU ── */}
          {mobileView === "main" && (
            <div className="px-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {/* Profile Header Card */}
              <div className="bg-[#0a0a0a] rounded-[20px] border border-white/[0.06] p-5 mt-2 relative">
                <div className="flex justify-between items-start">
                  <div
                    className="relative"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {!imgError && user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Avatar"
                        onError={() => setImgError(true)}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/[0.08]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-white text-black border border-white/[0.1] flex items-center justify-center text-[20px] font-bold">
                        {getInitials(user?.name)}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileView("profile")}
                    className="border border-white/[0.1] text-white/80 px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 active:bg-white/[0.05]"
                  >
                    Edit
                  </button>
                </div>
                <div className="mt-4">
                  <h2 className="text-[20px] font-semibold tracking-tight">
                    {user?.name || "Developer"}
                  </h2>
                  <p className="text-[12px] text-white/50 font-mono mt-0.5">
                    {user?.email}
                  </p>
                  {(formData.jobTitle || formData.company) && (
                    <p className="text-[11px] text-white/40 mt-1.5">
                      {formData.jobTitle}{" "}
                      {formData.company && `| ${formData.company}`}
                    </p>
                  )}
                </div>
              </div>

              {/* About Me Card */}
              <div
                onClick={() => setMobileView("profile")}
                className="bg-[#0a0a0a] rounded-2xl border border-white/[0.06] p-4 mt-4 active:bg-white/[0.02] transition-colors"
              >
                <div className="flex justify-between items-center mb-2 text-white/80">
                  <div className="flex items-center gap-2 text-[13px] font-medium">
                    <UserIcon className="w-4 h-4" /> About Me
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-white/30" />
                </div>
                <p className="text-[12px] text-white/50 leading-relaxed line-clamp-3">
                  {formData.bio || "No bio added yet. Tap to add one."}
                </p>
              </div>

              {/* Menu Options */}
              <div className="mt-4 flex flex-col gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.Icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setMobileView(tab.id)}
                      className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-white/[0.06] rounded-2xl active:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3 text-white/80">
                        <Icon className="w-4 h-4" />{" "}
                        <span className="text-[14px] font-medium">
                          {tab.label}
                        </span>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-white/30" />
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between p-4 mt-2 bg-red-500/[0.03] border border-red-500/[0.1] rounded-2xl active:bg-red-500/[0.05]"
                >
                  <div className="flex items-center gap-3 text-red-400">
                    <LogOutIcon className="w-4 h-4" />{" "}
                    <span className="text-[14px] font-medium">Logout</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-red-400/50" />
                </button>
              </div>
            </div>
          )}

          {/* ── MOBILE OVERVIEW SUB-PAGE ── */}
          {mobileView === "overview" && (
            <motion.div
              variants={orchestrate}
              initial="hidden"
              animate="show"
              className="px-4 flex flex-col gap-4 py-2"
            >
              <Cell className="p-4">
                <CellLabel>Stats</CellLabel>
                <div className="grid grid-cols-2 gap-2">
                  <StatBox label="Projects" value={user?.projectCount ?? 0} />
                  <StatBox
                    label="Collaborators"
                    value={user?.collaboratorCount ?? 0}
                  />
                  <StatBox label="Files" value={user?.fileCount ?? 0} />
                  <StatBox label="Days Active" value={user?.daysActive ?? 1} />
                </div>
              </Cell>
              <Cell className="p-4">
                <CellLabel
                  right={
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${aiUsage?.isLimited ? "bg-red-400/[0.08] text-red-400" : "bg-emerald-400/[0.08] text-emerald-400"}`}
                    >
                      {aiUsage?.isLimited ? "LIMITED" : "ACTIVE"}
                    </span>
                  }
                >
                  AI Usage
                </CellLabel>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="text-[26px] font-semibold leading-none text-white tabular-nums">
                      {aiUsage?.remaining ?? 0}
                    </div>
                    <div className="text-[9px] uppercase text-white/35 font-mono mt-1.5">
                      Requests left
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-mono text-white/55">
                      {aiUsage?.used ?? 0}/{aiUsage?.limit ?? 20}
                    </div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aiUsage?.percentageUsed ?? 0}%` }}
                    className={`h-full rounded-full ${aiUsage?.isLimited ? "bg-red-400/70" : aiUsage?.percentageUsed >= 80 ? "bg-yellow-400/70" : "bg-white/80"}`}
                  />
                </div>
                <div className="text-[10px] text-white/35">
                  {aiUsage?.isLimited
                    ? `Limit reached. Resets in ${aiUsage?.resetInHuman}.`
                    : `${aiUsage?.remaining ?? 0} request(s) remaining.`}
                </div>
              </Cell>
              <Cell className="p-4">
                <CellLabel>Recent Activity</CellLabel>
                <div className="flex flex-col gap-2">
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
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        <span className="text-[12px] text-white/60">
                          {action}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-white/30">
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </Cell>
            </motion.div>
          )}

          {/* ── MOBILE PROFILE EDIT ── */}
          {mobileView === "profile" && (
            <motion.div
              variants={orchestrate}
              initial="hidden"
              animate="show"
              className="px-4 py-2"
            >
              <Cell className="p-4">
                <div className="flex flex-col gap-4">
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
                  <Input
                    label="Website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yoursite.com"
                  />
                  <div className="flex flex-col gap-1.5 w-full">
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
                  </div>
                </div>
              </Cell>
            </motion.div>
          )}

          {/* ── MOBILE SOCIALS ── */}
          {mobileView === "socials" && (
            <motion.div
              variants={orchestrate}
              initial="hidden"
              animate="show"
              className="px-4 py-2"
            >
              <Cell className="p-4">
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
                </div>
              </Cell>
            </motion.div>
          )}

          {/* ── MOBILE PREFERENCES ── */}
          {mobileView === "preferences" && (
            <motion.div
              variants={orchestrate}
              initial="hidden"
              animate="show"
              className="px-4 py-2 flex flex-col gap-4"
            >
              <Cell className="p-4">
                <CellLabel>Notifications</CellLabel>
                <div>
                  <Toggle
                    label="Email notifications"
                    description="Receive updates via email"
                    checked={preferences.emailNotifications}
                    onChange={(v) =>
                      setPreferences((p) => ({ ...p, emailNotifications: v }))
                    }
                  />
                  <Toggle
                    label="Project invites"
                    description="Get notified of new invitations"
                    checked={preferences.projectInvites}
                    onChange={(v) =>
                      setPreferences((p) => ({ ...p, projectInvites: v }))
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
              <Cell className="p-4">
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
                      setPreferences((p) => ({ ...p, showOnlineStatus: v }))
                    }
                  />
                </div>
              </Cell>
            </motion.div>
          )}

          {/* ── MOBILE SECURITY ── */}
          {mobileView === "security" && (
            <motion.div
              variants={orchestrate}
              initial="hidden"
              animate="show"
              className="px-4 py-2 flex flex-col gap-4"
            >
              <Cell className="p-4">
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
              </Cell>
              <div className="bg-red-500/[0.03] rounded-2xl border border-red-500/[0.15] p-5">
                <div className="text-[12px] font-semibold tracking-wide text-red-400/80 mb-2 flex items-center gap-2">
                  <AlertIcon className="w-4 h-4" /> Danger Zone
                </div>
                <p className="text-[12px] text-white/45 mb-4 leading-relaxed">
                  Permanently remove your account and all associated data. This
                  cannot be undone.
                </p>
                <button
                  onClick={deleteAccount}
                  className="w-full text-[13px] font-semibold text-white bg-red-500/90 py-3 rounded-xl flex items-center justify-center gap-2 active:bg-red-500"
                >
                  <TrashIcon className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </motion.div>
          )}

          {/* ── MOBILE FEEDBACK ── */}
          {mobileView === "feedback" && (
            <motion.div
              variants={orchestrate}
              initial="hidden"
              animate="show"
              className="px-4 py-2"
            >
              <Cell className="p-4">
                <form onSubmit={submitFeedback} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
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
                          className={`flex-1 aspect-square rounded-xl border flex items-center justify-center ${star <= feedback.rating ? "border-white/20 bg-white/[0.08] text-yellow-300" : "border-white/[0.06] text-white/25"}`}
                        >
                          <StarIcon
                            className="w-5 h-5"
                            filled={star <= feedback.rating}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
                      Category
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {["General", "Bug", "Feature", "Other"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setFeedback({
                              ...feedback,
                              category: cat.toLowerCase(),
                            })
                          }
                          className={`px-4 py-2.5 rounded-xl text-[12px] font-medium transition-colors ${feedback.category === cat.toLowerCase() ? "bg-white text-black" : "bg-white/[0.03] border border-white/[0.06] text-white/50"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-white/40">
                      Message
                    </label>
                    <textarea
                      required
                      value={feedback.message}
                      onChange={(e) =>
                        setFeedback({ ...feedback, message: e.target.value })
                      }
                      rows="5"
                      placeholder="Type your message here..."
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-white/[0.2] transition-colors resize-none"
                    />
                  </div>
                </form>
              </Cell>
            </motion.div>
          )}
        </div>

        {/* ── Mobile Bottom Navigation ── */}
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#050505]/95 backdrop-blur-xl border-t border-white/[0.06] z-50 flex justify-around items-start pt-3 px-2 pb-safe">
          {[
            {
              id: "dashboard",
              label: "Dashboard",
              Icon: HomeIcon,
              route: "/home",
            },
            {
              id: "projects",
              label: "Projects",
              Icon: FolderIcon,
              route: "/home",
            },
            {
              id: "activity",
              label: "Activity",
              Icon: ActivityIcon,
              route: "/home",
            },
            {
              id: "profile",
              label: "Profile",
              Icon: UserIcon,
              route: "/profile",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "profile") setMobileView("main");
                else navigate(tab.route);
              }}
              className="flex flex-col items-center gap-1.5 w-16"
            >
              <tab.Icon
                className={`w-5 h-5 transition-colors ${tab.id === "profile" ? "text-white" : "text-white/30"}`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${tab.id === "profile" ? "text-white" : "text-white/30"}`}
              >
                {tab.label}
              </span>
              {tab.id === "profile" && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="w-6 h-0.5 rounded-full bg-white absolute bottom-8"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── LIGHTBOX (Shared) ─── */}
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
