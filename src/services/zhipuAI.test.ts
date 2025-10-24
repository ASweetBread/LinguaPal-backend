import {
  ZhipuAIService,
  Message,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "./zhipuAI";

/**
 * Test function to get chat response from ZhipuAI API
 * This function is moved from the main implementation file
 * @param messages Array of messages to send to the API
 * @param model The model to use (default: glm-4.6)
 * @param temperature Sampling temperature (default: 1)
 * @param maxTokens Maximum number of tokens (default: 65536)
 * @param stream Whether to stream the response (default: false)
 * @returns Promise with the generated content
 */
export async function getChatResponse(
  messages: Message[],
  model: string = "glm-4.6",
  temperature: number = 1,
  maxTokens: number = 65536,
  stream: boolean = false
): Promise<string> {
  const service = new ZhipuAIService();
  const request: ChatCompletionRequest = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream,
  };

  try {
    const response = await service.chatCompletions(request);
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error in getChatResponse test:", error);
    throw error;
  }
}

/**
 * Run test demo for ZhipuAI chat functionality
 * This is a demonstration of how to use the getChatResponse function
 */
export async function runChatTestDemo() {
  console.log("Starting ZhipuAI chat test demo...");

  try {
    // Test 3: Using different temperature
    const testMessages3: Message[] = [
      {
        role: "system",
        content: "你是一个创意写作助手。",
      },
      {
        role: "user",
        content: "写一个关于机器人的短故事，不超过50个字。",
      },
    ];

    console.log(
      "Test 3: Sending creative writing request with temperature 0.7..."
    );
    const response3 = await getChatResponse(testMessages3, "glm-4.6", 0.7);
    console.log("Test 3 Result:", response3);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Export the test function so it can be run separately
if (require.main === module) {
  // Only run the demo if this file is executed directly
  runChatTestDemo().catch((error) => {
    console.error("Demo execution failed:", error);
    process.exit(1);
  });
}
