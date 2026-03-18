import Document from '../model/documentModel.js';
import Project from '../model/projectModel.js';
import { checkProjectPermission } from '../utils/permissionUtils.js';

export const getDocuments = async (req, res, next) => {
    try {
        const { project } = req.query;
        if (!project) return res.status(400).json({ success: false, message: 'Project required' });
        const projectDoc = await Project.findById(project);
        if (!projectDoc || !checkProjectPermission(projectDoc, req.user._id, 'viewer')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const documents = await Document.find({ project }).populate('author', 'name email avatar').sort({ updatedAt: -1 });
        res.status(200).json({ success: true, count: documents.length, documents });
    } catch (error) { next(error); }
};

export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id).populate('author', 'name email avatar').populate('relatedTasks', 'title status');
        if (!document) return res.status(404).json({ success: false, message: 'Not found' });
        const projectDoc = await Project.findById(document.project);
        if (!checkProjectPermission(projectDoc, req.user._id, 'viewer')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.status(200).json({ success: true, document });
    } catch (error) { next(error); }
};

export const createDocument = async (req, res, next) => {
    try {
        const { title, content, project, type, relatedTasks } = req.body;
        const projectDoc = await Project.findById(project);
        if (!projectDoc || !checkProjectPermission(projectDoc, req.user._id, 'editor')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const document = await Document.create({ title, content, project, type, relatedTasks, author: req.user._id });
        await document.populate('author', 'name email avatar');
        res.status(201).json({ success: true, document });
    } catch (error) { next(error); }
};

export const updateDocument = async (req, res, next) => {
    try {
        let document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ success: false, message: 'Not found' });
        const projectDoc = await Project.findById(document.project);
        if (!checkProjectPermission(projectDoc, req.user._id, 'editor')) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('author', 'name email avatar');
        res.status(200).json({ success: true, document });
    } catch (error) { next(error); }
};

export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ success: false, message: 'Not found' });
        const projectDoc = await Project.findById(document.project);
        const isAdmin = checkProjectPermission(projectDoc, req.user._id, 'admin');
        const isAuthor = document.author.toString() === req.user._id.toString();
        if (!isAdmin && !isAuthor) return res.status(403).json({ success: false, message: 'Not authorized' });
        await document.deleteOne();
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
};
