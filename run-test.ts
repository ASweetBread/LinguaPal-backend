// Simple TypeScript script to run the ZhipuAI test demo
// This script demonstrates how to import and use the getChatResponse function from the test file

import { runChatTestDemo } from './src/services/zhipuAI.test';

console.log('Test Runner');
console.log('===================');

// Run the ZhipuAI demo
runChatTestDemo()
  .then(() => {
    console.log('\nTest demo completed successfully.');
  })
  .catch((error: Error) => {
    console.error('\nTest demo failed:', error.message);
  });