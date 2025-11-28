import projectModel from "../Models/project.model.js";
import mongoose from "mongoose";


export const createProject = async ({ name, userId }) => {
  if (!name) {
    throw new Error("Project name is required");
  }
  if (!userId) {
    throw new Error("User id is required");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID format");
  }

  let project;
  try {
    project = await projectModel.create({
      name,
      users: [userId],
      owner: userId,
      // [ADDED] Default File Tree so the project isn't empty
      fileTree: {
        "app.js": {
          file: {
            contents: `import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});`,
          },
        },
        "package.json": {
          file: {
            contents: `{
  "name": "temp-server",
  "type": "module",
  "dependencies": {
    "express": "^4.18.2"
  },
  "scripts": {
    "start": "node app.js"
  }
}`,
          },
        },
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Project name already exists");
    }
    throw error;
  }

  return project;
};

// ... keep getAllProjectByUserId, addUsersToProject, getProjectById, updateFileTree, addMessage as they are in your code

export const getAllProjectByUserId = async (userId) => {
  if (!userId) {
    throw new Error("User id is required");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID format");
  }

  const alluserProjects = await projectModel.find({
    users: userId,
  });

  return alluserProjects;
};

export const addUsersToProject = async ({ projectId, users, userId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!users) {
    throw new Error("users are required");
  }

  if (
    !Array.isArray(users) ||
    users.some((userId) => !mongoose.Types.ObjectId.isValid(userId))
  ) {
    throw new Error("Invalid userId(s) in users array");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const project = await projectModel.findOne({
    _id: projectId,
    users: userId,
  });

  if (!project) {
    throw new Error("User not belong to this project");
  }

  const updatedProject = await projectModel.findOneAndUpdate(
    {
      _id: projectId,
    },
    {
      $addToSet: {
        users: {
          $each: users,
        },
      },
    },
    {
      new: true,
    }
  );

  return updatedProject;
};

export const getProjectById = async (projectId, userId) => {
  if (!projectId) {
    throw new Error("Project id is required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!userId) {
    throw new Error("User ID is required for authorization");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const project = await projectModel
    .findOne({
      _id: projectId,
      users: userId,
    })
    .populate("users");

  return project;
};

export const updateFileTree = async ({ projectId, fileTree }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!fileTree) {
    throw new Error("File tree is reauired");
  }

  const project = await projectModel.findOneAndUpdate(
    {
      _id: projectId,
    },
    {
      fileTree,
    },
    {
      new: true,
    }
  );

  return project;
};


export const addMessage = async ({ projectId, sender, senderId, message, isAi, replyTo }) => {
    const project = await projectModel.findByIdAndUpdate(
        projectId,
        {
            $push: {
                messages: {
                    sender,
                    senderId,
                    message,
                    isAi,
                    timestamp: new Date(),
                    replyTo // Save reply info
                }
            }
        },
        { new: true }
    );
    return project.messages[project.messages.length - 1];
};

// [NEW] DELETE FUNCTION
export const deleteMessage = async ({ projectId, messageId }) => {
    const project = await projectModel.findById(projectId);
    // Filter out the message with the specific ID
    project.messages = project.messages.filter(msg => msg._id.toString() !== messageId);
    await project.save();
    return project;
};