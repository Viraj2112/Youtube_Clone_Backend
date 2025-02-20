import { Video, User, Channel, Comment } from "../Model/model.js"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function test(req, res) {
    res.json({ message: "Login endpoint works" });
}

// Fetch All Videos
export async function fetchVideos(req, res) {
    const videos = await Video.find({});
    res.status(200).json(videos);
}

// Get Channel and Video Data of a specific user
export async function getVideosByUser(req, res) {
    try {
        const { userId } = req.params;

        // Get user's channel Ids
        const user = await User.findById(userId).select('channels');
        if(!user) return res.status(404).json({ message: "User not found" });

        // Find all videos where channelId is in user's channels
        const videos = await Video.find({ channelId: { $in: user.channels } });
        const channel = await Channel.findOne({ _id: { $in: user.channels } });

        res.status(200).json({ 'videos': videos, 'channel': channel });
        console.log("Sent Channel and Videos Data");

    } catch (error) {
        res.status(500).json({'message': "internal server error"});
    }
}

// Delete Video
export async function deleteVideo(req, res) {
    try {
        const { videoId } = req.params;
        const video = await Video.findById(videoId);

        if(!video) return res.status(404).json({ message: "User not found" });

        await Video.deleteOne({_id: videoId});
        res.status(201).json({ 'message': 'Video Deleted' });
        console.log('Video Deleted');

    } catch (error) {
        res.status(500).json({'message': "internal server error"});
    }
}

// Register a User
export async function signup(req, res) {
    try {
        // Get hold of the user details
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        // Checking if the user already exists in the database. If yes we will return user already exists.
        const user = await User.findOne({email: email});
        if(user) {
            return res.status(400).json({'message': 'User Already Registered, Please Login'})
        }

        // Hashing the password before saving it to the database.
        const salt =  await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username:username,
            email: email,
            password: hashedPassword
        });

        res.status(201).json({'message': 'User Created'});
    } catch (error) {
        res.status(500).json({'message': 'Something Bad Happened', 'Error': error});
    }
}

// Login Validation
export async function validateLogin(req, res, next) {
    try {
        // Getting hold of the User details
        const email = req.body.email;
        const password = req.body.password;

        // Finding the User in the database if exists
        const user = await User.findOne({email: email});

        // If the User does not exist in the database then please Register.
        if(!user) {
            return res.status(401).json({'message': 'User Does not Exist. Please Register'});
        }

        // Check if the given password matches the password in our database
        const isPasswordValid = await bcrypt.compare(password, user.password)

        // If the password does not match we will return password is Incorrect
        if(!isPasswordValid) {
            return res.status(401).json({'message': 'Password is Incorrect'});
        }

        // Adding the user Property to req object
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({'message': 'Something Bad Happened', 'Error': error});
    }
} 

// if the validate login is successful we will provide JWT to the User with login function
export async function login(req,res) {
    try {
        const userId = req.user._id;

        // Generating JWT Token
        const token = jwt.sign({userId: userId, email: req.user.email}, process.env.JWT_SECRET);
        res.status(200).json({'message': 'User Logged In ', 'token': token});
    } catch (error) {
        res.status(500).json({'message': 'Something Bad Happened', 'Error': error});
    }
}

// User Authentication
export async function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader?.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({'message': 'Invalid JWT Token'});
        }
        req.user = user;
        next();
    })
}

// Fetch All Comments
export async function fetchComments(req, res) {
    try {
        const videoId = req.params.id;
        const comments = await Comment.find({videoId: videoId}).sort({createdAt: -1});
        res.status(200).json({'comments': comments});
    } catch (error) {
        res.status(500).json({'message': 'Something Bad Happened'})
    }
}

// Fetch Single Comment
export async function fetchComment(req, res) {
    try {
        const commentId = req.params.id;
        const comment = await Comment.findById(commentId);
        res.status(200).json({'comment': comment});
    } catch (error) {
        res.status(500).json({'message': 'Something Bad Happened'})
    }
}


// Add Comments
export async function addComment(req, res) {
    try {
        const { videoId, userId, username, text } = req.body

        if(!videoId || !userId || !text) {
            return res.status(400).json({'message': 'Missing required fields'});
        }

        await Comment.create({videoId, userId, username, text});
        res.status(201).json({'message': 'Comment Added'});
    } catch(error) {
        res.status(500).json({'message': 'Something Bad Happened'});
    }
}

