import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ClassBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! I'm ClassBot. Need help with the schedule, or want to play a game?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Greeting responses
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      return "Hey there! I'm ClassBot. Need help with the schedule, or want to play a game?";
    }

    // Schedule/Timetable responses
    if (lowerMessage.match(/(schedule|timetable|class|when|time)/)) {
      return "📅 Here's today's schedule:\n\n• 9:00 - 9:45: Mathematics (Mr. Smith)\n• 9:45 - 10:30: English (Ms. Johnson)\n• 10:45 - 11:30: Science (Dr. Brown)\n\nCheck the Timetable tab for the full weekly schedule!";
    }

    // Exam/Homework responses
    if (lowerMessage.match(/(exam|homework|assignment|deadline|test)/)) {
      return "📚 Upcoming deadlines:\n\n• Math Assignment - Due Friday\n• English Essay - Due Next Monday\n• Science Project - Due Next Wednesday\n\nStay on top of your work! 💪";
    }

    // Leaderboard responses
    if (lowerMessage.match(/(leaderboard|rank|points|score|top)/)) {
      return "🏆 You're doing great! Check the Leaderboard tab to see where you stand and compete with your classmates. Keep earning points!";
    }

    // Games responses
    if (lowerMessage.match(/(game|arcade|play|fun|break)/)) {
      return "🎮 Ready for some fun? Head to the Arcade tab to play:\n\n• Number Guesser - Predict the mystery number\n• Fast Clicker - Click the target before time runs out\n\nHave fun and beat the high scores!";
    }

    // Help responses
    if (lowerMessage.match(/(help|how|what|feature)/)) {
      return "ℹ️ I can help you with:\n\n• Schedule info\n• Homework deadlines\n• Leaderboard standings\n• Game instructions\n• General questions\n\nJust ask me anything about Class Hub!";
    }

    // Fallback response
    return "I'm analyzing that query... I don't have that specific data point in my local class database yet, but I've logged it for the Class Admin! Feel free to ask about schedules, homework, leaderboard, or games. 🤖";
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 500);
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, oklch(0.65 0.22 200), oklch(0.60 0.25 320))',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.4)'
        }}
        title="Open ClassBot"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Drawer */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] rounded-lg shadow-2xl flex flex-col h-96 z-40 transition-all duration-300"
          style={{
            background: 'rgba(24, 28, 50, 0.95)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(0, 212, 255, 0.5)',
            border: '1px solid'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              ClassBot
            </h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-wrap"
                  style={{
                    background: message.sender === 'user'
                      ? 'rgba(0, 212, 255, 0.2)'
                      : 'rgba(96, 40, 255, 0.2)',
                    color: message.sender === 'user' ? 'oklch(0.65 0.22 200)' : 'oklch(0.95 0.01 0)',
                    borderLeft: message.sender === 'user'
                      ? '2px solid oklch(0.65 0.22 200)'
                      : '2px solid oklch(0.60 0.25 320)'
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg" style={{
                  background: 'rgba(96, 40, 255, 0.2)'
                }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="text-foreground placeholder-muted-foreground"
                style={{
                  background: 'rgba(24, 28, 50, 0.5)',
                  borderColor: 'rgba(37, 80, 140, 0.5)'
                }}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="neon-button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
