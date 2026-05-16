import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Copy, CheckCheck, StopCircle, User, Scale } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { chatWithDocument } from '../services/api';
import { saveChatHistory, getChatHistory } from '../services/storage';
import type { ChatMessage } from '../types/index';

const SUGGESTIONS = [
  'What are the payment conditions?',
  'Explain the termination clause.',
  'What are the penalties for breach?',
  'Summarize the liability section.',
];

const AIChat: React.FC = () => {
  const { currentDocument, documentText } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentDocument?.id) {
      const saved = getChatHistory(currentDocument.id) as ChatMessage[];
      if (saved.length > 0) setMessages(saved);
    }
  }, [currentDocument?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading || !documentText) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Reset textarea height
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
    }

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await chatWithDocument(documentText, question, history);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: res.answer,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, assistantMsg];
      setMessages(updatedMessages);
      if (currentDocument?.id) {
        saveChatHistory(currentDocument.id, updatedMessages);
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ Error: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      // Auto-resize textarea
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  if (!currentDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-slide-up">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>How can I help you today?</h2>
        <p className="mb-8 max-w-md" style={{ color: 'var(--text-muted)' }}>
          Please upload a legal document first so I can assist you with analysis and questions.
        </p>
        <button onClick={() => navigate('/upload')} className="btn-primary px-6 py-3 rounded-full font-medium">
          Upload a Document
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      
      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-4 pb-36 w-full pt-4 md:pt-10">
        <div className="max-w-4xl mx-auto w-full space-y-6 md:space-y-8 flex flex-col">
            
            {/* Empty State / Welcome */}
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-10 md:mt-20 space-y-6 md:space-y-10 animate-slide-up">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: 'var(--brand-main)' }}>
                        <Scale size={24} className="md:w-8 md:h-8" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-center px-4" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                        I'm ready to analyze <br className="hidden md:block"/> <span className="text-blue-600 dark:text-blue-400 break-all">{currentDocument.name}</span>
                    </h2>
                    
                    <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-3 w-full max-w-4xl mt-4 md:mt-8 pb-4 md:pb-0 px-2 scrollbar-hide">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => sendMessage(s)}
                                className="flex-shrink-0 md:flex-shrink text-left px-4 py-3 rounded-2xl text-sm transition-colors border hover:bg-slate-50 dark:hover:bg-slate-800 w-[240px] md:w-auto"
                                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                            >
                                <span className="font-medium text-slate-700 dark:text-slate-300 block">{s}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat History */}
            {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full items-start gap-2 md:gap-4 mb-2 md:mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                    msg.role === 'user' 
                        ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' 
                        : 'text-white'
                }`} style={{ background: msg.role === 'assistant' ? 'var(--brand-main)' : undefined }}>
                    {msg.role === 'user' ? (
                        <User size={14} className="md:w-4 md:h-4" />
                    ) : (
                        <Scale size={14} className="md:w-4 md:h-4" strokeWidth={2.5} />
                    )}
                </div>
                
                <div className={`group relative max-w-[85%] md:max-w-[80%] pt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`prose-legal text-sm md:text-base leading-relaxed p-3 md:p-0 rounded-2xl ${msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-800/50 md:bg-transparent' : ''}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    
                    {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity justify-start">
                            <button
                                onClick={() => copyToClipboard(msg.id, msg.content)}
                                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                                title="Copy"
                            >
                                {copied === msg.id ? <CheckCheck size={14} className="text-green-500" /> : <Copy size={14} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
            <div className="flex w-full justify-start gap-2 md:gap-4">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white mt-1" style={{ background: 'var(--brand-main)' }}>
                    <Scale size={14} strokeWidth={2.5} />
                </div>
                <div className="flex items-center pt-2">
                    <div className="flex space-x-1.5">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
            )}
            <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--bg-app)] via-[var(--bg-app)] to-transparent pt-6 md:pt-10 pb-4 md:pb-6 px-3 md:px-4">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative flex items-end w-full rounded-[24px] md:rounded-3xl overflow-hidden border shadow-sm transition-all focus-within:ring-2 focus-within:ring-slate-300 dark:focus-within:ring-slate-600"
            style={{ 
                background: 'var(--bg-surface)', 
                borderColor: 'var(--border-subtle)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message LexAI..."
              className="w-full max-h-[150px] md:max-h-[200px] min-h-[48px] md:min-h-[52px] py-3 md:py-3.5 pl-4 md:pl-5 pr-12 md:pr-14 resize-none outline-none bg-transparent text-sm md:text-base"
              style={{ color: 'var(--text-main)' }}
              rows={1}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={`absolute right-1.5 md:right-2 bottom-1.5 md:bottom-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                 input.trim() ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              } disabled:cursor-not-allowed`}
            >
              {loading ? <StopCircle size={16} /> : <Send size={16} className={input.trim() ? 'translate-x-0.5' : ''} />}
            </button>
          </div>
          <p className="text-center text-[10px] md:text-xs mt-2 md:mt-3 text-slate-500 dark:text-slate-400 px-4">
            LexAI can make mistakes. Consider verifying important legal information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
