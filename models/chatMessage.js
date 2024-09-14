import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    // type: String,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    // type: String,
    ref: 'User',
    required: true
  },
  media: [
    {
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['image', 'video', 'document'],
        required: true
      }
    }
  ],
  message: {
    type: String,
    required: true
  },
  is_deleted:{
    type: Boolean,
    default: false
  },
  messageDeleteTime: {
    type: Date
  },
  read: { type: Boolean, default: false },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
