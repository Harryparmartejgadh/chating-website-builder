import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, prompt, type } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = prompt || '';

    if (type === 'analyze') {
      systemPrompt = `You are Dwiju Vision AI from BHILODIYA PRIMARY SCHOOL, Gujarat. Analyze images and describe what you see in detail. Support Gujarati, Hindi, and English.`;
      userPrompt = prompt || 'Describe this image in detail. What objects, people, text, or scenes do you see?';
    } else if (type === 'ocr') {
      systemPrompt = `You are Dwiju OCR AI. Extract ALL text from the image accurately. Preserve formatting where possible.`;
      userPrompt = 'Extract all text from this image. Return only the extracted text, preserving layout.';
    } else if (type === 'detect') {
      systemPrompt = `You are Dwiju Object Detection AI. List all objects you can identify in the image.`;
      userPrompt = 'List all objects detected in this image with their approximate positions (top, bottom, left, right, center).';
    } else if (type === 'emotion') {
      systemPrompt = `You are Dwiju Emotion AI. Analyze facial expressions and emotions in images.`;
      userPrompt = 'Analyze the emotions and facial expressions of people in this image. Describe their mood and feelings.';
    }

    console.log(`Processing vision request type: ${type}`);

    const parts: any[] = [{ text: userPrompt }];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
          systemInstruction: { parts: [{ text: systemPrompt }] }
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini Vision API error:', data);
      throw new Error(data.error?.message || 'Vision analysis failed');
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available';

    return new Response(JSON.stringify({ 
      success: true,
      result,
      type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dwiju-vision:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
