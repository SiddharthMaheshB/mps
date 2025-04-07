import asyncHandler from 'express-async-handler';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Friend from '../models/friendModel.js';
import mongoose from 'mongoose';
import Follow from '../models/followModel.js';

// @desc    Create a new post
// @route   POST /api/social/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { caption, image } = req.body;
    
    if (!caption) {
        res.status(400);
        throw new Error('Please provide a caption for your post');
    }
    
    const user = await User.findById(req.user._id);
    
    const post = await Post.create({
        user: req.user._id,
        username: user.username,
        userImage: user.avatar || '',
        caption,
        image,
        likes: [],
        comments: [],
        sharedBy: []
    });
    
    res.status(201).json(post);
});

// @desc    Get all posts (feed)
// @route   GET /api/social/posts
// @access  Private
const getPosts = asyncHandler(async (req, res) => {
    try {
        // Get all posts from all users sorted by creation date (newest first)
        // Filter out deleted posts at the database query level
        const posts = await Post.find({ deleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(100); // Increased limit but still capped to avoid excessive load
        
        // Get the current user for reference
        const currentUser = req.user;
        
        // If no posts exist yet, return empty array (no dummy data)
        if (posts.length === 0) {
            return res.json({ posts: [], message: "No posts have been created yet." });
        }
        
        // Return all posts - we don't filter by connections anymore as all posts should be public
        res.json({ 
            posts,
            currentUserId: currentUser._id,
            message: `Found ${posts.length} posts from all users in the community feed.`
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500);
        throw new Error('Failed to fetch posts. Please try again.');
    }
});

// @desc    Get a post by ID
// @route   GET /api/social/posts/:id
// @access  Public (so posts can be viewed when shared externally)
const getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate('user', 'username avatar')
        .populate('comments.user', 'username avatar');
    
    if (post && !post.deleted) {
        // Format for frontend use
        const formattedPost = {
            _id: post._id,
            username: post.username,
            userImage: post.userImage,
            image: post.image,
            caption: post.caption,
            likes: post.likes,
            comments: post.comments.map(comment => ({
                username: comment.username,
                text: comment.text,
                createdAt: comment.createdAt
            })),
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        };
        
        res.json(formattedPost);
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
});

// @desc    Like a post
// @route   POST /api/social/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    
    // Check if post is deleted
    if (post.deleted) {
        res.status(404);
        throw new Error('This post has been deleted');
    }
    
    // Check if user already liked the post
    const userId = req.user._id;
    const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());
    
    if (alreadyLiked) {
        // Unlike the post
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
        // Like the post
        post.likes.push(userId);
    }
    
    await post.save();
    
    // Return complete updated likes array and count for the frontend
    res.json({ 
        likes: post.likes,
        count: post.likes.length,
        liked: !alreadyLiked,
        // Include all information for proper frontend state updates
        post: {
            _id: post._id,
            likes: post.likes,
            isLiked: !alreadyLiked
        }
    });
});

// @desc    Comment on a post
// @route   POST /api/social/posts/:id/comment
// @access  Private
const commentOnPost = asyncHandler(async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        res.status(400);
        throw new Error('Comment text is required');
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    
    // Check if post is deleted
    if (post.deleted) {
        res.status(404);
        throw new Error('This post has been deleted');
    }
    
    const user = await User.findById(req.user._id);
    
    post.comments.push({
        user: req.user._id,
        username: user.username,
        text
    });
    
    await post.save();
    
    res.status(201).json(post.comments);
});

