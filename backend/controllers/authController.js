import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { registerSchema, loginSchema } from '../validation/authValidation.js';
import { OAuth2Client } from 'google-auth-library';

// Google OAuth client setup
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Generates a Google OAuth URL for frontend to redirect to
const getGoogleAuthURL = asyncHandler(async (req, res) => {
    // Check if Google OAuth credentials are available
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URL) {
        console.error('Missing Google OAuth credentials in environment variables');
        res.status(500);
        throw new Error('Server configuration error: Google OAuth is not properly configured');
    }

    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
    ];

    // Build a more direct URL with all required parameters explicitly set
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const urlParams = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URL,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes.join(' '),
        state: JSON.stringify({
            redirectUrl: req.query.redirectUrl || process.env.FRONTEND_URL,
        }),
    });

    const authUrl = `${baseUrl}?${urlParams.toString()}`;
    
    // Log the URL for debugging
    console.log('Generated Google Auth URL:', authUrl);
    
    // Parse URL to check if required parameters are included
    const urlObj = new URL(authUrl);
    const hasRedirectUri = urlObj.searchParams.has('redirect_uri');
    const hasClientId = urlObj.searchParams.has('client_id');
    const hasResponseType = urlObj.searchParams.has('response_type');
    
    if (!hasRedirectUri) {
        console.warn('Warning: redirect_uri not included in Google Auth URL');
    }
    
    if (!hasClientId) {
        console.warn('Warning: client_id not included in Google Auth URL');
    }
    
    if (!hasResponseType) {
        console.warn('Warning: response_type not included in Google Auth URL');
    }

    res.json({ 
        authUrl,
        clientId: process.env.GOOGLE_CLIENT_ID,
        redirectUri: process.env.GOOGLE_REDIRECT_URL
    });
});

