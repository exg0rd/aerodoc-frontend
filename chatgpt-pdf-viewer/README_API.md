# JSON API Server for ChatGPT PDF Viewer

This project includes a simple JSON API server to test API endpoints with delayed responses and configurable parameters.

## Environment Variables

You can configure the API server behavior using the following environment variables:

- `PORT` - Port number for the API server (default: 3001)
- `DELAY_MIN` - Minimum delay in milliseconds for API responses (default: 500)
- `DELAY_MAX` - Maximum delay in milliseconds for API responses (default: 2000)
- `DEFAULT_SOURCE_COUNT` - Default number of sources to return (default: 5)

## API Endpoints

### POST /api/chat
Process chat queries with configurable parameters.

**Request body:**
```json
{
  "message": "Your query message",
  "source_count": 5,
  "use_graph_rag": true,
  "detect_contradictions": false
}
```

**Response:**
```json
{
  "id": 1734223456789,
  "answer": "Response message with configurable parameters",
  "sources": [
    {
      "id": 1,
      "title": "Source Document 1",
      "url": "/docs/doc_1.pdf",
      "page": 3,
      "content": "Relevant content from source document...",
      "score": 0.85
    }
  ]
}
```

### GET /health
Health check endpoint.

## Running the API Server

### Using npm scripts:
```bash
# Run the API server
npm run api

# Run with custom environment variables
PORT=4000 DELAY_MIN=1000 DELAY_MAX=3000 npm run api
```

### Direct execution:
```bash
node basic-api-server.mjs
```

## Frontend Integration

The frontend automatically calls the API server at `http://localhost:3001/api/chat` when submitting messages. The settings from the SettingsPanel (source count, Graph RAG, contradiction detection) are passed to the API.

## Configuration

The frontend passes the following parameters to the API:
- `source_count` - Based on the "Количество результатов поиска" slider in settings
- `use_graph_rag` - Based on the "Использовать Graph RAG" checkbox
- `detect_contradictions` - Based on the "Обнаружение противоречий" checkbox