// @desc    Share a post
// @route   POST /api/social/posts/:id/share
// @access  Private
const sharePost = asyncHandler(async (req, res) => {
    const { sharedWith } = req.body;
    
    if (!sharedWith || !Array.isArray(sharedWith) || sharedWith.length === 0) {
        res.status(400);
        throw new Error('Please provide at least one follower to share with');
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    
    // Check if post is deleted
    if (post.deleted) {
        res.status(404);
        throw new Error('This post has been deleted and cannot be shared');
    }
    
    // Validate the connections - everything is a follower now
    const validatedConnections = sharedWith.map(connection => {
        // If connection is just a string (ID), treat it as a follower for backward compatibility
        if (typeof connection === 'string') {
            return { id: connection, type: 'follower' };
        }
        
        // If connection is an object with id
        if (connection.id) {
            return { id: connection.id, type: 'follower' };
        }
        
        return null;
    }).filter(Boolean); // Remove invalid entries
    
    if (validatedConnections.length === 0) {
        res.status(400);
        throw new Error('No valid followers provided');
    }
    
    // Get the current user's information to include username
    const user = await User.findById(req.user._id);
    
    // Add share information with username
    post.sharedBy.push({
        user: req.user._id,
        sharerUsername: user.username, // Include the username directly
        sharedWith: validatedConnections,
        timestamp: new Date()
    });
    
    await post.save();
    
    res.status(201).json({
        success: true,
        message: 'Post shared successfully with followers',
        shareCount: post.sharedBy.length
    });
});

// @desc    Get shared posts
// @route   GET /api/social/shared
// @access  Private
const getSharedPosts = asyncHandler(async (req, res) => {
    try {
        // Find posts shared with the user by ID - exclude deleted posts
        const sharedPosts = await Post.find({
            'sharedBy.sharedWith': { 
                $elemMatch: { 
                    id: req.user._id.toString() 
                }
            },
            deleted: { $ne: true } // Filter out deleted posts
        }).sort({ 'sharedBy.timestamp': -1 });
        
        // For backwards compatibility - also find posts shared with the user by username
        const sharedPostsByUsername = await Post.find({
            'sharedBy.sharedWith': { $in: [req.user.username] },
            deleted: { $ne: true } // Filter out deleted posts
        }).sort({ 'sharedBy.timestamp': -1 });
        
        // Combine and deduplicate
        const combinedPosts = [...sharedPosts];
        
        // Add posts from username-based sharing if they're not already included
        sharedPostsByUsername.forEach(usernamePost => {
            if (!combinedPosts.some(post => post._id.toString() === usernamePost._id.toString())) {
                combinedPosts.push(usernamePost);
            }
        });
        
        // Sort by most recent shared time
        combinedPosts.sort((a, b) => {
            const latestShareA = a.sharedBy.reduce((latest, share) => {
                return new Date(share.timestamp) > latest ? new Date(share.timestamp) : latest;
            }, new Date(0));
            
            const latestShareB = b.sharedBy.reduce((latest, share) => {
                return new Date(share.timestamp) > latest ? new Date(share.timestamp) : latest;
            }, new Date(0));
            
            return latestShareB - latestShareA; // Sort descending (newest first)
        });
        
        // If no shared posts, return empty array
        if (combinedPosts.length === 0) {
            return res.json({ sharedPosts: [] });
        }
        
        // Format posts for frontend
        const formattedSharedPosts = await Promise.all(combinedPosts.map(async (post) => {
            // Find who shared this post with the current user
            const shareInfo = post.sharedBy.find(share => 
                (share.sharedWith.some(conn => 
                    (typeof conn === 'string' && conn === req.user.username) || 
                    (conn.id && conn.id.toString() === req.user._id.toString())
                ))
            );
            
            // Get sharer's username if available
            let sharerUsername = "Unknown";
            
            if (shareInfo) {
                // First try to use the stored sharerUsername if it exists
                if (shareInfo.sharerUsername) {
                    sharerUsername = shareInfo.sharerUsername;
                } 
                // If not, try to get it from the user ID
                else if (shareInfo.user) {
                    try {
                        const sharerUser = await User.findById(shareInfo.user);
                        if (sharerUser) {
                            sharerUsername = sharerUser.username;
                        }
                    } catch (err) {
                        console.error("Error fetching sharer user:", err);
                    }
                }
            }
            
            return {
                _id: post._id,
                username: post.username,
                userImage: post.userImage,
                image: post.image,
                caption: post.caption,
                likes: post.likes,
                comments: post.comments.map(comment => ({
                    username: comment.username,
                    text: comment.text,
                    createdAt: comment.createdAt
                })),
                sharerUsername: sharerUsername, // Include this explicitly
                sharedBy: shareInfo ? [{
                    user: shareInfo.user,
                    sharerUsername: sharerUsername,
                    timestamp: shareInfo.timestamp
                }] : [],
                createdAt: post.createdAt,
                updatedAt: post.updatedAt
            };
        }));
        
        res.json({ sharedPosts: formattedSharedPosts });
    } catch (error) {
        console.error("Error fetching shared posts:", error);
        res.status(500);
        throw new Error("Failed to fetch shared posts");
    }
});

// @desc    Get friend suggestions
// @route   GET /api/social/friends/suggestions
// @access  Private
const getFriendSuggestions = asyncHandler(async (req, res) => {
    try {
        console.log(`Getting friend suggestions for user ID: ${req.user._id}`);
        
        // Get existing friend relationships
        const existingFriendships = await Friend.find({
            $or: [
                { requester: req.user._id },
                { recipient: req.user._id }
            ]
        });
        
        // Get existing follow relationships where the current user is the follower
        const existingFollows = await Follow.find({
            follower: req.user._id
        });
        
        console.log(`Found ${existingFriendships.length} friend relationships and ${existingFollows.length} follow relationships`);
        
        // Extract IDs of users that already have a relationship with the current user
        const existingFriendIds = new Set();
        
        // Add friends
        existingFriendships.forEach(friendship => {
            if (friendship.requester.equals(req.user._id)) {
                existingFriendIds.add(friendship.recipient.toString());
            } else {
                existingFriendIds.add(friendship.requester.toString());
            }
        });
        
        // Add follows
        existingFollows.forEach(follow => {
            existingFriendIds.add(follow.following.toString());
        });
        
        // Add current user ID to exclude from suggestions
        existingFriendIds.add(req.user._id.toString());
        
        console.log(`Excluding ${existingFriendIds.size} users from suggestions`);
        
        // Find users not already connected with the current user
        const suggestions = await User.find({
            _id: { $nin: Array.from(existingFriendIds) }
        })
        .select('_id username avatar')
        .limit(30);
        
        console.log(`Returning ${suggestions.length} user suggestions`);
        
        res.json(suggestions);
    } catch (error) {
        console.error('Error in getFriendSuggestions:', error);
        res.status(500).json({
            message: 'Error getting friend suggestions',
            error: error.message
        });
    }
});

// @desc    Send friend request
// @route   POST /api/social/friends/request
// @access  Private
const sendFriendRequest = asyncHandler(async (req, res) => {
    const { recipientId } = req.body;
    
    if (!recipientId) {
        res.status(400);
        throw new Error('Recipient ID is required');
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    
    if (!recipient) {
        res.status(404);
        throw new Error('User not found');
    }
    
    // Check if friend request already exists
    const existingRequest = await Friend.findOne({
        $or: [
            { requester: req.user._id, recipient: recipientId },
            { requester: recipientId, recipient: req.user._id }
        ]
    });
    
    if (existingRequest) {
        res.status(400);
        throw new Error('A friend request already exists between these users');
    }
    
    // Create new friend request
    const friendRequest = await Friend.create({
        requester: req.user._id,
        recipient: recipientId,
        status: 'pending'
    });
    
    res.status(201).json(friendRequest);
});

// @desc    Respond to friend request
// @route   PUT /api/social/friends/respond/:id
// @access  Private
const respondToFriendRequest = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    if (!status || !['accepted', 'rejected', 'blocked'].includes(status)) {
        res.status(400);
        throw new Error('Valid status (accepted, rejected, or blocked) is required');
    }
    
    // Find the friend request
    const friendRequest = await Friend.findById(req.params.id);
    
    if (!friendRequest) {
        res.status(404);
        throw new Error('Friend request not found');
    }
    
    // Ensure the user is the recipient of the request
    if (!friendRequest.recipient.equals(req.user._id)) {
        res.status(403);
        throw new Error('Not authorized to respond to this friend request');
    }
    
    // Update the status
    friendRequest.status = status;
    await friendRequest.save();
    
    res.json(friendRequest);
});

