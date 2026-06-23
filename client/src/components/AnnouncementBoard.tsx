import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Megaphone, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Announcement {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  timestamp: Date;
}

interface AnnouncementBoardProps {
  isAdmin: boolean;
}

const INITIAL: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to Class Hub!',
    content: 'This is your new digital classroom hub. Stay connected, collaborate, and celebrate achievements together!',
    pinned: true,
    timestamp: new Date(Date.now() - 2 * 3600_000),
  },
  {
    id: '2',
    title: 'Upcoming Exam Schedule',
    content: 'Final exams begin next week. Check the timetable for your schedule and prepare accordingly.',
    pinned: false,
    timestamp: new Date(Date.now() - 3600_000),
  },
];

function formatTime(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function AnnouncementBoard({ isAdmin }: AnnouncementBoardProps) {
  const [items, setItems] = useState<Announcement[]>(INITIAL);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pinned, setPinned] = useState(false);

  const openNew = () => {
    setEditing(null);
    setTitle(''); setContent(''); setPinned(false);
    setShowDialog(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setTitle(a.title); setContent(a.content); setPinned(a.pinned);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) { toast.error('Fill in all fields'); return; }
    if (editing) {
      setItems(prev => prev.map(a => a.id === editing.id ? { ...a, title, content, pinned } : a));
      toast.success('Announcement updated');
    } else {
      setItems(prev => [{ id: Date.now().toString(), title, content, pinned, timestamp: new Date() }, ...prev]);
      toast.success('Announcement posted!');
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(a => a.id !== id));
    toast.success('Announcement deleted');
  };

  const togglePin = (id: string) => {
    setItems(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  };

  const sorted = [...items].sort((a, b) => {
    if (a.pinned === b.pinned) return b.timestamp.getTime() - a.timestamp.getTime();
    return a.pinned ? -1 : 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" />
          Class Announcements
        </h2>
        {isAdmin && (
          <Button onClick={openNew} className="neon-button gap-2">
            <Plus className="w-4 h-4" />
            Post
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <div
            className="text-center py-12 rounded-lg"
            style={{ background: 'rgba(24,28,50,0.4)', border: '1px solid rgba(37,80,140,0.4)' }}
          >
            <p className="text-muted-foreground">No announcements yet.</p>
          </div>
        )}
        {sorted.map(a => (
          <div
            key={a.id}
            className="p-4 rounded-lg transition-all duration-300"
            style={{
              background: a.pinned ? 'rgba(0,212,255,0.06)' : 'rgba(24,28,50,0.4)',
              border: `1px solid ${a.pinned ? 'rgba(0,212,255,0.35)' : 'rgba(37,80,140,0.4)'}`,
              backdropFilter: 'blur(12px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(24,28,50,0.6)';
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,212,255,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = a.pinned ? 'rgba(0,212,255,0.06)' : 'rgba(24,28,50,0.4)';
              e.currentTarget.style.borderColor = a.pinned ? 'rgba(0,212,255,0.35)' : 'rgba(37,80,140,0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {a.pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                  <h3 className="text-lg font-semibold text-primary">{a.title}</h3>
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-2">{a.content}</p>
                <p className="text-xs text-muted-foreground">{formatTime(a.timestamp)}</p>
              </div>
              {isAdmin && (
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost" size="icon"
                    className={`h-8 w-8 ${a.pinned ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    title={a.pinned ? 'Unpin' : 'Pin'}
                    onClick={() => togglePin(a.id)}
                  >
                    <Pin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => openEdit(a)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent style={{
          background: 'rgba(24,28,50,0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,212,255,0.4)',
        }}>
          <DialogHeader>
            <DialogTitle className="text-primary">
              {editing ? 'Edit Announcement' : 'Post New Announcement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Title</label>
              <Input
                placeholder="Announcement title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="text-foreground placeholder:text-muted-foreground/50"
                style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(37,80,140,0.5)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Content</label>
              <Textarea
                placeholder="Announcement content"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="text-foreground placeholder:text-muted-foreground/50 min-h-28"
                style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(37,80,140,0.5)' }}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                className={`w-10 h-5 rounded-full transition-colors duration-200 relative ${pinned ? 'bg-primary' : 'bg-muted'}`}
                onClick={() => setPinned(v => !v)}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${pinned ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </div>
              <span className="text-sm text-foreground">Pin to top</span>
            </label>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} className="neon-button flex-1 gap-2">
                {editing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editing ? 'Save' : 'Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
