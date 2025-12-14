# ChatGPT-like PDF Viewer

A React-based application that provides a ChatGPT-like interface with integrated PDF viewing capabilities. The application features a split-screen layout with a chat interface on the left and a PDF viewer on the right.

## Features

- **Chat Interface**: ChatGPT-like conversation interface with message history
- **PDF Viewer**: PDF viewing capabilities with page navigation
- **Text Highlighting**: Search and highlight specific text in PDFs
- **Document Links**: Click links in chat messages to open specific documents
- **Responsive Design**: Adapts to different screen sizes

## How to Use

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Upload PDFs**: Use the "Upload PDF" button to load documents

3. **Chat with the AI**: Type messages in the input field at the bottom of the chat window

4. **Open Documents from Chat**: When the AI responds with document links, click them to open the PDF in the right panel

5. **Search in PDFs**: Use the search box in the PDF viewer to highlight specific text

## Project Structure

```
src/
├── components/
│   ├── ChatWindow.jsx      # Chat interface component
│   ├── PDFViewer.jsx       # PDF viewing component
│   ├── ChatWindow.css      # Chat window styles
│   └── PDFViewer.css       # PDF viewer styles
├── App.jsx                 # Main application component
├── App.css                 # Main application styles
├── main.jsx                # React entry point
└── index.css               # Global styles
```

## Implementation Details

- **React**: Frontend library for building user interfaces
- **react-pdf**: PDF rendering library
- **Vite**: Build tool for fast development
- **PDF.js**: Underlying PDF rendering engine

## Future Enhancements

- Word document support
- More sophisticated text highlighting
- Annotation capabilities
- AI integration for document analysis
- Better search functionality across multiple documents