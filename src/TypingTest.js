import React, { useState, useEffect, useRef } from 'react';

const TypingTest = () => {
  // States for the application
  const [wordList, setWordList] = useState([]);
  const [originalWordList, setOriginalWordList] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [wordStartTime, setWordStartTime] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [randomizeWords, setRandomizeWords] = useState(true);
  
  const inputRef = useRef(null);
  
  // Start the test
  const startTest = () => {
    if (originalWordList.length === 0) {
      alert('Please upload a word list or use the sample list');
      return;
    }
    
    // Randomize the word list if the option is selected
    if (randomizeWords) {
      setWordList(shuffleArray(originalWordList));
    } else {
      setWordList([...originalWordList]);
    }
    
    setCurrentWordIndex(0);
    setInputValue('');
    setResults([]);
    setIsRunning(true);
    setTestCompleted(false);
    setStartTime(Date.now());
    setWordStartTime(Date.now());
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target.result;
        setFileContent(content);
        
        // Parse the file content (assuming one word per line)
        const words = content.split(/[\n,\s]+/).filter(word => word.trim() !== '');
        setOriginalWordList(words);
        setWordList(randomizeWords ? shuffleArray(words) : words);
      };
      
      reader.readAsText(file);
    }
  };
  
  // Use sample word list
  const useSampleList = () => {
    const sampleWords = [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
      'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
    ];
    setOriginalWordList(sampleWords);
    setWordList(randomizeWords ? shuffleArray(sampleWords) : sampleWords);
    setFileContent(sampleWords.join('\n'));
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    if (!isRunning) return;
    
    setInputValue(e.target.value);
    
    const currentWord = wordList[currentWordIndex];
    const typedWord = e.target.value.trim();
    
    // If the current word is completed correctly
    if (typedWord === currentWord) {
      // Record the time spent on this word
      const now = Date.now();
      const timeSpent = (now - wordStartTime) / 1000; // in seconds
      
      setResults([...results, {
        word: currentWord,
        timeSpent: timeSpent,
        index: currentWordIndex
      }]);
      
      // Move to the next word
      if (currentWordIndex < wordList.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setInputValue('');
        setWordStartTime(now);
      } else {
        // Test completed
        setIsRunning(false);
        setTestCompleted(true);
      }
    }
  };
  
  // Export results to CSV
  const exportToCSV = () => {
    if (results.length === 0) return;
    
    // Include original word index to track the original position when randomized
    const csvContent = [
      'word,time_spent_seconds,word_index,original_order',
      ...results.map(result => {
        const originalIndex = originalWordList.indexOf(result.word);
        return `${result.word},${result.timeSpent},${result.index},${originalIndex}`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'typing_test_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Export results to JSON
  const exportToJSON = () => {
    if (results.length === 0) return;
    
    const jsonContent = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'typing_test_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Calculate total time
  const totalTime = results.reduce((sum, result) => sum + result.timeSpent, 0);
  
  // Calculate average time per word
  const averageTime = results.length > 0 ? totalTime / results.length : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Custom Word Typing Test</h1>
      
      {!isRunning && !testCompleted && (
        <div className="mb-6 space-y-4">
          <div className="border border-gray-300 rounded p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">1. Prepare Your Word List</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 font-medium">Upload a file with your words (one per line or comma-separated):</label>
                <input 
                  type="file" 
                  accept=".txt,.csv" 
                  onChange={handleFileUpload} 
                  className="border border-gray-300 rounded p-2 w-full"
                />
              </div>
              <div className="flex items-center">
                <div className="border-t border-gray-300 flex-grow mr-3"></div>
                <div className="text-gray-500">OR</div>
                <div className="border-t border-gray-300 flex-grow ml-3"></div>
              </div>
              <button 
                onClick={useSampleList} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
              >
                Use Sample Word List (40 common words)
              </button>
              
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="randomize"
                  checked={randomizeWords}
                  onChange={() => setRandomizeWords(!randomizeWords)}
                  className="w-4 h-4 mr-2"
                />
                <label htmlFor="randomize" className="text-sm font-medium">
                  Randomize word order
                </label>
              </div>
            </div>
          </div>
          
          {wordList.length > 0 && (
            <div className="border border-gray-300 rounded p-4">
              <h2 className="text-xl font-semibold mb-2">2. Your Word List ({wordList.length} words)</h2>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                <p className="text-sm font-mono whitespace-pre-wrap">{fileContent || wordList.join(', ')}</p>
              </div>
              <button 
                onClick={startTest} 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
              >
                Start Typing Test
              </button>
            </div>
          )}
        </div>
      )}
      
      {isRunning && (
        <div className="mb-6 space-y-4">
          <div className="text-center mb-4">
            <span className="text-lg font-medium">Word {currentWordIndex + 1} of {wordList.length}</span>
          </div>
          
          <div className="text-center mb-6">
            <span className="text-4xl font-bold">{wordList[currentWordIndex]}</span>
          </div>
          
          <div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full p-3 text-lg border-2 border-blue-400 rounded focus:outline-none focus:border-blue-600"
              placeholder="Type the word above and press space..."
              autoFocus
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">All Words:</h3>
            <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded bg-gray-50 max-h-40 overflow-y-auto">
              {wordList.map((word, index) => (
                <span 
                  key={index} 
                  className={`px-2 py-1 rounded text-sm ${
                    index === currentWordIndex 
                      ? 'bg-blue-500 text-white font-bold' 
                      : index < currentWordIndex 
                        ? 'bg-green-100 text-green-800 line-through' 
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {testCompleted && (
        <div className="mb-6 space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-green-600">Test Completed!</h2>
          </div>
          
          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            <h3 className="text-xl font-semibold mb-2">Results Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-white rounded shadow">
                <p className="text-sm text-gray-600">Words Typed</p>
                <p className="text-3xl font-bold">{results.length}</p>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-3xl font-bold">{totalTime.toFixed(2)} sec</p>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <p className="text-sm text-gray-600">Avg Time/Word</p>
                <p className="text-3xl font-bold">{averageTime.toFixed(2)} sec</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Top 5 Slowest Words</h3>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left">Word</th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-right">Time (sec)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...results].sort((a, b) => b.timeSpent - a.timeSpent).slice(0, 5).map((result, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b border-gray-200">{result.word}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-right">{result.timeSpent.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={exportToCSV} 
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Export to CSV
              </button>
              <button 
                onClick={exportToJSON} 
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
              >
                Export to JSON
              </button>
              <button 
                onClick={startTest} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              >
                Restart Test
              </button>
            </div>
          </div>
        </div>
      )}
      
      {results.length > 0 && !testCompleted && (
        <div className="p-3 fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium">Progress: {results.length}/{wordList.length} words</p>
          <p className="text-xs text-gray-600">Avg time: {averageTime.toFixed(2)} sec/word</p>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
