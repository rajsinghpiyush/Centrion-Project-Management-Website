import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true,
            maxlength: [100, 'Project name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                role: {
                    type: String,
                    enum: ['editor', 'viewer'],
                    default: 'editor',
                },
                status: {
                    type: String,
                    enum: ['pending', 'active', 'declined'],
                    default: 'pending',
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        color: {
            type: String,
            default: '#3B82F6',
        },
        icon: {
            type: String,
            default: '📋',
        },
        columns: [
            {
                name: {
                    type: String,
                    required: true,
                },
                order: {
                    type: Number,
                    required: true,
                },
                color: {
                    type: String,
                    default: '#94A3B8',
                },
            },
        ],
        labels: [
            {
                name: {
                    type: String,
                    required: true,
                },
                color: {
                    type: String,
                    required: true,
                },
            },
        ],
        customFields: [
            {
                name: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    enum: ['text', 'number', 'date', 'dropdown', 'checkbox', 'formula'],
                    required: true,
                },
                options: [String],
                required: {
                    type: Boolean,
                    default: false,
                },
                defaultValue: mongoose.Schema.Types.Mixed,
            },
        ],
        template: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Template',
            default: null,
        },
        settings: {
            visibility: {
                type: String,
                enum: ['private', 'workspace', 'public'],
                default: 'workspace',
            },
            allowComments: {
                type: Boolean,
                default: true,
            },
            requireApproval: {
                type: Boolean,
                default: false,
            },
        },
        startDate: {
            type: Date,
            default: null,
        },
        endDate: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ['active', 'archived', 'completed', 'on-hold'],
            default: 'active',
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        isFavorite: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

projectSchema.index({ name: 'text', description: 'text' });
projectSchema.index({ workspace: 1, status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

projectSchema.pre('validate', function () {
    if (this.owner && this.members && this.members.length > 0) {
        const ownerId = this.owner._id ? this.owner._id.toString() : this.owner.toString();
        this.members = this.members.filter(m => {
            const memberId = m.user._id ? m.user._id.toString() : m.user.toString();
            return memberId !== ownerId;
        });
    }
});

projectSchema.pre('save', function () {
    if (this.isNew && this.columns.length === 0) {
        this.columns = [
            { name: 'To Do', order: 0, color: '#94A3B8' },
            { name: 'In Progress', order: 1, color: '#3B82F6' },
            { name: 'Review', order: 2, color: '#F59E0B' },
            { name: 'Completed', order: 3, color: '#10B981' },
        ];
    }
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
