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
    const { text, voice, language, type } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (type === 'tts') {
      // Text to Speech
      console.log(`Generating TTS for: ${text?.slice(0, 50)}...`);
      
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice || 'alloy',
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI TTS error:', error);
        throw new Error('TTS generation failed');
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

      return new Response(JSON.stringify({ 
        success: true,
        audioBase64: base64Audio,
        type: 'tts'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (type === 'translate') {
      // Text translation using GPT
      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{ text: `Translate the following text to ${language}. Only return the translation, nothing else:\n\n${text}` }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048,
            }
          }),
        }
      );

      const data = await response.json();
      const translation = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return new Response(JSON.stringify({ 
        success: true,
        translation,
        type: 'translate'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid request type');

  } catch (error) {
    console.error('Error in dwiju-voice:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
