import React, { useState, useEffect, useRef } from 'react';

const TypingTest = () => {
  // List of all countries
  const allCountries = [
    "afghanistan", "albania", "algeria", "andorra", "angola", "antiguabarbuda", "argentina",
    "armenia", "australia", "austria", "azerbaijan", "bahamas", "bahrain", "bangladesh",
    "barbados", "belarus", "belgium", "belize", "benin", "bhutan", "bolivia", 
    "bosniaherzegovina", "botswana", "brazil", "brunei", "bulgaria", "burkinafaso", 
    "burundi", "cambodia", "cameroon", "canada", "capeverde", "car", "chad", "chile", 
    "china", "colombia", "comoros", "drc", "repcongo", "costarica", "croatia", "cuba", 
    "cyprus", "czechia", "denmark", "djibouti", "dominica", "dominicanrepublic", 
    "easttimor", "ecuador", "egypt", "elsalvador", "equatorialguinea", "eritrea", 
    "estonia", "eswatini", "ethiopia", "fiji", "finland", "france", "gabon", "gambia", 
    "georgia", "germany", "ghana", "greece", "grenada", "guatemala", "guinea", 
    "guineabissau", "guyana", "haiti", "honduras", "hungary", "iceland", "india", 
    "indonesia", "iran", "iraq", "ireland", "israel", "italy", "jamaica", "japan", 
    "jordan", "kazakhstan", "kenya", "kiribati", "northkorea", "southkorea", "kosovo", 
    "kuwait", "kyrgyzstan", "laos", "latvia", "lebanon", "lesotho", "liberia", "libya", 
    "liechtenstein", "lithuania", "luxembourg", "madagascar", "malawi", "malaysia", 
    "maldives", "mali", "malta", "marshallislands", "mauritania", "mauritius", "mexico", 
    "micronesia", "moldova", "monaco", "mongolia", "montenegro", "morocco", "mozambique", 
    "myanmar", "namibia", "nauru", "nepal", "netherlands", "newzealand", "nicaragua", 
    "niger", "nigeria", "northmacedonia", "norway", "oman", "pakistan", "palau", 
    "palestine", "panama", "papuanewguinea", "paraguay", "peru", "philippines", "poland", 
    "portugal", "qatar", "romania", "russia", "rwanda", "saintkittsandnevis", "saintlucia", 
    "saintvincentandgrenadines", "samoa", "sanmarino", "saotomeandprincipe", "saudiarabia", 
    "senegal", "serbia", "seychelles", "sierraleone", "singapore", "slovakia", "slovenia", 
    "solomonislands", "somalia", "southafrica", "southsudan", "spain", "srilanka", "sudan", 
    "suriname", "sweden", "switzerland", "syria", "taiwan", "tajikistan", "tanzania", 
    "thailand", "togo", "tonga", "trinidadandtobago", "tunisia", "turkey", "turkmenistan", 
    "tuvalu", "uganda", "ukraine", "unitedarabemirates", "unitedkingdom", "unitedstates", 
    "uruguay", "uzbekistan", "vanuatu", "vaticancity", "venezuela", "vietnam", "yemen", 
    "zambia", "zimbabwe"
  ];
  
  // States for the application
  const [wordList, setWordList] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [wordStartTime, setWordStartTime] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [randomizeWords, setRandomizeWords] = useState(true);
  const [testSize, setTestSize] = useState(50); // Default number of countries to test
  
  const inputRef = useRef(null);
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Prepare and start test
  const prepareTest = () => {
    // Get all countries or a random subset based on testSize
    let selectedCountries = [...allCountries];
    
    if (testSize < selectedCountries.length) {
      // Shuffle and select the first 'testSize' countries
      selectedCountries = shuffleArray(selectedCountries).slice(0, testSize);
    }
    
    // Randomize if option is selected
    if (randomizeWords) {
      setWordList(shuffleArray(selectedCountries));
    } else {
      setWordList(selectedCountries);
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
  
  // Handle input change
  const handleInputChange = (e) => {
    if (!isRunning) return;
    
    setInputValue(e.target.value);
    
    const currentWord = wordList[currentWordIndex];
    const typedWord = e.target.value.trim().toLowerCase();
    
    // If the current word is completed correctly
    if (typedWord === currentWord.toLowerCase()) {
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
    
    const csvContent = [
      'country,time_spent_seconds,test_index,original_index',
      ...results.map(result => {
        const originalIndex = allCountries.indexOf(result.word);
        return `${result.word},${result.timeSpent},${result.index},${originalIndex}`;
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'country_typing_test_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Export results to JSON
  const exportToJSON = () => {
    if (results.length === 0) return;
    
    const jsonData = results.map(result => {
      const originalIndex = allCountries.indexOf(result.word);
      return {
        country: result.word,
        timeSpent: result.timeSpent,
        testIndex: result.index,
        originalIndex
      };
    });
    
    const jsonContent = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'country_typing_test_results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Handle test size change
  const handleTestSizeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= allCountries.length) {
      setTestSize(value);
    }
  };
  
  // Calculate total time
  const totalTime = results.reduce((sum, result) => sum + result.timeSpent, 0);
  
  // Calculate average time per word
  const averageTime = results.length > 0 ? totalTime / results.length : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Country Name Typing Test</h1>
      
      {!isRunning && !testCompleted && (
        <div className="mb-6 space-y-4">
          <div className="border border-gray-300 rounded p-4 mb-4">
            <h2 className="text-xl font-semibold mb-2">Test Settings</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 font-medium">Number of countries to test (max 197):</label>
                <input 
                  type="number" 
                  min="1" 
                  max={allCountries.length}
                  value={testSize}
                  onChange={handleTestSizeChange}
                  className="border border-gray-300 rounded p-2 w-full md:w-32"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="randomize"
                  checked={randomizeWords}
                  onChange={() => setRandomizeWords(!randomizeWords)}
                  className="w-4 h-4 mr-2"
                />
                <label htmlFor="randomize" className="text-sm font-medium">
                  Randomize country order
                </label>
              </div>
              
              <button 
                onClick={prepareTest} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded w-full md:w-auto"
              >
                Start Typing Test
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isRunning && (
        <div className="mb-6 space-y-4">
          <div className="text-center mb-4">
            <span className="text-lg font-medium">Country {currentWordIndex + 1} of {wordList.length}</span>
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
              placeholder="Type the country name..."
              autoFocus
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">All Countries:</h3>
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
                <p className="text-sm text-gray-600">Countries Typed</p>
                <p className="text-3xl font-bold">{results.length}</p>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-3xl font-bold">{totalTime.toFixed(2)} sec</p>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <p className="text-sm text-gray-600">Avg Time/Country</p>
                <p className="text-3xl font-bold">{averageTime.toFixed(2)} sec</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mb-2">Top 5 Slowest Countries</h3>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left">Country</th>
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
                onClick={prepareTest} 
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
          <p className="text-sm font-medium">Progress: {results.length}/{wordList.length} countries</p>
          <p className="text-xs text-gray-600">Avg time: {averageTime.toFixed(2)} sec/country</p>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
