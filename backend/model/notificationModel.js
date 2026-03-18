import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        type: {
            type: String,
            enum: [
                'task-assigned',
                'task-mentioned',
                'comment-added',
                'comment-mentioned',
                'task-due-soon',
                'task-overdue',
                'project-invited',
                'workspace-invited',
                'task-completed',
                'task-updated',
                'file-uploaded',
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String,
        },
        relatedTask: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        },
        relatedProject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        relatedWorkspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
        emailSent: {
            type: Boolean,
            default: false,
        },
        emailSentAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
