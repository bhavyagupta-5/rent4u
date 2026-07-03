const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getIO, sendToUser } = require('../services/socketService');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name email avatar role verified')
    .populate('listing', 'title location rent images status')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name'
      }
    })
    .sort('-updatedAt');

    
    const data = await Promise.all(conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: userId },
        read: false
      });
      return {
        ...conv.toObject(),
        unreadCount
      };
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation thread not found' });
    }

    
    if (!conversation.participants.map(p => p.toString()).includes(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages in this conversation' });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Message.countDocuments({ conversation: conversationId });

    
    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: messages.reverse()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const senderId = req.user.id;

    if (!conversationId || !text) {
      return res.status(400).json({ success: false, message: 'Conversation ID and message text are required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.map(p => p.toString()).includes(senderId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages here' });
    }

    
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text: text,
      read: false
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar');

    
    conversation.lastMessage = message._id;
    await conversation.save();

    
    const io = getIO();
    if (io) {
      const roomName = `conv_${conversationId}`;
      io.to(roomName).emit('receive_message', populatedMessage);
      
      
      conversation.participants.forEach((participantId) => {
        const partStr = participantId.toString();
        if (partStr !== senderId) {
          sendToUser(partStr, 'new_notification', {
            type: 'message',
            conversationId,
            message: {
              _id: message._id,
              text: text,
              senderName: populatedMessage.sender.name,
            }
          });
        }
      });
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
