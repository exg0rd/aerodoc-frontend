// Basic API server using ES modules (for compatibility with "type": "module" in package.json)
import { createServer } from 'http';
import { parse } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3001;
const DELAY_MIN = parseInt(process.env.DELAY_MIN) || 500;  // Minimum delay in ms
const DELAY_MAX = parseInt(process.env.DELAY_MAX) || 2000; // Maximum delay in ms
const DEFAULT_SOURCE_COUNT = parseInt(process.env.DEFAULT_SOURCE_COUNT) || 5;

// Read the database file
let dbData = { responses: [] };
try {
  const dbPath = path.join(process.cwd(), 'db.json');
  const dbContent = fs.readFileSync(dbPath, 'utf8');
  dbData = JSON.parse(dbContent);
} catch (error) {
  console.error('Error reading database file:', error.message);
}

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

// Function to find response in the database based on query
const findResponseInDB = (query) => {
  const normalizedQuery = query.toLowerCase().trim();

  // First, try exact or substring matching
  const exactMatch = dbData.responses.find(resp => 
    resp.query.toLowerCase().includes(normalizedQuery) || 
    normalizedQuery.includes(resp.query.toLowerCase())
  );

  if (exactMatch) {
    return exactMatch;
  }

  // If no exact match, try fuzzy matching by checking if any query word appears in the user query
  for (const response of dbData.responses) {
    const queryWords = response.query.toLowerCase().split(/\s+/);
    const userInputWords = normalizedQuery.split(/\s+/);
    
    // Count how many words from the response query appear in user input
    const matchingWords = queryWords.filter(word => userInputWords.includes(word)).length;
    
    // If at least half of the words match, consider it a match
    if (matchingWords >= Math.ceil(queryWords.length / 2)) {
      return response;
    }
  }

  // If still no match, check if any individual word from user query matches any word from response queries
  const userInputWords = normalizedQuery.split(/\s+/);
  for (const response of dbData.responses) {
    const queryWords = response.query.toLowerCase().split(/\s+/);
    for (const userWord of userInputWords) {
      if (queryWords.some(qw => qw.includes(userWord) || userWord.includes(qw))) {
        return response;
      }
    }
  }

  // If no match found in DB, return a default response with document references
  return null;
};

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
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

  // Serve static files from test directory
  if (pathname.startsWith('/test/')) {
    const filePath = path.join(__dirname, pathname);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
        return;
      }
      
      const ext = path.extname(filePath);
      const contentType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/chat') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { message, source_count = DEFAULT_SOURCE_COUNT, use_graph_rag = true, detect_contradictions = false } = data;

        // First try to find response in the database
        let foundResponse = findResponseInDB(message);
        
        if (foundResponse) {
          // Prepare the response object
          const selectedResponse = {
            id: foundResponse.id,
            answer: foundResponse.answer,
            sources: foundResponse.sources || []
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(selectedResponse));
        } else {
          // If no match found in DB, generate a default response with document references
          const responses = [
            {
              id: Date.now(),
              answer: `Processing your query: "${message}". This response was generated with ${source_count} sources. Graph RAG: ${use_graph_rag}, Contradiction Detection: ${detect_contradictions}. According to our analysis, please see document [1] for detailed specifications and document [2] for compliance requirements.`,
              sources: Array.from({ length: source_count }, (_, i) => ({
                id: i + 1,
                title: `Source Document ${i + 1}`,
                url: `/test/${i + 1}.pdf`,
                page: Math.floor(Math.random() * 10) + 1,
                content: `Relevant content from source document ${i + 1} related to your query: "${message}".`,
                score: (Math.random() * 0.9 + 0.1).toFixed(2) // Random score between 0.1 and 1.0
              }))
            },
            {
              id: Date.now(),
              answer: `I analyzed your question about "${message}" using ${source_count} document sources. The system is configured with Graph RAG: ${use_graph_rag} and contradiction detection: ${detect_contradictions}. Based on documents [1] and [2], the key findings indicate...`,
              sources: Array.from({ length: Math.min(source_count, 3) }, (_, i) => ({
                id: i + 1,
                title: `Analysis Report ${i + 1}`,
                url: `/test/${i + 1}.pdf`,
                page: Math.floor(Math.random() * 5) + 1,
                content: `Detailed analysis from report ${i + 1} showing relevant findings for query: "${message}".`,
                score: (Math.random() * 0.9 + 0.1).toFixed(2)
              }))
            },
            {
              id: Date.now(),
              answer: `Based on the information in document [1], I can confirm that ${message} is addressed in detail. Additionally, document [2] provides supplementary information regarding this topic. The analysis shows consistent findings across both sources.`,
              sources: Array.from({ length: Math.min(source_count, 2) }, (_, i) => ({
                id: i + 1,
                title: `Technical Specification ${i + 1}`,
                url: `/test/${i + 1}.pdf`,
                page: Math.floor(Math.random() * 8) + 1,
                content: `Technical details from document ${i + 1} related to: "${message}". Important specifications and guidelines are outlined.`,
                score: (Math.random() * 0.9 + 0.1).toFixed(2)
              }))
            }
          ];
          
          // Select a random response
          const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(selectedResponse));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'GET' && pathname === '/health') {
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
  console.log('  GET  /test/*   - Serve static files from test directory');
});

export default server;