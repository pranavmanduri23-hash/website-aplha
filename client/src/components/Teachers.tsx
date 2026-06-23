import { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Upload, GraduationCap, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  photo: string;
  email: string;
  bio: string;
}

interface TeachersProps {
  isAdmin: boolean;
}

const INITIAL: Teacher[] = [];

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
}

export default function Teachers({ isAdmin }: TeachersProps) {
  const [teachers, setTeachers] = useLocalStorageState<Teacher[]>('classhub_teachers', INITIAL);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    setName(''); setSubject(''); setEmail(''); setBio(''); setPhoto('');
    setShowDialog(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setName(t.name); setSubject(t.subject); setEmail(t.email); setBio(t.bio); setPhoto(t.photo);
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
      setTeachers(prev => prev.map(t => t.id === editing.id ? { ...t, name, subject, email, bio, photo } : t));
      toast.success('Teacher updated');
    } else {
      setTeachers(prev => [...prev, { id: Date.now().toString(), name, subject, email, bio, photo }]);
      toast.success('Teacher added');
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    toast.success('Teacher removed');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          Our Teachers
        </h2>
        {isAdmin && (
          <Button onClick={openNew} className="neon-button gap-2">
            <Plus className="w-4 h-4" />
            Add Teacher
          </Button>
        )}
      </div>

      {teachers.length === 0 && (
        <div
          className="text-center py-12 rounded-lg"
          style={{ background: 'rgba(24,28,50,0.4)', border: '1px solid rgba(37,80,140,0.4)' }}
        >
          <p className="text-muted-foreground">
            No teachers added yet. {isAdmin ? 'Click "Add Teacher" to get started.' : 'Check back soon!'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map(t => (
          <div
            key={t.id}
            className="group relative p-5 rounded-lg flex flex-col items-center text-center transition-all duration-300"
            style={{ background: 'rgba(24,28,50,0.4)', border: '1px solid rgba(37,80,140,0.4)', backdropFilter: 'blur(12px)' }}
          >
            {t.photo ? (
              <img src={t.photo} alt={t.name} className="w-24 h-24 rounded-full object-cover mb-3 border-2" style={{ borderColor: 'rgba(0,212,255,0.4)' }} />
            ) : (
              <div
                className="w-24 h-24 rounded-full mb-3 flex items-center justify-center text-2xl font-bold"
                style={{ background: 'rgba(0,212,255,0.15)', color: 'oklch(0.65 0.22 200)', border: '2px solid rgba(0,212,255,0.4)' }}
              >
                {initials(t.name)}
              </div>
            )}
            <h3 className="font-semibold text-foreground">{t.name}</h3>
            {t.subject && (
              <span className="text-xs font-semibold mt-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.15)', color: 'oklch(0.65 0.22 200)' }}>
                {t.subject}
              </span>
            )}
            {t.bio && <p className="text-xs text-muted-foreground mt-2">{t.bio}</p>}
            {t.email && (
              <a href={`mailto:${t.email}`} className="text-xs text-primary mt-2 flex items-center gap-1 hover:underline">
                <Mail className="w-3 h-3" /> {t.email}
              </a>
            )}

            {isAdmin && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => openEdit(t)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(t.id)}>
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
            <DialogTitle className="text-primary">{editing ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)' }}
              >
                {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <GraduationCap className="w-6 h-6 text-primary" />}
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
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Teacher's name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Subject</label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Email (optional)</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="teacher@school.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Bio (optional)</label>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Short note about the teacher" className="min-h-20" />
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
