import cron from 'node-cron';
import ChatMessage from '../models/chatMessage.js';


cron.schedule('* * * * *', async () => {
  console.log('Cron job is running every minute:', new Date());  

  try {
    const now = new Date();
    const result = await ChatMessage.updateMany(
      {
        messageDeleteTime: { $lte: now },
        is_deleted: false
      },
      { $set: { is_deleted: true } }
    );

    console.log('Checked for expired messages and marked them as deleted.');
    console.log(`Matched ${result.matchedCount} documents.`);
    console.log(`Modified ${result.modifiedCount} documents.`);
  } catch (error) {
    console.error('Error checking for expired messages:', error);
  }
});