// Google OAuth callback handler
const googleCallback = asyncHandler(async (req, res) => {
    const { code } = req.query;
    const { state } = req.query;
    
    console.log('Google OAuth callback received with code:', code ? 'Code present' : 'No code');
    console.log('Query parameters:', req.query);
    
    if (!code) {
        res.status(400);
        throw new Error('Authorization code is required');
    }
    
    try {
        console.log('Received authorization code, exchanging for tokens');
        console.log('Using redirect URI:', process.env.GOOGLE_REDIRECT_URL);
        
        // Use a more direct approach for token exchange
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const tokenParams = new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URL,
            grant_type: 'authorization_code'
        });
        
        console.log('Token request parameters:', {
            code: 'REDACTED',
            client_id: process.env.GOOGLE_CLIENT_ID,
            redirect_uri: process.env.GOOGLE_REDIRECT_URL,
            grant_type: 'authorization_code'
        });
        
        // Make the token request
        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: tokenParams.toString()
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json().catch(() => ({}));
            console.error('Token exchange failed:', tokenResponse.status, errorData);
            throw new Error(`Token exchange failed: ${errorData.error || tokenResponse.statusText}`);
        }
        
        const tokens = await tokenResponse.json();
        console.log('Successfully exchanged code for tokens:', Object.keys(tokens).join(', '));
        
        if (!tokens.id_token) {
            console.error('No ID token received in the tokens response');
            throw new Error('Invalid token response from Google');
        }
        
        // Get user info directly from Google API
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`
            }
        });
        
        if (!userInfoResponse.ok) {
            console.error('Failed to fetch user info:', userInfoResponse.status);
            throw new Error('Failed to fetch user information from Google');
        }
        
        const userData = await userInfoResponse.json();
        
        if (!userData.email) {
            console.error('Invalid user data:', userData);
            throw new Error('Failed to extract user information');
        }
        
        const { email, name, picture, sub } = userData;
        console.log(`User authenticated: ${email}`);
        
        // Check if user exists in our database
        let user = await User.findOne({ email });
        
        // If user doesn't exist, create a new one
        if (!user) {
            console.log(`Creating new user for: ${email}`);
            // Generate a random password for Google users
            const password = Math.random().toString(36).slice(-8);
            
            // Check if the username already exists and generate a unique one if needed
            let username = name || email.split('@')[0];
            let isUsernameAvailable = false;
            let counter = 0;
            
            // Loop until we find an available username
            while (!isUsernameAvailable) {
                const existingUser = await User.findOne({ username: counter === 0 ? username : `${username}${counter}` });
                if (!existingUser) {
                    isUsernameAvailable = true;
                    if (counter > 0) {
                        username = `${username}${counter}`;
                    }
                } else {
                    counter++;
                }
            }
            
            user = await User.create({
                username,
                email,
                password,
                googleId: sub,
                avatar: picture,
                isGoogleUser: true
            });
        } else if (!user.isGoogleUser) {
            console.log(`Linking existing user with Google: ${email}`);
            // If a user with this email exists but is not a Google user,
            // update their account to link with Google
            user.googleId = sub;
            user.isGoogleUser = true;
            if (picture) user.avatar = picture;
            await user.save();
        } else {
            console.log(`Existing Google user logged in: ${email}`);
        }
        
        // Create JWT token for our app
        const token = generateToken(user._id);
        
        // Parse the state to get the redirect URL
        let redirectUrl = process.env.FRONTEND_URL;
        try {
            if (state) {
                const stateObj = JSON.parse(state);
                redirectUrl = stateObj.redirectUrl || redirectUrl;
            }
        } catch (err) {
            console.error('Error parsing state:', err);
        }
        
        console.log(`Redirecting to frontend: ${redirectUrl}/oauth/callback`);
        
        // Redirect to frontend with token
        res.redirect(`${redirectUrl}/oauth/callback?token=${token}&userId=${user._id}`);
        
    } catch (error) {
        console.error('Google OAuth Callback Error:', error);
        
        // Send detailed error to frontend for debugging
        const redirectUrl = process.env.FRONTEND_URL;
        const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
        
        // Redirect to frontend with error
        return res.redirect(`${redirectUrl}/oauth/callback?error=${errorMessage}`);
    }
});

const registerUser = asyncHandler(async (req, res) => {
    try {
        // Validate the request data
        const validatedData = registerSchema.parse(req.body);
        const { username, email, password, mobile } = validatedData;

        // Check if user with this email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400);
            throw new Error('User with this email already exists');
        }

        // Check if username is already taken
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            res.status(400);
            throw new Error('Username is already taken');
        }

        // Create the user
        const user = await User.create({
            username,
            email,
            password,
            mobile
        });

        if (user) {
            // Create token
            const token = generateToken(user._id);
            
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            // Send success response
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                token
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        // If it's a Zod validation error, handle it accordingly
        if (error.name === 'ZodError') {
            res.status(400);
            // Let the error middleware handle formatting the error
            throw error;
        }
        
        // For other errors, rethrow
        throw error;
    }
});

const loginUser = asyncHandler(async (req, res) => {
    try {
        // Validate the request data
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        // Find the user
        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            // Create token
            const token = generateToken(user._id);
            
            // Set JWT as HTTP-Only cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            // Send success response
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                token
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        // If it's a Zod validation error, handle it accordingly
        if (error.name === 'ZodError') {
            res.status(400);
            // Let the error middleware handle formatting the error
            throw error;
        }
        
        // For other errors, rethrow
        throw error;
    }
});

// Google OAuth login handler (client-side flow)
const googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    
    console.log('Google login attempt with token:', idToken ? 'Token provided' : 'No token');
    
    if (!idToken) {
        res.status(400);
        throw new Error('Google ID token is required');
    }
    
    try {
        // Initialize Google Auth client
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        let email, name, picture, sub;
        
        try {
            // First try to verify as an ID token
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            // Get user data from the token
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            picture = payload.picture;
            sub = payload.sub;
            
            console.log('Successfully verified ID token');
        } catch (tokenError) {
            console.error('ID token verification failed, trying as access token:', tokenError);
            
            // If ID token verification fails, try as an access token
            try {
                const userInfoResponse = await fetch(
                    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`
                );
                
                if (!userInfoResponse.ok) {
                    throw new Error('Failed to fetch user info with access token');
                }
                
                const userData = await userInfoResponse.json();
                email = userData.email;
                name = userData.name;
                picture = userData.picture;
                sub = userData.sub;
                
                console.log('Successfully fetched user info with access token');
            } catch (accessTokenError) {
                console.error('Access token verification failed:', accessTokenError);
                throw new Error('Invalid Google token - failed both ID and access token verification');
            }
        }
        
        // Check if user exists in database
        let user = await User.findOne({ email });
        
        // If user doesn't exist, create a new one
        if (!user) {
            // Generate a random password for Google users
            const password = Math.random().toString(36).slice(-8);
            
            // Check if the username already exists and generate a unique one if needed
            let username = name || email.split('@')[0];
            let isUsernameAvailable = false;
            let counter = 0;
            
            // Loop until we find an available username
            while (!isUsernameAvailable) {
                const existingUser = await User.findOne({ username: counter === 0 ? username : `${username}${counter}` });
                if (!existingUser) {
                    isUsernameAvailable = true;
                    if (counter > 0) {
                        username = `${username}${counter}`;
                    }
                } else {
                    counter++;
                }
            }
            
            user = await User.create({
                username,
                email,
                password,
                googleId: sub,
                avatar: picture,
                isGoogleUser: true
            });
            
            console.log('Created new user via Google login:', email);
        } else if (!user.isGoogleUser) {
            // If a user with this email exists but is not a Google user,
            // update their account to link with Google
            user.googleId = sub;
            user.isGoogleUser = true;
            if (picture) user.avatar = picture;
            await user.save();
            
            console.log('Linked existing user to Google login:', email);
        } else {
            console.log('Existing Google user logged in:', email);
        }
        
        // Create token
        const token = generateToken(user._id);
        
        // Set JWT as HTTP-Only cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile || '',
            avatar: user.avatar || '',
            token
        });
    } catch (error) {
        console.error('Google OAuth Error:', error);
        res.status(401);
        throw new Error('Invalid Google token or authorization failed');
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    // Clear the JWT cookie
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({ message: 'Logged out successfully' });
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            avatar: user.avatar || ''
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // If username is being updated, check if it's already taken
    if (req.body.name && req.body.name !== user.username) {
        const usernameExists = await User.findOne({ 
            username: req.body.name,
            _id: { $ne: req.user._id } // Exclude the current user
        });
        
        if (usernameExists) {
            res.status(400);
            throw new Error('Username is already taken');
        }
    }

    // Update user fields with data from request body
    user.username = req.body.name || user.username;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;
    
    // If avatar is provided, update it
    if (req.body.avatar) {
        user.avatar = req.body.avatar;
    }

    // Save the updated user
    const updatedUser = await user.save();

    // Return the updated user data
    res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            mobile: updatedUser.mobile,
            avatar: updatedUser.avatar || ''
        }
    });
});

export { 
    registerUser, 
    loginUser, 
    googleLogin, 
    googleCallback, 
    getGoogleAuthURL, 
    logoutUser, 
    getUserProfile,
    updateUserProfile
}; 