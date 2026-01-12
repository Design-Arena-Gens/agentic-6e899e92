"use client";

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StatusDisplayProps {
  status: {
    ollama: boolean;
    vosk: boolean;
    tts: boolean;
  };
}

export function StatusDisplay({ status }: StatusDisplayProps) {
  const StatusIndicator = ({ active, label }: { active: boolean; label: string }) => (
    <div className="flex items-center space-x-2">
      {active ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <XCircle className="w-5 h-5 text-red-400" />
      )}
      <span className={`text-sm ${active ? 'text-green-400' : 'text-red-400'}`}>
        {label}
      </span>
    </div>
  );

  const allActive = status.ollama && status.vosk && status.tts;

  return (
    <div className={`rounded-xl p-4 border ${
      allActive
        ? 'bg-green-900 bg-opacity-20 border-green-700'
        : 'bg-yellow-900 bg-opacity-20 border-yellow-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {allActive ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          )}
          <h3 className="text-lg font-semibold text-white">
            System Status
          </h3>
        </div>

        <div className="flex space-x-6">
          <StatusIndicator active={status.ollama} label="Ollama (Qwen2.5)" />
          <StatusIndicator active={status.vosk} label="Vosk STT" />
          <StatusIndicator active={status.tts} label="TTS Engine" />
        </div>
      </div>

      {!allActive && (
        <div className="mt-3 text-sm text-yellow-300">
          Note: Some services are simulated. For full functionality, install Ollama with Qwen2.5 model and Vosk 0.15.
        </div>
      )}
    </div>
  );
}
