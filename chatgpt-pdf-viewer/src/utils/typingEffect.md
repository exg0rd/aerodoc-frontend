# Typing Effect Utility

This utility provides functionality for displaying text with a typing effect, word by word, with random delays based on word length.

## Functions

### `simulateTypingEffect(text, updateCallback, onComplete)`
- `text`: The text to display with typing effect
- `updateCallback`: Function called with updated text as each word is added
- `onComplete`: Function called when typing is complete

### `findHardcodedResponse(query)`
- `query`: User input to match against hardcoded responses
- Returns: Matching response text or null if no match found

## Features

1. **Word-by-word display**: Text is split into words and displayed one at a time
2. **Random delays**: Each word has a random delay based on its length
3. **Fuzzy matching**: Query matching uses multiple strategies to find relevant responses
4. **Hardcoded database**: Contains predefined responses for common queries

## Delay Calculation

The delay for each word is calculated as:
- Base delay: 30ms per character in the word (minimum 50ms)
- Random factor: 30-100% of the base delay
- Final delay: `Math.floor(baseDelay * randomFactor)`

This creates a natural typing rhythm where longer words take more time to appear, with some randomness to simulate human-like typing patterns.