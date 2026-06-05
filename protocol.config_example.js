// Copyright (c) 2026 Nagravision SARL
export default {
  // Absolute path to the results folder where annotations will be saved
  resultsPath: "results",

  // Path relative to the project root (where server.js is located)
  // The server will execute: `<executablePath> <input_file> <output_file> [args...]`
  // Example for Python script: "python python/compress.py"
  // Example for Node wrapper script: "node your_wrapper.js"
  // Example for executable binary: "path/to/binary.exe"
  executablePath: 'node compress.js',
  
  // Additional arguments to pass to the executable
  // Example for flags/options: ['-q', '80', '--mode', 'fast']
  args: ['50'],

  // Session duration in milliseconds (1 hour = 3600000 ms)
  sessionDuration: 1000 * 60 * 60,

  // Phase durations in milliseconds (Used mainly for Protocol V1)
  durations: {
    original: 10000,   // 10 seconds
    gray: 3000,        // 3 seconds
    altered: 20000,    // 20 seconds
    masking: 60000*5     // 5 minutes
  }
};
