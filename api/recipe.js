// Food Image to Recipe API
// Uses LLaVA vision model on fal.ai for image recognition
// Then generates recipe using LLM

const FAL_KEY = '89197a8d-be7d-4c5b-934c-2f3d12c7b772:3f8d26a3ca1673a30d49d1e4be46caf3';

export default async function handler(req, res) {
  // Set CORS
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
    const { imageUrl, language = 'zh' } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Step 1: Use LLaVA to analyze the image and identify food
    const llavaPrompt = language === 'zh' 
      ? '请详细描述这张食物图片。你能识别出有哪些食材吗？这道菜可能叫什么名字？请用中文回答。'
      : 'Please describe this food image in detail. What ingredients can you identify? What dish might this be?';

    const llavaResponse = await fetch('https://queue.fal.ai/fal-ai/llava-next', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: llavaPrompt,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!llavaResponse.ok) {
      const error = await llavaResponse.text();
      console.error('LLaVA API error:', error);
      throw new Error('Failed to analyze image');
    }

    const llavaResult = await llavaResponse.json();
    const identifiedFood = llavaResult.output || llavaResult.response;

    // Step 2: Generate recipe based on identified food
    const recipePrompt = language === 'zh'
      ? `根据以下食物识别结果，生成一个完整的食谱：${identifiedFood}\n\n请包含：\n1. 菜名\n2. 所需食材（列出具体数量）\n3. 详细烹饪步骤\n4. 预计烹饪时间\n5. 难度等级\n\n请用中文回答，格式清晰。`
      : `Based on the following food analysis, generate a complete recipe: ${identifiedFood}\n\nPlease include:\n1. Dish name\n2. Ingredients (with quantities)\n3. Detailed cooking steps\n4. Estimated time\n5. Difficulty level\n\nPlease answer in English with clear formatting.`;

    const recipeResponse = await fetch('https://queue.fal.ai/fal-ai/qwen2-5-coder-32b-instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: recipePrompt,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    let recipe = '';
    if (recipeResponse.ok) {
      const recipeResult = await recipeResponse.json();
      recipe = recipeResult.output || recipeResult.response;
    } else {
      // If recipe generation fails, just return the identified food
      recipe = identifiedFood;
    }

    return res.status(200).json({
      success: true,
      identifiedFood,
      recipe,
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Failed to process image',
      message: error.message 
    });
  }
}
