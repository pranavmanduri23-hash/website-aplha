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

const generateBotResponse = (userMessage: string): string => {
  const msg = userMessage.toLowerCase().trim();

  // Greetings
  if (msg.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|yo)/)) {
    return "Hey! 👋 Welcome to Birla Open Minds Bandlaguda ClassBot! I can help you with school info, facilities, schedule, homework, leaderboard, games, and much more. What would you like to know?";
  }

  // School name / about
  if (msg.match(/(birla|open minds|bom|school name|which school|what school|about school|about us)/)) {
    return "🏫 Birla Open Minds International School, Bandlaguda\n\nOne of Hyderabad's premier CBSE schools, part of the prestigious Birla Group. Located in Bandlaguda, Hyderabad, Telangana.\n\nVision: Nurturing global citizens through holistic education, innovation, and values.\n\nAffiliation: CBSE | Grades: Pre-Primary to Class XII\n\nAsk me about facilities, admissions, clubs, or anything else!";
  }

  // Facilities
  if (msg.match(/(facilit|infrastructure|campus|building|ground|lab|library|pool|gym|sport|court|auditorium|cafeteria|canteen|transport|bus)/)) {
    return "🏛️ Birla Open Minds Bandlaguda Facilities:\n\n🔬 Labs: Science, Computer, Robotics, Math\n📚 Library: 10,000+ books, digital resources\n🏊 Swimming Pool: Olympic-standard\n⚽ Sports: Football, Basketball, Cricket, Badminton courts\n🎭 Auditorium: 800-seat capacity\n🍽️ Cafeteria: Hygienic, nutritious meals\n🚌 Transport: AC buses across Hyderabad\n🎨 Art & Music rooms\n🖥️ Smart classrooms with projectors\n\nWorld-class infrastructure for holistic learning!";
  }

  // Academics
  if (msg.match(/(academic|curriculum|cbse|syllabus|subject|class|grade|study|education|learn)/)) {
    return "📖 Academics at Birla Open Minds:\n\n• Curriculum: CBSE (Central Board of Secondary Education)\n• Grades: Pre-Primary → Class XII\n• Teaching: Activity-based, experiential learning\n• Subjects: Maths, Science, English, Hindi, Social Studies, Computer Science, Arts\n• Senior Secondary: Science & Commerce streams\n• Special: Robotics, Coding, Environmental Studies\n\nFocus on conceptual understanding, not just marks! 🎓";
  }

  // Admissions
  if (msg.match(/(admission|enrol|join|apply|fee|registration|new student)/)) {
    return "📋 Admissions at Birla Open Minds Bandlaguda:\n\n• Open for all grades Pre-Primary to XII\n• Admission process: Application → Assessment → Interview\n• Documents needed: Birth certificate, previous report cards, Aadhar\n• Academic year starts: June\n• Contact: Visit the school office or call the admissions desk\n• Location: Bandlaguda, Hyderabad, Telangana\n\nFor exact fee structure and availability, contact the school office directly!";
  }

  // Clubs / extracurricular
  if (msg.match(/(club|activity|extra|curricular|event|fest|competition|debate|music|dance|art|drama|ncc|scout)/)) {
    return "🎯 Clubs & Activities at Birla Open Minds:\n\n🎵 Music Club — Vocal & instrumental\n💃 Dance Club — Classical & western\n🎭 Drama Club — Annual school play\n🗣️ Debate Club — Inter-school competitions\n🤖 Robotics Club — Build & program robots\n🎨 Art Club — Painting, sculpture, crafts\n📸 Photography Club\n🌿 Eco Club — Environmental awareness\n⚽ Sports Teams — Football, cricket, athletics\n\nSomething for everyone at BOM! 🌟";
  }

  // Teachers / staff
  if (msg.match(/(teacher|staff|faculty|principal|headmaster|head|coordinator|sir|ma'am|madam)/)) {
    return "👩‍🏫 Faculty at Birla Open Minds:\n\nBirla Open Minds has highly qualified, experienced teachers with:\n• B.Ed / M.Ed qualifications\n• Subject specialisation\n• Regular training & workshops\n• Child-friendly teaching approach\n\nThe school is led by a dedicated Principal supported by academic coordinators for each section (Primary, Middle, Senior).\n\nFor specific teacher info, check the school's official website or contact the office!";
  }

  // Schedule/Timetable
  if (msg.match(/(schedule|timetable|time table|period|class time|school time|timing|start|end|recess|lunch|break)/)) {
    return "🕐 School Timings — Birla Open Minds Bandlaguda:\n\n• School starts: 8:00 AM\n• Assembly: 8:00 – 8:20 AM\n• Periods: 8:20 AM – 3:00 PM\n• Lunch/Recess: 12:30 – 1:00 PM\n• School ends: 3:00 PM\n\n📅 Check the Timetable tab above for your weekly class schedule with subjects and teachers!";
  }

  // Homework / exams
  if (msg.match(/(homework|assignment|project|deadline|due|submit|exam|test|unit test|half yearly|annual|result|marks|grade)/)) {
    return "📚 Upcoming at Birla Open Minds:\n\n• Math Assignment — Due this Friday\n• English Essay — Due next Monday\n• Science Project — Due next Wednesday\n• Unit Test — Next week\n\n💡 Tips:\n• Check your diary/planner daily\n• Use the announcements board for updates\n• Ask ClassBot for subject help anytime!\n\nStay ahead and you'll ace everything! 💪";
  }

  // Leaderboard / points
  if (msg.match(/(leaderboard|rank|ranking|points|score|top student|best student|achievement|badge|star)/)) {
    return "🏆 Leaderboard — Birla Open Minds Class Hub:\n\n1. Alex Chen — 2,850 pts 🥇\n2. Sarah Williams — 2,720 pts 🥈\n3. James Rodriguez — 2,590 pts 🥉\n\nPoints are earned through:\n✅ Class participation\n✅ Completing assignments\n✅ Attendance\n✅ Achievements & badges\n\nCheck the Leaderboard tab for full rankings! Keep pushing! 🚀";
  }

  // Games / arcade
  if (msg.match(/(game|arcade|play|fun|break|guesser|clicker|score|high score)/)) {
    return "🎮 Arcade — Birla Open Minds Class Hub:\n\n🔢 Number Guesser — Guess a number 1-50 in 5 tries. Score based on speed!\n\n🖱️ Fast Clicker — Click the moving target as many times as possible in 10 seconds!\n\nHead to the Arcade tab to play. Great for a brain break between studies! 🧠⚡";
  }

  // Location / address
  if (msg.match(/(location|address|where|directions|map|bandlaguda|hyderabad|how to reach|route)/)) {
    return "📍 Birla Open Minds International School\nBandlaguda, Hyderabad\nTelangana — 500005\n\n🚌 Transport: School buses available from major areas across Hyderabad\n🚗 By car: Easily accessible from Mehdipatnam, Attapur, and Rajendranagar\n🗺️ Check Google Maps: Search 'Birla Open Minds Bandlaguda'\n\nThe campus is well-connected and safe!";
  }

  // Contact
  if (msg.match(/(contact|phone|email|number|call|reach|website|official)/)) {
    return "📞 Contact Birla Open Minds Bandlaguda:\n\n🌐 Website: www.birlaopenmindsinternational.com\n📧 Email: Contact via official website\n📍 Address: Bandlaguda, Hyderabad, Telangana\n\n🕐 Office hours: Mon–Sat, 8:00 AM – 4:00 PM\n\nFor admissions, fee queries, or general info — visit the school office or the official website!";
  }

  // Values / motto
  if (msg.match(/(value|motto|vision|mission|philosophy|ethos|culture|discipline|uniform)/)) {
    return "🌟 Birla Open Minds — Values & Philosophy:\n\n🎯 Vision: Nurturing well-rounded global citizens\n💡 Mission: Holistic education combining academics, sports, arts & values\n\nCore Values:\n✨ Excellence\n🤝 Integrity\n🌍 Responsibility\n💪 Resilience\n🧠 Innovation\n\nUniform: Formal school uniform worn Mon–Fri. Sports uniform on PE days.\n\nBOM believes in educating the whole child, not just the mind!";
  }

  // Help
  if (msg.match(/(help|what can you|what do you|feature|capability|option)/)) {
    return "🤖 ClassBot — Birla Open Minds Bandlaguda\n\nI can answer questions about:\n\n🏫 School info & about BOM\n🏛️ Facilities & campus\n📖 Academics & curriculum\n📋 Admissions\n🎯 Clubs & activities\n🕐 Schedule & timings\n📚 Homework & exams\n🏆 Leaderboard & points\n🎮 Arcade games\n📍 Location & contact\n🌟 Values & vision\n\nJust ask me anything!";
  }

  // Thanks
  if (msg.match(/(thank|thanks|thx|appreciate|great|awesome|nice|good bot|helpful)/)) {
    return "You're welcome! 😊 Happy to help at Birla Open Minds Bandlaguda. Feel free to ask me anything anytime — I'm always here! 🌟";
  }

  // Fallback
  return `Hmm, I don't have specific info on "${userMessage}" yet. 🤔\n\nTry asking me about:\n• School facilities\n• Schedule or timetable\n• Admissions\n• Clubs & activities\n• Homework & exams\n• Leaderboard\n• Contact & location\n\nOr type "help" to see everything I can do! 🤖`;
};

export default function ClassBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! 👋 I'm ClassBot for Birla Open Minds Bandlaguda. Ask me about the school, facilities, schedule, homework, leaderboard, or anything else!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const captured = input;
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const botResponse: Message = { id: (Date.now() + 1).toString(), text: generateBotResponse(captured), sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 200), oklch(0.60 0.25 320))', boxShadow: '0 8px 32px rgba(0, 212, 255, 0.4)' }}
        title="Open ClassBot"
      >
        {isOpen ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageCircle className="w-6 h-6 text-primary-foreground" />}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] rounded-lg shadow-2xl flex flex-col z-40"
          style={{ height: '28rem', background: 'rgba(24, 28, 50, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 212, 255, 0.5)' }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              ClassBot — BOM Bandlaguda
            </h3>
            <p className="text-xs text-muted-foreground">Ask me anything about the school!</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-wrap"
                  style={{
                    background: message.sender === 'user' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(96, 40, 255, 0.2)',
                    color: message.sender === 'user' ? 'oklch(0.65 0.22 200)' : 'oklch(0.95 0.01 0)',
                    borderLeft: message.sender === 'user' ? '2px solid oklch(0.65 0.22 200)' : '2px solid oklch(0.60 0.25 320)'
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(96, 40, 255, 0.2)' }}>
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

          <div className="p-4 border-t" style={{ borderColor: 'rgba(37, 80, 140, 0.4)' }}>
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="text-foreground placeholder-muted-foreground"
                style={{ background: 'rgba(24, 28, 50, 0.5)', borderColor: 'rgba(37, 80, 140, 0.5)' }}
              />
              <Button onClick={handleSendMessage} size="icon" className="neon-button">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
