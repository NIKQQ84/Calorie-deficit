import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.resolve();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase request size limit for base64 food images
  app.use(express.json({ limit: "25mb" }));

  // Lazy initialize Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add your key in Settings > Secrets.");
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
    return aiClient;
  }

  // API endpoint to analyze food image
  app.post("/api/scan-food", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ success: false, error: "Изображение не предоставлено." });
      }

      // Check if image is in data URL format and extract raw base64 data and mimeType
      let mimeType = "image/jpeg";
      let base64Data = image;

      if (image.startsWith("data:")) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          return res.status(400).json({ success: false, error: "Некорректный формат изображения." });
        }
      }

      const ai = getGeminiClient();

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        }
      };

      const systemInstruction = `You are a professional nutritionist, dietitian, and food expert. 
Your goal is to carefully analyze the image of the food shown.
1. Determine if there is indeed food or beverage in the image.
2. If there is NO food or beverage at all (e.g. books, keyboards, faces, random non-food items), return isFood = false. Do not try to guess calories for non-food objects.
3. If there is food or beverage, analyze it carefully. Estimate the portion size (e.g. 150g, 350g) and calculate total calories, protein, fats, and carbs for the visual portion in the image.
4. Give a confidence level (e.g., 0.85) based on visibility.
5. Provide 3 nutrition tips or dietary advice in Russian. Be supportive, informative, and practical.
6. Provide a list of key detected ingredients/components in Russian.
7. If multiple distinct food items are present on the plate (e.g. a steak, mashed potato, and broccoli), provide a breakdown of these items in the "items" array with their approximate individual calorie and weight estimates.
All output text fields (foodName, tips, ingredients, item names) MUST be in Russian.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          imagePart,
          { text: "Analyze the food in this image and provide a JSON report according to the schema." }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isFood: {
                type: Type.BOOLEAN,
                description: "True if the image contains food or beverage, false otherwise.",
              },
              foodName: {
                type: Type.STRING,
                description: "Name of the main food item or dish in Russian.",
              },
              calories: {
                type: Type.INTEGER,
                description: "Estimated total calories (kcal) for the entire shown portion.",
              },
              portionWeight: {
                type: Type.INTEGER,
                description: "Estimated total weight of the portion in grams.",
              },
              protein: {
                type: Type.NUMBER,
                description: "Estimated protein content in grams for this portion.",
              },
              fat: {
                type: Type.NUMBER,
                description: "Estimated fat content in grams for this portion.",
              },
              carbs: {
                type: Type.NUMBER,
                description: "Estimated carbohydrate content in grams for this portion.",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence in the estimation, from 0.0 to 1.0.",
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 3 helpful nutritional or dietary tips/warnings in Russian.",
              },
              ingredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of detected key ingredients in Russian.",
              },
              items: {
                type: Type.ARRAY,
                description: "Breakdown of individual food items found in the image (if multiple items are present).",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the food item in Russian." },
                    calories: { type: Type.INTEGER, description: "Calories for this specific item portion." },
                    weight: { type: Type.INTEGER, description: "Estimated weight of this specific item in grams." },
                  },
                  required: ["name", "calories", "weight"]
                }
              }
            },
            required: ["isFood", "foodName", "calories", "portionWeight", "protein", "fat", "carbs", "confidence", "tips", "ingredients"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return res.status(500).json({ success: false, error: "Не удалось получить ответ от ИИ." });
      }

      const result = JSON.parse(responseText.trim());
      res.json({ success: true, data: result });
    } catch (err: any) {
      console.error("Error scanning food:", err);
      res.status(500).json({ success: false, error: err.message || "Внутренняя ошибка сервера при анализе." });
    }
  });

  // Serve static assets and Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
