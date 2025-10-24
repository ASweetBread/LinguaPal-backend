import axios, { AxiosInstance, AxiosResponse } from "axios";
import logger from "./LoggerService";

// Define the message type
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Define the request and response types
export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
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

/**
 * ZhipuAI Service Class
 */
export class ZhipuAIService {
  private axiosInstance: AxiosInstance;
  private apiKey: string = "825be8b67f07455baf8416a637a550e6.3OxR9TbflTscS0rR";
  private baseUrl: string = "https://open.bigmodel.cn/api/paas/v4";

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  /**
   * Access the chat completions API
   * @param request The chat completion request parameters
   * @returns Promise with the chat completion response
   */
  async chatCompletions(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      logger.debug(`Calling ZhipuAI chat API with model: ${request.model}`);
      logger.debug(`Request payload: ${JSON.stringify(request)}`);
      const response: AxiosResponse<ChatCompletionResponse> =
        await this.axiosInstance.post("/chat/completions", request);
      logger.debug(
        `ZhipuAI chat API call successful with response ID: ${response}`
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`Error calling ZhipuAI chat API: ${errorMessage}`);
      throw error;
    }
  }
}
