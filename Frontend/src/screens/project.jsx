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
import {
  MoreVertical,
  Trash2,
  Reply,
  Play,
  Square,
  Download,
  Globe,
  Terminal,
  Users,
  Bell,
  X,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  File,
  Send,
  Bot,
  ArrowLeft,
  Plus,
  Check,
  AlertTriangle,
  Code2,
} from "lucide-react";
import Loader from "../components/Loader";

// --- UTILITY ---
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

const getFileIcon = (fileName) => {
  if (!fileName) return <File size={11} className="text-neutral-600" />;
  return <File size={11} className="text-neutral-500" />;
};

const cleanTerminalOutput = (text) => {
  if (!text) return "";
  return text.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    "",
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

// --- FILE TREE NODE ---
const FileTreeNode = ({
  fileName,
  nodes,
  onSelect,
  onDelete,
  path,
  newFilePaths,
  selectedFile,
}) => {
  const isDir = !!nodes;
  const [isOpen, setIsOpen] = useState(false);
  const isNew = newFilePaths?.has(path);
  const isSelected = selectedFile === path;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isDir) setIsOpen(!isOpen);
    else onSelect(path);
  };

  return (
    <div className="select-none">
      <div
        onClick={handleToggle}
        className={`group flex items-center justify-between cursor-pointer py-[4px] px-2 mx-1 transition-all duration-150 text-[11px] font-mono ${
          !isDir && isSelected
            ? "bg-white/10 text-white border-l-2 border-white/60"
            : !isDir
              ? "hover:bg-white/5 text-neutral-500 hover:text-neutral-200 border-l-2 border-transparent"
              : "text-neutral-600 hover:text-neutral-300 hover:bg-white/3 border-l-2 border-transparent"
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
          {isDir ? (
            <>
              <span className="text-neutral-700 flex-shrink-0">
                {isOpen ? (
                  <ChevronDown size={11} />
                ) : (
                  <ChevronRight size={11} />
                )}
              </span>
              <span className="flex-shrink-0 text-neutral-600">
                {isOpen ? <FolderOpen size={11} /> : <Folder size={11} />}
              </span>
            </>
          ) : (
            <>
              <span className="w-3 flex-shrink-0" />
              <span className="flex-shrink-0">{getFileIcon(fileName)}</span>
            </>
          )}
          <span
            className={`truncate text-[11px] ${
              isDir
                ? "font-medium text-neutral-500"
                : isSelected
                  ? "text-white"
                  : ""
            }`}
          >
            {fileName}
          </span>
          {!isDir && isNew && (
            <span className="flex-shrink-0 text-[8px] bg-white/8 text-white/60 border border-white/15 px-1 py-0.5 font-mono tracking-wider">
              NEW
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(path);
          }}
          className="opacity-0 group-hover:opacity-100 text-neutral-700 hover:text-white transition-all duration-150 p-0.5 flex-shrink-0"
        >
          <Trash2 size={10} />
        </button>
      </div>

      {isDir && isOpen && (
        <div
          className="ml-3 border-l border-white/5 pl-1"
          style={{ animation: "expandDown 0.15s ease-out forwards" }}
        >
          {Object.keys(nodes).map((child) => (
            <FileTreeNode
              key={child}
              fileName={child}
              nodes={nodes[child]}
              onSelect={onSelect}
              onDelete={onDelete}
              path={`${path}/${child}`}
              newFilePaths={newFilePaths}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- FILE TREE SKELETON ---
const FileTreeSkeleton = () => (
  <div className="p-3 space-y-1.5">
    {[
      { w: 56, indent: 0 },
      { w: 44, indent: 1 },
      { w: 72, indent: 1 },
      { w: 36, indent: 2 },
      { w: 60, indent: 2 },
      { w: 48, indent: 0 },
    ].map((item, i) => (
      <div
        key={i}
        className="flex items-center gap-2 animate-pulse"
        style={{ marginLeft: `${item.indent * 12}px` }}
      >
        <div className="w-2.5 h-2.5 bg-neutral-800 rounded-sm flex-shrink-0" />
        <div
          className="h-2 bg-neutral-800/80 rounded-sm"
          style={{ width: `${item.w}px` }}
        />
      </div>
    ))}
    <div className="flex items-center gap-2 mt-4 ml-1">
      <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" />
      <div className="text-[9px] font-mono text-neutral-700 tracking-widest animate-pulse">
        generating files...
      </div>
    </div>
  </div>
);

// --- RESIZE HANDLE ---
const ResizeHandle = () => (
  <PanelResizeHandle className="group w-[3px] bg-transparent hover:bg-white/8 transition-all duration-200 cursor-col-resize z-50 flex items-center justify-center">
    <div className="w-px h-6 bg-neutral-800 group-hover:bg-neutral-600 group-hover:h-10 transition-all duration-200" />
  </PanelResizeHandle>
);

// --- STATUS DOT ---
const StatusDot = ({ active = false, pulse = false }) => (
  <span className="relative flex h-1.5 w-1.5">
    {pulse && active && (
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-50" />
    )}
    <span
      className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
        active ? "bg-white/70" : "bg-neutral-700"
      }`}
    />
  </span>
);

