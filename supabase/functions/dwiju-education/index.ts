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
    const { type, subject, topic, difficulty, language, question, studyGoal } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let prompt = '';
    let systemPrompt = `You are Dwiju Education AI, an expert teacher created by students at BHILODIYA PRIMARY SCHOOL, Gujarat. You help students learn in Gujarati, Hindi, and English. Always be encouraging and supportive.`;

    if (type === 'quiz') {
      prompt = `Generate a quiz with 5 multiple choice questions about "${topic}" in ${subject}.
Difficulty: ${difficulty}
Language: ${language}

Return ONLY valid JSON in this exact format:
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief explanation"
    }
  ]
}`;
    } else if (type === 'expert') {
      prompt = `You are a ${subject} expert teacher. Answer this student's question in ${language}:

"${question}"

Provide a clear, educational explanation suitable for school students. Include examples if helpful.`;
    } else if (type === 'planner') {
      prompt = `Create a study plan for a student with this goal: "${studyGoal}"
Language: ${language}

Return ONLY valid JSON in this exact format:
{
  "planTitle": "Study Plan Title",
  "duration": "X weeks/days",
  "dailyHours": 2,
  "schedule": [
    {
      "day": "Day 1",
      "topic": "Topic name",
      "activities": ["Activity 1", "Activity 2"],
      "resources": ["Resource 1"],
      "goals": "What to achieve"
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}`;
    } else {
      throw new Error('Invalid request type');
    }

    console.log(`Processing ${type} request for subject: ${subject || 'general'}`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
          systemInstruction: { parts: [{ text: systemPrompt }] }
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(data.error?.message || 'Failed to get response');
    }

    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // For quiz and planner, try to parse JSON
    if (type === 'quiz' || type === 'planner') {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({ 
            success: true,
            data: parsed,
            type
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      data: content,
      type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in dwiju-education:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
