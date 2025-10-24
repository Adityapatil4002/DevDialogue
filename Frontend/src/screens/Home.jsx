import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../Context/user.context";
import axios from "../Config/axios";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]); // Initial state is good!

  function createProject(e) {
    e.preventDefault();
    console.log("Creating project:", projectName);
    axios
      .post("/project/create", {
        name: projectName,
      })
      .then((res) => {
        console.log("Project created:", res.data);
        // Add the new project to the list without a full refresh
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
          className="project p-4 border border-slate-300 rounded-md flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <i className="ri-add-line mr-2"></i>
          Create New Project
        </button>
        {/* Add a check for 'project' to be safe */}
        {project &&
          project.map((proj) => (
            <div
              key={proj._id}
              className="project p-4 border border-slate-300 rounded-md hover:bg-slate-200 transition-colors min-w-52 hover:bg-slate-200 cursor-pointer flex flex-col justify-between"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {proj.name}
              </h3>
              <div className="flex gap-2">
                <p>
                  <small>
                    <i className="ri-user-line"></i>
                  </small>
                  <small>Collaborators:</small>
                </p>

                <small>{proj.users.length}</small>
              </div>
            </div>
          ))}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-8 rounded-lg shadow-xl z-50 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Create a New Project
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
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
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="My Awesome Project"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
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
