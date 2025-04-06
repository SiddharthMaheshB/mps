import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createPost,
    getPosts,
    getPostById,
    likePost,
    commentOnPost,
    sharePost,
    deletePost,
    getSharedPosts,
    getFriendSuggestions,
    sendFriendRequest,
    respondToFriendRequest,
    getFriends,
    getFollowers,
    getFollowing,
    getUserProfile,
    checkFollowStatus,
    followUser,
    unfollowUser
} from '../controllers/socialController.js';
import Post from '../models/postModel.js';

const router = express.Router();

// All routes are protected except specified ones
router.use(protect);

// Post routes
router.route('/posts')
    .get(getPosts)
    .post(createPost);

// Combined route for get, delete operations on a specific post
router.route('/posts/:id')
    .get((req, res, next) => {
        // Bypass authentication for GET requests
        if (req.method === 'GET') {
            return next();
        }
        // Otherwise, apply protect middleware
        return protect(req, res, next);
    }, getPostById)
    .delete(protect, deletePost);

router.route('/posts/:id/like')
    .post(likePost);

router.route('/posts/:id/comment')
    .post(commentOnPost);

router.route('/posts/:id/share')
    .post(sharePost);

// Shared posts
router.get('/shared', getSharedPosts);

// User profile routes
router.get('/profile/:username', getUserProfile);

// Debug route to check user's posts
router.get('/debug/posts', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const username = req.user.username;
        
        console.log(`Debug: Checking posts for user ${username} (${userId})`);
        
        // Check posts by user ID
        const postsByUserId = await Post.find({ user: userId });
        console.log(`Found ${postsByUserId.length} posts by user ID`);
        
        // Check posts by username
        const postsByUsername = await Post.find({ username });
        console.log(`Found ${postsByUsername.length} posts by username`);
        
        // Return details for debugging
        res.json({
            userId,
            username,
            postsByUserId: postsByUserId.map(p => ({ 
                id: p._id, 
                caption: p.caption, 
                user: p.user,
                username: p.username
            })),
            postsByUsername: postsByUsername.map(p => ({ 
                id: p._id, 
                caption: p.caption, 
                user: p.user,
                username: p.username
            }))
        });
    } catch (error) {
        console.error('Debug route error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Follow routes
router.get('/follow/status/:username', checkFollowStatus);
router.post('/follow/:username', followUser);
router.post('/unfollow/:username', unfollowUser);

// Friend routes
router.get('/friends', getFriends);
router.get('/followers', getFollowers);
router.get('/following', getFollowing);
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);
router.get('/friends/suggestions', getFriendSuggestions);
router.post('/friends/request', sendFriendRequest);
router.put('/friends/respond/:id', respondToFriendRequest);

export default router; 