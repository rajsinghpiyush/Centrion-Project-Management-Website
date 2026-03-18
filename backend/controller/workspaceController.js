import Workspace from '../model/workspaceModel.js';
import User from '../model/userModel.js';

export const getWorkspaces = async (req, res, next) => {
    try {
        const workspaces = await Workspace.find({
            $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
        })
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: workspaces.length, workspaces });
    } catch (error) { next(error); }
};

export const getWorkspace = async (req, res, next) => {
    try {
        const workspace = await Workspace.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');
        if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });
        res.status(200).json({ success: true, workspace });
    } catch (error) { next(error); }
};

export const createWorkspace = async (req, res, next) => {
    try {
        const { name, description, avatar } = req.body;
        const workspace = await Workspace.create({
            name, description, avatar, owner: req.user._id,
            members: [{ user: req.user._id, role: 'admin' }],
        });
        await workspace.populate('owner', 'name email avatar');
        res.status(201).json({ success: true, workspace });
    } catch (error) { next(error); }
};

export const updateWorkspace = async (req, res, next) => {
    try {
        const workspace = await Workspace.findById(req.params.id);
        if (!workspace || workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const updatedWorkspace = await Workspace.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('owner', 'name email avatar');
        res.status(200).json({ success: true, workspace: updatedWorkspace });
    } catch (error) { next(error); }
};

export const deleteWorkspace = async (req, res, next) => {
    try {
        const workspace = await Workspace.findById(req.params.id);
        if (!workspace || workspace.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await Workspace.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Workspace deleted' });
    } catch (error) { next(error); }
};
