import ChatMessage from '../../models/chatMessage.js';
import FriendRequest from '../../models/friendsRequests.js';
import User from '../../models/user.js';

const getMediaType = (filename) => {
  const ext = filename.split('.').pop();
  if (['jpg', 'jpeg', 'png'].includes(ext)) return 'image';
  if (['mp4', 'avi', 'mov'].includes(ext)) return 'video';
  if (['pdf', 'doc', 'docx'].includes(ext)) return 'document';
  return 'unknown';
};


export const sendMessage = async (req, res) => {
    try {
        const { recipient } = req.query;
        const sender = req.user.id
        const { text } = req.body;



        const checkBlock = await User.findOne({
          $or: [
            { _id: sender, blockedUsers: recipient },  // Check if sender has blocked the recipient
            { _id: recipient, blockedUsers: sender }   // Check if recipient has blocked the sender
          ]
        });

        if (checkBlock) {
          // If the sender has blocked the recipient
          if (String(checkBlock._id) === String(sender)) {
            return res.status(403).json({ message: `You have blocked ${recipient}. Unblock to send a message.` });
          }

          // If the recipient has blocked the sender
          if (String(checkBlock._id) === String(recipient)) {
            return res.status(403).json({ message: `You are blocked by ${sender}.` });
          }
        }

        const friendship = await FriendRequest.findOne({
          $or: [
              { requester: sender, recipient: recipient, status: 'accepted' },
              { requester: recipient, recipient: sender, status: 'accepted' }
          ]
      });

      // If no friendship is found or the status is not accepted, return an error
      if (!friendship) {
          return res.status(403).json({ message: 'You are not friends with this user.' });
      }



      const chatMessage = new ChatMessage({
        sender,
        recipient,
        message: text
      });

      await chatMessage.save();


      req.io.to(recipient).emit('chatMessage', chatMessage);
      req.io.to(sender).emit('chatMessage', chatMessage);


      // console.log(req.io.to(recipient).emit('chatMessage', chatMessage))
      // console.log(req.io.to(sender).emit('chatMessage', chatMessage))

      // console.log('Message emitted to recipient:', chatMessage);


      res.status(200).json(chatMessage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  export const getMessages = async (req, res) => {
    try {
        const recipient = req.params.id;
        const sender = req.user.id;

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;  // Default to page 1 if not provided
        const pageSize = parseInt(req.query.pageSize) || 5000;  // Default to 20 messages per page

        const skip = (page - 1) * pageSize;

        // Fetch messages with pagination
        const messages = await ChatMessage.find()
            .where('$or', [
                { sender: sender, recipient: recipient },
                { sender: recipient, recipient: sender }
            ])
            .populate('sender', 'username name')
            .populate('recipient', 'username name')
            .sort({ createdAt: -1 })  // Newest messages first
            .skip(skip)
            .limit(pageSize);

        // Get total message count for pagination
        const totalMessages = await ChatMessage.countDocuments()
            .where('$or', [
                { sender: sender, recipient: recipient },
                { sender: recipient, recipient: sender }
            ]);

        res.status(200).json({
            messages,
            pagination: {
                totalMessages,
                totalPages: Math.ceil(totalMessages / pageSize),
                currentPage: page,
                pageSize
            }
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
};


export const markMessagesAsRead = async (req, res) => {
  try {
    const { recipient } = req.query;
    const sender = req.user.id;

    // Mark messages as read for the recipient
    await ChatMessage.updateMany(
      { sender, recipient, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'Messages marked as read.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMediaMessage = async (req, res) => {
  try {
    const { recipient } = req.query;
    const sender = req.user.id;
    const files = req.files;


    const checkBlock = await User.findOne({
      $or: [
        { _id: sender, blockedUsers: recipient },
        { _id: recipient, blockedUsers: sender }
      ]
    });

    if (checkBlock) {
      if (String(checkBlock._id) === String(sender)) {
        return res.status(403).json({ message: `You have blocked ${recipient}. Unblock to send a message.` });
      }
      if (String(checkBlock._id) === String(recipient)) {
        return res.status(403).json({ message: `You are blocked by ${sender}.` });
      }
    }


    const friendship = await FriendRequest.findOne({
      $or: [
        { requester: sender, recipient: recipient, status: 'accepted' },
        { requester: recipient, recipient: sender, status: 'accepted' }
      ]
    });

    if (!friendship) {
      return res.status(403).json({ message: 'You are not friends with this user.' });
    }


    const media = files.map(file => ({
      url: file.path,
      type: getMediaType(file.originalname)
    }));

    const chatMessage = new ChatMessage({
      sender,
      recipient,
      message: 'Media shared',
      media: media
    });

    await chatMessage.save();

    
    req.io.to(recipient).emit('chatMessage', chatMessage);
    req.io.to(sender).emit('chatMessage', chatMessage);

    res.status(200).json(chatMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};