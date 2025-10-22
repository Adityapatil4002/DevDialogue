import projectModel from '../Models/project.model.js';

export const createProject = async ({
    name,
    userId
}) => {
    if (!name) {
        throw new Error('Project name is required');
    
    }
    if (!userId) {
        throw new Error('User id is required');

    }

    let project;
    try {
        project = await projectModel.create({
            name,
            users: [userId]
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project;
}