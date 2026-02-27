import React, { useState, useRef, useEffect } from 'react';
import { useDashboardStore } from '@/stores';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { cn } from '@/lib/utils';
import { Bot, X, Minus, Send, Mic, Sparkles, Lightbulb, BookOpen, Eye, MessageCircle } from 'lucide-react';

export const AIHelper: React.FC = () => {
  const { chatMessages, addChatMessage, isChatOpen, setChatOpen } = useDashboardStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeMode, setActiveMode] = useState<'general' | 'context' | 'visualize'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = {
    general: [
      'Explain this concept',
      'Give me an example',
      'Why is this important?',
    ],
    context: [
      'How does this relate to the video?',
      'What should I focus on?',
      'Explain this part again',
    ],
    visualize: [
      'Help me visualize this',
      'Walk me through the logic',
      'What\'s the thinking process?',
    ],
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInput('');

    // Simulate AI response based on mode
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: generateResponse(input, activeMode),
        timestamp: new Date(),
      };
      addChatMessage(aiResponse);
    }, 1000);
  };

  const generateResponse = (query: string, mode: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (mode === 'visualize' || lowerQuery.includes('visualize') || lowerQuery.includes('logic') || lowerQuery.includes('walk me')) {
      return `🧠 **Let me help you think through this:**

Imagine you're building a house. Before you start, you need a blueprint, right? That's what we're doing here - creating a plan.

**Step 1:** Understand what we're trying to solve
**Step 2:** Break it down into smaller pieces
**Step 3:** Connect those pieces logically

Think about it this way: What would happen if we did X instead of Y? Try to trace through the logic yourself first, then I'll help you verify!

💡 *Tip: Draw it out on paper - sometimes seeing it visually helps!*`;
    }
    
    if (mode === 'context' || lowerQuery.includes('video') || lowerQuery.includes('focus') || lowerQuery.includes('relate')) {
      return `📚 **Context from your current lesson:**

The video just covered how load balancers distribute traffic. Here's why this matters for what you're learning:

• **Real-world application:** When you visit a popular website, load balancers ensure it doesn't crash
• **Key takeaway:** Distribution = Reliability
• **Connection to your path:** This is fundamental for backend development

**What to focus on next:** Pay attention to the different load balancing algorithms mentioned - round-robin, least connections, etc.

🎯 *This concept will appear in your upcoming checkpoint!*`;
    }
    
    if (lowerQuery.includes('explain')) {
      return `💡 **Let me break this down:**

Think of it like a restaurant kitchen:
- The **frontend** is the dining area (what customers see)
- The **backend** is the kitchen (where the work happens)
- The **database** is the pantry (where ingredients are stored)

Each part has a specific job, and they communicate to serve the customer (user).

**Key points to remember:**
1. Separation of concerns
2. Each layer handles its own responsibility
3. They communicate through APIs

Does this analogy help? Let me know if you'd like me to dive deeper into any part!`;
    }
    
    if (lowerQuery.includes('example')) {
      return `🌟 **Here's a practical example:**

Imagine you're building a todo app:

**Frontend (React):** The form where you type your task
**Backend (Node.js):** Receives the task, validates it, saves it
**Database (MongoDB):** Stores all your tasks permanently

When you click "Add Task":
1. Frontend sends data to backend
2. Backend processes and validates
3. Backend saves to database
4. Backend confirms success to frontend
5. Frontend updates the UI

**Try this:** Can you trace what happens when you mark a task as complete?`;
    }
    
    if (lowerQuery.includes('quiz') || lowerQuery.includes('test') || lowerQuery.includes('practice')) {
      return `🎯 **Practice Question:**

Here's a scenario for you to think through:

*You're designing a URL shortener like bit.ly. When a user enters a long URL, you need to generate a short code and redirect visitors to the original URL.*

**Questions to consider:**
1. What data structure would you use to store the mapping?
2. How would you handle millions of URLs?
3. What happens if two users shorten the same URL?

Take a moment to think about it, then I can help you work through the solution! Don't worry about getting it perfect - the thinking process is what matters.`;
    }
    
    return `👋 I'm here to help you learn! 

I can:
• **Explain concepts** in simple terms
• **Provide context** for what you're watching
• **Help visualize** problems and logic
• **Give hints** without spoiling the answer
• **Suggest practice** questions

What would you like to explore? Try asking about a concept, requesting an example, or asking for help with a problem!`;
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  if (!isChatOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Pulse ring */}
          <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
          
          {/* Button */}
          <button
            onClick={() => setChatOpen(true)}
            className="relative w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-300 hover:scale-110 transition-transform group"
          >
            <Bot className="w-7 h-7 text-white" />
            
            {/* Tooltip */}
            <span className="absolute right-full mr-3 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
              Ask AI Helper
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="w-[400px] h-[600px] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-slate-900 font-semibold text-sm">SkillMatrix AI</h4>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-slate-500 text-xs">Online</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setChatOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setChatOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {[
            { id: 'general', label: 'General', icon: MessageCircle },
            { id: 'context', label: 'Context', icon: BookOpen },
            { id: 'visualize', label: 'Visualize', icon: Eye },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id as any)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                activeMode === mode.id
                  ? 'bg-white text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              )}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'justify-end'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-wrap',
                  message.role === 'assistant'
                    ? 'bg-white text-slate-700 rounded-tl-none shadow-sm border border-slate-100'
                    : 'bg-emerald-500 text-white rounded-tr-none'
                )}
              >
                <div dangerouslySetInnerHTML={{ 
                  __html: message.content
                    .replace(/\*\*(.*?)\*/g, '<strong>$1</strong>')
                    .replace(/•/g, '&bull;')
                    .replace(/💡|🧠|📚|🌟|🎯|👋/g, (match) => `<span class="text-lg">${match}</span>`)
                }} />
                <p className={cn(
                  'text-xs mt-2',
                  message.role === 'assistant' ? 'text-slate-400' : 'text-emerald-100'
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">You</span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-slate-100 bg-white">
          {suggestedPrompts[activeMode].map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Ask in ${activeMode} mode...`}
                className={cn(
                  'w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 pr-10 rounded-xl text-sm',
                  'focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100',
                  isListening && 'border-emerald-500 ring-2 ring-emerald-100'
                )}
              />
              <button
                onClick={startVoiceInput}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors',
                  isListening ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'
                )}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <MatrixButton onClick={handleSend} disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </MatrixButton>
          </div>
        </div>
      </div>
    </div>
  );
};
