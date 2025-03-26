import React, { useState, useEffect, useRef, useCallback } from 'react';
import Papa from 'papaparse';

// Timer component to display total elapsed time
const TimerDisplay = ({ startTime }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="text-center p-2 bg-blue-100 rounded border border-blue-200">
      <span className="text-sm font-bold">{formatTime(elapsedTime)}</span>
    </div>
  );
};

const TypingTest = () => {
  // List of all countries - exactly as in the CSV file (197 countries)
  const allCountries = [
    "afghanistan", "albania", "algeria", "andorra", "angola", "antiguabarbuda", 
    "argentina", "armenia", "australia", "austria", "azerbaijan", "bahamas", 
    "bahrain", "bangladesh", "barbados", "belarus", "belgium", "belize", 
    "benin", "bhutan", "bolivia", "bosniaherzegovina", "botswana", "brazil", 
    "brunei", "bulgaria", "burkinafaso", "burundi", "cambodia", "cameroon", 
    "canada", "capeverde", "car", "chad", "chile", "china", "colombia", 
    "comoros", "drc", "repcongo", "costarica", "croatia", "cuba", "cyprus", 
    "czechia", "denmark", "djibouti", "dominica", "dominicanrepublic", 
    "easttimor", "ecuador", "egypt", "elsalvador", "equatorialguinea", 
    "eritrea", "estonia", "ethiopia", "fiji", "finland", "france", "gabon", 
    "gambia", "georgia", "germany", "ghana", "greece", "grenada", "guatemala", 
    "guinea", "guineabissau", "guyana", "haiti", "honduras", "hungary", 
    "iceland", "india", "indonesia", "iran", "iraq", "ireland", "israel", 
    "italy", "ivorycoast", "jamaica", "japan", "jordan", "kazakhstan", "kenya", 
    "kiribati", "northkorea", "southkorea", "kosovo", "kuwait", "kyrgyzstan", 
    "laos", "latvia", "lebanon", "lesotho", "liberia", "libya", "liechtenstein", 
    "lithuania", "luxembourg", "macedonia", "madagascar", "malawi", "malaysia", 
    "maldives", "mali", "malta", "marshallislands", "mauritania", "mauritius", 
    "mexico", "micronesia", "moldova", "monaco", "mongolia", "montenegro", 
    "morocco", "mozambique", "myanmar", "namibia", "nauru", "nepal", "netherlands", 
    "newzealand", "nicaragua", "niger", "nigeria", "norway", "oman", "pakistan", 
    "palau", "palestine", "panama", "papuanewguinea", "paraguay", "peru", 
    "philippines", "poland", "portugal", "qatar", "romania", "russia", "rwanda", 
    "stkittsnevis", "stlucia", "stvincent", "samoa", "sanmarino", "saotomeprincipe", 
    "saudiarabia", "senegal", "serbia", "seychelles", "sierraleone", "singapore", 
    "slovakia", "slovenia", "solomonislands", "somalia", "southafrica", "spain", 
    "srilanka", "southsudan", "sudan", "suriname", "swaziland", "sweden", 
    "switzerland", "syria", "taiwan", "tajikistan", "tanzania", "thailand", 
    "togo", "tonga", "trinidadtobago", "tunisia", "turkey", "turkmenistan", 
    "tuvalu", "uganda", "ukraine", "uae", "uk", "usa", "uruguay", "uzbekistan", 
    "vanuatu", "vatican", "venezuela", "vietnam", "yemen", "zambia", "zimbabwe"
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
  const testSize = 197; // Fixed to all countries
  const [savedResults, setSavedResults] = useState(() => {
    // Try to load saved results from localStorage on initialization
    const saved = localStorage.getItem('countriesTypingResults');
    return saved ? JSON.parse(saved) : [];
  });
  const [autoSave, setAutoSave] = useState(true);
  const [flagUrls, setFlagUrls] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const inputRef = useRef(null);
  
  // Load flag URLs from the CSV file on component mount
  useEffect(() => {
    const loadFlagUrls = async () => {
      try {
        setIsLoading(true);
        
        try {
          // Look for the file in the public folder (root URL)
          const response = await fetch('/flag_urls.csv');
          if (!response.ok) {
            throw new Error(`Failed to fetch flag URLs: ${response.status}`);
          }
          const text = await response.text();
          
          Papa.parse(text, {
            header: true,
            complete: (results) => {
              const urls = {};
              // Map country names to flag URLs
              results.data.forEach(row => {
                if (row.country && row.flag_link) {
                  urls[row.country] = row.flag_link;
                }
              });
              console.log(`Loaded ${Object.keys(urls).length} flag URLs`);
              
              // Check for missing flags
              const missingFlags = allCountries.filter(country => !urls[country]);
              if (missingFlags.length > 0) {
                console.log("Missing flags for:", missingFlags);
              }
              
              setFlagUrls(urls);
              setIsLoading(false);
            },
            error: (error) => {
              console.error("Error parsing CSV:", error);
              setFlagUrls({});
              setIsLoading(false);
            }
          });
        } catch (err) {
          console.warn("Could not load flag_urls.csv, using empty flag set:", err);
          setFlagUrls({});
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in flag URL loading process:", error);
        setFlagUrls({});
        setIsLoading(false);
      }
    };
    
    loadFlagUrls();
  }, []);
  
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
    // Reuse the already prepared wordList rather than creating a new one
    // This maintains the same order between preview and actual test
    
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
        
        // Auto-save results if enabled
        if (autoSave) {
          const newResults = [...results, {
            word: currentWord,
            timeSpent: timeSpent,
            index: currentWordIndex,
            date: new Date().toISOString()
          }];
          
          const historyToSave = [
            ...savedResults,
            {
              date: new Date().toISOString(),
              testSize: wordList.length,
              randomized: randomizeWords,
              results: newResults,
              totalTime: newResults.reduce((sum, r) => sum + r.timeSpent, 0),
              averageTime: newResults.reduce((sum, r) => sum + r.timeSpent, 0) / newResults.length
            }
          ];
          
          // Save to localStorage (keep last 50 tests max)
          localStorage.setItem('countriesTypingResults', 
            JSON.stringify(historyToSave.slice(-50)));
          
          setSavedResults(historyToSave);
        }
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
  
  // Export all saved test history to CSV
  const exportAllHistoryToCSV = () => {
    if (savedResults.length === 0) return;
    
    // Prepare header row
    let csvContent = [
      'test_date,country,time_spent_seconds,test_index,original_index'
    ];
    
    // Add data from each test session
    savedResults.forEach(test => {
      const testDate = test.date;
      
      // For each country in this test
      if (test.results && Array.isArray(test.results)) {
        test.results.forEach(result => {
          const originalIndex = allCountries.indexOf(result.word);
          csvContent.push(`${testDate},${result.word},${result.timeSpent},${result.index},${originalIndex}`);
        });
      }
    });
    
    // Join all rows and create downloadable file
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_country_typing_tests.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Export all saved test history to JSON
  const exportAllHistoryToJSON = () => {
    if (savedResults.length === 0) return;
    
    // Format the data for export
    const exportData = savedResults.map(test => ({
      date: test.date,
      totalTime: test.totalTime,
      averageTime: test.averageTime,
      testSize: test.testSize,
      randomized: test.randomized,
      results: test.results ? test.results.map(result => ({
        country: result.word,
        timeSpent: result.timeSpent,
        testIndex: result.index,
        originalIndex: allCountries.indexOf(result.word)
      })) : []
    }));
    
    // Create downloadable file
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_country_typing_tests.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Calculate total time
  const totalTime = results.reduce((sum, result) => sum + result.timeSpent, 0);
  
  // Calculate average time per word
  const averageTime = results.length > 0 ? totalTime / results.length : 0;
  
  // Get flag URL for a country
  const getFlagUrl = (countryName) => {
    // First check the loaded flag URLs
    if (flagUrls[countryName]) {
      return flagUrls[countryName];
    }
    
    // Log missing flag
    console.log(`Missing flag URL for: ${countryName}`);
    
    // Fallback to placeholder if no flag is available
    return '/api/placeholder/60/40';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg
    return (
   <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
     <h1 className="text-2xl font-bold mb-4 text-center">Country Flag Typing Test</h1>
     
     {isLoading ? (
       <div className="text-center p-10">
         <p className="text-lg">Loading flag images...</p>
         <div className="mt-4 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
       </div>
     ) : (
       <>
         {!isRunning && !testCompleted && (
           <div className="mb-4">
             <div className="border border-gray-300 rounded p-4">
               <h2 className="text-xl font-semibold mb-2">Test Settings</h2>
               <div className="flex flex-col gap-4">
                 <p className="text-gray-700">This test includes all 197 countries with their flags.</p>
                 
                 <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
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
                   
                   <div className="flex items-center">
                     <input
                       type="checkbox"
                       id="autosave"
                       checked={autoSave}
                       onChange={() => setAutoSave(!autoSave)}
                       className="w-4 h-4 mr-2"
                     />
                     <label htmlFor="autosave" className="text-sm font-medium">
                       Auto-save results locally
                     </label>
                   </div>
                 </div>
                 
                 <button 
                   onClick={() => {
                     // Prepare the word list but don't start the test yet
                     let selectedCountries = [...allCountries];
                     if (randomizeWords) {
                       selectedCountries = shuffleArray(selectedCountries);
                     }
                     setWordList(selectedCountries);
                   }} 
                   className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded w-full md:w-auto"
                 >
                   Preview Flags
                 </button>
               </div>
             </div>
             
             {wordList.length > 0 && (
               <div className="mt-4">
                 <div className="flex justify-between items-center mb-2">
                   <h3 className="text-lg font-semibold">Preview All Flags:</h3>
                   <button 
                     onClick={prepareTest}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
                   >
                     Start Test
                   </button>
                 </div>
                 
                 <div className="grid grid-cols-6 gap-3 p-4 border border-gray-200 rounded bg-gray-50">
                   {wordList.map((word, index) => (
                     <div 
                       key={index} 
                       className="flex items-center justify-center p-1 rounded bg-gray-100 hover:bg-gray-200"
                       style={{ minHeight: '52px' }}
                     >
                       <img 
                         src={getFlagUrl(word)} 
                         alt="Country flag"
                         className="w-full object-contain border border-gray-300"
                         style={{ maxHeight: '42px' }}
                       />
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
         )}
         
         {isRunning && (
           <div className="mb-4">
             <div className="flex flex-col gap-4">
               <div className="flex flex-wrap justify-between items-center mb-2">
                 <div className="w-full md:w-64 flex-shrink-0">
                   <input
                     ref={inputRef}
                     type="text"
                     value={inputValue}
                     onChange={handleInputChange}
                     className="w-full py-2 px-3 text-sm border-2 border-blue-400 rounded focus:outline-none focus:border-blue-600"
                     placeholder="Type country name..."
                     autoFocus
                   />
                 </div>
                 
                 <div className="flex justify-between items-center gap-4 mt-2 md:mt-0">
                   <div className="text-center p-2 bg-gray-100 rounded">
                     <span className="text-sm font-medium">{currentWordIndex + 1} of {wordList.length}</span>
                   </div>
                   
                   <TimerDisplay startTime={startTime} />
                 </div>
               </div>
               
               <div 
                 className="grid grid-cols-6 gap-3 p-4 border border-gray-200 rounded bg-gray-50 w-full"
                 style={{ gridTemplateRows: 'repeat(auto-fill, minmax(70px, 1fr))' }}
               >
                 {wordList.map((word, index) => (
                   <div 
                     key={index} 
                     className={`flex items-center justify-center p-1 rounded relative ${
                       index === currentWordIndex 
                         ? 'bg-blue-500 p-2 ring-2 ring-blue-700 z-10' 
                         : index < currentWordIndex 
                           ? 'bg-green-100 opacity-50' 
                           : 'bg-gray-100'
                     }`}
                     style={{ 
                       minHeight: '52px',
                       transformOrigin: 'center'
                     }}
                     id={index === currentWordIndex ? "current-flag" : ""}
                   >
                     <img 
                       src={getFlagUrl(word)} 
                       alt="Country flag"
                       className="w-full object-contain border border-gray-300"
                       style={{ maxHeight: '42px' }}
                     />
                     {index < currentWordIndex && (
                       <span className="absolute text-green-800 text-lg font-bold">✓</span>
                     )}
                   </div>
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
                       <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left">Flag</th>
                       <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left">Country</th>
                       <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-right">Time (sec)</th>
                     </tr>
                   </thead>
                   <tbody>
                     {[...results].sort((a, b) => b.timeSpent - a.timeSpent).slice(0, 5).map((result, index) => (
                       <tr key={index}>
                         <td className="py-2 px-4 border-b border-gray-200">
                           <img 
                             src={getFlagUrl(result.word)} 
                             alt={result.word}
                             className="w-12 h-8 object-cover border border-gray-300"
                           />
                         </td>
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
               
               {savedResults.length > 0 && (
                 <div className="mt-6 border-t border-gray-300 pt-4">
                   <div className="flex justify-between items-center mb-2">
                     <h3 className="text-xl font-semibold">Saved Test History ({savedResults.length})</h3>
                     
                     <div className="flex gap-2">
                       <button 
                         onClick={exportAllHistoryToCSV}
                         disabled={savedResults.length === 0}
                         className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm py-1 px-3 rounded"
                       >
                         Export All (CSV)
                       </button>
                       <button 
                         onClick={exportAllHistoryToJSON}
                         disabled={savedResults.length === 0}
                         className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-sm py-1 px-3 rounded"
                       >
                         Export All (JSON)
                       </button>
                       <button 
                         onClick={() => {
                           setSavedResults([]);
                           localStorage.removeItem('countriesTypingResults');
                         }} 
                         className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded"
                       >
                         Clear History
                       </button>
                     </div>
                   </div>
                   <div className="overflow-x-auto max-h-60 overflow-y-auto">
                     <table className="min-w-full bg-white">
                       <thead className="sticky top-0 bg-white">
                         <tr>
                           <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left">Date/Time</th>
                           <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-center">Countries</th>
                           <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-center">Avg Time</th>
                           <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-center">Total Time</th>
                         </tr>
                       </thead>
                       <tbody>
                         {savedResults.slice().reverse().map((test, index) => (
                           <tr key={index}>
                             <td className="py-2 px-4 border-b border-gray-200">
                               {new Date(test.date).toLocaleString()}
                             </td>
                             <td className="py-2 px-4 border-b border-gray-200 text-center">
                               {test.testSize}
                             </td>
                             <td className="py-2 px-4 border-b border-gray-200 text-center">
                               {test.averageTime.toFixed(2)} sec
                             </td>
                             <td className="py-2 px-4 border-b border-gray-200 text-center">
                               {test.totalTime.toFixed(2)} sec
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               )}
             </div>
           </div>
         )}
       </>
     )}
   </div>
 );
};

export default TypingTest;
