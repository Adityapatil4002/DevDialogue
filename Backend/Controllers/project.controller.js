import projectModel from '../Models/project.model.js';
import * as projectService from '../Services/project.service.js';
import userModel from '../Models/user.model.js';
import {validationResult} from 'express-validator';


export const createProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try { 
    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });

    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({
        name,
        userId
    })

    res.status(201).json(newProject);
    } catch (err) {
        res.status(400).send(err.message);
        console.log(err);
    
}

    
}

export const getAllProjects = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const alluserProjects = await projectService.getAllProjectByUserId(
      loggedInUser._id
    );

    return res.status(200).json({
      projects: alluserProjects,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const { projectId, users } = req.body;

        const loggedInUser = await userModel.findOne({
          email: req.user.email
        })
      
      const project = await projectService.addUsersToProject({
        projectId,
        users,
        userId: loggedInUser._id
      });

      return res.status(200).json({
        project,

      })


    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    
    }
}

export const getProjectById = async (req, res) => {
  const { projectId } = req.params; // The ID from the URL

  try {

    const userId = req.user._id;

    const project = await projectService.getProjectById(projectId, userId);

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found or you do not have access" });
    }

    return res.status(200).json({
      project,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};

export const updateFileTree = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { projectId, fileTree } = req.body;

    const project = await projectService.updateFileTree({
      projectId,
      fileTree
    })

    return res.status(200).json({
      project
    })

  } catch (error) {
    console.log(err)
    res.status(400).json({error: err.message})
    
  }
}