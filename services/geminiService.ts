
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

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Analyze the floor plan to identify rooms
 */
export const analyzeFloorPlan = async (base64Image: string): Promise<string[]> => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: "Identify the core rooms in this floor plan. Focus on identifying if there is a 'Living Room', 'Master Bedroom', and 'Dining Room'. Return ONLY a JSON array of strings containing these 3 room types if found, or similar equivalents." }
      ]
    },
    config: {
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
    const data = JSON.parse(response.text || '{"rooms": []}');
    // Default to the requested 3 if none found or to ensure we have exactly 3
    const rooms = data.rooms.length > 0 ? data.rooms : ['Living Room', 'Master Bedroom', 'Dining Room'];
    return rooms.slice(0, 3);
  } catch (e) {
    return ['Living Room', 'Master Bedroom', 'Dining Room'];
  }
};

/**
 * Step 2: Generate individual 3D views for specific rooms
 */
export const generateRoomView = async (base64Image: string, style: DesignStyle, roomType: string): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  const styleKeywords = STYLE_KEYWORDS[style] || "";
  
  const assemblyPrompt = (extra: string = "") => 
    `A high-end architectural interior redesign of the ${roomType} shown in this floor plan. ${SPATIAL_DNA}, ${styleKeywords}, ${OFFICE_DNA}, ${extra} photorealistic, 8k, architectural digest style, sharp focus.`;

  const call = async (prompt: string) => {
    const res = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    });

    if (!res.candidates?.[0]?.content?.parts) throw new Error("SAFETY");
    for (const part of res.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("EMPTY");
  };

  try {
    return await call(assemblyPrompt());
  } catch (err: any) {
    return await call(assemblyPrompt("artistic style, SFW, "));
  }
};
