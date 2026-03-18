import Message from '../model/messageModel.js';
import Project from '../model/projectModel.js';

export const getProjectMessages = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const messages = await Message.find({ project: projectId })
            .populate('sender', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.status(200).json({ success: true, count: messages.length, messages: messages.reverse() });
    } catch (error) { next(error); }
};

export const getDirectMessages = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const messages = await Message.find({
            $or: [{ sender: req.user._id, recipient: userId }, { sender: userId, recipient: req.user._id }],
        })
            .populate('sender', 'name email avatar')
            .populate('recipient', 'name email avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        res.status(200).json({ success: true, count: messages.length, messages: messages.reverse() });
    } catch (error) { next(error); }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { content, recipient, project, replyTo, attachments } = req.body;
        const message = await Message.create({
            sender: req.user._id, content, recipient, project, replyTo, attachments,
            readBy: [{ user: req.user._id }],
        });
        await message.populate('sender', 'name email avatar');
        if (req.io) {
            if (project) req.io.to(`project:${project}`).emit('message:new', message);
            else if (recipient) req.io.to(`user:${recipient}`).emit('message:direct', message);
        }
        res.status(201).json({ success: true, messageData: message });
    } catch (error) { next(error); }
};
