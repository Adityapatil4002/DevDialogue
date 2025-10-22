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

    const project = await projectModel.create({
        name,
        users: [userId]
    
    })

    return project;
}