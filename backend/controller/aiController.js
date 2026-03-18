import * as aiService from '../service/aiService.js';
import Project from '../model/projectModel.js';
import Task from '../model/taskModel.js';

export const convertNotesToTasks = async (req, res) => {
    try {
        const { notes } = req.body;
        if (!notes) return res.status(400).json({ success: false, message: 'Notes required' });
        const tasks = await aiService.convertNotesToTasks(notes);
        res.status(200).json({ success: true, tasks });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const rewriteToUserStory = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.status(400).json({ success: false, message: 'Description required' });
        const userStory = await aiService.rewriteToUserStory(description);
        res.status(200).json({ success: true, result: userStory });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const generateKanbanStructure = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: 'Text required' });
        const structure = await aiService.generateKanbanStructure(text);
        res.status(200).json({ success: true, structure });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

export const getWorkspaceInsights = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const projects = await Project.find({ workspace: workspaceId }).select('_id name');
        const tasks = await Task.find({ project: { $in: projects.map(p => p._id) } }).select('title status dueDate priority');
        const insights = await aiService.generateWorkspaceInsights(workspaceId, projects, tasks);
        res.status(200).json({ success: true, insights });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
