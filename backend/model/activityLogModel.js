import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        action: {
            type: String,
            enum: ['create', 'update', 'delete', 'move', 'assign', 'unassign', 'comment', 'upload', 'complete', 'reopen', 'archive', 'restore'],
            required: true,
        },
        entityType: {
            type: String,
            enum: ['task', 'project', 'workspace', 'comment', 'file'],
            required: true,
        },
        entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
        entityName: { type: String },
        workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
        changes: { type: Map, of: mongoose.Schema.Types.Mixed },
        metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
        ipAddress: { type: String },
        userAgent: { type: String },
    },
    { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ workspace: 1, createdAt: -1 });
activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ task: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
