import mongoose from 'mongoose';

const friendSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'blocked'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Compound index to ensure unique friendship pairs and efficient lookups
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });
// Index for finding all friends of a user
friendSchema.index({ requester: 1, status: 1 });
friendSchema.index({ recipient: 1, status: 1 });

const Friend = mongoose.model('Friend', friendSchema);
export default Friend; 