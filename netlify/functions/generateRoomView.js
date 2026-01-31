const { GoogleGenerativeAI } = require("@google/generative-ai");

const STYLE_KEYWORDS = {
  minimalist: "Pure white space, ultra-minimalist, glass and steel, seamless floors, abundance of natural light.",
  wabiSabi: "Micro-cement textures, imperfect wooden beams, earthen tones, tranquil atmosphere, soft diffused light.",
  zen: "Bamboo elements, shoji screens, gravel gardens view, meditative space, balanced proportions.",
  japandi: "Blend of Scandinavian functionality and Japanese rustic minimalism, warm light, functional furniture.",
  nordic: "Bright natural light, pale wood, minimalist furniture, cozy yet clean aesthetic.",
  modern: "Sleek lines, contemporary materials, large glass openings, balanced functional spaces."
};

const OFFICE_DNA = "designed with golden ratio proportions, precise structural lines, high-end material textures, professional architectural photography style";
const SPATIAL_DNA = "Transform this 2D floor plan into a 3D professional interior visualization. Create a wide-angle perspective view. Focus on spatial depth, volumetric lighting, and realistic material rendering.";

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { base64Image, style, roomType } = JSON.parse(event.body);
    
    if (!base64Image || !style || !roomType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const styleKeywords = STYLE_KEYWORDS[style.toLowerCase()] || STYLE_KEYWORDS.minimalist;
    const imageData = base64Image.split(',')[1];
    
    const prompt = `A high-end architectural interior redesign of the ${roomType} shown in this floor plan. ${SPATIAL_DNA}, ${styleKeywords}, ${OFFICE_DNA}, photorealistic, 8k, architectural digest style, sharp focus.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      },
      prompt
    ]);

    const response = result.response;
    
    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error('No image generated');
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            imageUrl: `data:image/png;base64,${part.inlineData.data}`
          })
        };
      }
    }

    throw new Error('No image in response');

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate room view',
        details: error.message 
      })
    };
  }
};
