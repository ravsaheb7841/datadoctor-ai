import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  Send, MessageSquare, Bot, Sparkles, Zap,
  Copy, CheckCircle2, Trash2, RefreshCw, Clock
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const DataChat = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    { icon: 'rows', text: 'How many rows are in the dataset?' },
    { icon: 'avg', text: 'What is the average of Unit_Price?' },
    { icon: 'missing', text: 'Are there missing values?' },
    { icon: 'max', text: 'Which column has the highest value?' },
    { icon: 'top', text: 'What are the top 5 values?' },
    { icon: 'dup', text: 'Are there duplicate rows?' },
  ];

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiThinking]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/chat/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const history = (data.messages || []).map(msg => ({
          query: msg.user_query,
          response: msg.response,
          timestamp: msg.created_at
        }));
        setMessages(history);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  }, [id, token]);

  const sendMessage = async (customQuery) => {
    const queryText = customQuery || input.trim();
    if (!queryText || loading) return;

    setInput('');
    setLoading(true);
    setAiThinking(true);

    setMessages(prev => [...prev, { query: queryText, response: null, timestamp: new Date().toISOString() }]);

    try {
      const response = await fetch(`${API_URL}/api/datasets/${id}/chat`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });
      const data = await response.json();

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { query: queryText, response: data, timestamp: new Date().toISOString() };
        return newMessages;
      });
    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { query: queryText, response: { answer: 'Sorry, something went wrong. Please try again.' }, timestamp: new Date().toISOString() };
        return newMessages;
      });
    } finally {
      setLoading(false);
      setAiThinking(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const clearHistory = async () => {
    setClearingHistory(true);
    try {
      // Clear from backend
      await fetch(`${API_URL}/api/datasets/${id}/chat/history`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
    setMessages([]);
    setClearingHistory(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="mb-4 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Chat</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ask anything about your dataset</p>
          </div>
        </div>

        {/* Chat Actions */}
        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearHistory}
              disabled={clearingHistory}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Clear history"
            >
              {clearingHistory ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm relative">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}
        ></div>

        <div className="relative p-5 sm:p-6">
          {messages.length === 0 && !aiThinking ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] py-8 animate-scale-in">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-6">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Start a conversation</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">
                Ask questions about your data. I can help with statistics, trends, and data quality.
              </p>

              <div className="flex flex-wrap gap-2.5 justify-center max-w-xl">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.text)}
                    className="stagger-item group px-4 py-2.5 bg-gray-50 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 hover:shadow-md"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                      {q.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg, index) => (
                <div key={index} className="animate-slide-up space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end group">
                    <div className="flex items-end gap-2 max-w-[75%]">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-md shadow-blue-500/20">
                        <p className="text-sm leading-relaxed">{msg.query}</p>
                        <p className="text-[10px] text-blue-200 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  {msg.response && (
                    <div className="flex justify-start group">
                      <div className="flex items-start gap-3 max-w-[85%]">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/25">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="relative bg-gray-100 dark:bg-gray-700/80 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-gray-200/50 dark:border-gray-600/50">
                          <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                            {msg.response.answer || msg.response.error || 'No response'}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{formatTime(msg.timestamp)}</p>

                          {/* Copy Button */}
                          <button
                            onClick={() => copyToClipboard(msg.response.answer || '', index)}
                            className="absolute -right-2 -bottom-2 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy response"
                          >
                            {copiedIndex === index ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* AI Thinking Indicator */}
              {aiThinking && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700/80 px-5 py-3.5 rounded-2xl rounded-tl-md flex items-center gap-1.5 border border-gray-200/50 dark:border-gray-600/50">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask a question about your data... (Enter to send)"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
              disabled={loading}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-press flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            title="Send message"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
          Press Enter to send - AI answers based on your dataset context
        </p>
      </div>
    </div>
  );
};

export default DataChat;