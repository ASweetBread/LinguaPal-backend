import { aiService } from "../services/AIService";
import { Message } from "../services/zhipuAI";
import { conversationManager } from "../services/ConversationManager";
import logger from "../services/LoggerService";
import { type Express } from "express";

/**
 * Controller for handling AI-related API requests
 */

/**
 * Handler function for AI chat requests
 * Parses user input from { msg: 'user input' } format and uses ConversationManager to handle context
 */
async function handleAIChatRequest(req: any, res: any) {
  try {
    // Parse request body to get user input from { msg: 'user input' } format
    const { msg } = req.body;

    // Validate input
    if (!msg || typeof msg !== "string") {
      return res
        .status(400)
        .json({ error: "msg is required and must be a string" });
    }

    // Add user message to conversation context
    const userMessage: Message = {
      role: "user",
      content: msg,
    };
    conversationManager.addContext(userMessage);

    // Get complete context including system config and conversation history
    const contextMessages = conversationManager.getContext();

    // Call the AIService chat function with the complete context
    const response = await aiService.chat(contextMessages);

    // Add assistant response to conversation context
    const assistantMessage: Message = {
      role: "assistant",
      content: response,
    };
    conversationManager.addContext(assistantMessage);

    // Return the response
    res.json({
      success: true,
      response,
      conversationLength: conversationManager.getHistoryLength(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`AI chat controller error: ${errorMessage}`);
    res.status(500).json({
      error: "Failed to process AI chat request",
      details: errorMessage,
    });
  }
}

async function handleExtractVocabulary(req: any, res: any) {}

export default function registerAIChatRoutes(app: Express) {
  app.post("/api/ai-chat", handleAIChatRequest);
}
