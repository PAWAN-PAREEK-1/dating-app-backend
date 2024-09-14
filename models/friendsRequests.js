import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
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
        required: true,
        enum: ['pending', 'requested', 'accepted']
    },
    chatDeleteTime: {
        type: Number,  
        required: false,
        default: 2/60
      },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

export default FriendRequest;
