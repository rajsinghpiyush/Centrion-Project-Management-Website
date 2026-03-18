import Comment from '../model/commentModel.js';
import Task from '../model/taskModel.js';
// import Notification from '../model/notificationModel.js'; // Ported but check name
import { checkProjectPermission } from '../utils/permissionUtils.js';

export const getComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ task: req.params.taskId })
            .populate('author', 'name email avatar')
            .populate('mentions', 'name email avatar')
            .sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: comments.length, comments });
    } catch (error) { next(error); }
};

export const addComment = async (req, res, next) => {
    try {
        const { content, taskId, mentions, parentComment, attachments } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const comment = await Comment.create({
            content, task: taskId, author: req.user._id, mentions, parentComment, attachments,
        });
        await comment.populate('author', 'name email avatar');
        await comment.populate('mentions', 'name email avatar');

        if (req.io) req.io.to(`project:${task.project}`).emit('comment:added', comment);
        res.status(201).json({ success: true, comment });
    } catch (error) { next(error); }
};

export const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment || comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized or not found' });
        }
        comment.isDeleted = true;
        await comment.save();
        res.status(200).json({ success: true, message: 'Comment deleted' });
    } catch (error) { next(error); }
};
