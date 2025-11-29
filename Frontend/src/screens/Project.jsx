import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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
import { MoreVertical, Trash2, Reply } from "lucide-react";
import Loader from "../components/Loader";

// --- UTILITY FUNCTIONS & CONSTANTS ---

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

const cleanTerminalOutput = (text) => {
  if (!text) return "";
  return text.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
};

const menuItems = [
  { label: "Home", link: "/home" },
  { label: "Profile", link: "/profile" },
  { label: "Settings", link: "/profile" },
  { label: "Dashboard", link: "/dashboard" },
];

const socialItems = [
  { label: "GitHub", link: "https://github.com" },
  { label: "Twitter", link: "https://twitter.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

// --- COMPONENTS ---

// Modified to accept newFilePaths for highlighting
const FileTreeNode = ({
  fileName,
  nodes,
  onSelect,
  onDelete,
  path,
  newFilePaths,
}) => {
  const isDir = !!nodes;
  const [isOpen, setIsOpen] = useState(false);
  const isNew = newFilePaths?.has(path); // Check if file is new

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isDir) setIsOpen(!isOpen);
    else onSelect(path);
  };

  return (
    <div className="ml-4 select-none">
      <div
        onClick={handleToggle}
        className={`group flex items-center justify-between cursor-pointer py-1 px-2 rounded-md transition-colors text-sm ${
          !isDir
            ? "hover:bg-gray-800"
            : "hover:text-white text-gray-400 font-semibold"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <i
            className={
              isDir
                ? isOpen
                  ? "ri-folder-open-fill text-yellow-500"
                  : "ri-folder-fill text-yellow-500"
                : "ri-file-code-line text-blue-400"
            }
          ></i>
          <span
            className={`truncate ${
              !isDir
                ? isNew
                  ? "text-green-400 font-medium"
                  : "text-gray-300"
                : "text-gray-200"
            }`}
          >
            {fileName}
            {/* Visual Indicator for New Files */}
            {!isDir && isNew && (
              <span className="text-[9px] ml-2 bg-green-500/20 text-green-400 px-1 rounded">
                NEW
              </span>
            )}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(path);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-opacity p-1"
          title="Delete"
        >
          <i className="ri-delete-bin-line"></i>
        </button>
      </div>
      {isDir && isOpen && (
        <div className="border-l border-gray-700 ml-2">
          {Object.keys(nodes).map((child) => (
            <FileTreeNode
              key={child}
              fileName={child}
              nodes={nodes[child]}
              onSelect={onSelect}
              onDelete={onDelete}
              path={`${path}/${child}`}
              newFilePaths={newFilePaths} // Pass down prop
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTreeSkeleton = () => (
  <div className="p-4 space-y-3 opacity-60">
    <div className="flex items-center gap-2 animate-pulse">
      <div className="w-4 h-4 bg-gray-600 rounded"></div>
      <div className="h-4 bg-gray-600 rounded w-24"></div>
    </div>
    <div className="ml-4 space-y-2">
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-4 h-4 bg-gray-600 rounded"></div>
        <div className="h-4 bg-gray-600 rounded w-16"></div>
      </div>
    </div>
    <div className="text-xs text-blue-400 mt-2 animate-pulse flex items-center gap-2">
      <i className="ri-loader-4-line animate-spin"></i> Generating structure...
    </div>
  </div>
);

const Project = () => {
  const { projectId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // --- STATE DECLARATIONS ---
  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const [activeTab, setActiveTab] = useState("terminal");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);

  // New State for "New Files" tracking
  const [newFilePaths, setNewFilePaths] = useState(new Set());

  // UI States
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Data States
  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [project, setProject] = useState(null);

  const [isBooting, setIsBooting] = useState(true);
  const [error, setError] = useState(null);

  // Chat & Code States
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTypingUser, setRemoteTypingUser] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Menu State
  const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);

  const messageEndRef = useRef(null);
  const terminalEndRef = useRef(null);
  const saveTimeout = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Click outside listener for menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenuMsgId && !event.target.closest(".message-menu-container")) {
        setActiveMenuMsgId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuMsgId]);

  const buildStructure = (files) => {
    if (!files || Object.keys(files).length === 0) return {};
    const root = {};
    Object.keys(files).forEach((filePath) => {
      const parts = filePath.split("/");
      let current = root;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = null;
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      });
    });
    return root;
  };

  const folderStructure = buildStructure(fileTree);

  useEffect(() => {
    let isMounted = true;
    let cleanupMessageListener = null;

    const fetchProjectAndData = async () => {
      if (!projectId) {
        setError("No Project ID found.");
        setIsBooting(false);
        return;
      }
      setIsBooting(true);
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
          setMessages(projectRes.data.project.messages || []);

          if (!webContainer) {
            getWebContainer().then((containerInstance) => {
              if (isMounted) setWebContainer(containerInstance);
            });
          }

          const socket = initializeSocket(projectId);
          socket.on("typing", (data) => setRemoteTypingUser(data.email));
          socket.on("stop-typing", () => setRemoteTypingUser(""));

          socket.on("message-deleted", ({ messageId }) => {
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
          });

          cleanupMessageListener = recieveMessage("project-message", (data) => {
            if (isMounted) {
              if (data.isAi) setIsAiThinking(false);

              setMessages((prev) => {
                const incomingSenderId = data.sender?._id || data.senderId;
                const isMyMessage = incomingSenderId === user?._id;

                if (isMyMessage) {
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

              // --- HANDLE AI GENERATED FILES (ADD TO NEW FILES SET) ---
              if (
                data.isAi &&
                data.filetree &&
                typeof data.filetree === "object"
              ) {
                setFileTree((prev) => {
                  const merged = { ...prev, ...data.filetree };
                  saveFileTree(merged);
                  return merged;
                });
                // Track these files as new
                setNewFilePaths((prev) => {
                  const newSet = new Set(prev);
                  Object.keys(data.filetree).forEach((key) => newSet.add(key));
                  return newSet;
                });
              }
            }
          });
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load project.");
      } finally {
        if (isMounted) {
          setTimeout(() => {
            setIsBooting(false);
          }, 800);
        }
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
  }, [messages, isAiThinking]);

  useEffect(() => {
    if (activeTab === "terminal") {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalOutput, activeTab]);

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

  const handleDeleteMessage = (msgId) => {
    sendMessage("delete-message", { messageId: msgId });
  };

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

  const saveFileTree = (fileTreeToSave) => {
    if (!project?._id) return;
    axios
      .put("/project/update-file-tree", {
        projectId: project._id,
        fileTree: fileTreeToSave,
      })
      .catch((err) => console.error(err));
  };

  const handleCloseFile = (e, fileToClose) => {
    e.stopPropagation();
    setOpenFiles((prev) => {
      const newOpenFiles = prev.filter((f) => f !== fileToClose);
      if (currentFile === fileToClose) {
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
      [currentFile]: {
        ...fileTree[currentFile],
        file: { ...fileTree[currentFile]?.file, contents: newValue },
      },
    };
    setFileTree(newFileTree);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveFileTree(newFileTree), 1500);
  };

  const handleFileSelect = (filePath) => {
    setCurrentFile(filePath);
    if (!openFiles.includes(filePath)) {
      setOpenFiles((prev) => [...prev, filePath]);
    }
  };

  const onRequestDelete = (path) => {
    setFileToDelete(path);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFile = () => {
    if (!fileToDelete) return;
    const newFileTree = { ...fileTree };
    const pathsToDelete = [];
    Object.keys(newFileTree).forEach((key) => {
      if (key === fileToDelete || key.startsWith(fileToDelete + "/")) {
        pathsToDelete.push(key);
      }
    });
    pathsToDelete.forEach((key) => delete newFileTree[key]);
    setFileTree(newFileTree);
    saveFileTree(newFileTree);
    setOpenFiles((prev) => prev.filter((f) => !pathsToDelete.includes(f)));
    if (pathsToDelete.includes(currentFile)) setCurrentFile(null);
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };

  const send = () => {
    if (!message.trim() || !user?._id || !projectId) return;

    let messageToSend = message;
    if (message.trim().toLowerCase().includes("@ai")) {
      setIsAiThinking(true);
      if (currentFile && fileTree[currentFile]?.file) {
        const fileContent = fileTree[currentFile].file.contents;
        messageToSend += `\n\n***\nCONTEXT FOR AI (Current Open File: ${currentFile}):\n\`\`\`javascript\n${fileContent}\n\`\`\`\n***`;
      }
    }

    const messageData = {
      projectId,
      message: messageToSend,
      sender: { _id: user._id, email: user.email },
      replyTo: replyingTo,
    };

    sendMessage("project-message", messageData);
    setMessage("");
    setReplyingTo(null);
    setIsTyping(false);
    const socket = initializeSocket(projectId);
    socket.emit("stop-typing");
  };

  const handleRunClick = async () => {
    if (!webContainer) return;
    setTerminalOutput("");
    setActiveTab("terminal");

    // --- EXPLICIT INSTALLATION OUTPUT ---
    setTerminalOutput(
      "[System] Starting process...\n[System] Installing dependencies (this may take a moment)...\n"
    );

    try {
      const mountStructure = JSON.parse(JSON.stringify(fileTree));
      const hasPackageJson = !!mountStructure["package.json"];

      if (hasPackageJson) {
        setIsInstalling(true);
        try {
          const pkgJson = JSON.parse(
            mountStructure["package.json"].file.contents
          );
          if (!pkgJson.scripts || !pkgJson.scripts.start) {
            const entryFile = Object.keys(mountStructure).find((filename) =>
              ["server.js", "app.js", "index.js", "main.js"].includes(filename)
            );
            if (entryFile) {
              pkgJson.scripts = {
                ...(pkgJson.scripts || {}),
                start: `node ${entryFile}`,
              };
              mountStructure["package.json"].file.contents = JSON.stringify(
                pkgJson,
                null,
                2
              );
              setTerminalOutput(
                (p) =>
                  p +
                  `[System] Auto-fixed missing "start" script pointing to ${entryFile}...\n`
              );
            }
          }
        } catch (e) {
          /* ignore */
        }

        await webContainer.mount(mountStructure);

        // Use Spawn for install
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

        setIsInstalling(false);
        setTerminalOutput(
          (p) => p + "\n[System] Installation Complete. Starting server...\n"
        );
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
          setIframeUrl(url);
          setActiveTab("browser");
        });
      } else {
        setIsInstalling(false);
        await webContainer.mount(mountStructure);
        const jsFile = Object.keys(mountStructure).find((filename) =>
          filename.endsWith(".js")
        );
        if (!jsFile)
          throw new Error(
            "No JavaScript file found to run. Please create a .js file or a package.json."
          );
        setTerminalOutput(
          `[System] No package.json found. Running "${jsFile}" directly...\n`
        );
        if (runProcess) runProcess.kill();
        let tempRunProcess = await webContainer.spawn("node", [jsFile]);
        tempRunProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              setTerminalOutput((p) => p + chunk);
            },
          })
        );
        setRunProcess(tempRunProcess);
      }
    } catch (err) {
      setTerminalOutput((p) => p + `\nError: ${err.message}\n`);
      setIsInstalling(false);
    }
  };

  const downloadProject = async () => {
    const zip = new JSZip();
    Object.keys(fileTree).forEach((path) => {
      const fileContent = fileTree[path].file?.contents;
      if (fileContent) {
        zip.file(path, fileContent);
      }
    });
    try {
      const content = await zip.generateAsync({ type: "blob" });
      const safeName =
        project?.name?.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "project";
      saveAs(content, `${safeName}.zip`);
    } catch (error) {
      console.error("Failed to zip project:", error);
      alert("Failed to download project.");
    }
  };

  const handleStopClick = () => {
    if (runProcess) {
      runProcess.kill();
      setRunProcess(null);
      setTerminalOutput((p) => p + "\nProcess stopped by user.\n");
    }
  };
  const handleClear = () => {
    if (activeTab === "browser") setIframeUrl(null);
    else setTerminalOutput("");
  };

  const AiMessage = ({ raw }) => {
    try {
      const msgObj = typeof raw === "string" ? JSON.parse(raw) : raw;
      return (
        <div className="prose prose-invert prose-sm max-w-none space-y-2 break-words">
          <div dangerouslySetInnerHTML={{ __html: msgObj.text || "" }} />
          {msgObj.buildCommand && (
            <div className="p-2 bg-[#0d1117] border border-gray-700 rounded-md text-xs font-mono text-yellow-400 overflow-x-auto">
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
      return <p className="text-sm whitespace-pre-wrap break-words">{raw}</p>;
    }
  };

  if (isBooting) {
    return <Loader />;
  }

  if (error)
    return (
      <div className="h-screen bg-[#0d1117] text-red-500 flex items-center justify-center">
        {error}
      </div>
    );

  const ResizeHandle = ({ className = "" }) => (
    <PanelResizeHandle
      className={`w-[2px] bg-gray-800 hover:bg-blue-500 transition-colors cursor-col-resize z-50 ${className}`}
    />
  );

  return (
    <main className="h-screen w-screen flex flex-col bg-[#030712] text-white overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      <style>{` .message-box::-webkit-scrollbar { width: 6px; } .message-box::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; } .no-scrollbar::-webkit-scrollbar { display: none; } .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; } .animate-fade-in-up { animation: fadeInUp 0.2s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } `}</style>

      <PanelGroup direction="horizontal">
        {/* LEFT PANEL */}
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <section className="relative flex flex-col h-full w-full bg-[#0b0f19] border-r border-gray-800 z-10">
            {/* Header: Kept pl-16 to allow space for the left-aligned menu */}
            <header className="flex justify-between items-center p-4 pl-16 bg-[#0d1117] border-b border-gray-800 shadow-sm h-14 min-h-[3.5rem] flex-shrink-0">
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
                {messages.map((msg, i) => {
                  const getSenderId = (m) => {
                    if (m.sender && typeof m.sender === "object")
                      return m.sender._id;
                    if (m.senderId) return m.senderId;
                    return m.sender;
                  };

                  const currentSenderId = getSenderId(msg);
                  const isOwnMessage =
                    currentSenderId?.toString() === user?._id?.toString();

                  const senderEmail =
                    typeof msg.sender === "object" ? msg.sender.email : "User";
                  const isMenuOpen = activeMenuMsgId === (msg._id || i);

                  const previousMsg = messages[i - 1];
                  const prevSenderId = previousMsg
                    ? getSenderId(previousMsg)
                    : null;
                  const isSameSender =
                    previousMsg &&
                    currentSenderId === prevSenderId &&
                    previousMsg.isAi === msg.isAi;

                  return (
                    <div
                      key={msg._id || i}
                      className={`flex w-full animate-fade-in group relative ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      } ${isSameSender ? "mt-1" : "mt-4"}`}
                    >
                      <div
                        className={`max-w-[85%] flex flex-col relative ${
                          isOwnMessage ? "items-end" : "items-start"
                        }`}
                      >
                        {!isSameSender && !isOwnMessage && !msg.isAi && (
                          <div className="flex items-center gap-2 mb-1 ml-1">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-[8px] font-bold text-white">
                              {typeof senderEmail === "string"
                                ? senderEmail[0]?.toUpperCase()
                                : "?"}
                            </div>
                            <span className="text-[10px] text-gray-400 opacity-80">
                              {typeof senderEmail === "string"
                                ? senderEmail
                                : "User"}
                            </span>
                          </div>
                        )}

                        {msg.replyTo && (
                          <div
                            className={`text-xs mb-1 px-3 py-2 rounded-lg opacity-70 border-l-2 ${
                              isOwnMessage
                                ? "bg-blue-900/30 border-blue-400 text-blue-100"
                                : "bg-gray-800 border-gray-500 text-gray-400"
                            }`}
                          >
                            <span className="font-bold block mb-0.5 text-[10px]">
                              {msg.replyTo.originalSender}
                            </span>
                            <span className="line-clamp-1">
                              {msg.replyTo.originalMessage}
                            </span>
                          </div>
                        )}

                        <div
                          className={`relative px-4 py-2 shadow-md text-sm break-words overflow-hidden 
                            ${
                              isOwnMessage
                                ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                                : "bg-gray-800 text-gray-200 rounded-2xl rounded-tl-none border border-gray-700"
                            }
                            ${
                              isSameSender
                                ? isOwnMessage
                                  ? "rounded-tr-2xl"
                                  : "rounded-tl-2xl"
                                : ""
                            } 
                        `}
                        >
                          {msg.isAi ? (
                            <div className="flex gap-2">
                              <i className="ri-robot-2-line text-blue-400 text-lg mt-1 flex-shrink-0"></i>
                              <div className="overflow-hidden w-full">
                                <AiMessage raw={msg.message} />
                              </div>
                            </div>
                          ) : (
                            <p>{msg.message}</p>
                          )}
                          <div
                            className={`text-[10px] mt-1 text-right ${
                              isOwnMessage ? "text-blue-200" : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        <div
                          className={`absolute top-2 ${
                            isOwnMessage ? "-left-8" : "-right-8"
                          } z-50 message-menu-container`}
                        >
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuMsgId(
                                  isMenuOpen ? null : msg._id || i
                                );
                              }}
                              className={`p-1.5 rounded-full transition-all duration-200 ${
                                isMenuOpen
                                  ? "bg-gray-800 text-white opacity-100"
                                  : "text-gray-500 hover:text-white hover:bg-gray-800 opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <MoreVertical size={16} />
                            </button>
                            {isMenuOpen && (
                              <div
                                className={`absolute bottom-full mb-2 ${
                                  isOwnMessage
                                    ? "left-0 origin-bottom-left"
                                    : "right-0 origin-bottom-right"
                                } w-28 bg-[#030712] border border-gray-700 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-fade-in-up z-[9999]`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReplyingTo({
                                      originalMessage: msg.message,
                                      originalSender: senderEmail,
                                    });
                                    setActiveMenuMsgId(null);
                                  }}
                                  className="w-full text-left px-3 py-2.5 text-xs text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
                                >
                                  <Reply size={13} /> Reply
                                </button>
                                {isOwnMessage && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMessage(msg._id);
                                      setActiveMenuMsgId(null);
                                    }}
                                    className="w-full text-left px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-gray-700 transition-colors"
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isAiThinking && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-3 shadow-lg">
                      <i className="ri-robot-2-line text-blue-400 animate-spin-slow"></i>
                      <span className="text-xs font-medium text-gray-300">
                        Processing...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>

              <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent z-20">
                {replyingTo && (
                  <div className="bg-[#161b22] border border-gray-700 rounded-t-xl p-3 flex justify-between items-center mb-[-1px] mx-2 animate-fade-in">
                    <div className="text-xs text-gray-300 border-l-2 border-blue-500 pl-2">
                      <span className="font-bold text-blue-400 block mb-0.5">
                        Replying to {replyingTo.originalSender}
                      </span>
                      <div className="truncate max-w-[200px] opacity-70">
                        {replyingTo.originalMessage}
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-gray-500 hover:text-white"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                )}
                <div
                  className={`flex items-center gap-2 bg-[#161b22] p-2 pr-2 border border-gray-700 shadow-xl focus-within:border-blue-500 transition-colors ${
                    replyingTo
                      ? "rounded-b-xl rounded-t-none border-t-0 mx-2"
                      : "rounded-full"
                  }`}
                >
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

            {/* COLLABORATORS & NOTIFICATIONS */}
            <div
              className={`sidePanel w-full h-full flex flex-col gap-2 bg-[#0d1117]/95 backdrop-blur-md absolute transition-all duration-300 ease-in-out ${
                isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
              } top-0 z-30 border-r border-gray-800`}
            >
              {/* Header: Standardized h-14 */}
              <header className="flex justify-between items-center p-4 border-b border-gray-800 h-14 min-h-[3.5rem]">
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
            {isNotificationPanelOpen && (
              <div className="absolute top-16 right-0 left-0 bg-[#161b22] border-b border-gray-800 z-40 p-4 animate-fade-in shadow-2xl">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex justify-between items-center bg-[#0d1117] p-3 mb-2 rounded-lg border border-gray-700"
                  >
                    <p className="text-sm font-bold text-white">
                      {invite.name}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInviteResponse(invite._id, true)}
                        className="px-2 text-green-400"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleInviteResponse(invite._id, false)}
                        className="px-2 text-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingInvites.length === 0 && (
                  <p className="text-gray-500 text-sm">No notifications</p>
                )}
              </div>
            )}
          </section>
        </Panel>

        <ResizeHandle />

        <Panel>
          <PanelGroup direction="horizontal">
            {isExplorerOpen && (
              <>
                <Panel defaultSize={18} minSize={10} maxSize={25}>
                  <div className="h-full w-full bg-[#0d1117] flex flex-col border-r border-gray-800">
                    {/* Header: Standardized h-14 */}
                    <div
                      onClick={() => setIsExplorerOpen(!isExplorerOpen)}
                      className="flex items-center justify-between border-b border-gray-800 bg-[#0d1117] px-4 cursor-pointer hover:bg-[#161b22] h-14 min-h-[3.5rem]"
                    >
                      <div className="flex flex-grow items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          Explorer
                        </span>
                        <i
                          className={`ri-arrow-down-s-line text-gray-500 transition-transform ${
                            isExplorerOpen ? "" : "-rotate-90"
                          }`}
                        ></i>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadProject();
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Download Project as ZIP"
                      >
                        <i className="ri-download-cloud-2-line text-lg"></i>
                      </button>
                    </div>
                    <div className="file-tree w-full flex-grow overflow-y-auto pt-2 transition-all duration-300 scrollbar-thin scrollbar-thumb-gray-700">
                      {isAiThinking ? (
                        <FileTreeSkeleton />
                      ) : (
                        <div className="-ml-2">
                          {Object.keys(folderStructure).map((key) => (
                            <FileTreeNode
                              key={key}
                              fileName={key}
                              nodes={folderStructure[key]}
                              onSelect={handleFileSelect}
                              onDelete={onRequestDelete}
                              path={key}
                              newFilePaths={newFilePaths}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>
                <ResizeHandle />
              </>
            )}

            <Panel defaultSize={isExplorerOpen ? 42 : 50} minSize={20}>
              <div className="flex flex-col h-full w-full bg-[#0d1117]">
                {/* Header: Standardized h-14 */}
                <div className="top-bar flex justify-between items-center bg-[#010409] border-b border-gray-800 h-14 min-h-[3.5rem] flex-shrink-0">
                  <div className="files flex overflow-x-auto no-scrollbar h-full items-end">
                    {openFiles.map((file) => (
                      <div
                        key={file}
                        onClick={() => setCurrentFile(file)}
                        className={`group relative flex items-center min-w-fit px-4 h-full text-sm border-r border-gray-800 cursor-pointer ${
                          currentFile === file
                            ? "bg-[#0d1117] text-white border-t-2 border-t-blue-500"
                            : "bg-[#010409] text-gray-500 hover:bg-[#0d1117]"
                        }`}
                      >
                        <span className="mr-2">{file.split("/").pop()}</span>
                        <button
                          onClick={(e) => handleCloseFile(e, file)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="actions px-3 flex-shrink-0">
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
                <div className="bottom flex-grow overflow-hidden relative h-full w-full">
                  {currentFile && fileTree[currentFile]?.file ? (
                    <div
                      key={currentFile}
                      className="h-full w-full animate-fade-in"
                    >
                      <Editor
                        height="100%"
                        width="100%"
                        path={currentFile}
                        language={getLanguageFromFileName(currentFile)}
                        theme="vs-dark"
                        value={fileTree[currentFile].file.contents}
                        onChange={handleFileContentChange}
                        options={{ fontSize: 14, minimap: { enabled: false } }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 bg-[#0d1117]">
                      <div className="text-center">
                        <i className="ri-code-s-slash-line text-4xl mb-2 opacity-50"></i>
                        <p>Select a file to edit</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <ResizeHandle />

            <Panel defaultSize={40} minSize={20}>
              <div className="flex flex-col h-full w-full border-l border-gray-800 bg-[#0d1117]">
                {/* Header: Standardized h-14 */}
                <div className="tabs flex items-center justify-between bg-[#010409] border-b border-gray-800 px-4 h-14 min-h-[3.5rem]">
                  <div className="flex gap-2">
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
                  <button
                    onClick={handleClear}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Clear"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
                {activeTab === "browser" && (
                  <div className="flex-grow bg-[#1f2937] relative flex items-center justify-center overflow-hidden">
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
                {activeTab === "terminal" && (
                  <div className="flex-grow bg-[#0d1117] p-4 font-mono text-sm text-green-500 overflow-y-auto whitespace-pre-wrap break-words w-full max-w-full">
                    {cleanTerminalOutput(terminalOutput) ||
                      "Waiting for output..."}
                    <div ref={terminalEndRef} />
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {!isSidePanelOpen && (
        // MODIFICATION: Kept on Left, but changed top-4 to top-2 for perfect centering
        <div className="fixed top-2 left-4 z-50">
          <StaggeredMenu
            items={menuItems}
            socialItems={socialItems}
            menuButtonColor="#9ca3af"
            openMenuButtonColor="#22d3ee"
            accentColor="#22d3ee"
          />
        </div>
      )}
      {/* ... Modals kept as is ... */}
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
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-[#161b22] border border-red-900/50 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center">
                <i className="ri-alarm-warning-line text-red-500 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Delete Item?
                </h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-mono bg-gray-800 px-1 rounded">
                    {fileToDelete}
                  </span>
                  ?<br />
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex border-t border-gray-800">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors border-r border-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                className="flex-1 py-3 text-sm font-bold text-red-500 hover:bg-red-900/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
