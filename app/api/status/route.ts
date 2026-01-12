import { NextResponse } from 'next/server';

export async function GET() {
  const status = {
    ollama: await checkOllama(),
    vosk: checkVosk(),
    tts: checkTTS(),
  };

  return NextResponse.json(status);
}

async function checkOllama(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(2000),
    });
    if (response.ok) {
      const data = await response.json();
      return data.models?.some((m: any) => m.name.includes('qwen')) || false;
    }
    return false;
  } catch {
    return false;
  }
}

function checkVosk(): boolean {
  return typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;
}

function checkTTS(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
