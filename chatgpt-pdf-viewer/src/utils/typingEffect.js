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

/**
 * Find response in the hardcoded database
 * @param {string} query - User query
 * @returns {string|null} - Response if found, null otherwise
 */
export const findHardcodedResponse = (query) => {
  const responses = [
    {
      id: 1,
      query: "hello",
      response: "Привет! Рад вас приветствовать в нашей системе. Мы готовы помочь вам с любыми вопросами по анализу документов."
    },
    {
      id: 2,
      query: "what can you do",
      response: "Я могу анализировать PDF-документы, извлекать из них информацию, отвечать на вопросы по содержимому и находить противоречия между различными источниками."
    },
    {
      id: 3,
      query: "how does it work",
      response: "Вы загружаете документы в систему, задаете вопросы, а наш движок использует технологии RAG для поиска релевантной информации и предоставления точных ответов."
    },
    {
      id: 4,
      query: "features",
      response: "Основные возможности системы включают анализ PDF-документов, поиск по содержимому, выявление противоречий, генерацию ответов с указанием источников и интеграцию с графовыми базами знаний."
    },
    {
      id: 5,
      query: "search",
      response: "Поиск в документах осуществляется с использованием семантического анализа. Система находит не только точные совпадения, но и близкие по смыслу фразы и понятия."
    },
    {
      id: 6,
      query: "help",
      response: "Я могу помочь вам найти информацию в ваших документах. Просто задайте вопрос, и я постараюсь найти релевантные ответы из загруженных файлов."
    },
    {
      id: 7,
      query: "documents",
      response: "Система поддерживает анализ различных типов документов. Вы можете загружать PDF-файлы, и я буду искать в них нужную информацию."
    },
    {
      id: 8,
      query: "contradictions",
      response: "Да, я могу обнаруживать противоречия между разными документами или разделами одного документа, если включена соответствующая опция."
    }
  ];
  
  // Normalize the input query
  const normalizedQuery = query.toLowerCase().trim();
  
  // First, try exact or substring matching
  const exactMatch = responses.find(resp => 
    resp.query.toLowerCase().includes(normalizedQuery) || 
    normalizedQuery.includes(resp.query.toLowerCase())
  );
  
  if (exactMatch) {
    return exactMatch.response;
  }
  
  // If no exact match, try fuzzy matching by checking if any query word appears in the user query
  for (const response of responses) {
    const queryWords = response.query.toLowerCase().split(/\s+/);
    const userInputWords = normalizedQuery.split(/\s+/);
    
    // Count how many words from the response query appear in user input
    const matchingWords = queryWords.filter(word => userInputWords.includes(word)).length;
    
    // If at least half of the words match, consider it a match
    if (matchingWords >= Math.ceil(queryWords.length / 2)) {
      return response.response;
    }
  }
  
  // If still no match, check if any individual word from user query matches any word from response queries
  const userInputWords = normalizedQuery.split(/\s+/);
  for (const response of responses) {
    const queryWords = response.query.toLowerCase().split(/\s+/);
    for (const userWord of userInputWords) {
      if (queryWords.some(qw => qw.includes(userWord) || userWord.includes(qw))) {
        return response.response;
      }
    }
  }
  
  return null;
};