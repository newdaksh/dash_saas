/**
 * ChatWidget Component
 * An integrated AI Task Assistant chat widget for the Dash SaaS dashboard.
 * Uses the LangGraph chatbot backend with the same authentication.
 */
import React, { useState, useRef, useEffect } from 'react';
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
  Shrink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatbotAPI } from '../services/api';

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

  // Use controlled state if provided
  const effectiveIsOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;
  const handleToggle = onToggle || (() => setIsOpen(!isOpen));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your tasks..."
            className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 pl-4 pr-12 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
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
