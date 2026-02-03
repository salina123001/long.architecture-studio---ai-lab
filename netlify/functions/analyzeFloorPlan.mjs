import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event) => {
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
    const { base64Image } = JSON.parse(event.body);
    
    if (!base64Image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing base64Image' })
      };
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      console.error('GEMINI_API_KEY not found');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageData = base64Image.split(',')[1];

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      },
      "Identify the core rooms in this floor plan. Focus on identifying if there is a 'Living Room', 'Master Bedroom', and 'Dining Room'. Return ONLY a JSON array of strings containing these 3 room types if found. Format: {\"rooms\": [\"Living Room\", \"Master Bedroom\", \"Dining Room\"]}"
    ]);

    const text = result.response.text();
    console.log('API Response:', text);

    let rooms;
    try {
      const parsed = JSON.parse(text);
      rooms = parsed.rooms || ['Living Room', 'Master Bedroom', 'Dining Room'];
    } catch (e) {
      rooms = ['Living Room', 'Master Bedroom', 'Dining Room'];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ rooms: rooms.slice(0, 3) })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to analyze floor plan',
        details: error.message 
      })
    };
  }
};
