// Basic API server without external dependencies (using built-in Node modules only)
const http = require('http');
const url = require('url');

const port = process.env.PORT || 3001;
const DELAY_MIN = parseInt(process.env.DELAY_MIN) || 500;  // Minimum delay in ms
const DELAY_MAX = parseInt(process.env.DELAY_MAX) || 2000; // Maximum delay in ms
const DEFAULT_SOURCE_COUNT = parseInt(process.env.DEFAULT_SOURCE_COUNT) || 5;

// Enable CORS headers
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Function to add delay
const addDelay = (min, max) => {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(() => resolve(delay), delay);
  });
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Add delay to simulate processing time
  const delay = await addDelay(DELAY_MIN, DELAY_MAX);
  console.log(`${new Date().toISOString()} - Request: ${req.method} ${req.url}, Delayed: ${delay}ms`);

  // Set CORS headers for all responses
  setCORSHeaders(res);

  if (req.method === 'POST' && path === '/api/chat') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { message, source_count = DEFAULT_SOURCE_COUNT, use_graph_rag = true, detect_contradictions = false } = data;

        // Generate a random response from our hardcoded responses
        const responses = [
          {
            id: Date.now(),
            answer: `Processing your query: "${message}". This response was generated with ${source_count} sources. Graph RAG: ${use_graph_rag}, Contradiction Detection: ${detect_contradictions}.`,
            sources: Array.from({ length: source_count }, (_, i) => ({
              id: i + 1,
              title: `Source Document ${i + 1}`,
              url: `/docs/doc_${i + 1}.pdf`,
              page: Math.floor(Math.random() * 10) + 1,
              content: `Relevant content from source document ${i + 1} related to your query: "${message}".`,
              score: (Math.random() * 0.9 + 0.1).toFixed(2) // Random score between 0.1 and 1.0
            }))
          },
          {
            id: Date.now(),
            answer: `I analyzed your question about "${message}" using ${source_count} document sources. The system is configured with Graph RAG: ${use_graph_rag} and contradiction detection: ${detect_contradictions}.`,
            sources: Array.from({ length: Math.min(source_count, 3) }, (_, i) => ({
              id: i + 1,
              title: `Analysis Report ${i + 1}`,
              url: `/reports/report_${i + 1}.pdf`,
              page: Math.floor(Math.random() * 5) + 1,
              content: `Detailed analysis from report ${i + 1} showing relevant findings for query: "${message}".`,
              score: (Math.random() * 0.9 + 0.1).toFixed(2)
            }))
          }
        ];

        // Select a random response
        const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(selectedResponse));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'GET' && path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(port, () => {
  console.log(`Basic API Server is running on port ${port}`);
  console.log(`Environment variables:`);
  console.log(`  PORT=${port}`);
  console.log(`  DELAY_MIN=${DELAY_MIN}ms`);
  console.log(`  DELAY_MAX=${DELAY_MAX}ms`);
  console.log(`  DEFAULT_SOURCE_COUNT=${DEFAULT_SOURCE_COUNT}`);
  console.log('\nEndpoints:');
  console.log('  POST /api/chat - Process chat queries with configurable parameters');
  console.log('  GET  /health   - Health check');
});

module.exports = server;