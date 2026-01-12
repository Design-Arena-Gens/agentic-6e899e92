"use client";

import { useState, useEffect, useRef } from 'react';
import { FridayAssistant } from '@/components/FridayAssistant';
import { VoiceInterface } from '@/components/VoiceInterface';
import { FeaturePanel } from '@/components/FeaturePanel';
import { StatusDisplay } from '@/components/StatusDisplay';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState({
    ollama: false,
    vosk: false,
    tts: false,
  });

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Status check failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            F.R.I.D.A.Y
          </h1>
          <p className="text-gray-300 text-lg">
            Female Replacement Intelligent Digital Assistant Youth
          </p>
          <p className="text-gray-400 text-sm mt-2">
            300+ Active Features | Powered by Ollama Qwen2.5 & Vosk
          </p>
        </header>

        <StatusDisplay status={systemStatus} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <FridayAssistant
              isListening={isListening}
              currentFeature={currentFeature}
              onFeatureChange={setCurrentFeature}
            />
          </div>

          <div className="space-y-6">
            <VoiceInterface
              isListening={isListening}
              onListeningChange={setIsListening}
            />
            <FeaturePanel
              onFeatureSelect={setCurrentFeature}
              currentFeature={currentFeature}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
