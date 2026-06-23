import { useState, useRef } from 'react';
import {
  ShieldCheck, Users, Bell, Clock, Trophy, Key,
  Eye, EyeOff, Plus, Trash2, Save, AlertTriangle,
  Palette, Image as ImageIcon, RefreshCw, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, ADMIN_EMAILS } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'rgba(24, 28, 50, 0.5)', border: `1px solid ${color}33` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'rgba(24, 28, 50, 0.4)', border: '1px solid rgba(37, 80, 140, 0.4)', backdropFilter: 'blur(12px)' }}>
      <h3 className="flex items-center gap-2 text-lg font-semibold text-primary mb-5">
        <Icon className="w-5 h-5" />
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Preset themes ─────────────────────────────────────────────────────────────
const THEMES = [
  { name: 'Neon Arcade', primary: 'oklch(0.65 0.22 200)', secondary: 'oklch(0.60 0.25 320)', accent: 'oklch(0.75 0.20 120)', bg: 'oklch(0.12 0.01 280)' },
  { name: 'Sunset', primary: 'oklch(0.70 0.22 30)', secondary: 'oklch(0.65 0.25 350)', accent: 'oklch(0.80 0.20 60)', bg: 'oklch(0.10 0.02 20)' },
  { name: 'Forest', primary: 'oklch(0.60 0.20 145)', secondary: 'oklch(0.55 0.18 165)', accent: 'oklch(0.75 0.22 100)', bg: 'oklch(0.10 0.02 145)' },
  { name: 'Violet', primary: 'oklch(0.65 0.25 290)', secondary: 'oklch(0.60 0.28 310)', accent: 'oklch(0.75 0.18 260)', bg: 'oklch(0.10 0.02 290)' },
  { name: 'Rose', primary: 'oklch(0.65 0.25 350)', secondary: 'oklch(0.60 0.22 320)', accent: 'oklch(0.80 0.18 30)', bg: 'oklch(0.10 0.02 340)' },
  { name: 'Ocean', primary: 'oklch(0.60 0.22 230)', secondary: 'oklch(0.55 0.25 200)', accent: 'oklch(0.75 0.18 170)', bg: 'oklch(0.10 0.02 230)' },
];

