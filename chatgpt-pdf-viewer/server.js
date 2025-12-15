const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Parse environment variables with defaults
const PORT = process.env.PORT || 3001;
const DELAY_MIN = parseInt(process.env.DELAY_MIN) || 500;  // Minimum delay in ms
const DELAY_MAX = parseInt(process.env.DELAY_MAX) || 2000; // Maximum delay in ms
const DEFAULT_SOURCE_COUNT = parseInt(process.env.DEFAULT_SOURCE_COUNT) || 5;

server.use(middlewares);

// Add delay middleware
server.use(async (req, res, next) => {
  // Add artificial delay to simulate processing time
  const delay = Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Log the request for debugging
  console.log(`${new Date().toISOString()} - Request: ${req.method} ${req.url}`);
  
  next();
});

// Custom endpoint for chat responses with configurable parameters
server.post('/api/chat', (req, res) => {
  // Get body parameters
  const { message, source_count = DEFAULT_SOURCE_COUNT, use_graph_rag = true, detect_contradictions = false } = req.body || {};
  
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
  
  // Simulate API processing time based on parameters
  res.json(selectedResponse);
});

// Default fallback for other routes
server.use(router);

server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
  console.log(`Environment variables:`);
  console.log(`  PORT=${PORT}`);
  console.log(`  DELAY_MIN=${DELAY_MIN}ms`);
  console.log(`  DELAY_MAX=${DELAY_MAX}ms`);
  console.log(`  DEFAULT_SOURCE_COUNT=${DEFAULT_SOURCE_COUNT}`);
});