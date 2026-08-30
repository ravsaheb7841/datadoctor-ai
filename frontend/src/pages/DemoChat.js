import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { getDemoChatReply } from '../utils/demo';

const DemoChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (text) => {
    const query = (text || input).trim();
    if (!query) return;
    setMessages((prev) => [...prev, { role: 'user', text: query }, { role: 'bot', text: getDemoChatReply(query) }]);
    setInput('');
  };

  const suggestions = [
    'How many rows are in the dataset?',
    'Are there missing values?',
    'What is the average Unit_Price?',
  ];

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-11rem)] text-white">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Data Chat</h1>
        <p className="text-slate-400 text-sm mt-1">Ask about the sample dataset. Full AI chat unlocks after signup.</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <Bot className="w-10 h-10 text-purple-400 mb-3" />
            <p className="text-slate-300 font-medium">Try a sample question</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="px-3 py-1.5 text-xs rounded-full bg-slate-700 hover:bg-slate-600">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'bot' && <Bot className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />}
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
              {m.text}
            </div>
            {m.role === 'user' && <User className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask about the sample data..."
          className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white"
        />
        <button onClick={() => send()} className="btn-press px-5 rounded-xl bg-blue-600 font-medium">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DemoChat;
