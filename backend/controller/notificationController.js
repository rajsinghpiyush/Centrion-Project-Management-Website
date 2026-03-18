import Notification from '../model/notificationModel.js';

export const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name avatar')
            .populate('relatedProject', 'name')
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
        res.status(200).json({ success: true, count: notifications.length, unreadCount, notifications });
    } catch (error) { next(error); }
};

export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, notification });
    } catch (error) { next(error); }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'Marked all as read' });
    } catch (error) { next(error); }
};

export const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
};
