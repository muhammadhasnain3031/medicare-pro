'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const QUICK_QUESTIONS: Record<string, string[]> = {
  patient: [
    'I have fever and headache, what should I do?',
    'How do I book an appointment?',
    'What are visiting hours?',
    'How do I get my test reports?',
  ],
  doctor: [
    'What is the dosage for Amoxicillin?',
    'Drug interactions for Metformin',
    'ICD-10 code for Type 2 Diabetes',
    'Write a prescription note for hypertension',
  ],
  admin: [
    'How to improve patient satisfaction?',
    'Best practices for staff scheduling',
    'How to reduce no-show appointments?',
    'Revenue optimization tips',
  ],
};

export default function ChatBot() {
  const { user }  = useAuth();
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const quickQ = QUICK_QUESTIONS[user?.role || 'patient'] || QUICK_QUESTIONS.patient;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role:    'assistant',
        content: `Hi ${user?.name?.split(' ')[0]}! 👋 I'm your MediCare AI Assistant.\n\nHow can I help you today?`,
        time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: Message = {
      role:    'user',
      content: msg,
      time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role:    m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        role:    'assistant',
        content: data.reply || 'Sorry, I could not process that.',
        time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: '⚠️ Connection error. Please try again.',
        time:    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    setLoading(false);
  };

  const roleColors: Record<string, string> = {
    patient: 'from-green-600 to-emerald-700',
    doctor:  'from-blue-600 to-indigo-700',
    admin:   'from-purple-600 to-violet-700',
    nurse:   'from-teal-600 to-cyan-700',
    lab:     'from-orange-600 to-amber-700',
    receptionist: 'from-pink-600 to-rose-700',
  };

  const gradient = roleColors[user?.role || 'patient'];

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button onClick={() => setOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br ${gradient} rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform`}>
          <span className="text-2xl">🤖</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className={`fixed bottom-6 right-6 z-50 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ${
          minimized ? 'h-14' : 'h-[500px]'
        }`}>

          {/* Header */}
          <div className={`bg-gradient-to-r ${gradient} p-4 flex items-center justify-between flex-shrink-0`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <p className="text-white font-bold text-sm">MediCare AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-white/80 text-xs">Online · AI Powered</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMinimized(!minimized)}
                className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white text-xs transition-colors">
                {minimized ? '▲' : '▼'}
              </button>
              <button onClick={() => { setOpen(false); setMinimized(false); }}
                className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white text-sm transition-colors">
                ✕
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">
                        🤖
                      </div>
                    )}
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? `bg-gradient-to-br ${gradient} text-white rounded-br-sm`
                          : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-xs text-gray-400 px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">🤖</div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1.5 items-center">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Quick Questions */}
              {messages.length <= 1 && (
                <div className="px-3 py-2 bg-white border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Quick questions:</p>
                  <div className="flex flex-col gap-1.5">
                    {quickQ.map((q, i) => (
                      <button key={i} onClick={() => sendMessage(q)}
                        className="text-left text-xs px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
                        💬 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className={`w-10 h-10 bg-gradient-to-br ${gradient} text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all flex-shrink-0`}>
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-base">➤</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}