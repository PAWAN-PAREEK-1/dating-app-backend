import ChatMessage from '../../models/chatMessage.js';



export const sendMessage = async (req, res) => {
    try {
        const { recipient } = req.query;
        const sender = req.user.id
        const { text } = req.body;


      const chatMessage = new ChatMessage({
        sender,
        recipient,
        message: text
      });

      await chatMessage.save();


      req.io.to(recipient).emit('chatMessage', chatMessage);
      req.io.to(sender).emit('chatMessage', chatMessage);


      res.status(200).json(chatMessage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


  export const getMessages = async (req, res) => {
    try {
        const  recipient  = req.params.id;
        const sender = req.user.id
        // const sender = req.user.id


        const messages = await ChatMessage.find()
        .where('$or', [
            { sender: sender, recipient: recipient },
            { sender: recipient, recipient: sender }
        ])
        .populate('sender', 'username name')
        .populate('recipient', 'username name')
        .sort({ createdAt: 1 });


        console.log(recipient)

  

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: error.message });
    }
};
