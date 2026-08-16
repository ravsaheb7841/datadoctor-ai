import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { Send, MessageSquare } from 'lucide-react';

const DataChat = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/chat/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const history = data.messages.map(msg => ({
        query: msg.user_query,
        response: msg.response,
        timestamp: msg.created_at
      }));
      setMessages(history);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const query = input.trim();
    setInput('');
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/datasets/${id}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { query, response: data, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.error('Chat failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
          Data Chat
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Ask questions about your data in natural language</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start a conversation</h3>
            <p className="text-gray-500">Ask questions about your dataset</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index}>
                <div className="flex justify-end mb-2">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-md">
                    {msg.query}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg max-w-2xl">
                    <p className="text-gray-900 dark:text-white">{msg.response.answer}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question about your data..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataChat;