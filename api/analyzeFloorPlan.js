import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Image } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'Missing base64Image' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      console.error('GEMINI_API_KEY not found');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image"
    });

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

    return res.status(200).json({ rooms: rooms.slice(0, 3) });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze floor plan',
      details: error.message 
    });
  }
}