// Delete Comment
export async function deleteComment(req, res) {
    try {
        const commentId = req.params.id;
        if(!commentId) {
            return res.status(400).json({'message': 'Missing required fields'});
        }
        // Check if the Comment Exists in the database
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({'message': 'Comment with the Id does not Exist'});
        }

        await Comment.deleteOne({_id: commentId});
        console.log('Comment Deleted');
        res.status(200).json({'message': 'Comment Deleted'});
    } catch (error) {
        res.status(500).json({'message': 'Something Bad Happened'})
    }
}

//Update Comment
export async function updateComment(req,res) {
    try {
        const commentId = req.params.id;
        const updatedText = req.body.updatedText;

         // Validate input
         if (!commentId || !updatedText?.trim()) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find and update the comment
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { $set: { text: updatedText } }, // No need to update `createdAt`
            { new: true } // Returns the updated commentuserSignedIn
        );

        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment with the Id does not exist' });
        }

        console.log('Comment updated:', updatedComment);
        res.status(200).json({ message: 'Comment Updated', updatedComment });

    } catch (error) {
        res.status(500).json({'message': 'Something Bad Happened'})
    }
}

// Get the User from the Token
export async function getUserFromToken(req, res) {
    try {
        const authHeader = req.headers['authorization'];
        if(!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader?.split(" ")[1];
        if (!token) {
        return res.status(401).json({ error: "Token not provided" });
        }

        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user details from the database
        // Optionally, you can exclude sensitive fields like the password
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Return the user details
        res.json(user);

    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// Like a Video
export async function like(req, res) {
    try {
        const videoId = req.params.videoId;
        const userId = req.user.userId;

        const video = await Video.findById(videoId);
        
        if(!video) return req.status(404).json({'message': 'Video not Found'});

        // Ensure dislikes exists
        if (!video.dislikes) video.dislikes = [];

        // Remove from dislikes if User previously disliked
        video.dislikes = video.dislikes.filter(id => id.toString() !== userId);

        if (video.likes.includes(userId)) {
            video.likes = video.likes.filter(id => id.toString() !== userId);           //If user has already liked then remove like
            console.log("Like Removed")
        } else {
            video.likes.push(userId);    
            console.log('video liked')                                               //If user has not liked the video then like the video
        }

        await video.save();
        res.status(200).json(video);

    } catch (error) {
        res.status(500).json({'message': 'Something Bad Happened'})
    }
}

// Dislike a Video
export async function dislike(req, res) {
    try {
        const videoId = req.params.videoId;
        const userId = req.user.userId;

        const video = await Video.findById(videoId);
        if(!video) return req.status(404).json({'message': 'Video not Found'});

        // Remove from likes if User previously disliked
        video.likes = video.likes.filter(id => id.toString() !== userId);

        if (video.dislikes.includes(userId)) {
            video.dislikes = video.dislikes.filter(id => id.toString() !== userId);           //If user has already liked then remove like
            console.log("Dislike Removed")
        } else {
            video.dislikes.push(userId);                                                   //If user has not liked the video then like the video
            console.log("Video Disliked")
        }

        await video.save();
        res.status(200).json(video);

    } catch (error) {
        res.status(500).json({'message': 'Something Bad Happened'})
    }
}

// Verify JWT Token
export const verifyToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    if(!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = verified;            //Here adding the user details to request object
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// Create Channel
export const createChannel = async (req, res) => {
    try {
        const { channelName, ownerId, description, channelBanner } = req.body;
        // console.log('Got hold of channel body')

        if (!channelName || !ownerId) {
            return res.status(400).json({ message: "Channel Name and Owner ID are required" });
        }

        const newChannel = new Channel({
            channelName,
            owner: ownerId,
            description,
            channelBanner
        });

        const savedChannel = await newChannel.save();

        // Update the user's channels array with the new channel ID
        await User.findByIdAndUpdate(
            ownerId,
            { $push: { channels: savedChannel._id } },  // Push the new channel ID into channels array
            { new: true, useFindAndModify: false }
        );

        res.status(201).json(savedChannel);
    } catch (error) {
        console.error("Error creating channel:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Check if User has a Channel
export const checkChannel = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if a channel exists for the user
        const channelExists = await Channel.findOne({ owner: userId });

        res.status(200).json({ hasChannel: !!channelExists });
    } catch (error) {
        console.error("Error checking user channel:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}