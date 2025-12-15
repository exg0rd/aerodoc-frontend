// import React, { useState, useCallback } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
// import TextViewer from './TextViewer';
// import './PDFViewer.css';

// // ✅ Инициализация worker'а для pdf.js
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.min.mjs`;

// console.log(pdfjs.version)

// const PDFViewer = ({ document, highlightText, onHighlightChange }) => {
//   // If document type is text, render TextViewer instead
//   if (document.type === 'text') {
//     return (
//       <TextViewer
//         document={document}
//         highlightText={highlightText}
//         onHighlightChange={onHighlightChange}
//       />
//     );
//   }

//   const [numPages, setNumPages] = useState(null);
//   const [pageNumber, setPageNumber] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchResults, setSearchResults] = useState([]);

//   function onDocumentLoadSuccess({ numPages }) {
//     setNumPages(numPages);
//     setLoading(false);
//   }

//   function onDocumentLoadError(error) {
//     console.error('Error loading PDF:', error);
//     setError(`Failed to load PDF: ${error.message || error.toString()}`);
//     setLoading(false);
//   }

//   const goToPrevPage = () => {
//     if (pageNumber > 1) {
//       setPageNumber(pageNumber - 1);
//     }
//   };

//   const goToNextPage = () => {
//     if (pageNumber < numPages) {
//       setPageNumber(pageNumber + 1);
//     }
//   };

//   const handleSearchInputChange = (e) => {
//     onHighlightChange(e.target.value);
//   };

//   // Custom text renderer to highlight search terms
//   const customTextRenderer = useCallback((itemText) => {
//     if (!highlightText) return itemText;

//     const regex = new RegExp(`(${highlightText})`, 'gi');
//     const parts = itemText.split(regex);

//     return parts.map((part, index) =>
//       regex.test(part) ? (
//         <span key={index} className="highlight-term">{part}</span>
//       ) : part
//     );
//   }, [highlightText]);

//   return (
//     <div className="pdf-viewer">
//       <div className="pdf-controls">
//         <div className="search-box">
//           <input
//             type="text"
//             placeholder="Поиск и выделение текста..."
//             value={highlightText}
//             onChange={handleSearchInputChange}
//           />
//         </div>

//         {numPages && (
//           <div className="pagination">
//             <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
//               Предыдущая
//             </button>
//             <span>
//               Страница {pageNumber} из {numPages}
//             </span>
//             <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
//               Следующая
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="pdf-container-inner">
//         {
//           <Document
//             file={document.file} // 👈 вместо document.url
//             onLoadSuccess={onDocumentLoadSuccess}
//             onLoadError={onDocumentLoadError}
//             loading={<div>Loading PDF...</div>}
//             error={<div>Failed to load PDF</div>}
//           >
//             <Page
//               pageNumber={pageNumber}
//               scale={1.2}
//               renderTextLayer={true}
//               renderAnnotationLayer={true}
//               customTextRenderer={customTextRenderer}
//             />
//           </Document>
//         }
//       </div>
//     </div>
//   );
// };

// export default PDFViewer;

import React, { useState, useRef } from 'react';
import { usePdf } from '@mikecousins/react-pdf';

const MyPdfViewer = () => {
  const [page, setPage] = useState(1);
  const canvasRef = useRef(null);

  const { pdfDocument, pdfPage } = usePdf({
    file: 'test/1.pdf',
    page,
    canvasRef,
  });

  return (
    <div>
      {!pdfDocument && <span>Loading...</span>}
      <canvas ref={canvasRef} />
      {Boolean(pdfDocument && pdfDocument.numPages) && (
        <nav>
          <ul className="pager">
            <li className="previous">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
            </li>
            <li className="next">
              <button
                disabled={page === pdfDocument.numPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};