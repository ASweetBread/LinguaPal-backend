import { type Message } from "./zhipuAI";
import CET4Teacher from "../prompt/CET4Teacher";
/**
 * Conversation Manager to handle chat context management
 * - Stores conversation history
 * - Manages system configuration separately
 * - Provides methods to add and retrieve context
 */
export class ConversationManager {
  private conversationHistory: Message[] = [];
  private systemConfig: string = CET4Teacher.prompt;

  /**
   * Add a message to the conversation context
   * @param message The message to add (must be of type Message)
   */
  addContext(message: Message): void {
    if (!message || !message.role || !message.content) {
      throw new Error(
        "Invalid message format: message must have role and content"
      );
    }

    // Validate role
    if (!["system", "user", "assistant"].includes(message.role)) {
      throw new Error(
        `Invalid message role: ${message.role}. Role must be 'system', 'user', or 'assistant'`
      );
    }

    this.conversationHistory.push(message);
  }

  /**
   * Get the complete conversation context
   * @returns Array of messages including both system configuration and conversation history
   */
  getContext(): Message[] {
    const result: Message[] = [];

    // Add system configuration as system messages
    result.unshift({
      role: "system",
      content: this.systemConfig,
    });

    // Add conversation history
    result.push(...this.conversationHistory);

    return result;
  }

  /**
   * Clear the conversation history (system config remains)
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Clear all context including system config
   */
  clearAll(): void {
    this.conversationHistory = [];
    this.systemConfig = "";
  }

  /**
   * Get conversation history length
   */
  getHistoryLength(): number {
    return this.conversationHistory.length;
  }
}

/**
 * Singleton instance of ConversationManager
 */
export const conversationManager = new ConversationManager();
