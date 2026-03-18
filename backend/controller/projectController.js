import Project from '../model/projectModel.js';
import Workspace from '../model/workspaceModel.js';
import User from '../model/userModel.js';
import { checkProjectPermission } from '../utils/permissionUtils.js';

export const getProjects = async (req, res, next) => {
    try {
        const { workspace } = req.query;
        const query = {
            $or: [
                { owner: req.user._id },
                { members: { $elemMatch: { user: req.user._id, status: 'active' } } }
            ]
        };
        if (workspace) query.workspace = workspace;

        const projects = await Project.find(query)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: projects.length, projects });
    } catch (error) { next(error); }
};

export const getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .populate('workspace', 'name');

        if (!project || !checkProjectPermission(project, req.user._id, 'viewer')) {
            return res.status(403).json({ success: false, message: 'Not authorized or not found' });
        }

        res.status(200).json({ success: true, project });
    } catch (error) { next(error); }
};

export const createProject = async (req, res, next) => {
    try {
        const { name, description, workspace, color, columns } = req.body;
        const workspaceDoc = await Workspace.findById(workspace);
        if (!workspaceDoc) return res.status(404).json({ success: false, message: 'Workspace not found' });

        const project = await Project.create({
            name, description, workspace, owner: req.user._id, color,
            columns: columns || [
                { name: 'To Do', order: 0 },
                { name: 'In Progress', order: 1 },
                { name: 'Review', order: 2 },
                { name: 'Completed', order: 3 },
            ],
        });

        await project.populate('owner', 'name email avatar');
        res.status(201).json({ success: true, project });
    } catch (error) { next(error); }
};

export const updateProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project || project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('owner', 'name email avatar');

        res.status(200).json({ success: true, project: updatedProject });
    } catch (error) { next(error); }
};

export const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project || project.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Project deleted' });
    } catch (error) { next(error); }
};
