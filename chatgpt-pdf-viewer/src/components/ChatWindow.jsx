import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';
import { simulateTypingEffect, findHardcodedResponse } from '../utils/typingEffect';

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
      // Check for hardcoded response first
      const hardcodedResponse = findHardcodedResponse(inputValue);
      
      if (hardcodedResponse) {
        // Use typing effect for hardcoded response
        const botMessageId = Date.now() + 1;
        
        // Add an empty bot message initially
        setMessages(prev => [...prev, {
          id: botMessageId,
          type: 'bot',
          content: ''
        }]);
        
        // Apply typing effect to update the content word by word
        simulateTypingEffect(
          hardcodedResponse,
          (updatedContent) => {
            // Update the specific message with new content
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, content: updatedContent }
                : msg
            ));
          },
          () => {
            // Typing complete - hide loading indicator
            setIsLoading(false);
          }
        );
      } else {
        // Fallback to original API call if no hardcoded response
        // For now, we'll just use a fallback message with typing effect
        const fallbackResponse = "Извините, я не нашел точного ответа на ваш запрос в базе данных. Пожалуйста, уточните свой вопрос.";
        const botMessageId = Date.now() + 1;
        
        // Add an empty bot message initially
        setMessages(prev => [...prev, {
          id: botMessageId,
          type: 'bot',
          content: ''
        }]);
        
        // Apply typing effect to update the content word by word
        simulateTypingEffect(
          fallbackResponse,
          (updatedContent) => {
            // Update the specific message with new content
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, content: updatedContent }
                : msg
            ));
          },
          () => {
            // Typing complete - hide loading indicator
            setIsLoading(false);
          }
        );
      }
    } catch (error) {
      console.error('Error processing request:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Error: Could not process your request. ${error.message}`
      };
      setMessages(prev => [...prev, errorMessage]);
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
          placeholder="Введите Ваш запрос..."
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