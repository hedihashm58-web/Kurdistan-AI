
import { GoogleGenAI, Type, Modality, Content } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

// Helper to get fresh instance
const createAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_REQUIRED");
  return new GoogleGenAI({ apiKey });
};

export const chatWithKurdAIStream = async (message: string, history: Content[] = [], imageBase64?: string | null, mimeType: string = 'image/jpeg') => {
  const ai = createAI();
  
  const userParts: any[] = [{ text: message || "..." }];
  if (imageBase64) {
    userParts.push({ 
      inlineData: { 
        data: imageBase64.split(',')[1], 
        mimeType 
      } 
    });
  }

  const sanitizedHistory: Content[] = [];
  let lastRole: string | null = null;

  for (const entry of history) {
    const role = entry.role === 'model' ? 'model' : 'user';
    const textPart = entry.parts.find(p => p.text);
    const text = textPart?.text?.trim();

    if (text && text !== "" && role !== lastRole) {
      if (sanitizedHistory.length === 0 && role !== 'user') continue;
      sanitizedHistory.push({
        role: role as "user" | "model",
        parts: [{ text: text }]
      });
      lastRole = role;
    }
  }

  if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
    sanitizedHistory.pop();
  }

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [...sanitizedHistory, { role: 'user', parts: userParts }],
    config: { 
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    }
  });
};

export const generateKurdishArt = async (
  prompt: string, 
  style: string = 'Cinematic', 
  quality: '1K' | '2K' = '1K',
  base64Image?: string | null,
  mimeType: string = 'image/jpeg'
) => {
  const ai = createAI();
  const isPro = quality === '2K';
  const model = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  const enhancedPrompt = `Kurdish Theme: ${prompt}. Style: hyper-realistic, 8k, ${style}`;

  const contents: any = {
    parts: [{ text: enhancedPrompt }]
  };

  if (base64Image) {
    contents.parts.unshift({ inlineData: { data: base64Image.split(',')[1], mimeType } });
  }

  const response = await ai.models.generateContent({
    model,
    contents,
    config: { 
      imageConfig: { aspectRatio: "1:1", imageSize: isPro ? "2K" : "1K" },
      ...(isPro ? { tools: [{ googleSearch: {} }] } : {})
    }
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part) throw new Error("IMAGE_GEN_FAILED");
  return `data:image/png;base64,${part.inlineData.data}`;
};

export const generateKurdishVideo = async (
  prompt: string, 
  config: { resolution: '720p' | '1080p', aspectRatio: '16:9' | '9:16' },
  onStatusUpdate: (status: string, progress: number) => void
) => {
  const ai = createAI();
  const enhancedPrompt = `Cinematic Kurdish theme: ${prompt}. High quality.`;

  onStatusUpdate('پەیوەندی بە سێرڤەری ڤیدیۆوە دەکات...', 10);
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: enhancedPrompt,
    config: {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
    onStatusUpdate('خەریکی ڕێندەرکردنی فریمەکانە...', 50);
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const translateKurdishStream = async (text: string, sourceLang: string, targetLang: string, tone: string, imageBase64: string | null, mimeType: string) => {
  const ai = createAI();
  const parts: any[] = [{ text: `Translate from ${sourceLang} to ${targetLang}: ${text}` }];
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "You are a specialized Kurdish linguistic AI. Translate accurately." }
  });
};

export const analyzeMathStream = async (query: string, imageBase64: string | null, mimeType: string) => {
  const ai = createAI();
  const parts: any[] = [{ text: query }];
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts }],
    config: { 
      systemInstruction: "تۆ پسپۆڕی زانستیت. بە کوردی وەڵام بدەرەوە.",
      thinkingConfig: { thinkingBudget: 16000 }
    }
  });
};

export const getLandmarks = async (region: string) => {
  const ai = createAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `JSON list of 8 landmarks in ${region}, Kurdistan.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cityNarrative: {
            type: Type.OBJECT,
            properties: { ku: { type: Type.STRING }, ar: { type: Type.STRING }, en: { type: Type.STRING } },
            required: ["ku", "ar", "en"]
          },
          landmarks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.OBJECT, properties: { ku: { type: Type.STRING }, ar: { type: Type.STRING }, en: { type: Type.STRING } } },
                category: { type: Type.OBJECT, properties: { ku: { type: Type.STRING }, ar: { type: Type.STRING }, en: { type: Type.STRING } } },
                description: { type: Type.OBJECT, properties: { ku: { type: Type.STRING }, ar: { type: Type.STRING }, en: { type: Type.STRING } } }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const analyzeHealthImageStream = async (imageBase64: string | null, mimeType: string, question: string) => {
  const ai = createAI();
  const parts: any[] = [{ text: question }];
  if (imageBase64) parts.push({ inlineData: { data: imageBase64.split(',')[1], mimeType } });

  return await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "Kurdish Medical AI. Advise caution and professional consultation." }
  });
};
