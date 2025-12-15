/**
 * Simulates typing effect by displaying words one by one with random delays
 * @param {string} text - The text to display
 * @param {function} updateCallback - Callback to update the displayed text
 * @param {function} onComplete - Callback when typing is complete
 */
export const simulateTypingEffect = (text, updateCallback, onComplete) => {
  // Split the text into words
  const words = text.split(/\s+/).filter(word => word.length > 0);
  
  let currentIndex = 0;
  let currentText = '';
  
  const typeNextWord = () => {
    if (currentIndex < words.length) {
      // Add the next word to the current text
      currentText += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
      
      // Calculate delay based on word length with some randomness
      const wordLength = words[currentIndex].length;
      // Base delay of 30-80ms per character + some random factor
      const baseDelay = Math.max(50, wordLength * 30); // 30ms per character minimum
      const randomFactor = 0.3 + Math.random() * 0.7; // Random factor between 0.3 and 1.0
      const delay = Math.floor(baseDelay * randomFactor);
      
      // Update the displayed text
      updateCallback(currentText);
      
      currentIndex++;
      
      // Schedule the next word
      setTimeout(typeNextWord, delay);
    } else {
      // Typing is complete
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  // Start typing
  typeNextWord();
};