import { NextRequest, NextResponse } from 'next/server';
import { features } from '@/lib/features';

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();

    const detectedFeature = detectFeature(command);

    const useOllama = await checkOllamaAvailability();

    let response: string;

    if (useOllama) {
      response = await getOllamaResponse(command, detectedFeature);
    } else {
      response = getVoiceResponse(command, detectedFeature);
    }

    return NextResponse.json({
      response,
      feature: detectedFeature,
    });
  } catch (error) {
    console.error('Voice command error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice command' },
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
  command: string,
  feature: string | null
): Promise<string> {
  try {
    const systemPrompt = `You are F.R.I.D.A.Y, an advanced AI voice assistant. Respond conversationally and concisely to voice commands. Keep responses under 3 sentences for voice output.${
      feature ? `\n\nExecuting feature: ${feature}` : ''
    }`;

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: command },
        ],
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error('Ollama request failed');
    }

    const data = await response.json();
    return data.message?.content || 'I apologize, but I could not process that command.';
  } catch (error) {
    console.error('Ollama error:', error);
    return getVoiceResponse(command, feature);
  }
}

function detectFeature(command: string): string | null {
  const lowerCommand = command.toLowerCase();

  for (const feature of features) {
    if (feature.command && lowerCommand.includes(feature.command.toLowerCase())) {
      return feature.name;
    }
  }

  return null;
}

function getVoiceResponse(command: string, feature: string | null): string {
  const lowerCommand = command.toLowerCase();

  if (feature) {
    return `Activating ${feature}. How can I help you with this?`;
  }

  if (lowerCommand.includes('friday')) {
    return "Yes, I'm here. How can I assist you?";
  }

  if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
    return "Hello! I'm F.R.I.D.A.Y. How may I assist you?";
  }

  if (lowerCommand.includes('weather')) {
    return "The current weather is 72 degrees and sunny. Perfect conditions!";
  }

  if (lowerCommand.includes('time')) {
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    return `The time is ${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}.`;
  }

  if (lowerCommand.includes('thank')) {
    return "You're welcome! Let me know if you need anything else.";
  }

  if (lowerCommand.includes('help')) {
    return "I have over 315 features available. Try asking me about weather, reminders, timers, smart home control, or any other task.";
  }

  return "I'm processing your command. For full AI capabilities, please ensure Ollama with Qwen2.5 is running.";
}
