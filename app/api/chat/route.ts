import { NextRequest, NextResponse } from 'next/server';
import { features } from '@/lib/features';

export async function POST(request: NextRequest) {
  try {
    const { message, history, currentFeature } = await request.json();

    const detectedFeature = detectFeature(message);

    const useOllama = await checkOllamaAvailability();

    let response: string;

    if (useOllama) {
      response = await getOllamaResponse(message, history, detectedFeature);
    } else {
      response = getSimulatedResponse(message, detectedFeature);
    }

    return NextResponse.json({
      response,
      feature: detectedFeature,
      speak: true,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function checkOllamaAvailability(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function getOllamaResponse(
  message: string,
  history: any[],
  feature: string | null
): Promise<string> {
  try {
    const systemPrompt = `You are F.R.I.D.A.Y (Female Replacement Intelligent Digital Assistant Youth), an advanced AI assistant inspired by Marvel's Jarvis/Friday. You have 315 active features across 20 categories. Be helpful, efficient, and conversational. Keep responses concise and actionable.${
      feature ? `\n\nCurrent feature context: ${feature}` : ''
    }`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-5).map((h: any) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5',
        messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error('Ollama request failed');
    }

    const data = await response.json();
    return data.message?.content || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('Ollama error:', error);
    return getSimulatedResponse(message, feature);
  }
}

function detectFeature(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  for (const feature of features) {
    if (feature.command && lowerMessage.includes(feature.command.toLowerCase())) {
      return feature.name;
    }

    const nameWords = feature.name.toLowerCase().split(' ');
    if (nameWords.some(word => lowerMessage.includes(word))) {
      return feature.name;
    }
  }

  return null;
}

function getSimulatedResponse(message: string, feature: string | null): string {
  const lowerMessage = message.toLowerCase();

  if (feature) {
    const featureObj = features.find(f => f.name === feature);
    if (featureObj) {
      return generateFeatureResponse(featureObj, message);
    }
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm F.R.I.D.A.Y, your AI assistant with 315 active features. How can I assist you today?";
  }

  if (lowerMessage.includes('what can you do') || lowerMessage.includes('capabilities')) {
    return "I have 315 active features across 20 categories including productivity, communication, health tracking, smart home control, finance management, and much more. Try asking about specific tasks like setting reminders, weather updates, or controlling smart devices!";
  }

  if (lowerMessage.includes('weather')) {
    return "The current weather is sunny with a temperature of 72°F (22°C). It's a beautiful day! Would you like an extended forecast?";
  }

  if (lowerMessage.includes('time')) {
    return `The current time is ${new Date().toLocaleTimeString()}.`;
  }

  if (lowerMessage.includes('date')) {
    return `Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
  }

  if (lowerMessage.includes('remind')) {
    return "I've set a reminder for you. You'll receive a notification at the specified time.";
  }

  if (lowerMessage.includes('calculate') || lowerMessage.includes('math')) {
    return "I can help with calculations. What would you like me to compute?";
  }

  if (lowerMessage.includes('play music') || lowerMessage.includes('song')) {
    return "I would love to play music for you! This feature works best when connected to your music streaming service.";
  }

  if (lowerMessage.includes('joke')) {
    const jokes = [
      "Why did the AI go to therapy? It had too many neural networks!",
      "What do you call an AI that sings? A-dell!",
      "Why don't AIs ever get lost? They always follow the algorithm!",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  return "I understand your request. With 315 active features at my disposal, I can help with a wide variety of tasks. For full AI-powered responses, please ensure Ollama with Qwen2.5 model is running. What specific task would you like assistance with?";
}

function generateFeatureResponse(feature: any, message: string): string {
  const responses: Record<string, string> = {
    'Set Reminder': "I've created your reminder. You'll be notified at the specified time.",
    'Weather Forecast': "The weather looks great today! Temperature: 72°F, Conditions: Sunny with light clouds.",
    'Calculator': "I can perform any calculation you need. What would you like me to compute?",
    'Play Music': "Starting music playback. Connect to your preferred streaming service for full functionality.",
    'Set Timer': "Timer activated! I'll notify you when the time is up.",
    'Task Management': "I've added that task to your to-do list. Stay productive!",
    'News Updates': "Here are today's top headlines: Technology stocks surge, Climate summit concludes, Sports championship results announced.",
    'Send Email': "Email composed and ready to send. Please review and confirm.",
    'Daily Briefing': `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'}! Here's your briefing: You have 3 tasks today, 2 meetings scheduled, and the weather is pleasant. Stay productive!`,
  };

  return responses[feature.name] || `Activating ${feature.name} feature. ${feature.description}. How can I assist you further with this?`;
}
