import express, { Express, Request, Response } from "express";
import registerAIChatRoutes from "./controllers/aiController";
import logger from "./services/LoggerService";

const app: Express = express();
const port = 3000;

// Middleware
app.use(express.json());

// No middleware needed - the handler uses aiService directly

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to LinguaPal Backend API" });
});

registerAIChatRoutes(app);

// Start server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});

// Note: In a production environment, consider adding rate limiting and request validation
// for all API endpoints to improve security and reliability.
