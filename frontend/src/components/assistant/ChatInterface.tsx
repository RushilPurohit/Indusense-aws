import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import QuickActions from './QuickActions';
import { useChat } from '../../hooks/useChat';

interface Props {
  selectedDocId?: string;
}

const ChatInterface: React.FC<Props> = ({ selectedDocId }) => {
  const { messages, loading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input, selectedDocId ? [selectedDocId] : []);
    setInput('');
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action, selectedDocId ? [selectedDocId] : []);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">A.I.</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Maintenance Intelligence Assistant</h2>
            <p className="text-slate-500 mb-8">Ask questions about manuals, diagnose faults, or query machine sensor data.</p>
            <QuickActions onSelect={handleQuickAction} />
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex items-center space-x-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-sm text-slate-500 font-medium">Analyzing documents...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <button type="button" className="absolute left-3 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedDocId ? "Ask a question about the selected document..." : "Ask a question or describe a fault..."}
            className="w-full pl-12 pr-12 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm text-sm"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:hover:bg-primary"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2 text-xs text-slate-400">
          AI can make mistakes. Verify critical maintenance procedures.
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