const BG_PRESETS = [
  { name: 'None', value: '' },
  { name: 'Stars', value: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80' },
  { name: 'City Lights', value: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80' },
  { name: 'Aurora', value: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' },
  { name: 'Mountains', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
  { name: 'Abstract', value: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const { admin, logout } = useAuth();
  const [emails] = useState<string[]>([...ADMIN_EMAILS]);
  const [newEmail, setNewEmail] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Theme state
  const [activeTheme, setActiveTheme] = useState(0);
  const [customColors, setCustomColors] = useState({
    primary: '#00d4ff',
    secondary: '#ff00ff',
    accent: '#00ff88',
    bg: '#1a1c32',
  });

  // Background image state
  const [bgPreset, setBgPreset] = useState(0);
  const [customBgUrl, setCustomBgUrl] = useState('');
  const [bgOpacity, setBgOpacity] = useState(15);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const applyTheme = (idx: number) => {
    const t = THEMES[idx];
    setActiveTheme(idx);
    document.documentElement.style.setProperty('--primary', t.primary);
    document.documentElement.style.setProperty('--secondary', t.secondary);
    document.documentElement.style.setProperty('--accent', t.accent);
    document.documentElement.style.setProperty('--background', t.bg);
    document.documentElement.style.setProperty('--color-dark-bg', t.bg);
    toast.success(`Theme "${t.name}" applied!`);
  };

  const applyCustomColors = () => {
    document.documentElement.style.setProperty('--primary', customColors.primary);
    document.documentElement.style.setProperty('--secondary', customColors.secondary);
    document.documentElement.style.setProperty('--accent', customColors.accent);
    document.documentElement.style.setProperty('--background', customColors.bg);
    toast.success('Custom colors applied!');
  };

  const applyBgPreset = (idx: number) => {
    setBgPreset(idx);
    const url = BG_PRESETS[idx].value;
    applyBgImage(url);
  };

  const applyBgImage = (url: string) => {
    const el = document.getElementById('bg-layer');
    if (!el) return;
    if (!url) {
      el.style.backgroundImage = 'none';
    } else {
      el.style.backgroundImage = `url('${url}')`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
    }
    el.style.opacity = String(bgOpacity / 100);
  };

  const handleBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomBgUrl(url);
    applyBgImage(url);
    toast.success('Background image applied!');
  };

  const handleAddEmail = () => {
    const e = newEmail.trim().toLowerCase();
    if (!e.includes('@')) { toast.error('Enter a valid email.'); return; }
    if (emails.includes(e)) { toast.error('Already in the list.'); return; }
    toast.success(`${e} added (reload to persist).`);
    setNewEmail('');
  };

  const handleRemoveEmail = (e: string) => {
    if (e === admin?.email) { toast.error("You can't remove your own email."); return; }
    toast.success(`${e} removed (reload to persist).`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Admin Control Panel
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Logged in as <span className="text-primary font-semibold">{admin?.email}</span>
            {' '}· Session started {admin?.loginTime.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" onClick={() => { logout(); toast.success('Logged out.'); }} className="gap-2 text-red-400 border-red-400/40 hover:border-red-400">
          End Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Admin Accounts" value={ADMIN_EMAILS.length} color="oklch(0.65 0.22 200)" />
        <StatCard icon={Bell} label="Announcements" value={2} color="oklch(0.60 0.25 320)" />
        <StatCard icon={Clock} label="Timetable Slots" value={6} color="oklch(0.75 0.20 120)" />
        <StatCard icon={Trophy} label="Students Ranked" value={8} color="#f59e0b" />
      </div>

      {/* ── THEME / COLOR EDITOR ── */}
      <Section title="Theme & Color Editor" icon={Palette}>
        <p className="text-sm text-muted-foreground mb-4">Pick a preset theme or set your own custom colors — changes apply instantly.</p>

        {/* Preset themes */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {THEMES.map((t, i) => (
            <button
              key={t.name}
              onClick={() => applyTheme(i)}
              className="relative rounded-lg p-3 text-xs font-medium transition-all border"
              style={{
                background: `linear-gradient(135deg, ${t.primary}33, ${t.secondary}33)`,
                borderColor: activeTheme === i ? t.primary : 'rgba(37,80,140,0.3)',
                color: 'var(--foreground)',
              }}
            >
              {activeTheme === i && <Check className="w-3 h-3 absolute top-1 right-1 text-primary" />}
              <div className="flex gap-1 justify-center mb-1.5">
                {[t.primary, t.secondary, t.accent].map((c, ci) => (
                  <span key={ci} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
              {t.name}
            </button>
          ))}
        </div>

        {/* Custom color pickers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { key: 'primary', label: 'Primary' },
            { key: 'secondary', label: 'Secondary' },
            { key: 'accent', label: 'Accent' },
            { key: 'bg', label: 'Background' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColors[key as keyof typeof customColors]}
                  onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-10 h-9 rounded cursor-pointer border-0 p-0.5"
                  style={{ background: 'rgba(24,28,50,0.6)', border: '1px solid rgba(37,80,140,0.5)' }}
                />
                <Input
                  value={customColors[key as keyof typeof customColors]}
                  onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                  className="h-9 font-mono text-xs"
                  style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(37,80,140,0.5)' }}
                />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={applyCustomColors} className="neon-button gap-2">
          <Palette className="w-4 h-4" />
          Apply Custom Colors
        </Button>
      </Section>

      {/* ── BACKGROUND IMAGE ── */}
      <Section title="Background Image" icon={ImageIcon}>
        <p className="text-sm text-muted-foreground mb-4">Set a background image for the whole site. Only visible to you until you save/deploy.</p>

        {/* Preset backgrounds */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {BG_PRESETS.map((bg, i) => (
            <button
              key={bg.name}
              onClick={() => applyBgPreset(i)}
              className="relative rounded-lg overflow-hidden border text-xs font-medium transition-all"
              style={{
                height: 60,
                borderColor: bgPreset === i ? 'oklch(0.65 0.22 200)' : 'rgba(37,80,140,0.3)',
                background: bg.value ? `url('${bg.value}') center/cover` : 'rgba(24,28,50,0.5)',
                color: 'white',
              }}
            >
              {bgPreset === i && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.3)' }}>
                  <Check className="w-4 h-4" />
                </div>
              )}
              {!bg.value && <span style={{ color: 'var(--muted-foreground)' }}>None</span>}
            </button>
          ))}
        </div>

        {/* Opacity slider */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1 block">Overlay opacity: {bgOpacity}%</label>
          <input
            type="range" min={5} max={60} value={bgOpacity}
            onChange={e => {
              const v = Number(e.target.value);
              setBgOpacity(v);
              const el = document.getElementById('bg-layer');
              if (el) el.style.opacity = String(v / 100);
            }}
            className="w-full"
          />
        </div>

        {/* Custom URL */}
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Paste image URL…"
            value={customBgUrl}
            onChange={e => setCustomBgUrl(e.target.value)}
            className="h-9"
            style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(37,80,140,0.5)' }}
          />
          <Button onClick={() => { applyBgImage(customBgUrl); toast.success('Custom URL applied!'); }} className="neon-button h-9 gap-1">
            <Check className="w-4 h-4" />Apply
          </Button>
        </div>

        {/* File upload */}
        <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={handleBgFile} />
        <Button variant="outline" onClick={() => bgFileRef.current?.click()} className="gap-2" style={{ borderColor: 'rgba(37,80,140,0.5)' }}>
          <ImageIcon className="w-4 h-4" />
          Upload from device
        </Button>
      </Section>

      {/* ── ADMIN EMAILS ── */}
      <Section title="Authorised Admin Emails" icon={Key}>
        <div className="space-y-2 mb-4">
          {emails.map(e => (
            <div key={e} className="flex items-center justify-between px-4 py-2.5 rounded-lg"
              style={{ background: 'rgba(0, 212, 255, 0.07)', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
              <span className="text-sm text-foreground font-mono">{e}</span>
              <div className="flex items-center gap-2">
                {e === admin?.email && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">You</span>}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveEmail(e)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="new.admin@classhub.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
            className="text-foreground placeholder:text-muted-foreground/50 h-9"
            style={{ background: 'rgba(24, 28, 50, 0.6)', borderColor: 'rgba(37, 80, 140, 0.5)' }} />
          <Button onClick={handleAddEmail} className="neon-button gap-2 h-9">
            <Plus className="w-4 h-4" />Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Permanent changes require editing <code className="text-primary">AuthContext.tsx → ADMIN_EMAILS</code>
        </p>
      </Section>

      {/* Demo credentials */}
      <Section title="Demo Credentials" icon={Eye}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">Default passwords for each demo account.</p>
          <Button variant="ghost" size="sm" onClick={() => setShowPasswords(v => !v)} className="gap-2 text-xs">
            {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPasswords ? 'Hide' : 'Reveal'}
          </Button>
        </div>
        <div className="space-y-2">
          {[
            { email: 'pranav@classhub.com', pw: 'Pranav@2026' },
            { email: 'admin@classhub.com', pw: 'Admin@2026' },
            { email: 'teacher@classhub.com', pw: 'Teacher@2026' },
          ].map(row => (
            <div key={row.email} className="grid grid-cols-2 gap-4 px-4 py-2.5 rounded-lg text-sm font-mono"
              style={{ background: 'rgba(24, 28, 50, 0.5)', border: '1px solid rgba(37, 80, 140, 0.3)' }}>
              <span className="text-muted-foreground">{row.email}</span>
              <span className="text-primary">{showPasswords ? row.pw : '••••••••••'}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Change passwords in <code className="text-primary">AuthContext.tsx → ADMIN_PASSWORDS</code>
        </p>
      </Section>

      {/* Quick guide */}
      <Section title="Admin Capabilities" icon={Save}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Bell, label: 'Post & delete announcements', tab: 'Dashboard' },
            { icon: Clock, label: 'Add / edit / delete timetable slots', tab: 'Timetable' },
            { icon: Trophy, label: 'Edit leaderboard scores & names', tab: 'Leaderboard' },
            { icon: Users, label: 'Manage gallery photos', tab: 'Gallery' },
            { icon: Palette, label: 'Edit site theme & colors', tab: 'Admin → Theme' },
            { icon: ImageIcon, label: 'Set background image', tab: 'Admin → Background' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: 'rgba(0, 212, 255, 0.06)', border: '1px solid rgba(0, 212, 255, 0.15)' }}>
              <item.icon className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">→ {item.tab}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
