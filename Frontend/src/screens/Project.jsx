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
import Editor from "@monaco-editor/react"; // 1. Import VS Code's editor

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
  const saveTimeout = useRef(null); // Ref for debouncing file save

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
          // Load saved file tree from the project
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

              // 3. Update code from AI (merge, don't replace)
              if (data.isAi && data.filetree) {
                const newFiles = Object.keys(data.filetree);
                
                setFileTree(prevFileTree => {
                  const mergedFileTree = {
                    ...prevFileTree,
                    ...data.filetree
                  };
                  // Save the newly merged file tree to DB
                  saveFileTree(mergedFileTree);
                  return mergedFileTree;
                });

                // Open the new/updated files
                if (newFiles.length > 0) {
                  setCurrentFile(newFiles[0]);
                  setOpenFiles((prevOpen) => {
                    const allOpen = [...prevOpen];
                    newFiles.forEach(file => {
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
  }, [projectId, user?._id, webContainer]); // Added webContainer to dependency array

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
          <div className="p-2 bg-slate-700 rounded text-xs font-mono">
            <strong>Build:</strong> {msgObj.buildCommand.mainItem}{" "}
            {msgObj.buildCommand.commands.join(" ")}
          </div>
        )}
        {msgObj.startCommand && (
          <div className="p-2 bg-slate-700 rounded text-xs font-mono">
            <strong>Start:</strong> {msgObj.startCommand.mainItem}{" "}
            {msgObj.startCommand.commands.join(" ")}
          </div>
        )}
      </div>
    );
  };

  // 2. Function to save file tree to DB
  const saveFileTree = (fileTreeToSave) => {
    if (!project?._id) return;
    
    console.log("Saving file tree...");
    axios.put('/project/update-file-tree', {
      projectId: project._id,
      fileTree: fileTreeToSave
    }).then(res => {
      console.log("File tree saved successfully.", res.data);
    }).catch(err => {
      console.error("Error saving file tree:", err);
    });
  };

  // 2. Debounced save on file change
  const handleFileContentChange = (newValue) => {
    // Update state immediately for responsive UI
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

    // Clear existing timeout
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    // Set new timeout to save after 1.5s of no typing
    saveTimeout.current = setTimeout(() => {
      saveFileTree(newFileTree);
    }, 1500);
  };
  
  // 1. Improved Run/Stop logic
  const handleRunClick = async () => {
    if (!webContainer) return;

    setTerminalOutput(""); // Clear terminal
    setIsInstalling(true);
    setActiveTab("terminal"); // Show terminal

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
        setActiveTab("browser"); // Switch to browser when ready
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
      <div className="flex justify-center items-center h-screen">
        Loading project...
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error || "Project could not be loaded."}
      </div>
    );
  }

  return (
    <main className="h-screen w-screen flex">
      {/* ---------- CHAT PANEL ---------- */}
      <section className="relative flex flex-col h-full min-w-80 w-full md:w-96 lg:w-[400px] bg-slate-300 overflow-hidden border-r border-slate-400">
        {/* Header, Conversation, Input... (unchanged) */}
        <header className="flex justify-between items-center p-2 px-4 bg-slate-100 border-b border-slate-200">
          <h1 className="text-lg font-semibold truncate" title={project.name}>
            {project.name}
          </h1>
          <button
            onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
            className="p-2 rounded hover:bg-slate-200 transition-colors"
          >
            <i className="ri-group-fill text-xl"></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col overflow-hidden">
          <style>
            {`
              .message-box::-webkit-scrollbar { display:none; }
              .message-box { -ms-overflow-style:none; scrollbar-width:none; }
            `}
          </style>

          <div className="message-box p-2 flex-grow flex flex-col gap-2 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={msg.timestamp || `optimistic-${i}`}
                className={`flex ${
                  msg.sender?._id === user?._id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-xs md:max-w-md flex flex-col p-3 rounded-lg shadow
                    ${
                      msg.sender?._id === user?._id
                        ? "bg-blue-500 text-white"
                        : msg.isAi
                        ? "bg-slate-800 text-white"
                        : "bg-slate-50 text-gray-800"
                    }
                  `}
                >
                  {msg.sender?._id !== user?._id && !msg.isAi && (
                    <small className="opacity-80 text-xs font-medium text-blue-600 mb-1">
                      {msg.sender.email || "Unknown User"}
                    </small>
                  )}

                  {msg.isAi ? (
                    <AiMessage raw={msg.message} />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                  )}

                  <small
                    className={`text-xs self-end mt-1 ${
                      msg.sender?._id === user?._id
                        ? "text-blue-100 opacity-70"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString(
                      [],
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}
                  </small>
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10">
                No messages yet.
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <div className="inputField w-full flex border-t border-slate-400">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && send()}
              className="p-3 px-4 border-none outline-none flex-grow bg-slate-200 text-gray-800 placeholder-gray-500"
              placeholder="Enter message..."
            />
            <button
              onClick={send}
              className="px-5 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!message.trim()}
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-transform duration-300 ease-in-out ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 z-10`}
        >
          {/* Side Panel Content... (unchanged) */}
          <header className="flex justify-between items-center px-3 p-2 bg-slate-200 border-b border-slate-300">
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="flex items-center gap-2 p-2 rounded hover:bg-slate-300 transition-colors"
            >
              <i className="ri-add-fill mr-1"></i>
              <p className="font-medium">Add Collaborators</p>
            </button>
            <button
              onClick={() => setisSidePanelOpen(false)}
              className="p-2 rounded hover:bg-slate-300 transition-colors"
            >
              <i className="ri-close-fill text-xl"></i>
            </button>
          </header>
          <div className="users flex-grow flex flex-col gap-1 p-2 overflow-y-auto">
            <h3 className="text-xs uppercase text-gray-500 font-semibold px-2 mb-1">
              Collaborators
            </h3>
            {project?.users?.map((u) => (
              <div
                key={u._id}
                className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-3 items-center rounded-md transition-colors"
              >
                <div className="relative flex-shrink-0 aspect-square rounded-full w-10 h-10 flex items-center justify-center text-white bg-slate-600">
                  <span className="text-lg font-bold uppercase">
                    {u.email?.[0] ?? "?"}
                  </span>
                </div>
                <h1 className="font-medium text-gray-800 truncate">
                  {u.email}
                </h1>
              </div>
            ))}
            {(!project?.users || project.users.length === 0) && (
              <p className="text-center text-gray-500 mt-4">
                No collaborators yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ---------- RIGHT PANEL: FILE TREE + EDITOR ---------- */}
      <section className="right bg-gray-900 flex-grow h-full flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-800 text-white">
          <div className="file-tree w-full">
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
                  className={`tree-element cursor-pointer p-2 px-4 flex items-center gap-2 w-full text-left ${
                    CurrentFile === file ? "bg-slate-700" : "hover:bg-slate-700"
                  }`}
                >
                  <p className="font-medium text-sm">{file}</p>
                </button>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-400">No files yet.</p>
            )}
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full w-1/2">
          <div className="top-bar flex overflow-x-auto bg-slate-800">
            <div className="files flex-grow flex">
              {openFiles.map((file) => (
                <button
                  key={file}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer py-2 px-4 flex items-center w-fit gap-2 ${
                    CurrentFile === file
                      ? "bg-gray-900 text-white"
                      : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                  }`}
                >
                  <p className="font-medium text-sm">{file}</p>
                </button>
              ))}
            </div>

            <div className="actions flex gap-2 p-1 bg-slate-800">
              {/* 1. Updated Run/Stop Buttons */}
              {!runProcess ? (
                <button
                  onClick={handleRunClick}
                  disabled={isInstalling}
                  className={`p-2 px-4 text-sm rounded ${
                    isInstalling
                      ? "bg-yellow-600 cursor-wait"
                      : "bg-green-600 hover:bg-green-700"
                  } text-white`}
                >
                  {isInstalling ? "Installing..." : "Run"}
                </button>
              ) : (
                <button
                  onClick={handleStopClick}
                  className="p-2 px-4 text-sm rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
          <div className="bottom flex flex-grow bg-gray-900">
            {/* 4. VS Code Editor */}
            {CurrentFile && fileTree[CurrentFile] && fileTree[CurrentFile].file ? (
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
                  scrollBeyondLastLine: false,
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Select a file to start editing.
              </div>
            )}
          </div>
        </div>

        {/* 1. Terminal / Browser View */}
        <div className="flex-grow min-w-96 flex-col h-full flex bg-white">
          <div className="tabs flex bg-slate-200">
            <button
              onClick={() => setActiveTab("browser")}
              className={`p-2 px-4 text-sm font-medium ${
                activeTab === "browser"
                  ? "bg-white text-black"
                  : "bg-slate-200 text-gray-600 hover:bg-slate-300"
              }`}
            >
              Browser
            </button>
            <button
              onClick={() => setActiveTab("terminal")}
              className={`p-2 px-4 text-sm font-medium ${
                activeTab === "terminal"
                  ? "bg-gray-900 text-white"
                  : "bg-slate-200 text-gray-600 hover:bg-slate-300"
              }`}
            >
              Terminal
            </button>
          </div>

          {activeTab === 'browser' && (
            <div className="flex flex-col h-full">
              <div className="address-bar">
                <input type="text"
                  readOnly={true} // Make read-only
                  value={iframeUrl || "http://localhost:..."} className="w-full p-2 px-4 bg-slate-100 text-gray-600 text-sm"
                />
              </div>
              {iframeUrl ? (
                 <iframe src={iframeUrl} className="w-full h-full"></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Click "Run" to start the server.
                </div>
              )}
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="w-full h-full bg-gray-900 text-white p-4 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {terminalOutput || "Click 'Run' to install dependencies and start the server..."}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* ---------- ADD USER MODAL ---------- */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
          <div
            className="bg-white rounded-lg shadow-xl z-50 w-full max-w-md flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Content... (unchanged) */}
            <div className="flex justify-between items-center p-4 border-b flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                Add Collaborators
              </h2>
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <div className="p-4 flex-grow overflow-y-auto">
              <div className="mb-4">
                <label
                  htmlFor="userSearch"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Find by email
                </label>
                <input
                  type="text"
                  id="userSearch"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Start typing an email..."
                />
              </div>
              <ul className="h-64 border rounded-md overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((modalUser) => {
                    const alreadyInProject = project?.users?.some(
                      (p) => p._id === modalUser._id
                    );
                    const isSelected = selectedUsers.includes(modalUser._id);
                    return (
                      <li
                        key={modalUser._id}
                        onClick={() =>
                          !alreadyInProject && handleUserSelect(modalUser._id)
                        }
                        className={`flex justify-between items-center p-3 ${
                          alreadyInProject
                            ? "bg-slate-100 text-gray-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-100 cursor-pointer"
                            : "hover:bg-slate-100 cursor-pointer"
                        } border-b last:border-b-0 transition-colors`}
                      >
                        <span
                          className={`font-medium ${
                            alreadyInProject ? "" : "text-gray-700"
                          }`}
                        >
                          {modalUser.email}
                          {alreadyInProject && (
                            <span className="text-xs ml-2">
                              (Already added)
                            </span>
                          )}
                        </span>
                        {!alreadyInProject && isSelected && (
                          <i className="ri-check-line text-blue-600 font-bold"></i>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className="p-4 text-center text-gray-500">
                    No users found matching "{searchTerm}".
                  </li>
                )}
              </ul>
            </div>
            <div className="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg flex-shrink-0">
              <button
                onClick={() => setAddUserModalOpen(false)}
                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded border border-gray-300 mr-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCollaborators}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={selectedUsers.length === 0}
              >
                Add {selectedUsers.length > 0 && `(${selectedUsers.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;




