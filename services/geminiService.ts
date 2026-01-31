import { GoogleGenAI, Type } from "@google/genai";
import { DesignStyle } from "../types";

const STYLE_KEYWORDS: Record<DesignStyle, string> = {
  [DesignStyle.Minimalist]: "Pure white space, ultra-minimalist, glass and steel, seamless floors, abundance of natural light.",
  [DesignStyle.WabiSabi]: "Micro-cement textures, imperfect wooden beams, earthen tones, tranquil atmosphere, soft diffused light.",
  [DesignStyle.Zen]: "Bamboo elements, shoji screens, gravel gardens view, meditative space, balanced proportions.",
  [DesignStyle.Japandi]: "Blend of Scandinavian functionality and Japanese rustic minimalism, warm light, functional furniture.",
  [DesignStyle.Nordic]: "Bright natural light, pale wood, minimalist furniture, cozy yet clean aesthetic.",
  [DesignStyle.Modern]: "Sleek lines, contemporary materials, large glass openings, balanced functional spaces."
};

const OFFICE_DNA = "designed with golden ratio proportions, precise structural lines, high-end material textures, professional architectural photography style";
const SPATIAL_DNA = "Transform this 2D floor plan into a 3D professional interior visualization. Create a wide-angle perspective view. Focus on spatial depth, volumetric lighting, and realistic material rendering.";

// 初始化 API Key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ VITE_GEMINI_API_KEY is missing!");
  throw new Error("API Key not configured. Please set VITE_GEMINI_API_KEY in environment variables.");
}

console.log("✅ API Key loaded successfully");

const genAI = new GoogleGenAI(API_KEY);

/**
 * Step 1: 分析平面圖以識別房間
 */
export const analyzeFloorPlan = async (base64Image: string): Promise<string[]> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const response = await model.generateContent({
    contents: [{
      role: "user",
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: "Identify the core rooms in this floor plan. Focus on identifying if there is a 'Living Room', 'Master Bedroom', and 'Dining Room'. Return ONLY a JSON array of strings containing these 3 room types if found." }
      ]
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rooms: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["rooms"]
      }
    }
  });

  try {
    const text = response.response.text();
    const data = JSON.parse(text || '{"rooms": []}');
    return data.rooms.length > 0 ? data.rooms.slice(0, 3) : ['Living Room', 'Master Bedroom', 'Dining Room'];
  } catch (e) {
    console.error("分析平面圖失敗:", e);
    return ['Living Room', 'Master Bedroom', 'Dining Room'];
  }
};

/**
 * Step 2: 為特定房間生成 3D 視覺化視圖
 */
export const generateRoomView = async (base64Image: string, style: DesignStyle, roomType: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const styleKeywords = STYLE_KEYWORDS[style] || "";
  const assemblyPrompt = (extra: string = "") => 
    `A high-end architectural interior redesign of the ${roomType} shown in this floor plan. ${SPATIAL_DNA}, ${styleKeywords}, ${OFFICE_DNA}, ${extra} photorealistic, 8k, architectural digest style, sharp focus.`;

  const call = async (prompt: string) => {
    const res = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }]
    });

    const content = res.response;
    if (!content.candidates?.[0]?.content?.parts) throw new Error("SAFETY_OR_EMPTY");
    
    for (const part of content.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("NO_IMAGE_RETURNED");
  };

  try {
    return await call(assemblyPrompt());
  } catch (err: any) {
    console.error("第一次生成失敗，嘗試使用備用提示:", err);
    return await call(assemblyPrompt("artistic style, SFW, "));
  }
};