import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to LinguaPal Backend API' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});