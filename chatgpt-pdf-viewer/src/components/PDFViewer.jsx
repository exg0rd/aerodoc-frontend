import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import TextViewer from './TextViewer';
import './PDFViewer.css';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ document, highlightText, onHighlightChange }) => {
  // If document type is text, render TextViewer instead
  if (document.type === 'text') {
    return (
      <TextViewer 
        document={document} 
        highlightText={highlightText}
        onHighlightChange={onHighlightChange}
      />
    );
  }

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setError(`Failed to load PDF: ${error.message || error.toString()}`);
    setLoading(false);
  }

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handleSearchInputChange = (e) => {
    onHighlightChange(e.target.value);
  };

  // Custom text renderer to highlight search terms
  const customTextRenderer = useCallback((itemText) => {
    if (!highlightText) return itemText;
    
    const regex = new RegExp(`(${highlightText})`, 'gi');
    const parts = itemText.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="highlight-term">{part}</span>
      ) : part
    );
  }, [highlightText]);

  return (
    <div className="pdf-viewer">
      <div className="pdf-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search and highlight text..."
            value={highlightText}
            onChange={handleSearchInputChange}
          />
        </div>
        
        {numPages && (
          <div className="pagination">
            <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
              Previous
            </button>
            <span>
              Page {pageNumber} of {numPages}
            </span>
            <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
              Next
            </button>
          </div>
        )}
      </div>
      
      <div className="pdf-container-inner">
        {loading ? (
          <div className="loading">Loading PDF...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <Document
            file={document.url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div>Loading PDF...</div>}
            error={<div>Failed to load PDF</div}}
          >
            <Page 
              pageNumber={pageNumber} 
              scale={1.2}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              onGetTextSuccess={(textContent) => {
                // This callback is called when text layer is processed
                // We could implement more sophisticated search here if needed
              }}
              customTextRenderer={customTextRenderer}
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;