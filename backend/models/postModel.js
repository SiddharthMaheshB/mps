import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Connection schema to represent both friends and followers in sharedWith
const connectionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['friend', 'follower'],
        default: 'friend'
    }
}, { _id: false });

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    userImage: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        required: false
    },
    caption: {
        type: String,
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [commentSchema],
    sharedBy: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            sharerUsername: {
                type: String,
                required: false
            },
            sharedWith: {
                type: [mongoose.Schema.Types.Mixed],
                validate: {
                    validator: function(value) {
                        // Allow strings (backward compatibility) or objects with id and type
                        return value.every(item => 
                            typeof item === 'string' || 
                            (item.id && (item.type === 'friend' || item.type === 'follower'))
                        );
                    },
                    message: 'sharedWith must contain either strings or objects with id and type'
                }
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

// Indexes for faster queries
postSchema.index({ user: 1 });
postSchema.index({ username: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'sharedBy.sharedWith.id': 1 });

const Post = mongoose.model('Post', postSchema);
export default Post; 