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
    const { type, problem, code, language, topic } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let systemPrompt = `You are Dwiju Brain AI, an advanced reasoning and problem-solving AI from BHILODIYA PRIMARY SCHOOL, Gujarat. You excel at logical thinking, mathematics, coding, and analysis. Support Gujarati, Hindi, and English.`;
    let userPrompt = '';

    if (type === 'math') {
      userPrompt = `Solve this math problem step by step. Show all work clearly:\n\n${problem}`;
    } else if (type === 'logic') {
      userPrompt = `Solve this logic puzzle or reasoning problem. Explain your thinking:\n\n${problem}`;
    } else if (type === 'code') {
      userPrompt = `${problem}\n\nLanguage: ${language || 'Python'}\n\nProvide clean, well-commented code with explanation.`;
    } else if (type === 'explain') {
      userPrompt = `Explain this concept in simple terms with examples. Topic: ${topic}\n\nMake it easy for students to understand.`;
    } else if (type === 'analyze') {
      userPrompt = `Analyze the following and provide insights:\n\n${problem}`;
    } else {
      userPrompt = problem || 'Hello, how can I help you think through a problem today?';
    }

    console.log(`Processing brain request type: ${type}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          systemInstruction: { parts: [{ text: systemPrompt }] }
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini Brain API error:', data);
      throw new Error(data.error?.message || 'Brain processing failed');
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return new Response(JSON.stringify({ 
      success: true,
      result,
      type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dwiju-brain:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
