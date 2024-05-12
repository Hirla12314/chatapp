import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import dotenv from 'dotenv'
dotenv.config()

const app = express();

const port = process.env.PORT || 3005;

const apiKey = process.env.OPEN_AI_API_KEY;

const openai = new OpenAI({ apiKey: apiKey });

app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



app.post("/chatbot", async (req, res) => {
  const { question } = req.body;

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: question,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 100,
  });

  res.send(response.choices[0].message.content);
});
