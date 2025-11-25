import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../Config/axios";
import {
  initializeSocket,
  recieveMessage,
  sendMessage,
  disconnectSocket,
} from "../Config/socket";
import { UserContext } from "../Context/user.context.jsx";
import { getWebContainer } from "../Config/webContainer.js";
import Editor from "@monaco-editor/react";
import StaggeredMenu from "../components/StaggeredMenu";

const getLanguageFromFileName = (fileName) => {
  if (!fileName) return "plaintext";
  const ext = fileName.split(".").pop();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "css":
      return "css";
    case "json":
      return "json";
    case "html":
      return "html";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
};

const Project = () => {
  const { projectId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // UI States
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  // Data States
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat & Code States
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTypingUser, setRemoteTypingUser] = useState("");

  const [fileTree, setFileTree] = useState({});
  const [CurrentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [activeTab, setActiveTab] = useState("browser");

  const messageEndRef = useRef(null);
  const saveTimeout = useRef(null);
  const typingTimeoutRef = useRef(null);

  // --- MENU ---
  const menuItems = [
    { label: "Home", link: "/home" },
    { label: "Profile", link: "/profile" },
    { label: "Settings", link: "/profile" },
    { label: "Dashboard", link: "#" },
  ];

  const socialItems = [
    { label: "GitHub", link: "https://github.com" },
    { label: "Twitter", link: "https://twitter.com" },
    { label: "LinkedIn", link: "https://linkedin.com" },
  ];

  // --- INITIALIZATION ---
  useEffect(() => {
    let isMounted = true;
    let cleanupMessageListener = null;

    const fetchProjectAndData = async () => {
      if (!projectId) {
        setError("No Project ID found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [projectRes, allProjectsRes] = await Promise.all([
          axios.get(`/project/get-project/${projectId}`),
          axios.get("/project/all"),
        ]);

        if (isMounted) {
          setProject(projectRes.data.project);
          setFileTree(projectRes.data.project.fileTree || {});
          setPendingInvites(allProjectsRes.data.invites || []);

          initializeSocket(projectId);

          if (!webContainer) {
            getWebContainer().then((containerInstance) => {
              if (isMounted) {
                setWebContainer(containerInstance);
              }
            });
          }

          const socket = initializeSocket(projectId);

          socket.on("typing", (data) => {
            setRemoteTypingUser(data.email);
          });

          socket.on("stop-typing", () => {
            setRemoteTypingUser("");
          });

          cleanupMessageListener = recieveMessage("project-message", (data) => {
            if (isMounted) {
              setMessages((prev) => {
                if (data.sender?._id === user?._id) {
                  let replaced = false;
                  const updated = prev.map((m) => {
                    if (
                      m.isOptimistic &&
                      m.message === data.message &&
                      !replaced
                    ) {
                      replaced = true;
                      return data;
                    }
                    return m;
                  });
                  if (replaced) return updated;
                  if (!prev.some((m) => m.timestamp === data.timestamp))
                    return [...updated, data];
                  return updated;
                } else {
                  if (!prev.some((m) => m.timestamp === data.timestamp))
                    return [...prev, data];
                }
                return prev;
              });

              if (data.isAi && data.filetree) {
                const newFiles = Object.keys(data.filetree);
                setFileTree((prev) => {
                  const merged = { ...prev, ...data.filetree };
                  saveFileTree(merged);
                  return merged;
                });
                if (newFiles.length > 0) {
                  setCurrentFile(newFiles[0]);
                  setOpenFiles((prev) => {
                    const all = [...prev];
                    newFiles.forEach((f) => !all.includes(f) && all.push(f));
                    return all;
                  });
                }
              }
            }
          });
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load project.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjectAndData();

    return () => {
      isMounted = false;
      if (cleanupMessageListener) cleanupMessageListener();
      disconnectSocket();
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [projectId, user?._id, webContainer]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- TYPING HANDLER ---
  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      const socket = initializeSocket(projectId);
      socket.emit("typing");
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const socket = initializeSocket(projectId);
      socket.emit("stop-typing");
    }, 2000);
  };

  // --- SEARCH & INVITE LOGIC ---
  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;
    try {
      const res = await axios.get(`/project/user-search?email=${searchEmail}`);
      setSearchedUser(res.data.user);
    } catch (err) {
      setSearchedUser(null);
      alert("User not found");
    }
  };

  const handleSendInvite = async () => {
    if (!searchedUser) return;
    try {
      await axios.post("/project/send-invite", {
        projectId,
        email: searchedUser.email,
      });
      alert("Invitation sent!");
      setAddUserModalOpen(false);
      setSearchEmail("");
      setSearchedUser(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send invite");
    }
  };

  const handleInviteResponse = async (inviteProjectId, accept) => {
    try {
      const endpoint = accept
        ? "/project/accept-invite"
        : "/project/reject-invite";
      await axios.put(endpoint, { projectId: inviteProjectId });

      setPendingInvites((prev) =>
        prev.filter((i) => i._id !== inviteProjectId)
      );
      if (accept) window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // --- FILE OPS ---
  const saveFileTree = (fileTreeToSave) => {
    if (!project?._id) return;
    axios
      .put("/project/update-file-tree", {
        projectId: project._id,
        fileTree: fileTreeToSave,
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteFile = (e, fileName) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${fileName}?`)) return;

    const newFileTree = { ...fileTree };
    delete newFileTree[fileName];
    setFileTree(newFileTree);

    if (openFiles.includes(fileName)) {
      setOpenFiles((prev) => prev.filter((f) => f !== fileName));
      if (CurrentFile === fileName) setCurrentFile(null);
    }
    saveFileTree(newFileTree);
  };

  const handleCloseFile = (e, fileToClose) => {
    e.stopPropagation();
    setOpenFiles((prev) => {
      const newOpenFiles = prev.filter((f) => f !== fileToClose);
      if (CurrentFile === fileToClose) {
        if (newOpenFiles.length > 0)
          setCurrentFile(newOpenFiles[newOpenFiles.length - 1]);
        else setCurrentFile(null);
      }
      return newOpenFiles;
    });
  };

  const handleFileContentChange = (newValue) => {
    const newFileTree = {
      ...fileTree,
      [CurrentFile]: {
        ...fileTree[CurrentFile],
        file: { ...fileTree[CurrentFile]?.file, contents: newValue },
      },
    };
    setFileTree(newFileTree);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveFileTree(newFileTree), 1500);
  };

  const send = () => {
    if (!message.trim() || !user?._id || !projectId) return;
    const messageData = {
      projectId,
      message,
      sender: { _id: user._id, email: user.email },
    };
    sendMessage("project-message", messageData);
    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        isOptimistic: true,
        timestamp: new Date().toISOString(),
      },
    ]);
    setMessage("");

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    const socket = initializeSocket(projectId);
    socket.emit("stop-typing");
  };

  // --- RUNNER LOGIC ---
  const handleRunClick = async () => {
    if (!webContainer) return;
    setTerminalOutput("");
    setIsInstalling(true);
    setActiveTab("terminal");
    try {
      await webContainer.mount(fileTree);
      setTerminalOutput((p) => p + "Installing dependencies...\n");
      const installProcess = await webContainer.spawn("npm", ["install"]);
      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            setTerminalOutput((p) => p + chunk);
          },
        })
      );
      if ((await installProcess.exit) !== 0)
        throw new Error("Installation failed");

      setTerminalOutput((p) => p + "\nStarting server...\n");
      setIsInstalling(false);
      if (runProcess) runProcess.kill();

      let tempRunProcess = await webContainer.spawn("npm", ["start"]);
      tempRunProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            setTerminalOutput((p) => p + chunk);
          },
        })
      );
      setRunProcess(tempRunProcess);

      webContainer.on("server-ready", (port, url) => {
        console.log("Server ready at:", url);
        setIframeUrl(url);
        setActiveTab("browser");
      });
    } catch (err) {
      setTerminalOutput((p) => p + `\nError: ${err.message}\n`);
      setIsInstalling(false);
    }
  };

  const handleStopClick = () => {
    if (runProcess) {
      runProcess.kill();
      setRunProcess(null);
      setTerminalOutput((p) => p + "\nProcess stopped by user.\n");
    }
  };

  const AiMessage = ({ raw }) => {
    try {
      const msgObj = JSON.parse(raw);
      return (
        <div className="prose prose-invert prose-sm max-w-none space-y-2">
          <div dangerouslySetInnerHTML={{ __html: msgObj.text || "" }} />
          {msgObj.buildCommand && (
            <div className="p-2 bg-[#0d1117] border border-gray-700 rounded-md text-xs font-mono text-yellow-400">
              <strong>Build:</strong>{" "}
              <span className="text-green-400">
                {msgObj.buildCommand.mainItem}
              </span>{" "}
              {msgObj.buildCommand.commands.join(" ")}
            </div>
          )}
        </div>
      );
    } catch {
      return <p className="text-sm whitespace-pre-wrap">{raw}</p>;
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-[#0d1117] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="h-screen bg-[#0d1117] text-red-500 flex items-center justify-center">
        {error}
      </div>
    );

  return (
    <main className="h-screen w-screen flex bg-[#030712] text-white overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      <style>{`
        .message-box::-webkit-scrollbar { width: 6px; }
        .message-box::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .typing-indicator span { animation: blink 1.4s infinite both; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
      `}</style>

      {/* --- MENU (Hidden when Collaborator Panel is Open) --- */}
      {!isSidePanelOpen && (
        <div className="fixed top-4 left-4 z-50">
          <StaggeredMenu
            items={menuItems}
            socialItems={socialItems}
            menuButtonColor="#9ca3af"
            openMenuButtonColor="#22d3ee"
            accentColor="#22d3ee"
          />
        </div>
      )}

      {/* ---------- LEFT PANEL (CHAT) ---------- */}
      <section className="relative flex flex-col h-full min-w-80 w-full md:w-96 lg:w-[400px] bg-[#0b0f19] border-r border-gray-800 z-10">
        {/* HEADER */}
        <header className="flex justify-between items-center p-4 pl-16 bg-[#0d1117] border-b border-gray-800 shadow-sm h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/home")}
              className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <i className="ri-arrow-left-line text-lg"></i>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-green-500/50 shadow-lg"></div>
              <h1 className="text-lg font-bold truncate bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent max-w-[120px]">
                {project?.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              onClick={() =>
                setIsNotificationPanelOpen(!isNotificationPanelOpen)
              }
              className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white relative"
            >
              <i className="ri-notification-3-line text-xl"></i>
              {pendingInvites.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {/* Collaborators Toggle */}
            <button
              onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
              className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <i className="ri-group-line text-xl"></i>
            </button>
          </div>
        </header>

        {/* CHAT AREA */}
        <div className="conversation-area flex-grow flex flex-col overflow-hidden relative bg-[#0b0f19]">
          <div className="message-box p-4 flex-grow flex flex-col gap-4 overflow-y-auto pb-24">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex w-full animate-fade-in ${
                  msg.sender?._id === user?._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] flex flex-col p-3 rounded-2xl shadow-lg border relative ${
                    msg.sender?._id === user?._id
                      ? "bg-blue-600 border-blue-500 text-white rounded-br-none"
                      : "bg-gray-800 border-gray-700 text-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.sender?._id !== user?._id && !msg.isAi && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-[8px] font-bold">
                        {msg.sender.email?.[0].toUpperCase()}
                      </div>
                      <small className="opacity-70 text-xs font-medium text-gray-300">
                        {msg.sender.email}
                      </small>
                    </div>
                  )}
                  {msg.isAi ? (
                    <div className="flex gap-2">
                      <i className="ri-robot-2-line text-blue-400 text-lg mt-1"></i>
                      <AiMessage raw={msg.message} />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  )}
                  <small className="text-[10px] self-end mt-1 opacity-60">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </div>
            ))}

            {/* Typing Indicator Bubble */}
            {remoteTypingUser && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-[#1f2937] px-3 py-2 rounded-full rounded-bl-none border border-gray-700 flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {remoteTypingUser.split("@")[0]} is typing
                  </span>
                  <div className="typing-indicator flex gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          {/* Input */}
          <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent z-20">
            <div className="flex items-center gap-2 bg-[#161b22] p-2 pr-2 rounded-full border border-gray-700 shadow-xl focus-within:border-blue-500 transition-colors">
              <input
                value={message}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === "Enter" && send()}
                className="flex-grow bg-transparent text-white px-4 py-2 border-none outline-none placeholder-gray-500 text-sm"
                placeholder="Type a message to @ai..."
              />
              <button
                onClick={send}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 disabled:opacity-50"
                disabled={!message.trim()}
              >
                <i className="ri-send-plane-2-fill"></i>
              </button>
            </div>
          </div>
        </div>

        {/* COLLABORATORS SIDE PANEL */}
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-[#0d1117]/95 backdrop-blur-md absolute transition-all duration-300 ease-in-out ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 z-30 border-r border-gray-800`}
        >
          <header className="flex justify-between items-center p-4 border-b border-gray-800 h-16">
            <h2 className="font-bold text-gray-200">Collaborators</h2>
            <button
              onClick={() => setisSidePanelOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </header>
          <div className="p-4 flex-grow overflow-y-auto">
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-500 mb-4"
            >
              <i className="ri-user-add-line"></i> Invite New Member
            </button>
            <div className="flex flex-col gap-2">
              {project?.users?.map((u) => (
                <div
                  key={u._id}
                  className="p-3 flex gap-3 items-center rounded-lg hover:bg-[#1f2937] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold">
                    {u.email[0].toUpperCase()}
                  </div>
                  <h1 className="font-medium text-gray-300 text-sm truncate">
                    {u.email}
                  </h1>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS PANEL */}
        {isNotificationPanelOpen && (
          <div className="absolute top-16 right-0 left-0 bg-[#161b22] border-b border-gray-800 z-40 p-4 animate-fade-in shadow-2xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">
              Pending Invites
            </h3>
            {pendingInvites.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                No pending invites.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex justify-between items-center bg-[#0d1117] p-3 rounded-lg border border-gray-700"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">
                        {invite.name}
                      </p>
                      <p className="text-xs text-gray-500">Project Invite</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInviteResponse(invite._id, true)}
                        className="px-3 py-1 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 text-xs font-bold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleInviteResponse(invite._id, false)}
                        className="px-3 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 text-xs font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setIsNotificationPanelOpen(false)}
              className="w-full mt-4 text-center text-gray-500 hover:text-white text-xs"
            >
              <i className="ri-arrow-up-s-line"></i> Close Notifications
            </button>
          </div>
        )}
      </section>

      {/* ---------- RIGHT PANEL ---------- */}
      <section className="right flex-grow h-full flex bg-[#030712] relative overflow-hidden">
        {/* EXPLORER */}
        <div className="explorer h-full max-w-64 min-w-52 bg-[#0d1117] flex flex-col border-r border-gray-800">
          <div
            onClick={() => setIsExplorerOpen(!isExplorerOpen)}
            className="p-3 border-b border-gray-800 flex items-center justify-between cursor-pointer hover:bg-[#161b22]"
          >
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Explorer
            </span>
            <i
              className={`ri-arrow-down-s-line text-gray-500 transition-transform ${
                isExplorerOpen ? "" : "-rotate-90"
              }`}
            ></i>
          </div>
          <div
            className={`file-tree w-full flex-grow overflow-y-auto pt-2 transition-all duration-300 ${
              isExplorerOpen ? "opacity-100" : "opacity-0 max-h-0"
            }`}
          >
            {Object.keys(fileTree).map((file) => (
              <div
                key={file}
                className={`group w-full text-left px-4 py-1.5 flex items-center gap-2 transition-colors border-l-2 cursor-pointer ${
                  CurrentFile === file
                    ? "bg-[#1f2937] border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <div
                  className="flex items-center gap-2 flex-grow overflow-hidden"
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles((p) => (p.includes(file) ? p : [...p, file]));
                  }}
                >
                  <i className="ri-file-code-line text-lg"></i>
                  <span className="text-sm font-medium truncate">{file}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteFile(e, file)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* EDITOR */}
        <div className="code-editor flex flex-col flex-grow h-full w-1/2 bg-[#0d1117]">
          <div className="top-bar flex justify-between items-center bg-[#010409] border-b border-gray-800 h-12">
            <div className="files flex overflow-x-auto no-scrollbar">
              {openFiles.map((file) => (
                <div
                  key={file}
                  onClick={() => setCurrentFile(file)}
                  className={`group relative flex items-center min-w-fit px-4 h-12 text-sm border-r border-gray-800 cursor-pointer ${
                    CurrentFile === file
                      ? "bg-[#0d1117] text-white border-t-2 border-t-blue-500"
                      : "bg-[#010409] text-gray-500 hover:bg-[#0d1117]"
                  }`}
                >
                  <span className="mr-2">{file}</span>
                  <button
                    onClick={(e) => handleCloseFile(e, file)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="actions px-3">
              {!runProcess ? (
                <button
                  onClick={handleRunClick}
                  disabled={isInstalling}
                  className="flex items-center gap-2 py-1.5 px-4 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-500"
                >
                  {isInstalling ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className="ri-play-fill"></i>
                  )}{" "}
                  Run
                </button>
              ) : (
                <button
                  onClick={handleStopClick}
                  className="flex items-center gap-2 py-1.5 px-4 text-xs font-bold rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                  <i className="ri-stop-fill"></i> Stop
                </button>
              )}
            </div>
          </div>
          <div className="bottom flex flex-grow overflow-hidden relative">
            {CurrentFile && fileTree[CurrentFile]?.file ? (
              <Editor
                height="100%"
                width="100%"
                path={CurrentFile}
                language={getLanguageFromFileName(CurrentFile)}
                theme="vs-dark"
                value={fileTree[CurrentFile].file.contents}
                onChange={handleFileContentChange}
                options={{ fontSize: 14, minimap: { enabled: false } }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                Select a file
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW */}
        <div className="flex-grow min-w-[400px] flex flex-col h-full border-l border-gray-800 bg-[#0d1117]">
          {/* Tabs */}
          <div className="tabs flex items-center bg-[#010409] border-b border-gray-800 p-2 gap-2">
            <button
              onClick={() => setActiveTab("browser")}
              className={`px-4 py-1.5 text-xs font-medium rounded ${
                activeTab === "browser"
                  ? "bg-[#1f2937] text-blue-400"
                  : "text-gray-500"
              }`}
            >
              Browser
            </button>
            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-4 py-1.5 text-xs font-medium rounded ${
                activeTab === "terminal"
                  ? "bg-[#1f2937] text-green-400"
                  : "text-gray-500"
              }`}
            >
              Terminal
            </button>
          </div>

          {/* BROWSER CONTENT (Modified Theme & Animation) */}
          {activeTab === "browser" && (
            <div className="flex-grow bg-[#1f2937] relative flex items-center justify-center">
              {iframeUrl ? (
                <iframe
                  src={iframeUrl}
                  className="w-full h-full border-none"
                ></iframe>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center animate-pulse">
                    <i className="ri-rocket-2-fill text-3xl text-blue-500"></i>
                  </div>
                  <div className="text-gray-400 text-sm font-medium animate-fade-in">
                    Ready to Launch
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TERMINAL CONTENT */}
          {activeTab === "terminal" && (
            <div className="flex-grow bg-[#0d1117] p-4 font-mono text-sm text-green-500 overflow-y-auto whitespace-pre-wrap">
              {terminalOutput || "Waiting for output..."}
            </div>
          )}
        </div>
      </section>

      {/* ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-[#161b22] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-white font-bold">Invite Member</h2>
              <button
                onClick={() => {
                  setAddUserModalOpen(false);
                  setSearchedUser(null);
                  setSearchEmail("");
                }}
                className="text-gray-400"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-bold uppercase">
                  Email Address
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="flex-grow bg-[#0d1117] border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                    placeholder="user@example.com"
                  />
                  <button
                    onClick={handleSearchUser}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 rounded"
                  >
                    <i className="ri-search-line"></i>
                  </button>
                </div>
              </div>
              {searchedUser && (
                <div className="bg-[#0d1117] p-3 rounded border border-gray-700 flex justify-between items-center animate-fade-in">
                  <span className="text-sm text-gray-200">
                    {searchedUser.email}
                  </span>
                  <button
                    onClick={handleSendInvite}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded font-bold"
                  >
                    Send Invite
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
