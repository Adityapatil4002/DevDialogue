import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Settings,
  Lock,
  Code,
  Zap,
  Github,
  Twitter,
  Layout,
  LogOut,
  Camera,
  Save,
} from "lucide-react";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Mock User Data
  const user = {
    name: "Aditya Patil",
    email: "aditya@devdialogue.com",
    role: "Pro Member",
    avatar:
      "https://ui-avatars.com/api/?name=Aditya+Patil&background=0D8ABC&color=fff&size=128",
    bio: "Full Stack Developer. Building the future of code collaboration.",
    stats: { projects: 12, aiUsage: "84%" },
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
          {/* User Mini Card */}
          <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-md">
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-12 h-12 rounded-full border border-gray-700"
            />
            <div className="overflow-hidden">
              <h3 className="font-bold text-white truncate">{user.name}</h3>
              <p className="text-xs text-cyan-400">{user.role}</p>
            </div>
          </div>

          {/* Navigation Menu */}
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
                {/* Active Indicator Line */}
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

          <div className="border-t border-gray-800 pt-6">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/10 rounded-lg text-sm font-medium transition-colors">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="md:col-span-9 lg:col-span-9">
          <motion.div
            layout
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

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
                      <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20">
                        <Save size={16} /> Save Changes
                      </button>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer">
                        <img
                          src={user.avatar}
                          className="w-24 h-24 rounded-full border-2 border-gray-700 group-hover:border-cyan-500 transition-colors"
                          alt="Profile"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white" size={24} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          Profile Photo
                        </h3>
                        <p className="text-sm text-gray-400">
                          Recommended 400x400px.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">
                          Display Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user.name}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">
                          Username
                        </label>
                        <input
                          type="text"
                          defaultValue="adityapatil6604"
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm text-gray-400">Bio</label>
                        <textarea
                          rows="3"
                          defaultValue={user.bio}
                          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: EDITOR PREFERENCES --- */}
                {activeTab === "preferences" && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-white">
                      Editor Configuration
                    </h2>

                    <div className="space-y-4">
                      {/* Setting Item */}
                      <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-900 rounded-lg text-cyan-400">
                            <Layout size={20} />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Theme</h3>
                            <p className="text-xs text-gray-500">
                              Select your preferred code syntax theme.
                            </p>
                          </div>
                        </div>
                        <select className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none">
                          <option>Dracula</option>
                          <option>Monokai</option>
                          <option>GitHub Dark</option>
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
                            <p className="text-xs text-gray-500">
                              Adjust the size of the code editor text.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-1 border border-gray-700">
                          <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded">
                            -
                          </button>
                          <span className="text-sm font-mono w-8 text-center">
                            14
                          </span>
                          <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded">
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: AI CONFIG --- */}
                {activeTab === "ai" && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-white">
                      AI Assistance
                    </h2>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
                      <Zap className="text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-blue-400">
                          Pro Plan Active
                        </h3>
                        <p className="text-sm text-blue-200/70 mt-1">
                          You have unlimited access to GPT-4 and Claude 3 Opus
                          models.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">
                          Default Model
                        </label>
                        <select className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none">
                          <option>Gemini 1.5 Pro (Recommended)</option>
                          <option>GPT-4 Turbo</option>
                          <option>Llama 3</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: SECURITY --- */}
                {activeTab === "security" && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-white">
                      Security & Account
                    </h2>

                    <div className="space-y-4">
                      <div className="p-4 border border-gray-800 rounded-xl">
                        <label className="text-sm text-gray-400 block mb-2">
                          Email Address
                        </label>
                        <div className="flex gap-4">
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                          />
                          <button className="text-cyan-400 text-sm hover:underline">
                            Change
                          </button>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-800 rounded-xl flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-white">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-xs text-gray-500">
                            Add an extra layer of security to your account.
                          </p>
                        </div>
                        <div className="w-12 h-6 bg-gray-800 rounded-full relative cursor-pointer border border-gray-700">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full transition-all"></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-800">
                      <h3 className="text-red-500 font-bold mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <button className="px-4 py-2 border border-red-500/30 text-red-500 bg-red-500/5 rounded-lg text-sm hover:bg-red-500/10 transition">
                        Delete Account
                      </button>
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
