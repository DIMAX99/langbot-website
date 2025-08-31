import { GoogleGenerativeAI } from '@google/generative-ai';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authHelpers } from '../../lib/auth';
import { dbHelpers } from '../../lib/database';

// API Keys - Add these to your .env.local file
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Model configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // gemini, openai, anthropic
const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL_NAME || "gemini-2.0-flash-exp";

// Language-specific prompts for better tutoring
const getLanguageTutorPrompt = (language: string, userLevel: string) => {
  const basePrompt = `You are an expert ${language} language tutor. Reply concisely and directly to the user's message. Only ask a follow-up question if it is required for learning or to keep the conversation going, and keep any question very short. Do not ask unnecessary questions. If you correct or explain, do so briefly. Use some ${language} in your reply when appropriate, and always provide English translations for ${language} words/phrases. Point out common mistakes only if relevant. Be friendly and supportive.`;
  return basePrompt;
};

const getLanguageSpecificGuidance = (language: string) => {
  const guidance: { [key: string]: string } = {
    Spanish: `
- Focus on gender agreement (el/la, -o/-a endings)
- Practice ser vs estar usage
- Help with subjunctive mood when relevant
- Emphasize rolled R pronunciation
- Discuss regional variations (Mexican, Argentinian, etc.)`,
    
    French: `
- Focus on gender agreement and liaisons
- Practice nasal vowels pronunciation
- Help with formal vs informal address (tu/vous)
- Explain silent letters and pronunciation rules
- Discuss cultural etiquette and expressions`,
    
    German: `
- Focus on der/die/das articles and cases
- Practice word order in different sentence types
- Help with separable/inseparable verbs
- Explain compound word formation
- Discuss formal vs informal address (du/Sie)`,
    
    Japanese: `
- Focus on hiragana, katakana, and basic kanji
- Practice politeness levels (keigo, teineigo)
- Help with particle usage (wa, ga, wo, ni, etc.)
- Explain pitch accent and pronunciation
- Discuss cultural context and bowing etiquette`,
    
    Italian: `
- Focus on gender agreement and verb conjugations
- Practice double consonants pronunciation
- Help with formal vs informal address (tu/Lei)
- Explain hand gestures and cultural expressions
- Discuss regional dialects and variations`,
    
    English: `
- Focus on irregular verbs and phrasal verbs
- Practice articles (a, an, the) usage
- Help with pronunciation of difficult sounds
- Explain idioms and colloquial expressions
- Discuss formal vs informal language`
  };

  return guidance[language] || `Focus on basic grammar, vocabulary, and pronunciation for ${language}.`;
};

// Initialize AI providers
let genAI: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// OpenAI integration
const callOpenAI = async (messages: any[], language: string, userLevel: string) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = getLanguageTutorPrompt(language, userLevel);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Good for language learning, cost-effective
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'I apologize, I cannot respond right now.';
};

// Anthropic Claude integration
const callAnthropic = async (messages: any[], language: string, userLevel: string) => {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  const systemPrompt = getLanguageTutorPrompt(language, userLevel);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307', // Fast and good for conversations
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.content || msg.parts?.[0]?.text || ''
      }))
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'I apologize, I cannot respond right now.';
};

// Gemini 2.0 Flash integration - optimized for speed and language learning
const callGemini = async (message: string, history: any[], language: string, userLevel: string) => {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ 
    model: GEMINI_MODEL_NAME,
    generationConfig: {
      maxOutputTokens: 500, // Increased for better responses
      temperature: 0.8, // Slightly higher for more natural language teaching
      topP: 0.95,
      topK: 40,
    },
  });
  
  const systemPrompt = getLanguageTutorPrompt(language, userLevel);

  const chat = model.startChat({
    history: history || [],
  });

  const result = await chat.sendMessage(`${systemPrompt}\n\nUser: ${message}`);
  const response = await result.response;
  return response.text();
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Extract user info from token
    const { authorization } = req.headers;
    let user = null;
    
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.split(' ')[1];
      user = authHelpers.verifyToken(token);
    }

    const { message, history = [], language = 'English', userLevel = 'beginner', conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Get or create conversation for authenticated users
    let currentConversationId = conversationId;
    if (user && !currentConversationId) {
      // Create new conversation
      currentConversationId = await dbHelpers.createConversation(
        user.id, 
        language, 
        `${language.charAt(0).toUpperCase() + language.slice(1)} Chat`
      );
    }

    // Save user message if authenticated
    if (user && currentConversationId) {
      await dbHelpers.createMessage(currentConversationId, 'user', message);
    }

    let response: string;

    // Try different AI providers based on configuration and availability
    switch (AI_PROVIDER) {
      case 'openai':
        if (OPENAI_API_KEY) {
          const messages = history.map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : h.role,
            content: h.parts?.[0]?.text || h.content
          }));
          messages.push({ role: 'user', content: message });
          response = await callOpenAI(messages, language, userLevel);
          break;
        }
        // Fallback to next available provider
        
      case 'anthropic':
        if (ANTHROPIC_API_KEY) {
          const messages = history.map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : h.role,
            content: h.parts?.[0]?.text || h.content
          }));
          messages.push({ role: 'user', content: message });
          response = await callAnthropic(messages, language, userLevel);
          break;
        }
        // Fallback to next available provider
        
      case 'gemini':
      default:
        if (GEMINI_API_KEY) {
          response = await callGemini(message, history, language, userLevel);
          break;
        }
        
        // If no primary provider available, try fallbacks
        if (OPENAI_API_KEY) {
          const messages = history.map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : h.role,
            content: h.parts?.[0]?.text || h.content
          }));
          messages.push({ role: 'user', content: message });
          response = await callOpenAI(messages, language, userLevel);
        } else if (ANTHROPIC_API_KEY) {
          const messages = history.map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : h.role,
            content: h.parts?.[0]?.text || h.content
          }));
          messages.push({ role: 'user', content: message });
          response = await callAnthropic(messages, language, userLevel);
        } else {
          throw new Error('No AI provider configured. Please set up at least one API key.');
        }
    }

    // Save AI response if authenticated
    if (user && currentConversationId) {
      await dbHelpers.createMessage(currentConversationId, 'ai', response!);
      await dbHelpers.updateConversation(currentConversationId);
    }

    res.status(200).json({ 
      response: response!,
      provider: AI_PROVIDER,
      language,
      userLevel,
      conversationId: currentConversationId,
      user: user ? { id: user.id, email: user.email, name: user.name } : null
    });

  } catch (error) {
    console.error('AI API error:', error);
    
    // Fallback response with helpful language learning content
    const fallbackResponse = `I'm having trouble connecting to my AI brain right now, but I'm still here to help you learn! 

Try asking me about:
🗣️ Basic phrases and greetings
📚 Grammar rules and explanations  
🔤 Vocabulary in specific topics
🗺️ Cultural insights

What would you like to learn about?`;

    res.status(200).json({ 
      response: fallbackResponse,
      provider: 'fallback'
    });
  }
}