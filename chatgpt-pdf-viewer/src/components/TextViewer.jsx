import React, { useState, useCallback } from 'react';
import './TextViewer.css';

const TextViewer = ({ document, highlightText, onHighlightChange }) => {
  const [searchResults, setSearchResults] = useState([]);
  
  const handleSearchInputChange = (e) => {
    onHighlightChange(e.target.value);
  };

  // Function to highlight text
  const highlightTextContent = useCallback((text) => {
    if (!highlightText) return text;
    
    const regex = new RegExp(`(${highlightText})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="highlight-term">{part}</span>
      ) : part
    );
  }, [highlightText]);

  return (
    <div className="text-viewer">
      <div className="text-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search and highlight text..."
            value={highlightText}
            onChange={handleSearchInputChange}
          />
        </div>
      </div>
      
      <div className="text-content">
        <pre>{highlightTextContent(document.content)}</pre>
      </div>
    </div>
  );
};

export default TextViewer;