// @desc    Get user's friends
// @route   GET /api/social/friends
// @access  Private
const getFriends = asyncHandler(async (req, res) => {
    // Find all accepted friendships
    const friendships = await Friend.find({
        $or: [
            { requester: req.user._id, status: 'accepted' },
            { recipient: req.user._id, status: 'accepted' }
        ]
    });
    
    // Extract friend IDs
    const friendIds = friendships.map(friendship => {
        return friendship.requester.equals(req.user._id) 
            ? friendship.recipient 
            : friendship.requester;
    });
    
    // Get details of all friends
    const friends = await User.find({
        _id: { $in: friendIds }
    }).select('_id username avatar');
    
    // If no friends, return dummy friends
    if (friends.length === 0) {
        const dummyFriends = [
            { id: 1, name: "FarmerJoe" },
            { id: 2, name: "AgriTech" },
            { id: 3, name: "EcoGrower" },
        ];
        
        return res.json({ friends: [], dummyFriends });
    }
    
    const formattedFriends = friends.map(friend => ({
        id: friend._id,
        name: friend.username,
        avatar: friend.avatar
    }));
    
    res.json({ friends: formattedFriends, dummyFriends: [] });
});

// @desc    Get user's followers
// @route   GET /api/social/followers or GET /api/social/followers/:userId
// @access  Private
const getFollowers = asyncHandler(async (req, res) => {
    try {
        let userId = req.user._id;
        
        // Check if a specific user ID was provided in the URL
        if (req.params.userId) {
            userId = req.params.userId;
        }
        
        // Find followers where the specified user is being followed
        const userFollowers = await Follow.find({ following: userId })
            .populate('follower', 'username avatar _id')
            .sort({ createdAt: -1 });
        
        if (userFollowers.length > 0) {
            // Format followers for frontend use
            const followers = userFollowers.map(follow => ({
                id: follow.follower._id,
                name: follow.follower.username,
                avatar: follow.follower.avatar
            }));
            
            res.json(followers);
        } else {
            // If no followers found, return empty array
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500);
        throw new Error('Failed to fetch followers');
    }
});

