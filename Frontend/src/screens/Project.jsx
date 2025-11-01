import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "../Config/axios";
import {
  initializeSocket,
  recieveMessage,
  sendMessage,
  disconnectSocket, // Import the new disconnect function
} from "../Config/socket";
import { UserContext } from "../Context/user.context.jsx";

const Project = () => {
  const location = useLocation();
  const { projectId } = useParams();
  const { user } = useContext(UserContext); // Get logged-in user context

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
  // Removed: messageBox ref (no longer needed)

  useEffect(() => {
    let isMounted = true;
    let cleanupMessageListener = null; // To store the cleanup function

    const fetchProjectAndUsers = async () => {
      if (!projectId) {
        setError("No Project ID found in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const projectRes = await axios.get(`/project/get-project/${projectId}`);
        if (isMounted && projectRes.data.project) {
          const fetchedProject = projectRes.data.project;
          setProject(fetchedProject);
          initializeSocket(projectId); // This will now only run once

          // --- FIX: Store the returned cleanup function ---
          cleanupMessageListener = recieveMessage("project-message", (data) => {
            console.log("Received message:", data);
            // Removed: appendIncomingMessage(data);
            if (isMounted) {
              // Update state based on received data
              setMessages((prev) => {
                // Check if message (by timestamp or optimistic flag) already exists
                // This is a safeguard if server emits back to sender
                const exists = prev.some(
                  (m) =>
                    (m.isOptimistic &&
                      m.message === data.message &&
                      m.sender._id === data.sender._id) || // Check optimistic
                    m.timestamp === data.timestamp // Check timestamp
                );

                // If it's an optimistic message, replace it with the server version
                if (exists && data.sender._id === user?._id) {
                  return prev.map((m) =>
                    m.isOptimistic &&
                    m.message === data.message &&
                    m.sender._id === data.sender._id
                      ? data // Replace optimistic with server data
                      : m
                  );
                }

                // If it's a new incoming message, add it
                if (!exists) {
                  return [...prev, data];
                }

                // Otherwise, it's a duplicate, return previous state
                return prev;
              });
            }
          });
          // --- END FIX ---
        } else if (isMounted) {
          setError("Project not found or failed to load.");
        }

        const usersRes = await axios.get("/user/all");
        if (isMounted) {
          setAllUsers(usersRes.data.users);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isMounted) {
          setError("Failed to load project details or users.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProjectAndUsers();

    // --- FIX: Use the cleanup function on unmount ---
    return () => {
      isMounted = false;
      if (cleanupMessageListener) {
        cleanupMessageListener(); // Remove the 'project-message' listener
      }
      disconnectSocket(); // Disconnect socket and clear instance
    };
    // --- END FIX ---
  }, [projectId, user?._id]); // Add user._id as dependency for message logic

  // ... (handleUserSelect and other functions remain the same) ...
  const handleUserSelect = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
      u._id !== user?._id
  );

  const handleSubmitCollaborators = () => {
    console.log("Adding these user IDs to the project:", selectedUsers);
    console.log("Using projectId:", projectId);

    if (!projectId) {
      console.error("Cannot add collaborators: Project ID is missing.");
      return;
    }

    axios
      .put("/project/add-user", {
        projectId: projectId,
        users: selectedUsers,
      })
      .then((res) => {
        setProject(res.data.project);
      })
      .catch((err) => {
        console.error("Error adding collaborators:", err);
      });

    setAddUserModalOpen(false);
    setSelectedUsers([]);
    setSearchTerm("");
  };

  const send = () => {
    if (!message.trim() || !user?._id || !projectId) {
      console.log(
        "Cannot send message: Missing message, logged-in user ID, or project ID"
      );
      return;
    }
    const messageData = {
      projectId: projectId,
      message: message,
      sender: {
        _id: user._id,
        email: user.email,
      },
    };
    sendMessage("project-message", messageData); // Send to server

    // --- FIX: REMOVED manual DOM append ---
    // Removed: appendoutgoingMessage(messageData);

    // ONLY update React state
    // Add a temporary timestamp for optimistic rendering
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

  // --- FIX: Removed the append... functions ---
  // Removed: function appendIncomingMessage(messageObject) { ... }
  // Removed: function appendoutgoingMessage(messageObject) { ... }
  // --- END FIX ---

  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-full min-w-80 w-full md:w-96 lg:w-[450px] bg-slate-300 overflow-hidden border-r border-slate-400">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 border-b border-slate-200">
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

        {/* Conversation Area */}
        <div className="conversation-area flex-grow flex flex-col">
          {/* Message Box - Now 100% controlled by React state */}
          <div
            // Removed: ref={messageBox}
            className="message-box p-2 flex-grow flex flex-col gap-2 overflow-y-auto"
          >
            {/* Map over actual messages from state */}
            {messages.map((msg, index) => (
              <div
                key={msg.timestamp || `optimistic-${index}`} // Use timestamp or index
                className={`flex ${
                  msg.sender._id === user?._id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`message max-w-xs md:max-w-md flex flex-col p-2 rounded-lg shadow ${
                    msg.sender._id === user?._id
                      ? "bg-blue-500 text-white"
                      : "bg-slate-50"
                  }`}
                >
                  {/* Show sender email only if it's not the current user */}
                  {msg.sender._id !== user?._id && (
                    <small className="opacity-80 text-xs font-medium text-blue-600 mb-1">
                      {msg.sender.email || "Unknown User"}
                    </small>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <small
                    className={`text-xs self-end mt-1 ${
                      msg.sender._id === user?._id
                        ? "text-blue-100 opacity-70"
                        : "text-gray-400"
                    }`}
                  >
                    {/* Format timestamp */}
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString(
                      [],
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}
                    {msg.isOptimistic && (
                      <span className="ml-1 opacity-50">(Sending...)</span>
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
          </div>
          {/* Input */}
          <div className="inputField w-full flex border-t border-slate-400">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && send()}
              className="p-3 px-4 border-none outline-none flex-grow bg-slate-200 text-gray-800 placeholder-gray-500"
              type="text"
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
        {/* Side Panel */}
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-transform duration-300 ease-in-out ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 z-10`}
        >
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
            {project &&
              project.users &&
              project.users.map((u) => {
                return (
                  <div
                    key={u._id}
                    className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-3 items-center rounded-md transition-colors"
                  >
                    <div className="relative flex-shrink-0 aspect-square rounded-full w-10 h-10 flex items-center justify-center text-white bg-slate-600">
                      <span className="text-lg font-bold uppercase">
                        {u.email ? u.email[0] : "?"}
                      </span>
                    </div>
                    <h1 className="font-medium text-gray-800 truncate">
                      {u.email}
                    </h1>
                  </div>
                );
              })}
            {project && project.users && project.users.length === 0 && (
              <p className="text-center text-gray-500 mt-4">
                No collaborators yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
          <div
            className="bg-white rounded-lg shadow-xl z-50 w-full max-w-md flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
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
                      (pUser) => pUser._id === modalUser._id
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
                type="button"
                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded border border-gray-300 mr-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCollaborators}
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={selectedUsers.length === 0}
              >
                Add{" "}
                {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
