import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Code,
  Zap,
  Layout,
  LogOut,
  Camera,
  Save,
  Loader,
} from "lucide-react";
import { UserContext } from "../Context/user.context.jsx" // Adjust path if needed
import axios from "../Config/axios.js" // Adjust path if needed

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext); // Get global user state
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Local state for form handling
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    settings: {
      theme: "dracula",
      fontSize: 14,
      aiModel: "gemini-pro",
    },
  });

  // Load user data into form when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        settings: user.settings || {
          theme: "dracula",
          fontSize: 14,
          aiModel: "gemini-pro",
        },
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSettingChange = (key, value) => {
    setFormData({
      ...formData,
      settings: { ...formData.settings, [key]: value },
    });
  };

  const saveChanges = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.put("/users/update", formData);

      // Update global state
      setUser(res.data.user);
      setMessage({ type: "success", text: "Changes saved successfully!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to save changes." });
    } finally {
      setLoading(false);
      // Hide message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const tabs = [
    { id: "profile", label: "Public Profile", icon: <User size={18} /> },
    {
      id: "preferences",
      label: "Editor Preferences",
      icon: <Code size={18} />,
    },
    { id: "ai", label: "AI Configuration", icon: <Zap size={18} /> },
    { id: "security", label: "Account & Security", icon: <Lock size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans p-4 md:p-8 flex justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 mt-16">
        {/* SIDEBAR NAVIGATION */}
        <div className="md:col-span-3 lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-md">
            <img
              src={
                user?.avatar || "https://ui-avatars.com/api/?background=random"
              }
              alt="Avatar"
              className="w-12 h-12 rounded-full border border-gray-700"
            />
            <div className="overflow-hidden">
              <h3 className="font-bold text-white truncate">
                {user?.name || "User"}
              </h3>
              <p className="text-xs text-cyan-400">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                  activeTab === tab.id
                    ? "text-white bg-blue-600/10 border border-blue-600/30"
                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"
                  />
                )}
                <span
                  className={`z-10 ${
                    activeTab === tab.id ? "text-blue-400" : ""
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="z-10">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="md:col-span-9 lg:col-span-9">
          <motion.div
            layout
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Success/Error Message Toast */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute top-4 right-4 px-4 py-2 rounded-lg text-sm font-bold ${
                  message.type === "success"
                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                    : "bg-red-500/20 text-red-400 border border-red-500/50"
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* --- TAB: PUBLIC PROFILE --- */}
                {activeTab === "profile" && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-white">
                        Public Profile
                      </h2>
                      <button
                        onClick={saveChanges}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          <Save size={16} />
                        )}
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">
                          Display Name
                        </label>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          type="text"
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm text-gray-400">Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: EDITOR PREFERENCES --- */}
                {activeTab === "preferences" && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-white">
                        Editor Configuration
                      </h2>
                      <button
                        onClick={saveChanges}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                      >
                        <Save size={16} /> Save Preferences
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-900 rounded-lg text-cyan-400">
                            <Layout size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Theme</h3>
                          </div>
                        </div>
                        <select
                          value={formData.settings.theme}
                          onChange={(e) =>
                            handleSettingChange("theme", e.target.value)
                          }
                          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        >
                          <option value="dracula">Dracula</option>
                          <option value="monokai">Monokai</option>
                          <option value="github-dark">GitHub Dark</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-900 rounded-lg text-cyan-400">
                            <Code size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">
                              Font Size
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-1 border border-gray-700">
                          <button
                            onClick={() =>
                              handleSettingChange(
                                "fontSize",
                                formData.settings.fontSize - 1
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
                          >
                            -
                          </button>
                          <span className="text-sm font-mono w-8 text-center">
                            {formData.settings.fontSize}
                          </span>
                          <button
                            onClick={() =>
                              handleSettingChange(
                                "fontSize",
                                formData.settings.fontSize + 1
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
