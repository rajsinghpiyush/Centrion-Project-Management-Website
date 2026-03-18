import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        content: {
            type: String,
            required: [true, 'Message content is required'],
            maxlength: [5000, 'Message cannot exceed 5000 characters'],
        },
        attachments: [
            {
                name: String,
                url: String,
                size: Number,
                mimeType: String,
            },
        ],
        readBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        isEdited: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ project: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
