import mongoose from "mongoose";

// Video Schema
const videoSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        videoUrl: { type: String, required: true },
        thumbnailUrl: { type: String, required: true },
    
        channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
        uploader: { type: String, required: true },
    
        views: { type: Number, default: 0 },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],  
        dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],  
    
        uploadDate: { type: Date, default: Date.now },
    }, { timestamps: true }
);

// UserSchema
const userSchema = mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        avatar: { type: String },
        channels: { type: Array }
    }
);

// Channel Schema
const channelSchema = mongoose.Schema(
    {
        channelName: { type: String, required: true, unique: true, trim: true },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        description: { type: String, default: '', trim: true },
        channelBanner: { type: String, default: '' },
        subscribers: { type: Number, default: 0, min: 0 },
        videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
    },
    { timestamps: true }
);

// Comment Schema
const commentSchema = mongoose.Schema(
    {
        videoId: { type: String, required: true },
        userId: { type: String, required: true },
        username: { type: String, default: 'User'},
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }
)

// Forming mongoose models with respective schemas.
export const Video = mongoose.model('videos', videoSchema);
export const User = mongoose.model('users', userSchema);
export const Channel = mongoose.model('channels', channelSchema);
export const Comment = mongoose.model('comments', commentSchema);
