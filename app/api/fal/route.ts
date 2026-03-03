import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { image_url, prompt, model } = await request.json();
  
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const endpoint = model === 'llava' 
    ? 'https://queue.fal.ai/fal-ai/llava-next'
    : 'https://queue.fal.ai/fal-ai/qwen2-5-coder-32b-instruct';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url,
        prompt,
        max_tokens: model === 'llava' ? 300 : 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: error }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
