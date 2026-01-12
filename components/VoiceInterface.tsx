"use client";

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceInterfaceProps {
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
}

export function VoiceInterface({ isListening, onListeningChange }: VoiceInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceLevel, setVoiceLevel] = useState(0);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        setTranscript(text);

        if (event.results[last].isFinal) {
          handleVoiceCommand(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onListeningChange(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        startAudioVisualization();
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    } else if (!isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        stopAudioVisualization();
      } catch (error) {
        console.error('Failed to stop recognition:', error);
      }
    }
  }, [isListening]);

  const startAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVoiceLevel(average / 255 * 100);
          requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    } catch (error) {
      console.error('Audio visualization error:', error);
    }
  };

  const stopAudioVisualization = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setVoiceLevel(0);
  };

  const handleVoiceCommand = async (command: string) => {
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();

      if (data.response && !isMuted) {
        speak(data.response);
      }
    } catch (error) {
      console.error('Voice command error:', error);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v =>
        v.name.includes('Female') ||
        v.name.includes('female') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Karen') ||
        v.name.includes('Moira') ||
        v.name.includes('Tessa') ||
        v.name.includes('Fiona')
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    onListeningChange(!isListening);
    if (!isListening) {
      setTranscript('');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700 p-6">
      <h3 className="text-xl font-bold text-white mb-4">Voice Control</h3>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 glow pulse-ring'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>

          {isListening && (
            <div className="absolute inset-0 rounded-full border-4 border-red-500 opacity-50 animate-ping"></div>
          )}
        </div>
      </div>

      {isListening && (
        <div className="mb-4">
          <div className="bg-gray-700 rounded-lg p-2 h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded transition-all duration-100"
              style={{ width: `${voiceLevel}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={toggleMute}
          className={`w-full p-3 rounded-lg flex items-center justify-center space-x-2 transition ${
            isMuted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-5 h-5 text-white" />
              <span className="text-white">Unmute Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5 text-white" />
              <span className="text-white">Mute Voice</span>
            </>
          )}
        </button>

        {transcript && (
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Transcript:</p>
            <p className="text-white text-sm">{transcript}</p>
          </div>
        )}

        <div className="text-center text-sm text-gray-400">
          {isListening ? 'Listening for commands...' : 'Click microphone to start'}
        </div>
      </div>
    </div>
  );
}
