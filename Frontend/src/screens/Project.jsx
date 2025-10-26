import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "../Config/axios";
import { set } from "mongoose";

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false);

  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [users, setUsers] = useState([]);

  useEffect(() => {

    axios.get(`/project/get-project/${location.state.project._id}`).then(res => {
      console.log(res.data.project);
      setProject(res.data.project);

    })


    axios.get('/user/all').then(res => setAllUsers(res.data.users)).catch(err => console.log(err));
    setAllUsers([]);
  }, []);

  const handleUserSelect = (userId) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        // User is already selected, so remove them
        return prevSelected.filter((id) => id !== userId);
      } else {
        // User is not selected, so add them
        return [...prevSelected, userId];
      }
    });
  };

  const filteredUsers = allUsers.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitCollaborators = () => {
    console.log("Adding these user IDs to the project:", selectedUsers);
    axios.put('/project/add-user', { projectId: '...', users: selectedUsers });
    setAddUserModalOpen(false);
    setSelectedUsers([]);
    setSearchTerm("");
  };

  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-full min-w-80 bg-slate-300 overflow-hidden">
        <header className="flex justify-end p-2 px-4 w-full bg-slate-100">
          <button
            onClick={() => setisSidePanelOpen(!isSidePanelOpen)}
            className="p-2 "
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex-grow flex flex-col">
          {/* ... your existing message box and input field ... */}
          <div className="message-box p-1 flex-grow flex flex-col gap-1">
            <div className="message max-w-56 flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className="opacity-65 text-sm">example@gmail.com</small>
              <p className="test-sm">
                ipsum dolor sit amet.ipsum dolor sit amet.
              </p>
            </div>
            <div className="ml-auto max-w-56 message flex flex-col p-2 bg-slate-50 w-fit rounded-md">
              <small className="opacity-65 text-sm">example@gmail.com</small>
              <p className="test-sm">ipsum dolor sit amet.</p>
            </div>
          </div>
          <div className="inputField w-full flex ">
            <input
              className="p-2 px-4 border-none outline-none flex-grow"
              type="text"
              placeholder="Enter message"
            />
            <button className=" px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        {/* --- Side Panel --- */}
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-between items-center px-3 p-2 bg-slate-200 ">
            {/* This button now opens the new modal */}
            <button
              onClick={() => setAddUserModalOpen(true)}
              className="flex gap-2"
            >
              <i className="ri-add-fill mr-1"></i>
              <p>Add Collaborators</p>
            </button>
            <button onClick={() => setisSidePanelOpen(false)} className="p-2 ">
              <i className="ri-close-fill"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2">

            {}

          </div>
        </div>
      </section>

      {/* --- Add User Modal --- */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
          <div
            className="bg-white rounded-lg shadow-xl z-50 w-full max-w-md"
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
            <div className="p-4">
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
                    const isSelected = selectedUsers.includes(user._id);
                    return (
                      <li
                        key={user._id}
                        onClick={() => handleUserSelect(user._id)}
                        className={`flex justify-between items-center p-3 cursor-pointer ${
                          isSelected ? "bg-blue-100" : "hover:bg-slate-100"
                        } border-b last:border-b-0`}
                      >
                        <span className="font-medium text-gray-700">
                          {user.email}
                        </span>
                        {isSelected && (
                          <i className="ri-check-line text-blue-600 font-bold"></i>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className="p-4 text-center text-gray-500">
                    No users found.
                  </li>
                )}
              </ul>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setAddUserModalOpen(false)}
                type="button"
                className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded border mr-3"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCollaborators}
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
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