// @desc    Get users that the current user is following
// @route   GET /api/social/following or GET /api/social/following/:userId
// @access  Private
const getFollowing = asyncHandler(async (req, res) => {
    try {
        let userId = req.user._id;
        
        // Check if a specific user ID was provided in the URL
        if (req.params.userId) {
            userId = req.params.userId;
        }
        
        // Find users that the specified user is following
        const userFollowing = await Follow.find({ follower: userId })
            .populate('following', 'username avatar _id')
            .sort({ createdAt: -1 });
        
        if (userFollowing.length > 0) {
            // Format following list for frontend use
            const following = userFollowing.map(follow => ({
                id: follow.following._id,
                name: follow.following.username,
                avatar: follow.following.avatar
            }));
            
            res.json(following);
        } else {
            // If not following anyone, return empty array
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching following:', error);
        res.status(500);
        throw new Error('Failed to fetch following list');
    }
});

// @desc    Get user profile
// @route   GET /api/social/profile/:username
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    
    console.log(`Fetching profile for username: ${username}`);
    
    // Handle 'me' to get the current user's profile
    if (username === 'me') {
        console.log('Fetching current user profile');
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
            res.status(404);
            throw new Error('User not found');
        }
        
        console.log(`Found current user: ${currentUser.username}`);
        
        // Get user's posts - only fetch non-deleted posts
        const posts = await Post.find({ 
            user: req.user._id,
            deleted: { $ne: true } // Only get posts that are not deleted
        }).sort({ createdAt: -1 });
            
        console.log(`Found ${posts.length} posts for current user`);
        
        // If no posts by ID, try by username
        if (posts.length === 0) {
            console.log('No posts found by ID, trying by username');
            const usernameBasedPosts = await Post.find({ 
                username: currentUser.username,
                deleted: { $ne: true } // Only get posts that are not deleted
            }).sort({ createdAt: -1 });
                
            console.log(`Found ${usernameBasedPosts.length} posts by username`);
            
            if (usernameBasedPosts.length > 0) {
                posts.push(...usernameBasedPosts);
            }
        }
        
        // Count followers and following
        const followers = await Follow.countDocuments({ following: req.user._id });
        const following = await Follow.countDocuments({ follower: req.user._id });
        
        return res.json({
            _id: currentUser._id,
            name: currentUser.name,
            username: currentUser.username,
            profilePic: currentUser.avatar,
            bio: currentUser.bio || "Farmer at FarmConnect",
            farmLocation: currentUser.location || "India",
            followers: followers,
            following: following,
            posts: posts.map(post => ({
                _id: post._id,
                image: post.image,
                caption: post.caption,
                likes: post.likes,
                comments: post.comments,
                createdAt: post.createdAt
            }))
        });
    }
    
    // Find user by username
    console.log(`Finding user by username: ${username}`);
    const user = await User.findOne({ username });
    
    if (!user) {
        console.log(`User not found: ${username}`);
        res.status(404);
        throw new Error('User not found');
    }
    
    console.log(`Found user: ${user.username} with ID: ${user._id}`);
    
    // Get user's posts - only fetch non-deleted posts
    const posts = await Post.find({ 
        user: user._id,
        deleted: { $ne: true } // Only get posts that are not deleted
    }).sort({ createdAt: -1 });
        
    console.log(`Found ${posts.length} posts for user by ID`);
    
    // If no posts by ID, try by username
    if (posts.length === 0) {
        console.log('No posts found by ID, trying by username');
        const usernameBasedPosts = await Post.find({ 
            username: user.username,
            deleted: { $ne: true } // Only get posts that are not deleted
        }).sort({ createdAt: -1 });
            
        console.log(`Found ${usernameBasedPosts.length} posts by username`);
        
        if (usernameBasedPosts.length > 0) {
            posts.push(...usernameBasedPosts);
        }
    }
    
    // Count followers and following
    const followers = await Follow.countDocuments({ following: user._id });
    const following = await Follow.countDocuments({ follower: user._id });
    
    res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        profilePic: user.avatar,
        bio: user.bio || "Farmer at FarmConnect",
        farmLocation: user.location || "India",
        followers: followers,
        following: following,
        posts: posts.map(post => ({
            _id: post._id,
            image: post.image,
            caption: post.caption,
            likes: post.likes,
            comments: post.comments,
            createdAt: post.createdAt
        }))
    });
});

