import React, { useEffect, useState, useRef } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, MapPin, Check, CheckCheck, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import UserAvatar from '../components/Common/UserAvatar';

const ChatPage = () => {
  const { user } = useAuth();
  const { 
    socket, 
    onlineUsers, 
    typingUsers, 
    activeConversationId, 
    setActiveConversationId 
  } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const chatBottomRef = useRef(null);

  
  const fetchConversations = async () => {
    try {
      setLoadingConv(true);
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load conversations list:", err.message);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  
  const selectConversation = async (conv) => {
    setActiveConversationId(conv._id);
    setMessages([]);
    setLoadingMsgs(true);
    
    
    setConversations(prev => prev.map(c => 
      c._id === conv._id ? { ...c, unreadCount: 0 } : c
    ));

    try {
      
      const res = await api.get(`/messages/conversations/${conv._id}/messages`);
      if (res.data.success) {
        setMessages(res.data.data);
      }

      
      if (socket) {
        socket.emit('join_conversation', conv._id);
        socket.emit('mark_seen', { conversationId: conv._id, userId: user._id });
      }
    } catch (err) {
      toast.error("Could not load messages history");
    } finally {
      setLoadingMsgs(false);
    }
  };

  
  useEffect(() => {
    if (!socket) return;

    
    const handleReceiveMessage = (msg) => {
      if (activeConversationId === msg.conversation) {
        setMessages(prev => [...prev, msg]);
        
        socket.emit('mark_seen', { conversationId: activeConversationId, userId: user._id });
      } else {
        
        setConversations(prev => prev.map(c => 
          c._id === msg.conversation ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMessage: msg } : c
        ));
      }
    };

    
    const handleMarkedSeen = ({ conversationId: seenConvId }) => {
      if (activeConversationId === seenConvId) {
        setMessages(prev => prev.map(m => m.sender._id !== user._id ? m : { ...m, read: true }));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_marked_seen', handleMarkedSeen);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_marked_seen', handleMarkedSeen);
    };
  }, [socket, activeConversationId, user]);

  
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId || !socket) return;

    
    if (isTyping) {
      socket.emit('typing', { conversationId: activeConversationId, isTyping: false });
      setIsTyping(false);
    }

    
    socket.emit('send_message', {
      conversationId: activeConversationId,
      senderId: user._id,
      text: inputText.trim()
    });

    setInputText('');
  };

  
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!activeConversationId || !socket) return;

    if (!isTyping) {
      socket.emit('typing', { conversationId: activeConversationId, isTyping: true });
      setIsTyping(true);
    }

    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId: activeConversationId, isTyping: false });
      setIsTyping(false);
    }, 2000);
  };

  
  const currentConv = conversations.find(c => c._id === activeConversationId);
  
  const partner = currentConv?.participants.find(p => p._id !== user._id);
  const partnerOnline = partner ? onlineUsers.includes(partner._id) : false;
  
  const partnerTyping = activeConversationId && partner && typingUsers[activeConversationId]?.[partner._id];

  return (
    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden flex h-[calc(100vh-12rem)] shadow-sm">
      
      {}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white/30 dark:bg-slate-950/20">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 text-left">
          <h3 className="font-bold text-sm">Conversations</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConv ? (
            <div className="p-4 flex items-center justify-center text-slate-400 text-xs">
              <Loader2 className="animate-spin mr-1" size={14} /> Loading threads
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No active chat rooms found</p>
          ) : (
            conversations.map((conv) => {
              const other = conv.participants.find(p => p._id !== user._id);
              const isSelected = conv._id === activeConversationId;
              const isOnline = other ? onlineUsers.includes(other._id) : false;

              return (
                <button
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left ${
                    isSelected 
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 dark:shadow-none' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <UserAvatar 
                      name={other?.name}
                      avatar={other?.avatar} 
                      className="h-10 w-10 rounded-xl"
                    />
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{other?.name}</span>
                      {conv.unreadCount > 0 && !isSelected && (
                        <span className="h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.listing && (
                      <span className={`block text-[9px] font-bold truncate ${isSelected ? 'text-primary-100/90' : 'text-primary-600 dark:text-primary-400'}`}>
                        🏡 {conv.listing.title}
                      </span>
                    )}
                    <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-primary-200' : 'text-slate-400'}`}>
                      {conv.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {}
      <div className="flex-1 flex flex-col justify-between bg-slate-50/20 dark:bg-slate-950/10">
        {activeConversationId ? (
          <>
            {}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <UserAvatar 
                  name={partner?.name}
                  avatar={partner?.avatar} 
                  className="h-9 w-9 rounded-xl"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{partner?.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${partnerOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span className="text-[9px] text-slate-400 font-medium">{partnerOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>

              {currentConv?.listing && (
                <div className="text-right hidden sm:block">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Listing Context</span>
                  <span className="text-xs font-bold text-primary-500 line-clamp-1">{currentConv.listing.title}</span>
                </div>
              )}
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {loadingMsgs ? (
                <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                  <Loader2 className="animate-spin mr-1" size={14} /> Loading logs
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Send a message to start conversation
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender._id === user._id;
                  return (
                    <div 
                      key={msg._id} 
                      className={`flex gap-3 max-w-[70%] text-left ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <UserAvatar 
                        name={msg.sender.name}
                        avatar={msg.sender.avatar} 
                        className="h-7 w-7 rounded-lg shrink-0 mt-0.5"
                      />
                      <div className="space-y-1">
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe 
                            ? 'bg-primary-600 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none dark:bg-slate-800 dark:border-slate-700/60 dark:text-slate-200'
                        }`}>
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 justify-end">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            msg.read ? <CheckCheck size={11} className="text-emerald-500" /> : <Check size={11} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef}></div>
            </div>

            {}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
              
              {}
              {partnerTyping && (
                <div className="flex items-center gap-1.5 mb-2 pl-2 text-left">
                  <span className="text-[10px] text-slate-400 font-medium italic">{partner.name} is typing...</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 glass-input text-xs"
                  value={inputText}
                  onChange={handleInputChange}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-500/20 disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
            <MessageSquare size={36} className="text-slate-300 dark:text-slate-800 mb-2" />
            <p className="text-sm font-bold">Select a conversation thread</p>
            <p className="text-xs text-slate-400 mt-1">Open chats are created automatically once Owner accepts Tenant interest.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatPage;
