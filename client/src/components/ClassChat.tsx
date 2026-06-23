import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

interface ChatMessage {
  id: string;
  name: string;
  text: string;
  timestamp: Date;
}

interface ClassChatProps {
  isAdmin: boolean;
}

const NICK_KEY = 'classhub_chat_nickname';

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function ClassChat({ isAdmin }: ClassChatProps) {
  const [messages, setMessages] = useLocalStorageState<ChatMessage[]>(
    'classhub_chat_messages',
    [],
    list => list.map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
  );
  const [nickname, setNickname] = useState(() => localStorage.getItem(NICK_KEY) ?? '');
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = () => {
    if (!nickname.trim()) { toast.error('Enter your name first'); return; }
    if (!draft.trim()) return;
    localStorage.setItem(NICK_KEY, nickname.trim());
    setMessages(prev => [...prev, { id: Date.now().toString(), name: nickname.trim(), text: draft.trim(), timestamp: new Date() }]);
    setDraft('');
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          Class Chat
        </h2>
        {isAdmin && messages.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" onClick={clearChat}>
            <Trash2 className="w-3.5 h-3.5" /> Clear Chat
          </Button>
        )}
      </div>

      <div
        className="flex items-start gap-2 p-3 rounded-lg text-xs text-muted-foreground"
        style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.25)' }}
      >
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <span>
          This chat is saved on this browser/device — it stays in sync across tabs on the same computer,
          but messages won't appear on a classmate's phone or laptop unless this site is connected to a
          shared server. Ask whoever set up the site if you'd like real cross-device chat added.
        </span>
      </div>

      <div
        className="rounded-lg p-4 h-96 overflow-y-auto flex flex-col gap-3"
        style={{ background: 'rgba(24,28,50,0.4)', border: '1px solid rgba(37,80,140,0.4)', backdropFilter: 'blur(12px)' }}
      >
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm m-auto">No messages yet. Say hi! 👋</p>
        )}
        {messages.map(m => (
          <div key={m.id} className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-primary">{m.name}</span>
              <span className="text-xs text-muted-foreground">{formatTime(m.timestamp)}</span>
            </div>
            <p className="text-sm text-foreground break-words">{m.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Your name"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          className="sm:w-40"
          maxLength={24}
        />
        <Input
          placeholder="Type a message..."
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}
          maxLength={500}
        />
        <Button onClick={send} className="neon-button gap-2 shrink-0">
          <Send className="w-4 h-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
