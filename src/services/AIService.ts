import { ZhipuAIService as ZhipuService, Message } from "./zhipuAI";
import logger from './LoggerService';

// Common chat options interface
export interface AIChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Simplified AI Service class that focuses on chat functionality
 * Uses ZhipuAIService as the default provider
 */
export class AIService {
  private defaultProvider: ZhipuService;

  constructor() {
    // Initialize defaultProvider with ZhipuAIService instance directly
    this.defaultProvider = new ZhipuService();
    logger.info('AIService initialized with ZhipuService provider');
  }

  /**
   * Chat function that uses the default provider (ZhipuAI)
   */
  async chat(messages: Message[], options: AIChatOptions = {}): Promise<string> {
    try {
      logger.debug(`AI chat request received with model: ${options.model || "glm-4.6"}`);
      
      const response = await this.defaultProvider.chatCompletions({
        model: options.model || "glm-4.6",
        messages,
        temperature: options.temperature || 1,
        max_tokens: options.maxTokens || 65536,
        stream: options.stream || false
      });
      
      logger.debug('AI chat request completed successfully');
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`AI chat error: ${errorMessage}`);
      throw error;
    }
  }
}

/**
 * Singleton instance of AIService
 */
export const aiService = new AIService();


// Controller functions have been moved to src/controllers/aiController.ts