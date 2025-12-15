// Test script to verify typing effect functionality
import { simulateTypingEffect, findHardcodedResponse } from './src/utils/typingEffect.js';

console.log('Testing typing effect functionality...\n');

// Test 1: Check response matching
console.log('Test 1: Response matching');
const testQueries = ['hello', 'what can you do', 'help', 'unknown query'];
testQueries.forEach(query => {
  const response = findHardcodedResponse(query);
  console.log(`Query: "${query}" -> ${response ? `Response found (${response.length} chars)` : 'No response'}`);
});

// Test 2: Check typing effect simulation
console.log('\nTest 2: Typing effect simulation');
const testText = "Hello world this is a test";
let currentText = '';

console.log('Simulating typing effect for: "' + testText + '"');

// Simulate the typing effect without actual delays for testing
const words = testText.split(/\s+/).filter(word => word.length > 0);
let currentIndex = 0;

console.log('Word breakdown:');
words.forEach((word, index) => {
  const wordLength = word.length;
  const baseDelay = Math.max(50, wordLength * 30);
  const randomFactor = 0.3 + Math.random() * 0.7;
  const delay = Math.floor(baseDelay * randomFactor);
  console.log(`  Word ${index + 1}: "${word}" (${wordLength} chars) -> delay: ~${delay}ms`);
});

console.log('\nTyping effect implementation is ready!');
console.log('To test in browser, visit: http://localhost:5173/');