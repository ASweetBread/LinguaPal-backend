# ZhipuAI Service

This service provides a TypeScript implementation for interacting with the ZhipuAI API, with a focus on the chat completions endpoint.

## Features

- Express middleware integration
- TypeScript type definitions for all requests and responses
- Error handling and logging
- Multiple usage patterns (middleware or standalone functions)

## Installation

Ensure you have the required dependencies installed:

```bash
npm install axios
```

## Usage

### 1. Using as Express Middleware

```typescript
import express from 'express';
import { zhipuAIMiddleware } from './services/zhipuAI';

const app = express();

// Apply the middleware with your API key
app.use(zhipuAIMiddleware('your-api-key-here'));

// Use in routes
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await req.zhipuAI.chatCompletions({
      model: 'glm-4.6',
      messages,
      temperature: 1,
      max_tokens: 65536,
      stream: false
    });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});
```

### 2. Using as a Standalone Function

```typescript
import { getChatResponse, Message } from './services/zhipuAI';

async function chat() {
  const messages: Message[] = [
    {
      role: 'system',
      content: '你是一个有用的AI助手。'
    },
    {
      role: 'user',
      content: '请介绍一下人工智能的发展历程。'
    }
  ];
  
  const response = await getChatResponse(
    'your-api-key-here',
    messages,
    'glm-4.6',
    1
  );
  
  console.log(response);
}

chat();
```

### 3. Directly Using the Service Class

```typescript
import { ZhipuAIService } from './services/zhipuAI';

const zhipuService = new ZhipuAIService('your-api-key-here');

const response = await zhipuService.chatCompletions({
  model: 'glm-4.6',
  messages: [
    { role: 'system', content: '你是一个有用的AI助手。' },
    { role: 'user', content: '请介绍一下人工智能的发展历程。' }
  ],
  temperature: 1,
  max_tokens: 65536,
  stream: false
});
```

## Type Definitions

### Message

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### ChatCompletionRequest

```typescript
interface ChatCompletionRequest {
  model: string; // e.g., 'glm-4.6'
  messages: Message[];
  temperature?: number; // Default: 1
  max_tokens?: number; // Default: 65536
  stream?: boolean; // Default: false
}
```

### ChatCompletionResponse

```typescript
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

## Important Notes

1. **Security**: In a production environment, always store your API key in environment variables, not in your source code.

2. **Error Handling**: The service includes basic error logging, but you should implement more robust error handling based on your application's needs.

3. **Rate Limiting**: Be aware of the API's rate limits and implement backoff strategies if necessary.

4. **Environment Variables**: For production, use a package like `dotenv` to manage environment variables:

```bash
npm install dotenv --save
```

Then in your index.ts:

```typescript
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
```

## API Documentation

For more information about the ZhipuAI API, visit their official documentation:
[ZhipuAI API Documentation](https://open.bigmodel.cn/api/paas/v4/)