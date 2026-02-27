import React, { useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Bot, X, Send, Mic, Sparkles, PhoneOff } from 'lucide-react';
import { Conversation } from '@elevenlabs/client';

interface AIHelperProps {
  variant?: 'floating' | 'panel';
}

export const AIHelper: React.FC<AIHelperProps> = ({ variant = 'floating' }) => {
  const { chatMessages, sendChatMessage, addChatMessage, isChatOpen, setChatOpen, isLoadingChat, activeVideoUrl } = useDashboardStore();
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const conversationInstance = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Explain this concept',
    'Quiz me on this topic',
    'Give me an example',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendChatMessage(input);
    setInput('');
  };

  const startVoiceInput = async () => {
    if (isConnected || isConnecting) {
      if (conversationInstance.current) {
        await conversationInstance.current.endSession();
      }
      setIsConnected(false);
      setIsAgentSpeaking(false);
      setIsConnecting(false);
      return;
    }

    try {
      setIsConnecting(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });

      let transcriptContext = "";
      if (activeVideoUrl) {
        try {
          const res = await fetch(`http://localhost:8000/api/curriculum/transcript?youtube_url=${encodeURIComponent(activeVideoUrl)}`);
          if (res.ok) {
            const data = await res.json();
            transcriptContext = data.transcript;
          }
        } catch (err) {
          console.error("Failed to fetch transcript", err);
        }
      }

      conversationInstance.current = await Conversation.startSession({
        agentId: 'agent_7301kjg96r6ee229kjh53b62hrej',
        connectionType: 'webrtc',
        dynamicVariables: {
          youtube_transcript: transcriptContext || "No video context available.",
        },
        onConnect: () => {
          setIsConnected(true);
          setIsConnecting(false);
          addChatMessage({
            id: Date.now().toString(),
            role: 'assistant',
            content: transcriptContext ? 'Voice connection established with video context. Start speaking...' : 'Voice connection established. Start speaking...',
            timestamp: new Date()
          });
        },
        onDisconnect: () => {
          setIsConnected(false);
          setIsAgentSpeaking(false);
          setIsConnecting(false);
        },
        onMessage: (message: any) => {
          const text = message.message || message.text || '';
          const role = message.role || 'assistant';
          if (text) {
            addChatMessage({
              id: Date.now().toString() + Math.random(),
              role: role === 'assistant' ? 'assistant' : 'user',
              content: text,
              timestamp: new Date()
            });
          }
        },
        onError: (error: any) => {
          console.error("ElevenLabs error:", error);
        },
        onModeChange: (mode: any) => {
          setIsAgentSpeaking(mode.mode === 'speaking');
        }
      });
    } catch (error) {
      console.error("Failed to start voice session:", error);
      alert("Microphone access is required for voice chat, or connection failed.");
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (conversationInstance.current) {
        conversationInstance.current.endSession();
      }
    };
  }, []);

  if (variant === 'panel') {
    return (
      <div className="flex flex-col h-full bg-[#FFFDF7] border-l-[3px] border-black">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-emerald-500 border-b-[3px] border-black">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-9 h-9 border-[2.5px] border-black flex items-center justify-center',
                isConnected
                  ? isAgentSpeaking
                    ? 'bg-lime-300 animate-pulse'
                    : 'bg-yellow-300'
                  : 'bg-white'
              )}
              style={{ boxShadow: '2px 2px 0 #000' }}
            >
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <h4 className="text-black font-black text-sm uppercase tracking-wider">
                AI Tutor
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className={cn(
                    'w-2 h-2 border border-black',
                    isConnected
                      ? 'bg-lime-300 animate-pulse'
                      : isConnecting
                        ? 'bg-yellow-300 animate-pulse'
                        : 'bg-white'
                  )}
                />
                <span className="text-black/70 text-[10px] font-bold uppercase tracking-widest">
                  {isConnected
                    ? isAgentSpeaking
                      ? 'Speaking...'
                      : 'Listening...'
                    : isConnecting
                      ? 'Connecting...'
                      : 'Online'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="w-8 h-8 bg-white border-[2.5px] border-black flex items-center justify-center hover:bg-red-400 hover:text-white transition-colors"
            style={{ boxShadow: '2px 2px 0 #000' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFDF7]">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'justify-end'
              )}
            >
              {message.role === 'assistant' && (
                <div
                  className="w-7 h-7 bg-emerald-400 border-[2px] border-black flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: '2px 2px 0 #000' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] p-3 text-xs leading-relaxed border-[2px] border-black',
                  message.role === 'assistant'
                    ? 'bg-white text-slate-800'
                    : 'bg-emerald-500 text-white'
                )}
                style={{ boxShadow: '3px 3px 0 #000' }}
              >
                <p className="font-bold whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div
                  className="w-7 h-7 bg-black border-[2px] border-black flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: '2px 2px 0 #374151' }}
                >
                  <span className="text-white text-[8px] font-black">YOU</span>
                </div>
              )}
            </div>
          ))}
          {isLoadingChat && (
            <div className="flex gap-3">
              <div
                className="w-7 h-7 bg-emerald-400 border-[2px] border-black flex items-center justify-center flex-shrink-0 animate-pulse"
                style={{ boxShadow: '2px 2px 0 #000' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
              </div>
              <div
                className="bg-yellow-200 text-black p-3 text-xs border-[2px] border-black font-bold italic"
                style={{ boxShadow: '3px 3px 0 #000' }}
              >
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggested prompts ── */}
        {chatMessages.length < 3 && (
          <div className="px-4 py-3 flex flex-wrap gap-2 bg-[#FFFDF7] border-t-[2px] border-black">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="px-3 py-1.5 bg-lime-200 text-black text-[10px] font-black uppercase tracking-wider border-[2px] border-black hover:bg-lime-300 transition-colors"
                style={{ boxShadow: '2px 2px 0 #000' }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* ── Input ── */}
        <div className="p-4 bg-white border-t-[3px] border-black">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className={cn(
                  'w-full bg-[#FFFDF7] border-[2.5px] border-black text-black px-3 py-2.5 pr-10 text-xs font-bold placeholder:text-slate-400 placeholder:font-medium',
                  'focus:outline-none focus:ring-0 transition-all',
                  isConnected && 'border-emerald-600 bg-emerald-50'
                )}
                style={{ boxShadow: '3px 3px 0 #000' }}
              />
              <button
                onClick={startVoiceInput}
                disabled={isConnecting}
                className={cn(
                  'absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 border-[2px] border-black flex items-center justify-center transition-all',
                  isConnected
                    ? 'bg-lime-300 text-black animate-pulse'
                    : 'bg-white text-black hover:bg-emerald-200 disabled:opacity-50'
                )}
                title={isConnected ? 'End Voice Chat' : 'Start Voice Chat'}
              >
                {isConnected || isConnecting ? (
                  <PhoneOff className="w-3.5 h-3.5" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-3 py-2.5 bg-emerald-500 text-white border-[2.5px] border-black disabled:opacity-40 hover:bg-emerald-600 transition-colors font-black"
              style={{ boxShadow: '3px 3px 0 #000' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-2.5 text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            ⚡ Logic hints only — no free answers
          </p>
        </div>
      </div>
    );
  }

  if (!isChatOpen) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={() => setChatOpen(true)}
          className="bg-emerald-500 text-black px-3 py-6 border-[3px] border-black border-r-0 flex flex-col items-center gap-2 hover:bg-lime-300 transition-all group font-black"
          style={{ boxShadow: '-4px 4px 0 #000' }}
        >
          <Bot className="w-5 h-5" />
          <span className="[writing-mode:vertical-lr] rotate-180 text-xs font-black uppercase tracking-widest">
            AI Tutor
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 pointer-events-auto"
        onClick={() => setChatOpen(false)}
      />

      {/* Drawer Panel */}
      <div
        className="absolute right-0 top-0 h-full w-[420px] bg-[#FFFDF7] border-l-[4px] border-black flex flex-col pointer-events-auto animate-in slide-in-from-right duration-300"
        style={{ boxShadow: '-6px 0 0 #000' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-5 bg-emerald-500 border-b-[3px] border-black">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-11 h-11 border-[3px] border-black flex items-center justify-center',
                isConnected
                  ? isAgentSpeaking
                    ? 'bg-lime-300 animate-pulse'
                    : 'bg-yellow-300'
                  : 'bg-white'
              )}
              style={{ boxShadow: '3px 3px 0 #000' }}
            >
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <h4 className="text-black font-black text-lg uppercase tracking-wider">
                SkillMatrix AI
              </h4>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2.5 h-2.5 border-[1.5px] border-black',
                    isConnected
                      ? 'bg-lime-300 animate-pulse'
                      : isConnecting
                        ? 'bg-yellow-300 animate-pulse'
                        : 'bg-white'
                  )}
                />
                <span className="text-black/70 text-xs font-bold uppercase tracking-widest">
                  {isConnected
                    ? isAgentSpeaking
                      ? 'Speaking...'
                      : 'Listening...'
                    : isConnecting
                      ? 'Connecting...'
                      : 'Online'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="w-10 h-10 bg-white border-[3px] border-black flex items-center justify-center hover:bg-red-400 hover:text-white transition-colors"
            style={{ boxShadow: '3px 3px 0 #000' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#FFFDF7]">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'justify-end'
              )}
            >
              {message.role === 'assistant' && (
                <div
                  className="w-9 h-9 bg-emerald-400 border-[2.5px] border-black flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: '2px 2px 0 #000' }}
                >
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] p-4 text-sm leading-relaxed border-[2.5px] border-black',
                  message.role === 'assistant'
                    ? 'bg-white text-slate-800'
                    : 'bg-emerald-500 text-white'
                )}
                style={{ boxShadow: '4px 4px 0 #000' }}
              >
                <p className="font-bold whitespace-pre-wrap">{message.content}</p>
                <p
                  className={cn(
                    'text-[9px] mt-2 font-black uppercase tracking-widest',
                    message.role === 'assistant' ? 'text-slate-400' : 'text-emerald-100'
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div
                  className="w-9 h-9 bg-black border-[2.5px] border-black flex items-center justify-center flex-shrink-0"
                  style={{ boxShadow: '2px 2px 0 #374151' }}
                >
                  <span className="text-white text-[9px] font-black">YOU</span>
                </div>
              )}
            </div>
          ))}
          {isLoadingChat && (
            <div className="flex gap-3">
              <div
                className="w-9 h-9 bg-emerald-400 border-[2.5px] border-black flex items-center justify-center flex-shrink-0 animate-pulse"
                style={{ boxShadow: '2px 2px 0 #000' }}
              >
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div
                className="bg-yellow-200 text-black p-4 text-sm border-[2.5px] border-black font-bold italic"
                style={{ boxShadow: '4px 4px 0 #000' }}
              >
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggested Prompts ── */}
        {chatMessages.length < 3 && (
          <div className="px-5 py-4 flex flex-wrap gap-2 bg-[#FFFDF7] border-t-[2px] border-black">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="px-4 py-2 bg-lime-200 text-black text-[11px] font-black uppercase tracking-wider border-[2.5px] border-black hover:bg-lime-300 transition-colors"
                style={{ boxShadow: '3px 3px 0 #000' }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* ── Input ── */}
        <div className="p-5 bg-white border-t-[3px] border-black">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your question..."
                className={cn(
                  'w-full bg-[#FFFDF7] border-[2.5px] border-black text-black px-5 py-3.5 pr-12 text-sm font-bold placeholder:text-slate-400 placeholder:font-medium',
                  'focus:outline-none focus:ring-0 transition-all',
                  isConnected && 'border-emerald-600 bg-emerald-50'
                )}
                style={{ boxShadow: '4px 4px 0 #000' }}
              />
              <button
                onClick={startVoiceInput}
                disabled={isConnecting}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 border-[2px] border-black flex items-center justify-center transition-all',
                  isConnected
                    ? 'bg-lime-300 text-black animate-pulse'
                    : 'bg-white text-black hover:bg-emerald-200 disabled:opacity-50'
                )}
                title={isConnected ? 'End Voice Chat' : 'Start Voice Chat'}
              >
                {isConnected || isConnecting ? (
                  <PhoneOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-5 py-3.5 bg-emerald-500 text-white border-[2.5px] border-black disabled:opacity-40 hover:bg-emerald-600 transition-colors font-black"
              style={{ boxShadow: '4px 4px 0 #000' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-3 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            ⚡ Logic hints only — no direct solutions
          </p>
        </div>
      </div>
    </div>
  );
};
