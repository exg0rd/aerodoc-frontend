// Basic API server using ES modules (for compatibility with "type": "module" in package.json)
import { createServer } from 'http';
import { parse } from 'url';
import fs from 'fs';
import path from 'path';

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

  // Return default response if no match found
  return dbData.responses.find(r => r.query === 'default') || {
    id: 0,
    query: 'default',
    answer: 'Извините, я не нашел подходящего ответа на ваш запрос.',
    sources: []
  };
};

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
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

        // Find response in the database
        const foundResponse = findResponseInDB(message);

        // Prepare the response object
        const selectedResponse = {
          id: foundResponse.id,
          answer: foundResponse.answer,
          sources: foundResponse.sources || []
        };

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

export default server;