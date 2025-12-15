import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';

const ChatWindow = ({ onLinkClick, searchResultsCount = 5, useGraphRAG = true, detectContradictions = false }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Добрый день! Я помогу проанализировать документы. Задайте интересующий вопрос ниже, и я найду информацию!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get settings from parent component or default values
      const settings = {
        source_count: searchResultsCount,
        use_graph_rag: useGraphRAG,
        detect_contradictions: detectContradictions
      };

      // Make API call to our backend
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          ...settings
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Format bot response with sources
      let botResponse = `${data.answer}`;
      
      if (data.sources && data.sources.length > 0) {
        botResponse += '<br/><br/><strong>Sources:</strong><ul>';
        data.sources.forEach(source => {
          botResponse += `<li><a href="#" class="doc-link" data-type="pdf" data-url="${source.url}" data-highlight="">${source.title} (Page ${source.page})</a> - ${source.content.substring(0, 100)}${source.content.length > 100 ? '...' : ''}</li>`;
        });
        botResponse += '</ul>';
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Error: Could not process your request. ${error.message}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    const link = e.target.closest('.doc-link');
    if (link) {
      const type = link.getAttribute('data-type');
      const url = link.getAttribute('data-url');
      const highlight = link.getAttribute('data-highlight');
      onLinkClick(type, url, highlight);
    }
  };

  return (
    <div className="chat-window">
      <div className="messages-container" onClick={handleLinkClick}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.type}-message`}
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
        ))}
        {isLoading && (
          <div className="message bot-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;