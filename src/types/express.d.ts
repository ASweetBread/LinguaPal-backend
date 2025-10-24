import { ZhipuAIService } from '../services/zhipuAI';

declare global {
  namespace Express {
    interface Request {
      zhipuAI?: ZhipuAIService;
      // aiService property removed - no longer needed
    }
  }
}