const { Server } = require('socket.io');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

let io = null;
const onlineUsers = new Map(); 

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    
    socket.on('register_user', (userId) => {
      if (!userId) return;
      socket.userId = userId;
      
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      
      
      io.emit('user_status_change', { userId, status: 'online' });
      console.log(`Socket user registered: ${userId} (socket: ${socket.id})`);
    });

    
    socket.on('join_conversation', (conversationId) => {
      const roomName = `conv_${conversationId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    
    socket.on('typing', ({ conversationId, isTyping }) => {
      const roomName = `conv_${conversationId}`;
      socket.to(roomName).emit('typing_status', {
        conversationId,
        userId: socket.userId,
        isTyping
      });
    });

    
    socket.on('send_message', async ({ conversationId, senderId, text }) => {
      try {
        if (!conversationId || !senderId || !text) return;

        
        const newMessage = await Message.create({
          conversation: conversationId,
          sender: senderId,
          text: text,
          read: false
        });

        
        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'name email avatar');

        
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id
        });

        
        const roomName = `conv_${conversationId}`;
        io.to(roomName).emit('receive_message', populatedMessage);

        
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.participants.forEach((participantId) => {
            const partStr = participantId.toString();
            if (partStr !== senderId) {
              sendToUser(partStr, 'new_notification', {
                type: 'message',
                conversationId,
                message: {
                  _id: newMessage._id,
                  text: text,
                  senderName: populatedMessage.sender.name,
                }
              });
            }
          });
        }
      } catch (err) {
        console.error("Socket send_message error:", err.message);
      }
    });

    
    socket.on('mark_seen', async ({ conversationId, userId }) => {
      try {
        if (!conversationId || !userId) return;

        
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, read: false },
          { $set: { read: true } }
        );

        
        const roomName = `conv_${conversationId}`;
        io.to(roomName).emit('messages_marked_seen', { conversationId, userId });
      } catch (err) {
        console.error("Socket mark_seen error:", err.message);
      }
    });

    
    socket.on('get_online_users', () => {
      socket.emit('online_users_list', Array.from(onlineUsers.keys()));
    });

    
    socket.on('disconnect', () => {
      const userId = socket.userId;
      if (userId && onlineUsers.has(userId)) {
        const socketSet = onlineUsers.get(userId);
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          onlineUsers.delete(userId);
          
          io.emit('user_status_change', { userId, status: 'offline' });
        }
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const sendToUser = (userId, event, data) => {
  if (onlineUsers.has(userId)) {
    const socketIds = onlineUsers.get(userId);
    socketIds.forEach((socketId) => {
      if (io) io.to(socketId).emit(event, data);
    });
  }
};

const getIO = () => io;

module.exports = {
  initSocket,
  getIO,
  sendToUser,
};