// @desc    Check if user is following another user
// @route   GET /api/social/follow/status/:username
// @access  Private
const checkFollowStatus = asyncHandler(async (req, res) => {
    const { username } = req.params;
    
    // Get target user ID
    let targetUserId;
    
    // Check if username parameter is a MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(username)) {
        targetUserId = username;
    } else {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        targetUserId = user._id;
    }
    
    // Check if current user is following target user
    const isFollowing = await Follow.exists({
        follower: req.user._id,
        following: targetUserId
    });
    
    res.json({
        isFollowing: !!isFollowing
    });
});

// @desc    Follow a user
// @route   POST /api/social/follow/:username
// @access  Private
const followUser = asyncHandler(async (req, res) => {
    const { username } = req.params;
    
    try {
        // Get target user ID
        let targetUserId;
        let targetUser;
        
        // Check if username parameter is a MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(username)) {
            targetUserId = username;
            targetUser = await User.findById(targetUserId);
            if (!targetUser) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found with provided ID' 
                });
            }
        } else {
            // Find user by username
            targetUser = await User.findOne({ username });
            if (!targetUser) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found with provided username'
                });
            }
            targetUserId = targetUser._id;
        }
        
        // Prevent following yourself
        if (targetUserId.toString() === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'You cannot follow yourself'
            });
        }
        
        // Check if already following
        const existingFollow = await Follow.findOne({
            follower: req.user._id,
            following: targetUserId
        });
        
        if (existingFollow) {
            return res.status(200).json({ 
                success: true, 
                alreadyFollowing: true,
                message: 'Already following this user',
                user: {
                    id: targetUser._id,
                    username: targetUser.username,
                    avatar: targetUser.avatar
                }
            });
        }
        
        // Create follow relationship
        const newFollow = await Follow.create({
            follower: req.user._id,
            following: targetUserId
        });
        
        // Return success with user details
        return res.status(201).json({ 
            success: true,
            alreadyFollowing: false,
            message: 'Successfully followed user',
            user: {
                id: targetUser._id,
                username: targetUser.username,
                avatar: targetUser.avatar
            },
            followId: newFollow._id
        });
    } catch (error) {
        console.error('Error in followUser controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while following user',
            error: error.message
        });
    }
});

// @desc    Unfollow a user
// @route   POST /api/social/unfollow/:username
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
    const { username } = req.params;
    
    // Get target user ID
    let targetUserId;
    
    // Check if username parameter is a MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(username)) {
        targetUserId = username;
    } else {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        targetUserId = user._id;
    }
    
    // Check if following
    const existingFollow = await Follow.findOne({
        follower: req.user._id,
        following: targetUserId
    });
    
    if (!existingFollow) {
        res.status(400);
        throw new Error('Not following this user');
    }
    
    // Remove follow relationship
    await Follow.deleteOne({
        follower: req.user._id,
        following: targetUserId
    });
    
    res.json({ success: true });
});

// @desc    Delete a post
// @route   DELETE /api/social/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            res.status(404);
            throw new Error('Post not found');
        }
        
        // Check if the user is the owner of the post
        if (post.user.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized to delete this post');
        }
        
        // First find all shared versions of this post and delete them completely
        const sharedPosts = await Post.find({ originalPostId: post._id });
        console.log(`Found ${sharedPosts.length} shared versions of this post to delete`);
        
        // Delete all shared posts
        if (sharedPosts.length > 0) {
            await Post.deleteMany({ originalPostId: post._id });
            console.log(`Deleted ${sharedPosts.length} shared versions of the post`);
        }
        
        // Then delete the original post completely
        await Post.findByIdAndDelete(req.params.id);
        console.log(`Deleted original post with ID: ${req.params.id}`);
        
        res.json({ 
            success: true, 
            message: 'Post and all shared versions successfully deleted',
            postId: post._id
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(error.statusCode || 500);
        throw new Error(error.message || 'Failed to delete post');
    }
});

export {
    createPost,
    getPosts,
    getPostById,
    likePost,
    commentOnPost,
    sharePost,
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
    unfollowUser,
    deletePost
}; 