import { DesignStyle } from "../types";

/**
 * Step 1: 分析平面圖以識別房間
 */
export const analyzeFloorPlan = async (base64Image: string): Promise<string[]> => {
  try {
    const response = await fetch('/api/analyzeFloorPlan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image })
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return data.rooms || ['Living Room', 'Master Bedroom', 'Dining Room'];
  } catch (error) {
    console.error("分析平面圖失敗:", error);
    return ['Living Room', 'Master Bedroom', 'Dining Room'];
  }
};

/**
 * Step 2: 為特定房間生成 3D 視覺化視圖
 */
export const generateRoomView = async (
  base64Image: string, 
  style: DesignStyle, 
  roomType: string
): Promise<string> => {
  try {
    const response = await fetch('/api/generateRoomView', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        base64Image, 
        style, 
        roomType 
      })
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("生成房間視圖失敗:", error);
    throw error;
  }
};
