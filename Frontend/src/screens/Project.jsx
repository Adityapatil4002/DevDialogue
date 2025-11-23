import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
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

// Helper to get language for syntax highlighting
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

  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [CurrentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [activeTab, setActiveTab] = useState("browser"); // 'browser' or 'terminal'

  const messageEndRef = useRef(null);
  const saveTimeout = useRef(null);

  // 2. Load files from DB on mount
  useEffect(() => {
    let isMounted = true;
    let cleanupMessageListener = null;

    const fetchProjectAndUsers = async () => {
      if (!projectId) {
        setError("No Project ID found in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [projectRes, usersRes] = await Promise.all([
          axios.get(`/project/get-project/${projectId}`),
          axios.get("/user/all"),
        ]);

        if (isMounted) {
          const fetchedProject = projectRes.data.project;
          setProject(fetchedProject);
          setAllUsers(usersRes.data.users);
          setFileTree(fetchedProject.fileTree || {});

          initializeSocket(projectId);

          if (!webContainer) {
            getWebContainer().then((containerInstance) => {
              if (isMounted) {
                setWebContainer(containerInstance);
                console.log("container started");
              }
            });
          }

          cleanupMessageListener = recieveMessage("project-message", (data) => {
            console.log("Received message:", data);

            if (isMounted) {
              setMessages((prev) => {
                if (data.sender?._id === user?._id) {
                  let replaced = false;
                  const updatedMessages = prev.map((m) => {
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

                  if (replaced) {
                    return updatedMessages;
                  }
                  if (!prev.some((m) => m.timestamp === data.timestamp)) {
                    return [...updatedMessages, data];
                  }
                  return updatedMessages;
                } else {
                  if (!prev.some((m) => m.timestamp === data.timestamp)) {
                    return [...prev, data];
                  }
                }
                return prev;
              });

              if (data.isAi && data.filetree) {
                const newFiles = Object.keys(data.filetree);

                setFileTree((prevFileTree) => {
                  const mergedFileTree = {
                    ...prevFileTree,
                    ...data.filetree,
                  };
                  saveFileTree(mergedFileTree);
                  return mergedFileTree;
                });

                if (newFiles.length > 0) {
                  setCurrentFile(newFiles[0]);
                  setOpenFiles((prevOpen) => {
                    const allOpen = [...prevOpen];
                    newFiles.forEach((file) => {
                      if (!allOpen.includes(file)) {
                        allOpen.push(file);
                      }
                    });
                    return allOpen;
                  });
                }
              }
            }
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) setError("Failed to load project.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProjectAndUsers();

    return () => {
      isMounted = false;
      if (cleanupMessageListener) cleanupMessageListener();
      disconnectSocket();
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [projectId, user?._id, webContainer]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
      u._id !== user?._id
  );

  const handleSubmitCollaborators = () => {
    if (!projectId || selectedUsers.length === 0) return;

    axios
      .put("/project/add-user", { projectId, users: selectedUsers })
      .then((res) => setProject(res.data.project))
      .catch((err) => console.error("Error adding collaborators:", err));

    setAddUserModalOpen(false);
    setSelectedUsers([]);
    setSearchTerm("");
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
  };

  const AiMessage = ({ raw }) => {
    let msgObj;
    try {
      msgObj = JSON.parse(raw);
    } catch {
      return <p className="text-sm whitespace-pre-wrap break-words">{raw}</p>;
    }

    return (
      <div className="prose prose-invert prose-sm max-w-none space-y-2">
        <div dangerouslySetInnerHTML={{ __html: msgObj.text || "" }} />
        {msgObj.buildCommand && (
          <div className="p-2 bg-[#0d1117] border border-gray-700 rounded-md text-xs font-mono text-yellow-400">
            <strong className="text-gray-400">Build:</strong>{" "}
            <span className="text-green-400">
              {msgObj.buildCommand.mainItem}
            </span>{" "}
            {msgObj.buildCommand.commands.join(" ")}
          </div>
        )}
        {msgObj.startCommand && (
          <div className="p-2 bg-[#0d1117] border border-gray-700 rounded-md text-xs font-mono text-yellow-400">
            <strong className="text-gray-400">Start:</strong>{" "}
            <span className="text-green-400">
              {msgObj.startCommand.mainItem}
            </span>{" "}
            {msgObj.startCommand.commands.join(" ")}
          </div>
        )}
      </div>
    );
  };

  const saveFileTree = (fileTreeToSave) => {
    if (!project?._id) return;
    axios
      .put("/project/update-file-tree", {
        projectId: project._id,
        fileTree: fileTreeToSave,
      })
      .then((res) => {
        console.log("File tree saved successfully.", res.data);
      })
      .catch((err) => {
        console.error("Error saving file tree:", err);
      });
  };

  const handleFileContentChange = (newValue) => {
    const newFileTree = {
      ...fileTree,
      [CurrentFile]: {
        ...fileTree[CurrentFile],
        file: {
          ...fileTree[CurrentFile]?.file,
          contents: newValue,
        },
      },
    };
    setFileTree(newFileTree);

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      saveFileTree(newFileTree);
    }, 1500);
  };

  const handleRunClick = async () => {
    if (!webContainer) return;

    setTerminalOutput("");
    setIsInstalling(true);
    setActiveTab("terminal");

    try {
      await webContainer.mount(fileTree);

      setTerminalOutput((prev) => prev + "Installing dependencies...\n");
      const installProcess = await webContainer.spawn("npm", ["install"]);

      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            setTerminalOutput((prev) => prev + chunk);
          },
        })
      );

      const exitCode = await installProcess.exit;
      if (exitCode !== 0) {
        throw new Error("Installation failed");
      }

      setTerminalOutput((prev) => prev + "\nStarting server...\n");
      setIsInstalling(false);

      if (runProcess) {
        runProcess.kill();
      }

      let tempRunProcess = await webContainer.spawn("npm", ["start"]);

      tempRunProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            setTerminalOutput((prev) => prev + chunk);
          },
        })
      );

      setRunProcess(tempRunProcess);

      webContainer.on("server-ready", (port, url) => {
        console.log("Server ready at:", port, url);
        setIframeUrl(url);
        setActiveTab("browser");
      });
    } catch (err) {
      setTerminalOutput((prev) => prev + `\nError: ${err.message}\n`);
      setIsInstalling(false);
      setRunProcess(null);
    }
  };

  const handleStopClick = () => {
    if (runProcess) {
      runProcess.kill();
      setRunProcess(null);
      setTerminalOutput((prev) => prev + "\nProcess stopped by user.\n");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-mono">
            Initializing DevEnvironment...
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0d1117] text-red-500">
        <div className="p-6 bg-[#161b22] border border-red-900 rounded-xl shadow-2xl">
          <i className="ri-error-warning-fill text-3xl mb-2 block text-center"></i>
          {error || "Project could not be loaded."}
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen flex bg-[#030712] text-white overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      <style>
        {`
          .message-box::-webkit-scrollbar { width: 6px; }
          .message-box::-webkit-scrollbar-track { background: transparent; }
          .message-box::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
          .message-box::-webkit-scrollbar-thumb:hover { background: #4b5563; }
          
          .glass-panel {
            background: rgba(17, 24, 39, 0.7);
            backdrop-filter: blur(10px);
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}
      </style>

      {/* ---------- LEFT CHAT PANEL ---------- */}
      <section className="relative flex flex-col h-full min-w-80 w-full md:w-96 lg:w-[400px] bg-[#0b0f19] border-r border-gray-800 z-10">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-[#0d1117] border-b border-gray-800 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
            <h1
              className="text-lg font-bold truncate bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              title={project.name}
            >
              {project.name}
            </h1>
          </div>
          <button
            onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
            className="p-2 rounded-full hover:bg-gray-800 transition-all duration-200 text-gray-400 hover:text-white"
          >
            <i className="ri-group-line text-xl"></i>
          </button>
        </header>

        {/* Conversation Area */}
        <div className="conversation-area flex-grow flex flex-col overflow-hidden relative bg-[#0b0f19]">
          <div className="message-box p-4 flex-grow flex flex-col gap-4 overflow-y-auto pb-24">
            {messages.map((msg, i) => (
              <div
                key={msg.timestamp || `optimistic-${i}`}
                className={`flex w-full animate-fade-in ${
                  msg.sender?._id === user?._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[85%] flex flex-col p-3 rounded-2xl shadow-lg border relative
                    ${
                      msg.sender?._id === user?._id
                        ? "bg-blue-600 border-blue-500 text-white rounded-br-none"
                        : msg.isAi
                        ? "bg-[#161b22] border-gray-700 text-gray-200 rounded-bl-none"
                        : "bg-gray-800 border-gray-700 text-gray-100 rounded-bl-none"
                    }
                  `}
                >
                  {msg.sender?._id !== user?._id && !msg.isAi && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-[8px] font-bold text-white">
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
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {msg.message}
                    </p>
                  )}

                  <small
                    className={`text-[10px] self-end mt-1 font-mono ${
                      msg.sender?._id === user?._id
                        ? "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString(
                      [],
                      { hour: "numeric", minute: "2-digit" }
                    )}
                  </small>
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                <i className="ri-message-3-line text-6xl mb-2"></i>
                <p>
                  Start the conversation
                  <br />
                  to generate code.
                </p>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Input Field */}
          <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19] to-transparent z-20">
            <div className="flex items-center gap-2 bg-[#161b22] p-2 pr-2 rounded-full border border-gray-700 shadow-xl focus-within:border-blue-500 transition-colors">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && send()}
                className="flex-grow bg-transparent text-white px-4 py-2 border-none outline-none placeholder-gray-500 text-sm"
                placeholder="Type a message to @ai..."
              />
              <button
                onClick={send}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                disabled={!message.trim()}
              >
                <i className="ri-send-plane-2-fill"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel (Collaborators) */}
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-[#0d1117]/95 backdrop-blur-md absolute transition-all duration-300 ease-in-out ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 z-30 border-r border-gray-800`}
        >
          <header className="flex justify-between items-center p-4 bg-[#0d1117] border-b border-gray-800">
            <h2 className="font-bold text-gray-200">Collaborators</h2>
            <button
              onClick={() => setisSidePanelOpen(false)}
              className="p-1 rounded hover:bg-gray-800 transition-colors text-gray-400"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </header>

          <div className="p-4 flex-grow overflow-y-auto">
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all mb-4 group"
            >
              <i className="ri-user-add-line group-hover:scale-110 transition-transform"></i>
              <span className="text-sm font-medium">Add New Member</span>
            </button>

            <div className="flex flex-col gap-2">
              {project?.users?.map((u) => (
                <div
                  key={u._id}
                  className="user p-3 flex gap-3 items-center rounded-lg hover:bg-[#1f2937] transition-colors border border-transparent hover:border-gray-700 cursor-default"
                >
                  <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <span className="text-sm font-bold uppercase">
                      {u.email?.[0] ?? "?"}
                    </span>
                    {/* Online status indicator mock */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1f2937] rounded-full"></span>
                  </div>
                  <h1 className="font-medium text-gray-300 text-sm truncate">
                    {u.email}
                  </h1>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- RIGHT PANEL: FILE TREE + EDITOR + PREVIEW ---------- */}
      <section className="right flex-grow h-full flex bg-[#030712] relative overflow-hidden">
        {/* File Explorer */}
        <div className="explorer h-full max-w-64 min-w-52 bg-[#0d1117] flex flex-col border-r border-gray-800">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Explorer
            </span>
            <i className="ri-folder-3-line text-gray-500"></i>
          </div>
          <div className="file-tree w-full flex-grow overflow-y-auto pt-2">
            {Object.keys(fileTree).length > 0 ? (
              Object.keys(fileTree).map((file) => (
                <button
                  key={file}
                  onClick={() => {
                    setCurrentFile(file);
                    setOpenFiles((prev) =>
                      prev.includes(file) ? prev : [...prev, file]
                    );
                  }}
                  className={`group w-full text-left px-4 py-1.5 flex items-center gap-2 transition-colors border-l-2 ${
                    CurrentFile === file
                      ? "bg-[#1f2937] border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:bg-[#161b22] hover:text-white"
                  }`}
                >
                  {/* Simple Icon Logic based on ext */}
                  <i
                    className={`text-lg ${
                      file.endsWith("jsx")
                        ? "ri-reactjs-line text-blue-400"
                        : file.endsWith("css")
                        ? "ri-css3-line text-orange-400"
                        : file.endsWith("js")
                        ? "ri-javascript-line text-yellow-400"
                        : "ri-file-code-line text-gray-500"
                    }`}
                  ></i>
                  <span className="text-sm font-medium truncate">{file}</span>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-gray-600">
                <i className="ri-ghost-line text-2xl mb-2 block"></i>
                <p className="text-xs">No files generated yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="code-editor flex flex-col flex-grow h-full w-1/2 bg-[#0d1117]">
          {/* Top Bar (Tabs + Run) */}
          <div className="top-bar flex justify-between items-center bg-[#010409] border-b border-gray-800 h-12">
            <div className="files flex overflow-x-auto no-scrollbar">
              {openFiles.map((file) => (
                <div
                  key={file}
                  className={`group relative flex items-center min-w-fit px-4 h-12 text-sm border-r border-gray-800 cursor-pointer transition-colors ${
                    CurrentFile === file
                      ? "bg-[#0d1117] text-white border-t-2 border-t-blue-500"
                      : "bg-[#010409] text-gray-500 hover:bg-[#0d1117] hover:text-gray-300"
                  }`}
                  onClick={() => setCurrentFile(file)}
                >
                  <span className="mr-2">{file}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Optional: Add logic to close file if needed, visually present
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-gray-700 text-gray-400"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              ))}
            </div>

            <div className="actions flex items-center gap-2 px-3 bg-[#010409]">
              {!runProcess ? (
                <button
                  onClick={handleRunClick}
                  disabled={isInstalling}
                  className={`flex items-center gap-2 py-1.5 px-4 text-xs font-bold rounded-md shadow-lg transition-all ${
                    isInstalling
                      ? "bg-yellow-600/20 text-yellow-500 cursor-wait border border-yellow-600/50"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-500/20"
                  }`}
                >
                  {isInstalling ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>{" "}
                      Installing
                    </>
                  ) : (
                    <>
                      <i className="ri-play-fill text-sm"></i> Run
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleStopClick}
                  className="flex items-center gap-2 py-1.5 px-4 text-xs font-bold rounded-md bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 transition-all"
                >
                  <i className="ri-stop-fill text-sm"></i> Stop
                </button>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="bottom flex flex-grow overflow-hidden relative">
            {CurrentFile &&
            fileTree[CurrentFile] &&
            fileTree[CurrentFile].file ? (
              <Editor
                height="100%"
                width="100%"
                path={CurrentFile}
                language={getLanguageFromFileName(CurrentFile)}
                theme="vs-dark"
                value={fileTree[CurrentFile].file.contents || ""}
                onChange={handleFileContentChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "JetBrains Mono, Menlo, monospace",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: "all",
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-[#0d1117]">
                <i className="ri-code-s-slash-line text-6xl mb-4 opacity-20"></i>
                <p>Select a file to edit</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview / Terminal Panel */}
        <div className="flex-grow min-w-[400px] flex flex-col h-full border-l border-gray-800 bg-[#0d1117]">
          {/* Tabs */}
          <div className="tabs flex items-center bg-[#010409] border-b border-gray-800 p-2 gap-2">
            <button
              onClick={() => setActiveTab("browser")}
              className={`flex items-center gap-2 py-1.5 px-4 text-xs font-medium rounded-md transition-all ${
                activeTab === "browser"
                  ? "bg-[#1f2937] text-blue-400 border border-gray-700"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#161b22]"
              }`}
            >
              <i className="ri-global-line"></i> Browser
            </button>
            <button
              onClick={() => setActiveTab("terminal")}
              className={`flex items-center gap-2 py-1.5 px-4 text-xs font-medium rounded-md transition-all ${
                activeTab === "terminal"
                  ? "bg-[#1f2937] text-green-400 border border-gray-700"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#161b22]"
              }`}
            >
              <i className="ri-terminal-box-line"></i> Terminal
            </button>
          </div>

          {/* Browser Content */}
          {activeTab === "browser" && (
            <div className="flex flex-col h-full bg-[#161b22]">
              <div className="address-bar p-2 bg-[#0d1117] border-b border-gray-800 flex items-center gap-2">
                <div className="flex gap-1.5 ml-1 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex-grow bg-[#010409] rounded-md flex items-center px-3 py-1.5 border border-gray-700">
                  <i className="ri-lock-line text-gray-500 text-xs mr-2"></i>
                  <input
                    type="text"
                    readOnly
                    value={iframeUrl || "http://localhost:3000"}
                    className="w-full bg-transparent text-gray-400 text-xs outline-none font-mono"
                  />
                  <i className="ri-refresh-line text-gray-500 text-xs cursor-pointer hover:text-white transition-colors"></i>
                </div>
              </div>

              <div className="flex-grow relative bg-white">
                {iframeUrl ? (
                  <iframe
                    src={iframeUrl}
                    className="w-full h-full border-none"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1117] text-gray-500">
                    <div className="w-16 h-16 rounded-full bg-[#1f2937] flex items-center justify-center mb-4 animate-bounce">
                      <i className="ri-rocket-2-fill text-2xl text-blue-500"></i>
                    </div>
                    <p className="font-medium">Ready to launch</p>
                    <p className="text-sm opacity-60 mt-1">
                      Click "Run" to start the development server.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Terminal Content */}
          {activeTab === "terminal" && (
            <div className="w-full h-full bg-[#0d1117] p-4 overflow-y-auto font-mono text-sm border-t border-gray-800">
              <div className="flex items-center justify-between mb-2 opacity-50">
                <span className="text-xs">Console Output</span>
                <button
                  onClick={() => setTerminalOutput("")}
                  className="text-xs hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-green-500 leading-tight">
                {terminalOutput || (
                  <span className="text-gray-600 italic">
                    Waiting for commands...
                  </span>
                )}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* ---------- ADD USER MODAL ---------- */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
          <div
            className="bg-[#161b22] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#0d1117]">
              <h2 className="text-lg font-bold text-white">
                Add Collaborators
              </h2>
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wide">
                  Find by email
                </label>
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-2.5 text-gray-500"></i>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-600 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
                    placeholder="search@example.com"
                  />
                </div>
              </div>

              <div className="h-48 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((modalUser) => {
                    const alreadyInProject = project?.users?.some(
                      (p) => p._id === modalUser._id
                    );
                    const isSelected = selectedUsers.includes(modalUser._id);
                    return (
                      <div
                        key={modalUser._id}
                        onClick={() =>
                          !alreadyInProject && handleUserSelect(modalUser._id)
                        }
                        className={`flex justify-between items-center p-3 rounded-md transition-all duration-200 ${
                          alreadyInProject
                            ? "opacity-50 cursor-not-allowed bg-gray-800/50"
                            : isSelected
                            ? "bg-blue-600/20 border border-blue-500/50 cursor-pointer"
                            : "hover:bg-gray-700/50 cursor-pointer border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                            {modalUser.email[0].toUpperCase()}
                          </div>
                          <span
                            className={`text-sm ${
                              alreadyInProject
                                ? "text-gray-500"
                                : "text-gray-200"
                            }`}
                          >
                            {modalUser.email}
                          </span>
                        </div>
                        {alreadyInProject && (
                          <span className="text-xs text-gray-500">Added</span>
                        )}
                        {!alreadyInProject && isSelected && (
                          <i className="ri-check-line text-blue-400 font-bold"></i>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p className="text-sm">No users found.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-gray-700 bg-[#0d1117] gap-3">
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCollaborators}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                disabled={selectedUsers.length === 0}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
