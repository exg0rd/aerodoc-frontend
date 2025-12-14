import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';

const ChatWindow = ({ onLinkClick }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I can help you analyze documents. Upload a PDF or ask me questions about documents.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sample documents for demonstration
  const sampleDocs = [
    { type: 'pdf', url: '/sample.pdf', name: 'Sample Document.pdf', text: 'important findings' },
    { type: 'pdf', url: '/report.pdf', name: 'Annual Report.pdf', text: 'financial data' }
  ];

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

    // Simulate bot response after delay
    setTimeout(() => {
      let botResponse = '';
      
      // Check if the user mentioned specific documents or asked to open one
      const lowerInput = inputValue.toLowerCase();
      let shouldShowDocLink = false;
      let docToOpen = null;
      let highlightText = '';

      if (lowerInput.includes('show') || lowerInput.includes('open') || lowerInput.includes('view')) {
        // Find if user mentioned a specific document
        for (const doc of sampleDocs) {
          if (lowerInput.includes(doc.name.toLowerCase().replace('.pdf', ''))) {
            shouldShowDocLink = true;
            docToOpen = doc;
            break;
          }
        }
        
        // If no specific doc mentioned, just suggest showing one
        if (!shouldShowDocLink && sampleDocs.length > 0) {
          shouldShowDocLink = true;
          docToOpen = sampleDocs[0];
        }
      }

      // Check for text that might need highlighting
      const match = inputValue.match(/highlight\s+(.+)/i);
      if (match) {
        highlightText = match[1].trim();
        shouldShowDocLink = true;
        docToOpen = sampleDocs[0];
      }

      if (shouldShowDocLink && docToOpen) {
        botResponse = `I found information about "${docToOpen.name}". Click here to view it and highlight "${highlightText || 'relevant sections'}": `;
        botResponse += `<a href="#" class="doc-link" data-type="${docToOpen.type}" data-url="${docToOpen.url}" data-highlight="${highlightText}">
          View ${docToOpen.name}
        </a>`;
      } else {
        botResponse = `I received your message: "${inputValue}". In a real implementation, I would process your request and potentially return links to documents or specific text sections.`;
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
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