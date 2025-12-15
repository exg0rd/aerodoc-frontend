import React, { useState, useRef, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import PDFViewer from './components/PDFViewer';
import SettingsPanel from './components/SettingsPanel';
import './App.css';

function App() {
  const [activeDocument, setActiveDocument] = useState(null);
  const [highlightText, setHighlightText] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [searchResultsCount, setSearchResultsCount] = useState(5);
  const [useGraphRAG, setUseGraphRAG] = useState(true);
  const [detectContradictions, setDetectContradictions] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize dark mode based on system preference or stored preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

    if (newDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (file.type === 'application/pdf' || fileExtension === 'pdf') {
        const url = URL.createObjectURL(file);
        setActiveDocument({ type: 'pdf', url, name: file.name });
      } else if (file.type.startsWith('text/') || fileExtension === 'txt' || fileExtension === 'md') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setActiveDocument({ type: 'text', content: e.target.result, name: file.name });
        };
        reader.readAsText(file);
        console.log(file)
      } else {
        alert('Unsupported file type. Please upload a PDF or text file.');
      }
    }
  };

  const handleLinkClick = (documentType, documentUrl, highlight = '') => {
    // For now, we'll just handle PDF links to sample documents
    // In a real implementation, you might want to load the document content
    if (documentType === 'pdf') {
      setActiveDocument({ type: documentType, url: documentUrl });
    } else if (documentType === 'text') {
      // For demonstration, we'll load a sample text content
      setActiveDocument({
        type: documentType,
        content: `This is a sample text document.\n\nYou can search for terms like "${highlight || 'sample'}" in this document.\n\nAdditional content for demonstration purposes.`,
        name: 'Sample Document.txt'
      });
    }
    if (highlight) {
      setHighlightText(highlight);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>✈️ Aerodoc Assistant v1.0</h1>
        <div className="header-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.md,.text"
            style={{ display: 'none' }}
          />
          <button
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Загрузить документ
          </button>
          <button
            className="theme-toggle-btn"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Переключиться в светлый режим" : "Переключиться в темный режим"}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="main-container">
        <div className="settings-container">
          <SettingsPanel
            searchResultsCount={searchResultsCount}
            setSearchResultsCount={setSearchResultsCount}
            useGraphRAG={useGraphRAG}
            setUseGraphRAG={setUseGraphRAG}
            detectContradictions={detectContradictions}
            setDetectContradictions={setDetectContradictions}
          />
        </div>
        <div className="right-panel">
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
                <p>Документ не загружен. Загрузите PDF или нажмите на ссылку в чате, чтобы открыть документ здесь.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;