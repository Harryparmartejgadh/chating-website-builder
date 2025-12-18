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
    const { messages, imageBase64 } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Build content parts
    const parts: any[] = [];
    
    // Add text from messages
    const userMessage = messages[messages.length - 1]?.content || '';
    if (userMessage) {
      parts.push({ text: userMessage });
    }

    // Add image if provided
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      });
    }

    // Build conversation history for context
    const contents = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          systemInstruction: {
            parts: [{
              text: `You are Dwiju (દ્વિજુ), an advanced AI assistant created by students at BHILODIYA PRIMARY SCHOOL, Gujarat, India under the guidance of teacher શ્રી પરમાર હરિશકુમાર રણછોડભાઈ.

You are a friendly, helpful, and intelligent AI robot with 1950+ features covering:
- Education (245+ features)
- Medical/Health (135+ features)  
- Agriculture (134+ features)
- Multimedia (109+ features)
- And many more categories

You can communicate in multiple languages including Gujarati (ગુજરાતી), Hindi (हिंदी), English, and others.

Always be helpful, educational, and supportive. When asked about yourself, explain you are Dwiju AI Robot from Gujarat.`
            }]
          }
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Failed to get response from Gemini');
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ 
      response: generatedText,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dwiju-live:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
