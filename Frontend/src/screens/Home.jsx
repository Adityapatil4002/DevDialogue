import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../Context/user.context";
import axios from "../Config/axios";
import { useNavigate } from "react-router-dom"; // Ensure this is imported

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const navigate = useNavigate(); // Initialize navigate hook

  function createProject(e) {
    e.preventDefault();
    console.log("Creating project:", projectName);
    axios
      .post("/project/create", {
        name: projectName,
      })
      .then((res) => {
        console.log("Project created:", res.data);
        setProject((prevProjects) => [...prevProjects, res.data]);
      })
      .catch((error) => {
        console.log(error);
      });
    setIsModalOpen(false);
    setProjectName("");
  }

  useEffect(() => {
    axios
      .get("/project/all")
      .then((res) => {
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <main className="p-4">
      <div className="projects flex flex-wrap gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="project p-4 border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer min-h-[100px]" // Added min-height and cursor
        >
          <i className="ri-add-line mr-2"></i>
          Create New Project
        </button>
        {project &&
          project.map((proj) => (
            <div
              key={proj._id}
              // --- THIS IS THE FIX ---
              // Navigate to the correct path including the project ID
              // Remove the state object
              onClick={() => navigate(`/project/${proj._id}`)}
              // --- END OF FIX ---
              className="project p-4 border border-slate-300 rounded-md hover:bg-slate-200 transition-colors min-w-52 cursor-pointer flex flex-col justify-between min-h-[100px]" // Added min-height
            >
              <h3 className="text-lg font-semibold text-gray-800 break-words">
                {" "}
                {/* Added break-words */}
                {proj.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                {" "}
                {/* Improved styling */}
                <i className="ri-user-line"></i>
                <span>Collaborators:</span>
                <span className="font-medium">{proj.users.length}</span>
              </div>
            </div>
          ))}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" // Added padding
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-md" // Adjusted padding
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              {" "}
              {/* Adjusted margin */}
              <h2 className="text-xl font-bold text-gray-800">
                {" "}
                {/* Adjusted size */}
                Create a New Project
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700" // Adjusted hover
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label
                  htmlFor="projectName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" // Added focus styles
                  placeholder="My Awesome Project"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors" // Adjusted colors
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
