import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, SkipBack, SkipForward, Plus, Trash2, Volume2, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

interface Track {
  id: string;
  title: string;
  src: string; // direct audio file URL or an uploaded data URL
}

interface MusicPlayerProps {
  isAdmin: boolean;
}

const INITIAL: Track[] = [];

export default function MusicPlayer({ isAdmin }: MusicPlayerProps) {
  const [tracks, setTracks] = useLocalStorageState<Track[]>('classhub_music_tracks', INITIAL);
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const current = tracks[currentIndex];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentIndex]);

  const togglePlay = () => {
    if (!current) { toast.error('No tracks added yet'); return; }
    setIsPlaying(p => !p);
  };

  const next = () => {
    if (tracks.length === 0) return;
    setCurrentIndex(i => (i + 1) % tracks.length);
    setIsPlaying(true);
  };

  const prev = () => {
    if (tracks.length === 0) return;
    setCurrentIndex(i => (i - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) { toast.error('Please select an audio file'); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error('File must be under 8MB — paste a link instead for longer songs'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      setUrl(ev.target?.result as string);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const addTrack = () => {
    if (!title.trim() || !url.trim()) { toast.error('Add a title and an audio file or link'); return; }
    setTracks(prev => [...prev, { id: Date.now().toString(), title: title.trim(), src: url.trim() }]);
    setTitle(''); setUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowAdd(false);
    toast.success('Track added');
  };

  const removeTrack = (id: string) => {
    const idx = tracks.findIndex(t => t.id === id);
    setTracks(prev => prev.filter(t => t.id !== id));
    if (idx === currentIndex) { setIsPlaying(false); }
    toast.success('Track removed');
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, oklch(0.65 0.22 200), oklch(0.60 0.25 320))',
          boxShadow: '0 8px 24px rgba(0,212,255,0.35)',
        }}
        title="Class playlist"
      >
        <Music className="w-6 h-6 text-white" />
      </button>

      {open && (
        <div
          className="fixed bottom-24 left-6 z-40 w-80 rounded-lg p-4 space-y-3"
          style={{ background: 'rgba(24,28,50,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0,212,255,0.4)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <Music className="w-4 h-4" /> Class Playlist
            </h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {tracks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No tracks yet. {isAdmin ? 'Add one below.' : 'Ask an admin to add some music.'}
            </p>
          ) : (
            <>
              <div className="text-center py-2">
                <p className="font-medium text-foreground truncate">{current?.title}</p>
                <p className="text-xs text-muted-foreground">{currentIndex + 1} / {tracks.length}</p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="icon" onClick={prev}><SkipBack className="w-5 h-5" /></Button>
                <Button onClick={togglePlay} className="neon-button h-11 w-11 rounded-full p-0">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={next}><SkipForward className="w-5 h-5" /></Button>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <Slider value={[volume]} max={100} step={1} onValueChange={v => setVolume(v[0])} />
              </div>
              <audio
                ref={audioRef}
                src={current?.src}
                onEnded={next}
                autoPlay={isPlaying}
              />

              {isAdmin && (
                <div className="max-h-32 overflow-y-auto space-y-1 pt-2 border-t" style={{ borderColor: 'rgba(37,80,140,0.4)' }}>
                  {tracks.map((t, i) => (
                    <div key={t.id} className="flex items-center justify-between text-xs gap-2">
                      <button
                        className={`truncate text-left flex-1 ${i === currentIndex ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                        onClick={() => { setCurrentIndex(i); setIsPlaying(true); }}
                      >
                        {t.title}
                      </button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => removeTrack(t.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {isAdmin && (
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowAdd(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Track
            </Button>
          )}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent style={{ background: 'rgba(24,28,50,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,212,255,0.4)' }}>
          <DialogHeader>
            <DialogTitle className="text-primary">Add a Track</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Song or playlist name" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Audio file URL</label>
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/track.mp3" />
              <p className="text-xs text-muted-foreground mt-1">
                Use a direct link to a royalty-free or self-owned MP3 (e.g. your own hosting, or sites like Pixabay Audio /
                Free Music Archive) so playback stays ad-free.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: 'rgba(37,80,140,0.4)' }} />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(37,80,140,0.4)' }} />
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} />
              <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" /> Upload an audio file (under 8MB)
              </Button>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
              <Button onClick={addTrack} className="neon-button flex-1">Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
