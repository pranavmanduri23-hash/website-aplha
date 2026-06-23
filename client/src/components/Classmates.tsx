import { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Upload, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

interface Classmate {
  id: string;
  name: string;
  photo: string; // data URL or external URL, empty = show initials avatar
  funFact: string;
}

interface ClassmatesProps {
  isAdmin: boolean;
}

const INITIAL: Classmate[] = [];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Classmates({ isAdmin }: ClassmatesProps) {
  const [people, setPeople] = useLocalStorageState<Classmate[]>('classhub_classmates', INITIAL);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Classmate | null>(null);
  const [name, setName] = useState('');
  const [funFact, setFunFact] = useState('');
  const [photo, setPhoto] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    setName(''); setFunFact(''); setPhoto('');
    setShowDialog(true);
  };

  const openEdit = (p: Classmate) => {
    setEditing(p);
    setName(p.name); setFunFact(p.funFact); setPhoto(p.photo);
    setShowDialog(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 3 * 1024 * 1024) { toast.error('Photo must be under 3MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (editing) {
      setPeople(prev => prev.map(p => p.id === editing.id ? { ...p, name, funFact, photo } : p));
      toast.success('Classmate updated');
    } else {
      setPeople(prev => [...prev, { id: Date.now().toString(), name, funFact, photo }]);
      toast.success('Classmate added');
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
    toast.success('Classmate removed');
  };

  const sorted = [...people].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Our Class
        </h2>
        {isAdmin && (
          <Button onClick={openNew} className="neon-button gap-2">
            <Plus className="w-4 h-4" />
            Add Classmate
          </Button>
        )}
      </div>

      {sorted.length === 0 && (
        <div
          className="text-center py-12 rounded-lg"
          style={{ background: 'rgba(24,28,50,0.4)', border: '1px solid rgba(37,80,140,0.4)' }}
        >
          <p className="text-muted-foreground">
            No classmates added yet. {isAdmin ? 'Click "Add Classmate" to get started.' : 'Check back soon!'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sorted.map(p => (
          <div
            key={p.id}
            className="group relative p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300"
            style={{ background: 'rgba(24,28,50,0.4)', border: '1px solid rgba(37,80,140,0.4)', backdropFilter: 'blur(12px)' }}
          >
            {p.photo ? (
              <img src={p.photo} alt={p.name} className="w-20 h-20 rounded-full object-cover mb-3 border-2" style={{ borderColor: 'rgba(0,212,255,0.4)' }} />
            ) : (
              <div
                className="w-20 h-20 rounded-full mb-3 flex items-center justify-center text-xl font-bold"
                style={{ background: 'rgba(0,212,255,0.15)', color: 'oklch(0.65 0.22 200)', border: '2px solid rgba(0,212,255,0.4)' }}
              >
                {initials(p.name)}
              </div>
            )}
            <h3 className="font-semibold text-foreground text-sm">{p.name}</h3>
            {p.funFact && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.funFact}</p>}

            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(p)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent style={{ background: 'rgba(24,28,50,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,212,255,0.4)' }}>
          <DialogHeader>
            <DialogTitle className="text-primary">{editing ? 'Edit Classmate' : 'Add Classmate'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)' }}
              >
                {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-primary" />}
              </div>
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                </Button>
                {photo && (
                  <Button type="button" variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => setPhoto('')}>
                    <X className="w-3.5 h-3.5" /> Remove
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Fun fact (optional)</label>
              <Textarea value={funFact} onChange={e => setFunFact(e.target.value)} placeholder="e.g. Plays the guitar, loves cricket..." className="min-h-20" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} className="neon-button flex-1">{editing ? 'Save' : 'Add'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
