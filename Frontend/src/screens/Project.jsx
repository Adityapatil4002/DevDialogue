import React, { useState, useEffect } from "react";
// Import useParams
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "../Config/axios";
import { initializeSocket } from "../Config/socket";

const Project = () => {
  const location = useLocation();
  // --- Get projectId from URL ---
  const { projectId } = useParams(); // e.g., if your route is /project/:projectId

  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // --- Initialize project state to null, add loading/error state ---
  const [project, setProject] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    initializeSocket();




    // Only fetch if projectId is valid
    if (projectId) {
      setLoading(true);
      setError(null); // Reset error state on new fetch

      // --- Fetch project data using projectId from URL ---
      axios
        .get(`/project/get-project/${projectId}`)
        .then((res) => {
          setProject(res.data.project);
        })
        .catch((err) => {
          console.error("Error fetching project:", err);
          setError("Failed to load project details."); // Set error message
        })
        .finally(() => {
          setLoading(false); // Stop loading regardless of success/failure
        });

      // --- Fetch all users for the modal ---
      axios
        .get("/user/all")
        .then((res) => setAllUsers(res.data.users))
        .catch((err) => console.log("Error fetching users:", err));
    } else {
      setError("No Project ID found in URL.");
      setLoading(false);
    }
  }, [projectId]); // Depend on projectId from URL

  const handleUserSelect = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId);
      } else {
        return [...prevSelected, userId];
      }
    });
  };

  const filteredUsers = allUsers.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitCollaborators = () => {
    console.log("Adding these user IDs to the project:", selectedUsers);

    // --- Use projectId from URL params ---
    console.log("Using projectId:", projectId);

    if (!projectId) {
      console.error("Cannot add collaborators: Project ID is missing.");
      return; // Prevent API call if ID is missing
    }

    axios
      .put("/project/add-user", {
        projectId: projectId, // Use ID from URL
        users: selectedUsers,
      })
      .then((res) => {
        setProject(res.data.project); // Update state with the returned project
      })
      .catch((err) => {
        console.error("Error adding collaborators:", err);
        // You might want to show an error message to the user here
      });

    setAddUserModalOpen(false);
    setSelectedUsers([]);
    setSearchTerm("");
  };

  // --- Handle Loading and Error States ---
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
        {error || "Project not found."}
      </div>
    );
  }
  // --- End Loading/Error Handling ---

  return (
    // ... rest of your JSX remains largely the same ...
    // Make sure to use 'project' state safely now that it might initially be null
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-full min-w-80 bg-slate-300 overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100">
          {/* Display Project Name if available */}
          <h1 className="text-lg font-semibold">
            {project ? project.name : "Project"}
          </h1>
          <button
            onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
            className="p-2 "
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        {/* Conversation Area */}
        <div className="conversation-area flex-grow flex flex-col">
          {/* Messages */}
          <div className="message-box p-1 flex-grow flex flex-col gap-1 overflow-y-auto">
            {" "}
            {/* Added overflow */}
            {/* Example Messages - Replace with actual messages later */}
            <div className="message max-w-xs md:max-w-md flex flex-col p-2 bg-slate-50 w-fit rounded-md shadow">
              <small className="opacity-65 text-sm font-medium text-blue-600">
                brenda@example.com
              </small>
              <p className="text-sm text-gray-800">
                Hey Carlos, did you see the latest design mockups?
              </p>
              <small className="text-xs text-gray-400 self-end mt-1">
                1:15 PM
              </small>
            </div>
            <div className="ml-auto max-w-xs md:max-w-md message flex flex-col p-2 bg-blue-500 text-white w-fit rounded-md shadow">
              <small className="opacity-80 text-sm font-medium">
                carlos@example.com
              </small>
              <p className="text-sm">
                Yeah, just looked at them. They look great!
              </p>
              <small className="text-xs text-blue-100 self-end mt-1">
                1:16 PM
              </small>
            </div>
            <div className="message max-w-xs md:max-w-md flex flex-col p-2 bg-slate-50 w-fit rounded-md shadow">
              <small className="opacity-65 text-sm font-medium text-purple-600">
                devin@example.com
              </small>
              <p className="text-sm text-gray-800">
                Agreed! The color scheme is much better now.
              </p>
              <small className="text-xs text-gray-400 self-end mt-1">
                1:17 PM
              </small>
            </div>
          </div>
          {/* Input */}
          <div className="inputField w-full flex border-t border-slate-400">
            <input
              className="p-3 px-4 border-none outline-none flex-grow bg-slate-200 text-gray-800 placeholder-gray-500"
              type="text"
              placeholder="Enter message..."
            />
            <button className="px-5 bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        {/* --- Side Panel --- */}
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all duration-300 ease-in-out ${
            // Added duration
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 z-10`} // Added z-index
        >
          <header className="flex justify-between items-center px-3 p-2 bg-slate-200 border-b border-slate-300">
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="flex items-center gap-2 p-2 rounded hover:bg-slate-300 transition-colors" // Style button
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
            {" "}
            {/* Added padding & overflow */}
            <h3 className="text-xs uppercase text-gray-500 font-semibold px-2 mb-1">
              Collaborators
            </h3>
            {/* Use project state */}
            {project &&
              project.users &&
              project.users.map((user) => {
                return (
                  <div
                    key={user._id}
                    className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-3 items-center rounded-md transition-colors"
                  >
                    {" "}
                    {/* Increased gap */}
                    {/* Avatar */}
                    <div className="relative flex-shrink-0 aspect-square rounded-full w-10 h-10 flex items-center justify-center text-white bg-slate-600">
                      {/* Simple Initial */}
                      <span className="text-lg font-bold uppercase">
                        {user.email ? user.email[0] : "?"}
                      </span>
                      {/* <i className="ri-user-fill absolute text-xl"></i> */}
                    </div>
                    {/* Email */}
                    <h1 className="font-medium text-gray-800 truncate">
                      {user.email}
                    </h1>{" "}
                    {/* Added truncate */}
                  </div>
                );
              })}
            {/* Add a message if no users */}
            {project && project.users && project.users.length === 0 && (
              <p className="text-center text-gray-500 mt-4">
                No collaborators yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* --- Add User Modal --- */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
          <div
            className="bg-white rounded-lg shadow-xl z-50 w-full max-w-md flex flex-col" // Added flex-col
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
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

            {/* Modal Body */}
            <div className="p-4 flex-grow">
              {" "}
              {/* Added flex-grow */}
              {/* Search Input */}
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
              {/* User List */}
              <ul className="h-64 overflow-y-auto border rounded-md">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    // Prevent adding users already in the project
                    const alreadyInProject = project?.users?.some(
                      (pUser) => pUser._id === user._id
                    );
                    const isSelected = selectedUsers.includes(user._id);

                    return (
                      <li
                        key={user._id}
                        // Disable clicking if user is already in project
                        onClick={() =>
                          !alreadyInProject && handleUserSelect(user._id)
                        }
                        className={`flex justify-between items-center p-3 ${
                          alreadyInProject
                            ? "bg-slate-100 text-gray-400 cursor-not-allowed" // Style for existing users
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
                          {user.email}
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

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
              {" "}
              {/* Added bg color */}
              <button
                onClick={() => setAddUserModalOpen(false)}
                type="button"
                className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded border border-gray-300 mr-3 transition-colors" // Adjusted style
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCollaborators}
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed transition-colors" // Added disabled cursor
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
