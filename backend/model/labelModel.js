import mongoose from 'mongoose';

const labelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Label name is required'],
            trim: true,
            maxlength: [50, 'Label name cannot exceed 50 characters'],
        },
        color: {
            type: String,
            required: [true, 'Label color is required'],
            default: '#6366f1',
        },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

labelSchema.index({ name: 1, project: 1 }, { unique: true });

const Label = mongoose.model('Label', labelSchema);
export default Label;
