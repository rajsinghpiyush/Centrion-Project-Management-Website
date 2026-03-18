import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Workspace name is required'],
            trim: true,
            maxlength: [100, 'Workspace name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
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
                    enum: ['admin', 'manager', 'member', 'guest'],
                    default: 'member',
                },
                joinedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        settings: {
            visibility: {
                type: String,
                enum: ['private', 'team', 'public'],
                default: 'private',
            },
            allowInvites: {
                type: Boolean,
                default: true,
            },
            defaultProjectVisibility: {
                type: String,
                enum: ['private', 'workspace', 'public'],
                default: 'workspace',
            },
        },
        avatar: {
            type: String,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

workspaceSchema.index({ name: 'text', description: 'text' });
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

workspaceSchema.pre('save', function () {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

workspaceSchema.methods.isMember = function (userId) {
    const uId = userId.toString();
    const getSafeId = (val) => (val?._id ? val._id.toString() : val?.toString());
    return this.members.some(
        (member) => getSafeId(member.user) === uId
    );
};

workspaceSchema.methods.getUserRole = function (userId) {
    const uId = userId.toString();
    const getSafeId = (val) => (val?._id ? val._id.toString() : val?.toString());
    const member = this.members.find(
        (m) => getSafeId(m.user) === uId
    );
    return member ? member.role : null;
};

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
