import React, { useState, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import PDFViewer from './components/PDFViewer';
import './App.css';

function App() {
  const [activeDocument, setActiveDocument] = useState(null);
  const [highlightText, setHighlightText] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      const url = URL.createObjectURL(file);
      setActiveDocument({ type: 'pdf', url, name: file.name });
    }
  };

  const handleLinkClick = (documentType, documentUrl, highlight = '') => {
    setActiveDocument({ type: documentType, url: documentUrl });
    if (highlight) {
      setHighlightText(highlight);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ChatGPT-like PDF Viewer</h1>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf"
          style={{ display: 'none' }}
        />
        <button 
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload PDF
        </button>
      </header>
      
      <div className="main-container">
        <div className="chat-container">
          <ChatWindow onLinkClick={handleLinkClick} />
        </div>
        
        <div className="pdf-container">
          {activeDocument ? (
            <PDFViewer 
              document={activeDocument} 
              highlightText={highlightText}
              onHighlightChange={setHighlightText}
            />
          ) : (
            <div className="pdf-placeholder">
              <p>No document loaded. Upload a PDF or click a link in the chat to view documents here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;