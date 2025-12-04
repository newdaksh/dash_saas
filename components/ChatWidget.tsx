/**
 * ChatWidget Component
 * An integrated AI Task Assistant chat widget for the Dash SaaS dashboard.
 * Uses the LangGraph chatbot backend with the same authentication.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User as UserIcon, 
  X, 
  Loader2, 
  RotateCcw,
  Minimize2,
  Maximize2,
  Expand,
  Shrink,
  RefreshCw,
  Bell
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatbotAPI } from '../services/api';
import websocketService, { WebSocketEventType, WebSocketMessage } from '../services/websocket';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp?: string;
}

interface ChatWidgetProps {
  userName?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  userName = 'User',
  isOpen: controlledIsOpen,
  onToggle 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasDataChanges, setHasDataChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      content: `Hello ${userName}! I'm your Task Assistant. I can help you create, view, update, and manage tasks. How can I help you today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Use controlled state if provided
  const effectiveIsOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;
  const handleToggle = onToggle || (() => setIsOpen(!isOpen));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea when input changes
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const newHeight = Math.min(ta.scrollHeight, 192); // limit to match max visual size
    ta.style.height = `${newHeight}px`;
  }, [input]);

  // list insertion functionality removed; only newline (Shift+Enter) is kept

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await chatbotAPI.getHistory();
        if (data.history && data.history.length > 0) {
          setMessages(data.history.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          })));
        }
      } catch (err) {
        console.log('No previous chat history');
      }
    };
    loadHistory();
  }, []);

  // Listen for WebSocket events for real-time data changes
  useEffect(() => {
    const handleDataUpdate = (message: WebSocketMessage) => {
      const changeDescription = getChangeDescription(message);
      if (changeDescription) {
        setHasDataChanges(true);
        setPendingChanges(prev => {
          // Keep only last 10 changes
          const updated = [...prev, changeDescription].slice(-10);
          return updated;
        });
      }
    };

    // Subscribe to task-related events
    const unsubscribeTaskCreated = websocketService.on(WebSocketEventType.TASK_CREATED, handleDataUpdate);
    const unsubscribeTaskUpdated = websocketService.on(WebSocketEventType.TASK_UPDATED, handleDataUpdate);
    const unsubscribeTaskDeleted = websocketService.on(WebSocketEventType.TASK_DELETED, handleDataUpdate);
    const unsubscribeTaskAssigned = websocketService.on(WebSocketEventType.TASK_ASSIGNED, handleDataUpdate);
    const unsubscribeTaskStatus = websocketService.on(WebSocketEventType.TASK_STATUS_CHANGED, handleDataUpdate);

    // Subscribe to project-related events
    const unsubscribeProjectCreated = websocketService.on(WebSocketEventType.PROJECT_CREATED, handleDataUpdate);
    const unsubscribeProjectUpdated = websocketService.on(WebSocketEventType.PROJECT_UPDATED, handleDataUpdate);
    const unsubscribeProjectDeleted = websocketService.on(WebSocketEventType.PROJECT_DELETED, handleDataUpdate);
    const unsubscribeProjectMember = websocketService.on(WebSocketEventType.PROJECT_MEMBER_ADDED, handleDataUpdate);

    // Subscribe to user-related events
    const unsubscribeUserInvited = websocketService.on(WebSocketEventType.USER_INVITED, handleDataUpdate);
    const unsubscribeUserJoined = websocketService.on(WebSocketEventType.USER_JOINED, handleDataUpdate);
    const unsubscribeUserUpdated = websocketService.on(WebSocketEventType.USER_UPDATED, handleDataUpdate);

    // Subscribe to invitation events
    const unsubscribeInvitationReceived = websocketService.on(WebSocketEventType.INVITATION_RECEIVED, handleDataUpdate);
    const unsubscribeInvitationResponse = websocketService.on(WebSocketEventType.INVITATION_RESPONSE, handleDataUpdate);

    // Subscribe to comment events
    const unsubscribeCommentAdded = websocketService.on(WebSocketEventType.COMMENT_ADDED, handleDataUpdate);
    const unsubscribeCommentDeleted = websocketService.on(WebSocketEventType.COMMENT_DELETED, handleDataUpdate);

    return () => {
      // Cleanup task subscriptions
      unsubscribeTaskCreated();
      unsubscribeTaskUpdated();
      unsubscribeTaskDeleted();
      unsubscribeTaskAssigned();
      unsubscribeTaskStatus();
      // Cleanup project subscriptions
      unsubscribeProjectCreated();
      unsubscribeProjectUpdated();
      unsubscribeProjectDeleted();
      unsubscribeProjectMember();
      // Cleanup user subscriptions
      unsubscribeUserInvited();
      unsubscribeUserJoined();
      unsubscribeUserUpdated();
      // Cleanup invitation subscriptions
      unsubscribeInvitationReceived();
      unsubscribeInvitationResponse();
      // Cleanup comment subscriptions
      unsubscribeCommentAdded();
      unsubscribeCommentDeleted();
    };
  }, []);

  // Helper to generate change descriptions
  const getChangeDescription = (message: WebSocketMessage): string | null => {
    const payload = message.payload;
    switch (message.type) {
      // Task events
      case WebSocketEventType.TASK_CREATED:
        return `Task "${payload.title}" was created`;
      case WebSocketEventType.TASK_UPDATED:
        return `Task "${payload.title}" was updated`;
      case WebSocketEventType.TASK_DELETED:
        return `A task was deleted`;
      case WebSocketEventType.TASK_ASSIGNED:
        return `Task "${payload.title}" was reassigned to ${payload.assignee_name}`;
      case WebSocketEventType.TASK_STATUS_CHANGED:
        return `Task status changed to ${payload.status}`;
      
      // Project events
      case WebSocketEventType.PROJECT_CREATED:
        return `Project "${payload.name}" was created`;
      case WebSocketEventType.PROJECT_UPDATED:
        return `Project "${payload.name}" was updated`;
      case WebSocketEventType.PROJECT_DELETED:
        return `A project was deleted`;
      case WebSocketEventType.PROJECT_MEMBER_ADDED:
        return `A member was added to project "${payload.name || 'a project'}"`;
      
      // User events
      case WebSocketEventType.USER_INVITED:
        return `User "${payload.email || 'someone'}" was invited`;
      case WebSocketEventType.USER_JOINED:
        return `User "${payload.name || 'someone'}" joined the company`;
      case WebSocketEventType.USER_UPDATED:
        return `User "${payload.name || 'a user'}" was updated`;
      
      // Invitation events
      case WebSocketEventType.INVITATION_RECEIVED:
        return `New invitation received from ${payload.company_name || 'a company'}`;
      case WebSocketEventType.INVITATION_RESPONSE:
        return `Invitation ${payload.action === 'accept' ? 'accepted' : 'declined'} by ${payload.invitee_email || 'user'}`;
      
      // Comment events
      case WebSocketEventType.COMMENT_ADDED:
        return `New comment added by ${payload.user_name || 'someone'}`;
      case WebSocketEventType.COMMENT_DELETED:
        return `A comment was deleted`;
      
      default:
        return null;
    }
  };

  // Handle acknowledging data changes and refreshing context
  const handleRefreshContext = useCallback(async () => {
    if (loading) return;
    
    try {
      // Notify the chatbot backend about the changes
      if (pendingChanges.length > 0) {
        await chatbotAPI.notifyChanges(pendingChanges);
      }
      
      // Add a local message about the refresh
      const changesInfo = pendingChanges.length > 0 
        ? `Recent changes:\n${pendingChanges.map(c => `• ${c}`).join('\n')}`
        : 'Data has been updated in the dashboard.';
      
      setMessages(prev => [...prev, {
        role: 'bot',
        content: `🔄 **Dashboard data has been updated!**\n\n${changesInfo}\n\nI'm now using the latest data. You can ask me about tasks again to see the updated information.`,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Error notifying chatbot about changes:', err);
      // Still show the message locally
      setMessages(prev => [...prev, {
        role: 'bot',
        content: `🔄 **Data has changed!** Please ask about tasks again to see the latest information.`,
        timestamp: new Date().toISOString()
      }]);
    }
    
    setHasDataChanges(false);
    setPendingChanges([]);
  }, [loading, pendingChanges]);

  const handleResetChat = async () => {
    if (loading || resetting) return;
    setResetting(true);

    try {
      await chatbotAPI.resetChat();
      setMessages([
        {
          role: 'bot',
          content: `Hello ${userName}! I've cleared our previous conversation. How can I help you with your tasks?`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err: any) {
      console.error('Error resetting chat:', err);
      // Still reset locally for UX
      setMessages([
        {
          role: 'bot',
          content: `Hello ${userName}! Starting fresh. How can I help you?`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setResetting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Always notify chatbot about any pending changes before sending message
    // This ensures real-time data sync on every interaction
    if (pendingChanges.length > 0) {
      try {
        await chatbotAPI.notifyChanges(pendingChanges);
      } catch (err) {
        console.error('Error notifying about changes:', err);
      }
      // Clear the changes regardless of API success
      setHasDataChanges(false);
      setPendingChanges([]);
    }
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg,
      timestamp: new Date().toISOString()
    }]);
    setLoading(true);

    try {
      const response = await chatbotAPI.sendMessage(userMsg);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: response.response,
        timestamp: new Date().toISOString()
      }]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      if (err.response?.status === 401) {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "Your session has expired. Please refresh the page and try again.",
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString()
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Floating button when closed
  if (!effectiveIsOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={handleToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white z-50 hover:shadow-xl transition-shadow"
        title="Open Task Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 w-72 bg-gray-900 rounded-xl shadow-2xl z-50 border border-gray-700"
      >
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-white font-medium text-sm">Task Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              title="Expand chat"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggle(); }}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full chat window
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`fixed bg-gray-900 shadow-2xl z-50 flex flex-col border border-gray-700 overflow-hidden transition-all duration-300 ${
        isFullscreen 
          ? 'inset-0 w-full h-full rounded-none' 
          : 'bottom-6 right-6 w-96 h-[600px] rounded-xl'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Task Assistant</h3>
            <p className="text-xs text-white/70">AI-powered task management</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Data refresh indicator */}
          {hasDataChanges && (
            <button
              onClick={handleRefreshContext}
              disabled={loading}
              className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-300 hover:text-yellow-200 transition-colors animate-pulse disabled:opacity-50 relative"
              title={`Data updated! ${pendingChanges.length} change(s) detected. Click to refresh context.`}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-xs text-black font-bold flex items-center justify-center">
                {pendingChanges.length}
              </span>
            </button>
          )}
          <button
            onClick={handleResetChat}
            disabled={loading || resetting}
            className="p-2 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors disabled:opacity-50"
            title="Reset chat"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Shrink className="w-4 h-4" />
            ) : (
              <Expand className="w-4 h-4" />
            )}
          </button>
          {!isFullscreen && (
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => { setIsFullscreen(false); handleToggle(); }}
            className="p-2 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gray-700'
                }`}>
                  {msg.role === 'user' 
                    ? <UserIcon className="w-4 h-4 text-white" /> 
                    : <Bot className="w-4 h-4 text-blue-400" />
                  }
                </div>
                
                <div className={`p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-sm' 
                    : 'bg-gray-800 text-gray-200 rounded-tl-sm border border-gray-700'
                }`}>
                  <div className="prose prose-sm prose-invert max-w-none text-sm break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-sm border border-gray-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <form onSubmit={handleSend} className="relative">
          {/* Toolbar removed - textarea only */}

          <textarea
            ref={(el) => { textareaRef.current = el; }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
            placeholder="Ask about your tasks... (Enter to send, Shift+Enter for newline)"
            className="w-full bg-gray-900 border border-gray-600 rounded-xl py-2 pl-4 pr-12 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none max-h-48 overflow-auto"
            disabled={loading}
            rows={2}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Try: "Show my tasks" or "Create a new task"
        </p>
      </div>
    </motion.div>
  );
};

export default ChatWidget;