const Project = () => {
  const { projectId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [fileTree, setFileTree] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const [activeTab, setActiveTab] = useState("terminal");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);
  const [newFilePaths, setNewFilePaths] = useState(new Set());

  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [project, setProject] = useState(null);

  const [isBooting, setIsBooting] = useState(true);
  const [error, setError] = useState(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTypingUser, setRemoteTypingUser] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);

  const messageEndRef = useRef(null);
  const terminalEndRef = useRef(null);
  const saveTimeout = useRef(null);
  const typingTimeoutRef = useRef(null);

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
        if (index === parts.length - 1) current[part] = null;
        else {
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
            getWebContainer().then((c) => {
              if (isMounted) setWebContainer(c);
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
                const isMyMessage =
                  incomingSenderId?.toString() === user?._id?.toString();
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
        if (isMounted) setTimeout(() => setIsBooting(false), 800);
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
    if (activeTab === "terminal")
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalOutput, activeTab]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      initializeSocket(projectId).emit("typing");
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      initializeSocket(projectId).emit("stop-typing");
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
    } catch {
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
      await axios.put(
        accept ? "/project/accept-invite" : "/project/reject-invite",
        { projectId: inviteProjectId },
      );
      setPendingInvites((prev) =>
        prev.filter((i) => i._id !== inviteProjectId),
      );
      if (accept) window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const saveFileTree = async (fileTreeToSave) => {
    if (!project?._id) return;
    try {
      await axios.put("/project/update-file-tree", {
        projectId: project._id,
        fileTree: fileTreeToSave,
      });
    } catch (err) {
      console.error("Failed to auto-save:", err);
    }
  };

  const handleCloseFile = (e, fileToClose) => {
    e.stopPropagation();
    setOpenFiles((prev) => {
      const next = prev.filter((f) => f !== fileToClose);
      if (currentFile === fileToClose)
        setCurrentFile(next.length > 0 ? next[next.length - 1] : null);
      return next;
    });
  };

  const handleFileContentChange = (newValue) => {
    const newFileTree = {
      ...fileTree,
      [currentFile]: {
        ...fileTree[currentFile],
        file: {
          ...fileTree[currentFile]?.file,
          contents: newValue,
        },
      },
    };
    setFileTree(newFileTree);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveFileTree(newFileTree), 1500);
  };

  const handleFileSelect = (filePath) => {
    setCurrentFile(filePath);
    if (!openFiles.includes(filePath))
      setOpenFiles((prev) => [...prev, filePath]);
  };

  const onRequestDelete = (path) => {
    setFileToDelete(path);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFile = () => {
    if (!fileToDelete) return;
    const newFileTree = { ...fileTree };
    const pathsToDelete = Object.keys(newFileTree).filter(
      (k) => k === fileToDelete || k.startsWith(fileToDelete + "/"),
    );
    pathsToDelete.forEach((k) => delete newFileTree[k]);
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
        messageToSend += `\n\n***\nCONTEXT FOR AI (Current Open File: ${currentFile}):\n\`\`\`javascript\n${fileTree[currentFile].file.contents}\n\`\`\`\n***`;
      }
    }
    sendMessage("project-message", {
      projectId,
      message: messageToSend,
      sender: { _id: user._id, email: user.email },
      replyTo: replyingTo,
    });
    setMessage("");
    setReplyingTo(null);
    setIsTyping(false);
    initializeSocket(projectId).emit("stop-typing");
  };

  const handleRunClick = async () => {
    if (!webContainer) return;
    setTerminalOutput("");
    setActiveTab("terminal");
    try {
      setTerminalOutput("[System] Syncing files...\n");
      const mountStructure = {};
      Object.keys(fileTree).forEach((filePath) => {
        const parts = filePath.split("/");
        let current = mountStructure;
        parts.forEach((part, index) => {
          if (index === parts.length - 1)
            current[part] = {
              file: { contents: fileTree[filePath].file.contents },
            };
          else {
            if (!current[part]) current[part] = { directory: {} };
            current = current[part].directory;
          }
        });
      });
      await webContainer.mount(mountStructure);
      const hasPackageJson = !!fileTree["package.json"];
      if (hasPackageJson) {
        setTerminalOutput("[System] Installing dependencies...\n");
        setIsInstalling(true);
        const installProcess = await webContainer.spawn("npm", ["install"]);
        installProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              setTerminalOutput((p) => p + chunk);
            },
          }),
        );
        if ((await installProcess.exit) !== 0)
          throw new Error("Installation failed.");
        setIsInstalling(false);
        setTerminalOutput("\n[System] Starting server...\n");
        if (runProcess) runProcess.kill();
        const startProcess = await webContainer.spawn("npm", ["start"]);
        startProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              setTerminalOutput((p) => p + chunk);
            },
          }),
        );
        setRunProcess(startProcess);
        webContainer.on("server-ready", (port, url) => {
          setTerminalOutput(`\n[System] Server ready at ${url}\n`);
          setIframeUrl(url);
          setActiveTab("browser");
        });
      } else {
        setIsInstalling(false);
        const entryFiles = ["index.js", "main.js", "server.js", "app.js"];
        let entryFile = entryFiles.find((f) => fileTree[f]);
        if (!entryFile && currentFile?.endsWith(".js")) entryFile = currentFile;
        if (!entryFile) throw new Error("No runnable entry point found.");
        setTerminalOutput(`[System] Executing 'node ${entryFile}'...\n`);
        if (runProcess) runProcess.kill();
        const nodeProcess = await webContainer.spawn("node", [entryFile]);
        nodeProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              setTerminalOutput((p) => p + chunk);
            },
          }),
        );
        setRunProcess(nodeProcess);
      }
    } catch (err) {
      console.error(err);
      setTerminalOutput(`\n[Error] ${err.message}\n`);
      setIsInstalling(false);
    }
  };

  const downloadProject = async () => {
    const zip = new JSZip();
    Object.keys(fileTree).forEach((path) => {
      const c = fileTree[path].file?.contents;
      if (c) zip.file(path, c);
    });
    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(
        content,
        `${
          project?.name?.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "project"
        }.zip`,
      );
    } catch {
      alert("Failed to download project.");
    }
  };

  const handleStopClick = () => {
    if (runProcess) {
      runProcess.kill();
      setRunProcess(null);
      setTerminalOutput((p) => p + "\nProcess stopped.\n");
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
            <div className="p-2 bg-black/60 border border-white/8 text-[10px] font-mono text-white/50 overflow-x-auto">
              <strong>Build:</strong>{" "}
              <span className="text-white/70">
                {msgObj.buildCommand.mainItem}
              </span>{" "}
              {msgObj.buildCommand.commands.join(" ")}
            </div>
          )}
        </div>
      );
    } catch {
      return (
        <p className="text-[11px] whitespace-pre-wrap break-words font-mono">
          {raw}
        </p>
      );
    }
  };

  if (isBooting) return <Loader />;
  if (error)
    return (
      <div className="h-screen bg-[#080808] text-neutral-400 flex flex-col items-center justify-center font-mono text-[12px] tracking-wider gap-3">
        <AlertTriangle size={20} className="text-neutral-600" />
        <span>{error}</span>
      </div>
    );

  return (
    <main className="h-screen w-screen flex flex-col bg-[#080808] text-white overflow-hidden font-sans selection:bg-white/10">
      <style>{`
        /* ── Scrollbars ── */
        .styled-scroll::-webkit-scrollbar { width: 2px; height: 2px; }
        .styled-scroll::-webkit-scrollbar-track { background: transparent; }
        .styled-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 99px; }
        .styled-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.14); }
        .no-scrollbar::-webkit-scrollbar { display: none; }

        /* ── Keyframes ── */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes expandDown {
          from { opacity: 0; transform: scaleY(0.92); transform-origin: top; }
          to   { opacity: 1; transform: scaleY(1); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.3; }
          40%            { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes shimmerLine {
          0%   { opacity: 0.3; }
          50%  { opacity: 0.7; }
          100% { opacity: 0.3; }
        }

        /* ── Utility classes ── */
        .animate-fade-in    { animation: fadeIn   0.2s  ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.18s ease-out forwards; }
        .animate-scale-in   { animation: scaleIn  0.2s  ease-out forwards; }

        /* Typing dots */
        .typing-dot { animation: dotBounce 1.4s ease-in-out infinite both; }
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.16s; }
        .typing-dot:nth-child(3) { animation-delay: 0.32s; }

        /* Terminal cursor blink */
        .terminal-cursor { animation: blink 1s step-end infinite; }

        /* Active file-tab top line */
        .tab-active::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: shimmerLine 3s ease-in-out infinite;
        }

        /* Own message bubble */
        .bubble-own {
          background: #ffffff;
          color: #111;
        }

        /* AI message bubble */
        .bubble-ai {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* Other user bubble */
        .bubble-other {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
        }
      `}</style>

      <PanelGroup direction="horizontal">
        {/* ════════════════════════════════════════
            LEFT PANEL — CHAT
        ════════════════════════════════════════ */}
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <section className="relative flex flex-col h-full w-full border-r border-white/5 bg-[#0a0a0a] z-10 overflow-hidden">
            {/* Top hairline */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── Chat header ── */}
            <header className="flex justify-between items-center px-3 pl-14 bg-[#080808] border-b border-white/5 h-11 min-h-[2.75rem] flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => navigate("/home")}
                  className="text-neutral-600 hover:text-white transition-colors duration-150 group flex-shrink-0"
                >
                  <ArrowLeft
                    size={13}
                    className="group-hover:-translate-x-0.5 transition-transform duration-150"
                  />
                </button>
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot active pulse />
                  <h1 className="text-[12px] font-semibold text-white truncate max-w-[100px] tracking-tight">
                    {project?.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                {/* Notifications */}
                <button
                  onClick={() =>
                    setIsNotificationPanelOpen(!isNotificationPanelOpen)
                  }
                  className={`relative p-2 rounded transition-colors duration-150 ${
                    isNotificationPanelOpen
                      ? "bg-white/8 text-white"
                      : "text-neutral-600 hover:text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  <Bell size={13} />
                  {pendingInvites.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full">
                      <span className="absolute inset-0 animate-ping bg-white/70 rounded-full" />
                    </span>
                  )}
                </button>

                {/* Collaborators */}
                <button
                  onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
                  className={`p-2 rounded transition-colors duration-150 ${
                    isSidePanelOpen
                      ? "bg-white/8 text-white"
                      : "text-neutral-600 hover:text-neutral-300 hover:bg-white/5"
                  }`}
                >
                  <Users size={13} />
                </button>
              </div>
            </header>

            {/* ── Messages area ── */}
            <div className="conversation-area flex-grow flex flex-col overflow-hidden relative">
              <div className="message-box styled-scroll p-3 flex-grow flex flex-col gap-0.5 overflow-y-auto pb-24">
                {messages.map((msg, i) => {
                  const getSenderId = (m) =>
                    m.sender?._id || m.senderId || m.sender;
                  const currentSenderId = getSenderId(msg);
                  const isOwnMessage =
                    currentSenderId?.toString() === user?._id?.toString();
                  const senderEmail =
                    typeof msg.sender === "object" ? msg.sender.email : "User";
                  const isMenuOpen = activeMenuMsgId === (msg._id || i);
                  const previousMsg = messages[i - 1];
                  const isSameSender =
                    previousMsg &&
                    getSenderId(previousMsg) === currentSenderId &&
                    previousMsg.isAi === msg.isAi;

                  return (
                    <div
                      key={msg._id || i}
                      className={`flex w-full group relative ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      } ${isSameSender ? "mt-0.5" : "mt-4"}`}
                      style={{ animation: "fadeIn 0.18s ease-out forwards" }}
                    >
                      <div
                        className={`max-w-[87%] flex flex-col relative ${
                          isOwnMessage ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Sender label — other user */}
                        {!isSameSender && !isOwnMessage && !msg.isAi && (
                          <div className="flex items-center gap-1.5 mb-1.5 ml-0.5">
                            <div className="w-5 h-5 bg-neutral-800 border border-white/8 flex items-center justify-center text-[8px] font-bold text-neutral-400">
                              {typeof senderEmail === "string"
                                ? senderEmail[0]?.toUpperCase()
                                : "?"}
                            </div>
                            <span className="text-[9px] font-mono text-neutral-600 tracking-wide">
                              {senderEmail}
                            </span>
                          </div>
                        )}

                        {/* Sender label — AI */}
                        {!isSameSender && msg.isAi && (
                          <div className="flex items-center gap-1.5 mb-1.5 ml-0.5">
                            <div className="w-5 h-5 bg-neutral-900 border border-white/10 flex items-center justify-center">
                              <Bot size={10} className="text-neutral-400" />
                            </div>
                            <span className="text-[9px] font-mono text-neutral-500 tracking-wide">
                              AI Assistant
                            </span>
                          </div>
                        )}

                        {/* Reply preview */}
                        {msg.replyTo && (
                          <div
                            className={`text-[10px] mb-1 px-2.5 py-1.5 border-l-2 font-mono max-w-full ${
                              isOwnMessage
                                ? "border-white/30 bg-white/5 text-white/40"
                                : "border-white/10 bg-white/3 text-neutral-600"
                            }`}
                          >
                            <span className="block mb-0.5 text-[9px] text-neutral-700">
                              {msg.replyTo.originalSender}
                            </span>
                            <span className="line-clamp-1 opacity-70">
                              {msg.replyTo.originalMessage}
                            </span>
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={`relative px-3 py-2 text-[11px] break-words font-mono leading-relaxed ${
                            isOwnMessage
                              ? "bubble-own"
                              : msg.isAi
                                ? "bubble-ai text-neutral-300"
                                : "bubble-other text-neutral-300"
                          } ${msg.isOptimistic ? "opacity-50" : ""}`}
                        >
                          {msg.isAi ? (
                            <div className="flex gap-2">
                              <div className="overflow-hidden w-full">
                                <AiMessage raw={msg.message} />
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed">{msg.message}</p>
                          )}
                          <div
                            className={`text-[9px] mt-1.5 text-right font-mono ${
                              isOwnMessage
                                ? "text-black/35"
                                : "text-neutral-700"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        {/* Message context menu trigger */}
                        <div
                          className={`absolute top-0 ${
                            isOwnMessage ? "-left-8" : "-right-8"
                          } z-50 message-menu-container`}
                        >
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuMsgId(
                                  isMenuOpen ? null : msg._id || i,
                                );
                              }}
                              className={`p-1.5 rounded transition-all duration-150 ${
                                isMenuOpen
                                  ? "opacity-100 bg-white/8 text-white"
                                  : "opacity-0 group-hover:opacity-100 text-neutral-700 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <MoreVertical size={12} />
                            </button>

                            {isMenuOpen && (
                              <div
                                className={`absolute bottom-full mb-1.5 ${
                                  isOwnMessage
                                    ? "left-0 origin-bottom-left"
                                    : "right-0 origin-bottom-right"
                                } w-28 bg-[#111] border border-white/8 overflow-hidden shadow-xl shadow-black/60 animate-fade-in-up z-[9999]`}
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
                                  className="w-full text-left px-3 py-2 text-[10px] font-mono text-neutral-600 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                                >
                                  <Reply size={10} />
                                  Reply
                                </button>
                                {isOwnMessage && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMessage(msg._id);
                                      setActiveMenuMsgId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-[10px] font-mono text-neutral-700 hover:bg-white/4 hover:text-white flex items-center gap-2 border-t border-white/5 transition-colors"
                                  >
                                    <Trash2 size={10} />
                                    Delete
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

                {/* AI Thinking indicator */}
                {isAiThinking && (
                  <div className="flex justify-start animate-fade-in mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-neutral-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Bot size={10} className="text-neutral-500" />
                      </div>
                      <div className="bubble-ai px-3 py-2.5 flex items-center gap-1.5">
                        <span className="typing-dot w-1.5 h-1.5 bg-neutral-500 rounded-full" />
                        <span className="typing-dot w-1.5 h-1.5 bg-neutral-500 rounded-full" />
                        <span className="typing-dot w-1.5 h-1.5 bg-neutral-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Remote user typing */}
                {remoteTypingUser && (
                  <div className="flex justify-start animate-fade-in mt-1">
                    <div className="px-2 py-1 text-[9px] font-mono text-neutral-700 flex items-center gap-1.5">
                      <span className="typing-dot w-1 h-1 bg-neutral-700 rounded-full" />
                      <span className="typing-dot w-1 h-1 bg-neutral-700 rounded-full" />
                      <span className="typing-dot w-1 h-1 bg-neutral-700 rounded-full" />
                      <span className="ml-1">{remoteTypingUser}</span>
                    </div>
                  </div>
                )}

                <div ref={messageEndRef} />
              </div>

              {/* ── Message input ── */}
              <div className="absolute bottom-0 w-full bg-[#0a0a0a]/95 border-t border-white/5 z-20 backdrop-blur-sm">
                {/* Reply preview strip */}
                {replyingTo && (
                  <div className="border-b border-white/5 px-3 py-2 flex justify-between items-center animate-fade-in bg-white/2">
                    <div className="text-[9px] font-mono text-neutral-600 border-l-2 border-white/20 pl-2 min-w-0">
                      <span className="text-neutral-500 flex items-center gap-1 mb-0.5">
                        <Reply size={9} />
                        {replyingTo.originalSender}
                      </span>
                      <span className="truncate max-w-[140px] block opacity-50 text-[9px]">
                        {replyingTo.originalMessage}
                      </span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-neutral-700 hover:text-white p-1 rounded hover:bg-white/5 transition-all ml-2 flex-shrink-0"
                    >
                      <X size={11} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 p-2.5">
                  <div className="flex-grow flex items-center bg-white/4 border border-white/6 px-3 py-1.5 focus-within:border-white/12 focus-within:bg-white/5 transition-all duration-200">
                    <input
                      value={message}
                      onChange={handleTyping}
                      onKeyPress={(e) => e.key === "Enter" && send()}
                      className="flex-grow bg-transparent text-white outline-none placeholder-neutral-700 text-[11px] font-mono"
                      placeholder="message or @ai ..."
                    />
                    {message.toLowerCase().includes("@ai") && (
                      <Bot
                        size={11}
                        className="text-neutral-500 flex-shrink-0 ml-1"
                      />
                    )}
                  </div>
                  <button
                    onClick={send}
                    disabled={!message.trim()}
                    className="w-8 h-8 bg-white flex items-center justify-center text-black hover:bg-neutral-200 transition-all duration-150 disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Collaborators slide-in panel ── */}
            <div
              className={`sidePanel w-full h-full flex flex-col bg-[#0a0a0a] border-r border-white/5 absolute transition-all duration-300 ease-out ${
                isSidePanelOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0"
              } top-0 z-30`}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <header className="flex justify-between items-center px-4 border-b border-white/5 h-11 min-h-[2.75rem]">
                <div className="flex items-center gap-2">
                  <Users size={12} className="text-neutral-600" />
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-neutral-600">
                    Collaborators
                  </span>
                </div>
                <button
                  onClick={() => setisSidePanelOpen(false)}
                  className="text-neutral-700 hover:text-white p-1 hover:bg-white/5 transition-all"
                >
                  <X size={13} />
                </button>
              </header>

              <div className="p-3 flex-grow overflow-y-auto styled-scroll">
                <button
                  onClick={() => setAddUserModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/8 text-[10px] font-mono text-neutral-600 hover:border-white/20 hover:text-white hover:bg-white/3 transition-all duration-200 mb-4 group"
                >
                  <Plus
                    size={11}
                    className="group-hover:rotate-90 transition-transform duration-200"
                  />
                  Invite member
                </button>
                <div className="space-y-0.5">
                  {project?.users?.map((u) => (
                    <div
                      key={u._id}
                      className="py-2 px-2 flex gap-2.5 items-center hover:bg-white/3 transition-colors"
                    >
                      <div className="w-6 h-6 bg-neutral-800 border border-white/8 flex items-center justify-center text-[9px] font-bold text-neutral-400 flex-shrink-0">
                        {u.email[0].toUpperCase()}
                      </div>
                      <span className="font-mono text-[10px] text-neutral-600 truncate flex-grow">
                        {u.email}
                      </span>
                      <StatusDot active />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Notifications dropdown ── */}
            {isNotificationPanelOpen && (
              <div className="absolute top-11 right-0 left-0 bg-[#0c0c0c]/98 border-b border-white/5 z-40 p-3 animate-fade-in shadow-xl shadow-black/60 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={10} className="text-neutral-700" />
                  <span className="text-[9px] font-mono text-neutral-700 tracking-widest uppercase">
                    Notifications
                  </span>
                </div>
                {pendingInvites.length === 0 ? (
                  <p className="text-[9px] font-mono text-neutral-800 tracking-wider py-2 text-center">
                    All caught up ✓
                  </p>
                ) : (
                  pendingInvites.map((invite) => (
                    <div
                      key={invite._id}
                      className="flex justify-between items-center py-2.5 border-b border-white/4 last:border-b-0"
                    >
                      <div>
                        <p className="text-[10px] font-mono text-neutral-400">
                          {invite.name}
                        </p>
                        <p className="text-[9px] font-mono text-neutral-700 mt-0.5">
                          Project invitation
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleInviteResponse(invite._id, true)}
                          className="text-[9px] font-mono bg-white/8 text-white border border-white/15 hover:bg-white/15 px-2 py-1 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleInviteResponse(invite._id, false)
                          }
                          className="text-[9px] font-mono bg-white/4 text-neutral-600 border border-white/8 hover:bg-white/8 hover:text-neutral-400 px-2 py-1 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </Panel>

        <ResizeHandle />

        <Panel>
          <PanelGroup direction="horizontal">
            {/* ════════════════════════════════════════
                FILE EXPLORER
            ════════════════════════════════════════ */}
            {isExplorerOpen && (
              <>
                <Panel defaultSize={18} minSize={10} maxSize={25}>
                  <div className="h-full w-full bg-[#090909] flex flex-col border-r border-white/5">
                    {/* Explorer header */}
                    <div
                      onClick={() => setIsExplorerOpen(!isExplorerOpen)}
                      className="flex items-center justify-between border-b border-white/5 px-3 cursor-pointer hover:bg-white/2 h-11 min-h-[2.75rem] flex-shrink-0 group transition-colors"
                    >
                      <span className="text-[9px] font-semibold tracking-widest uppercase text-neutral-700 flex items-center gap-1.5 group-hover:text-neutral-500 transition-colors">
                        <Code2 size={10} />
                        Explorer
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadProject();
                        }}
                        className="text-neutral-700 hover:text-white transition-all duration-150 p-1 hover:bg-white/5 group/btn"
                        title="Download ZIP"
                      >
                        <Download
                          size={11}
                          className="group-hover/btn:translate-y-0.5 transition-transform duration-150"
                        />
                      </button>
                    </div>

                    {/* File tree */}
                    <div className="styled-scroll w-full flex-grow overflow-y-auto py-2">
                      {isAiThinking ? (
                        <FileTreeSkeleton />
                      ) : (
                        <div className="space-y-0.5">
                          {Object.keys(folderStructure).map((key) => (
                            <FileTreeNode
                              key={key}
                              fileName={key}
                              nodes={folderStructure[key]}
                              onSelect={handleFileSelect}
                              onDelete={onRequestDelete}
                              path={key}
                              newFilePaths={newFilePaths}
                              selectedFile={currentFile}
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

            {/* ════════════════════════════════════════
                CODE EDITOR
            ════════════════════════════════════════ */}
            <Panel defaultSize={isExplorerOpen ? 42 : 50} minSize={20}>
              <div className="flex flex-col h-full w-full bg-[#0c0c0c]">
                {/* Tab bar */}
                <div className="top-bar flex justify-between items-center bg-[#090909] border-b border-white/5 h-11 min-h-[2.75rem] flex-shrink-0">
                  <div className="files flex overflow-x-auto no-scrollbar h-full items-end flex-grow">
                    {openFiles.map((file) => {
                      const isActive = currentFile === file;
                      return (
                        <div
                          key={file}
                          onClick={() => setCurrentFile(file)}
                          className={`group relative flex items-center min-w-fit px-3 h-full text-[10px] font-mono border-r border-white/5 cursor-pointer transition-all duration-150 gap-1.5 ${
                            isActive
                              ? "tab-active bg-[#0c0c0c] text-white"
                              : "bg-[#090909] text-neutral-600 hover:text-neutral-300 hover:bg-white/2"
                          }`}
                        >
                          <span className="flex-shrink-0">
                            {getFileIcon(file.split("/").pop())}
                          </span>
                          <span className="mr-1.5 truncate max-w-[80px]">
                            {file.split("/").pop()}
                          </span>
                          <button
                            onClick={(e) => handleCloseFile(e, file)}
                            className="opacity-0 group-hover:opacity-100 text-neutral-700 hover:text-white flex-shrink-0 p-0.5 hover:bg-white/8 transition-all"
                          >
                            <X size={9} />
                          </button>
                        </div>
                      );
                    })}

                    {/* Show explorer when closed */}
                    {!isExplorerOpen && (
                      <button
                        onClick={() => setIsExplorerOpen(true)}
                        className="h-full px-3 text-neutral-700 hover:text-neutral-400 hover:bg-white/3 transition-colors border-r border-white/5"
                      >
                        <ChevronRight size={12} />
                      </button>
                    )}
                  </div>

                  {/* Run / Stop button */}
                  <div className="px-3 flex-shrink-0">
                    {!runProcess ? (
                      <button
                        onClick={handleRunClick}
                        disabled={isInstalling}
                        className="flex items-center gap-1.5 py-1.5 px-3 text-[10px] font-mono tracking-wide border border-white/15 text-white/70 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/25 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isInstalling ? (
                          <>
                            <span className="w-2 h-2 border border-white/40 border-t-transparent rounded-full animate-spin" />
                            <span className="animate-pulse">installing</span>
                          </>
                        ) : (
                          <>
                            <Play size={10} className="fill-white/70" />
                            Run
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handleStopClick}
                        className="flex items-center gap-1.5 py-1.5 px-3 text-[10px] font-mono tracking-wide border border-white/10 text-white/50 bg-white/3 hover:bg-white/8 hover:text-white/80 hover:border-white/20 transition-all duration-150"
                      >
                        <Square size={10} className="fill-white/50" />
                        Stop
                      </button>
                    )}
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-grow overflow-hidden relative h-full w-full">
                  {currentFile && fileTree[currentFile]?.file ? (
                    <div
                      key={currentFile}
                      className="h-full w-full"
                      style={{ animation: "fadeIn 0.15s ease-out" }}
                    >
                      <Editor
                        height="100%"
                        width="100%"
                        path={currentFile}
                        language={getLanguageFromFileName(currentFile)}
                        theme="vs-dark"
                        value={fileTree[currentFile].file.contents}
                        onChange={handleFileContentChange}
                        options={{
                          fontSize: 12,
                          fontFamily:
                            "'JetBrains Mono', 'Fira Code', monospace",
                          minimap: { enabled: false },
                          lineNumbersMinChars: 3,
                          padding: { top: 16 },
                          scrollbar: {
                            verticalScrollbarSize: 3,
                            horizontalScrollbarSize: 3,
                          },
                          renderLineHighlight: "gutter",
                          cursorBlinking: "smooth",
                          smoothScrolling: true,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0c0c0c]">
                      <div className="text-center space-y-4">
                        <div className="w-14 h-14 mx-auto border border-white/5 bg-white/2 flex items-center justify-center">
                          <Code2 size={22} className="text-neutral-800" />
                        </div>
                        <div>
                          <p className="text-[11px] font-mono text-neutral-700 tracking-widest uppercase mb-1">
                            No file selected
                          </p>
                          <p className="text-[10px] font-mono text-neutral-800">
                            Choose a file from the explorer
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <ResizeHandle />

            {/* ════════════════════════════════════════
                BROWSER / TERMINAL
            ════════════════════════════════════════ */}
            <Panel defaultSize={40} minSize={20}>
              <div className="flex flex-col h-full w-full border-l border-white/5 bg-[#090909]">
                {/* Tab bar */}
                <div className="flex items-center justify-between bg-[#090909] border-b border-white/5 px-3 h-11 min-h-[2.75rem]">
                  <div className="flex gap-px">
                    {[
                      { id: "browser", icon: Globe, label: "Browser" },
                      {
                        id: "terminal",
                        icon: Terminal,
                        label: "Terminal",
                      },
                    ].map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-wide transition-all duration-150 ${
                          activeTab === id
                            ? "bg-white/6 text-white border border-white/8"
                            : "text-neutral-600 hover:text-neutral-400 hover:bg-white/3"
                        }`}
                      >
                        <Icon size={11} />
                        {label}
                        {id === "terminal" && runProcess && (
                          <StatusDot active pulse />
                        )}
                        {id === "browser" && iframeUrl && <StatusDot active />}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleClear}
                    className="text-neutral-700 hover:text-white transition-colors p-1.5 hover:bg-white/5"
                    title="Clear"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Browser panel */}
                {activeTab === "browser" && (
                  <div className="flex-grow bg-[#0c0c0c] relative flex items-center justify-center overflow-hidden">
                    {iframeUrl ? (
                      <>
                        {/* URL bar */}
                        <div className="absolute top-0 left-0 right-0 z-10 bg-[#090909]/95 border-b border-white/5 px-3 py-1.5 flex items-center gap-2 backdrop-blur-sm">
                          <StatusDot active pulse />
                          <span className="text-[9px] font-mono text-neutral-600 truncate">
                            {iframeUrl}
                          </span>
                        </div>
                        <iframe
                          src={iframeUrl}
                          className="w-full h-full border-none pt-7"
                        />
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-14 h-14 border border-white/5 bg-white/2 flex items-center justify-center">
                          <Globe size={20} className="text-neutral-800" />
                        </div>
                        <div>
                          <p className="text-[11px] font-mono text-neutral-700 tracking-widest uppercase mb-1">
                            No preview
                          </p>
                          <p className="text-[10px] font-mono text-neutral-800">
                            Run your project to see it here
                          </p>
                        </div>
                        <button
                          onClick={handleRunClick}
                          disabled={!webContainer}
                          className="flex items-center gap-2 py-2 px-4 text-[10px] font-mono border border-white/10 text-white/50 bg-white/4 hover:bg-white/8 hover:text-white/80 transition-all duration-150 disabled:opacity-30"
                        >
                          <Play size={10} className="fill-white/50" />
                          Run Project
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Terminal panel */}
                {activeTab === "terminal" && (
                  <div className="flex-grow bg-[#060606] flex flex-col overflow-hidden">
                    {/* Terminal chrome */}
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/4">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/8" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/8" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/8" />
                      <span className="ml-2 text-[9px] font-mono text-neutral-800 tracking-widest">
                        TERMINAL
                      </span>
                      {runProcess && (
                        <span className="ml-auto flex items-center gap-1.5 text-[9px] font-mono text-neutral-600">
                          <StatusDot active pulse />
                          running
                        </span>
                      )}
                    </div>

                    {/* Output */}
                    <div className="styled-scroll flex-grow p-4 font-mono text-[11px] overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">
                      {cleanTerminalOutput(terminalOutput) ? (
                        <span className="text-neutral-400">
                          {cleanTerminalOutput(terminalOutput)}
                        </span>
                      ) : (
                        <span className="text-neutral-800 flex items-center gap-2">
                          <span className="text-neutral-700">$</span>
                          <span className="terminal-cursor text-neutral-700">
                            ▌
                          </span>
                          <span>Waiting for output...</span>
                        </span>
                      )}
                      <div ref={terminalEndRef} />
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>

      {/* ── Staggered nav menu ── */}
      {!isSidePanelOpen && (
        <div className="fixed top-2 left-4 z-50">
          <StaggeredMenu
            items={menuItems}
            socialItems={socialItems}
            menuButtonColor="#444"
            openMenuButtonColor="#ffffff"
            accentColor="#ffffff"
          />
        </div>
      )}

      {/* ════════════════════════════════════════
          INVITE MODAL
      ════════════════════════════════════════ */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-[#0e0e0e] border border-white/8 w-full max-w-md overflow-hidden relative shadow-2xl shadow-black/80 animate-scale-in">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Corner accents */}
            {[
              "top-0 left-0 border-l border-t",
              "top-0 right-0 border-r border-t",
              "bottom-0 left-0 border-l border-b",
              "bottom-0 right-0 border-r border-b",
            ].map((c, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 border-white/15 ${c}`}
              />
            ))}

            <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-white/6 border border-white/10 flex items-center justify-center">
                  <Users size={11} className="text-neutral-400" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide text-neutral-300">
                  Invite Member
                </span>
              </div>
              <button
                onClick={() => {
                  setAddUserModalOpen(false);
                  setSearchedUser(null);
                  setSearchEmail("");
                }}
                className="text-neutral-700 hover:text-white p-1.5 hover:bg-white/5 transition-all"
              >
                <X size={13} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-[9px] font-semibold tracking-widest uppercase text-neutral-700 block mb-2">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearchUser()}
                    className="flex-grow bg-white/4 border border-white/8 px-3 py-2.5 text-[11px] text-white font-mono focus:border-white/20 focus:bg-white/5 outline-none placeholder-neutral-800 transition-all"
                    placeholder="user@example.com"
                  />
                  <button
                    onClick={handleSearchUser}
                    className="border border-white/8 bg-white/4 text-neutral-600 hover:text-white hover:border-white/20 hover:bg-white/8 px-3 text-[11px] font-mono transition-all group"
                  >
                    <ChevronRight
                      size={13}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </div>
              </div>

              {searchedUser && (
                <div className="bg-white/3 border border-white/8 px-3 py-3 flex justify-between items-center animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-neutral-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                      {searchedUser.email[0]?.toUpperCase()}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-300">
                      {searchedUser.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSendInvite}
                    className="text-[9px] font-mono tracking-wide bg-white text-black px-3 py-1.5 hover:bg-neutral-200 transition-colors flex items-center gap-1.5 font-semibold"
                  >
                    <Check size={10} />
                    Invite
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          DELETE MODAL
      ════════════════════════════════════════ */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-[#0e0e0e] border border-white/8 w-full max-w-sm overflow-hidden relative shadow-2xl shadow-black/80 animate-scale-in">
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Corner accents */}
            {[
              "top-0 left-0 border-l border-t",
              "top-0 right-0 border-r border-t",
              "bottom-0 left-0 border-l border-b",
              "bottom-0 right-0 border-r border-b",
            ].map((c, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 border-white/10 ${c}`}
              />
            ))}

            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 border border-white/8 bg-white/3 flex items-center justify-center">
                <AlertTriangle size={18} className="text-neutral-500" />
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-white mb-2 tracking-tight">
                  Delete this item?
                </h3>
                <p className="text-[10px] font-mono text-neutral-600 leading-relaxed">
                  This will permanently delete{" "}
                  <code className="text-neutral-300 bg-white/5 border border-white/8 px-1.5 py-0.5">
                    {fileToDelete}
                  </code>
                  <br />
                  and cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex border-t border-white/5">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3.5 text-[10px] font-mono text-neutral-600 hover:text-white hover:bg-white/3 transition-colors border-r border-white/5 tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                className="flex-1 py-3.5 text-[10px] font-mono text-neutral-500 hover:text-white hover:bg-white/5 transition-colors tracking-wider flex items-center justify-center gap-1.5"
              >
                <Trash2 size={10} />
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
