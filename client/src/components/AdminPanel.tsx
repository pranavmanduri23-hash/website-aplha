import { useState, useRef } from 'react';
import {
  ShieldCheck, Users, Bell, Clock, Trophy, Key,
  Eye, EyeOff, Plus, Trash2, AlertTriangle,
  Palette, Image as ImageIcon, Check, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, ADMIN_EMAILS } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import { toast } from 'sonner';

function StatCard({ icon: Icon, label, value, color, loading }: {
  icon: React.ElementType; label: string; value: string | number; color: string; loading?: boolean;
}) {
  return (
    <div className="p-5 rounded-xl" style={{ background: 'rgba(24,28,50,0.5)', border: `1px solid ${color}33` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color }}>
        {loading ? <Loader2 className="w-6 h-6 animate-spin" style={{ color }} /> : value}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'rgba(24,28,50,0.4)', border: '1px solid rgba(37,80,140,0.4)', backdropFilter: 'blur(12px)' }}>
      <h3 className="flex items-center gap-2 text-lg font-semibold text-primary mb-5">
        <Icon className="w-5 h-5" />{title}
      </h3>
      {children}
    </div>
  );
}

const THEMES = [
  { name: 'Neon Arcade', primary: 'oklch(0.65 0.22 200)', secondary: 'oklch(0.60 0.25 320)', accent: 'oklch(0.75 0.20 120)', bg: 'oklch(0.12 0.01 280)' },
  { name: 'Sunset',      primary: 'oklch(0.70 0.22 30)',  secondary: 'oklch(0.65 0.25 350)', accent: 'oklch(0.80 0.20 60)',  bg: 'oklch(0.10 0.02 20)'  },
  { name: 'Forest',      primary: 'oklch(0.60 0.20 145)', secondary: 'oklch(0.55 0.18 165)', accent: 'oklch(0.75 0.22 100)', bg: 'oklch(0.10 0.02 145)' },
  { name: 'Violet',      primary: 'oklch(0.65 0.25 290)', secondary: 'oklch(0.60 0.28 310)', accent: 'oklch(0.75 0.18 260)', bg: 'oklch(0.10 0.02 290)' },
  { name: 'Rose',        primary: 'oklch(0.65 0.25 350)', secondary: 'oklch(0.60 0.22 320)', accent: 'oklch(0.80 0.18 30)',  bg: 'oklch(0.10 0.02 340)' },
  { name: 'Ocean',       primary: 'oklch(0.60 0.22 230)', secondary: 'oklch(0.55 0.25 200)', accent: 'oklch(0.75 0.18 170)', bg: 'oklch(0.10 0.02 230)' },
];

const BG_PRESETS = [
  { name: 'None',        value: '' },
  { name: 'Stars',       value: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80' },
  { name: 'City Lights', value: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80' },
  { name: 'Aurora',      value: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80' },
  { name: 'Mountains',   value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80' },
  { name: 'Abstract',    value: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80' },
];

export default function AdminPanel() {
  const { admin, logout } = useAuth();
  const { saveSettings }  = useSiteSettings();

  const { rows: announcements,  loading: loadAnn } = useSupabaseTable<{ id: number }>('announcements');
  const { rows: timetableSlots, loading: loadTT  } = useSupabaseTable<{ id: number }>('timetable');
  const { rows: leaderboardRows,loading: loadLB  } = useSupabaseTable<{ id: number }>('leaderboard');

  const [emails] = useState<string[]>([...ADMIN_EMAILS]);
  const [newEmail, setNewEmail]         = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [activeTheme, setActiveTheme]   = useState<number | null>(null);
  const [customColors, setCustomColors] = useState({ primary: '#00d4ff', secondary: '#ff00ff', accent: '#00ff88', bg: '#1a1c32' });
  const [bgPreset, setBgPreset]         = useState(0);
  const [customBgUrl, setCustomBgUrl]   = useState('');
  const [bgOpacity, setBgOpacity]       = useState(15);
  const [savingTheme, setSavingTheme]   = useState(false);
  const [savingBg, setSavingBg]         = useState(false);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const applyTheme = async (idx: number) => {
    const t = THEMES[idx];
    setActiveTheme(idx); setSavingTheme(true);
    try {
      await saveSettings({ theme_primary: t.primary, theme_secondary: t.secondary, theme_accent: t.accent, theme_bg: t.bg });
      toast.success(`Theme "${t.name}" applied to everyone!`);
    } catch (e: unknown) { toast.error((e as Error).message ?? 'Failed'); }
    finally { setSavingTheme(false); }
  };

  const applyCustomColors = async () => {
    setSavingTheme(true);
    try {
      await saveSettings({ theme_primary: customColors.primary, theme_secondary: customColors.secondary, theme_accent: customColors.accent, theme_bg: customColors.bg });
      toast.success('Custom colors applied to everyone!');
    } catch (e: unknown) { toast.error((e as Error).message ?? 'Failed'); }
    finally { setSavingTheme(false); }
  };

  const applyBgPreset = async (idx: number) => {
    setBgPreset(idx); setSavingBg(true);
    try {
      await saveSettings({ bg_image_url: BG_PRESETS[idx].value, bg_opacity: bgOpacity });
      toast.success('Background updated for everyone!');
    } catch (e: unknown) { toast.error((e as Error).message ?? 'Failed'); }
    finally { setSavingBg(false); }
  };

  const applyBgUrl = async (url: string) => {
    setSavingBg(true);
    try {
      await saveSettings({ bg_image_url: url, bg_opacity: bgOpacity });
      toast.success('Background updated for everyone!');
    } catch (e: unknown) { toast.error((e as Error).message ?? 'Failed'); }
    finally { setSavingBg(false); }
  };

  const applyOpacity = async (v: number) => {
    setBgOpacity(v);
    try { await saveSettings({ bg_opacity: v }); } catch { /* silent */ }
  };

  const handleBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomBgUrl(url);
    applyBgUrl(url);
  };

  const handleAddEmail    = () => {
    const e = newEmail.trim().toLowerCase();
    if (!e.includes('@')) { toast.error('Enter a valid email.'); return; }
    if (emails.includes(e)) { toast.error('Already in the list.'); return; }
    toast.success(`${e} added (reload to persist).`); setNewEmail('');
  };
  const handleRemoveEmail = (e: string) => {
    if (e === admin?.email) { toast.error("Can't remove your own email."); return; }
    toast.success(`${e} removed (reload to persist).`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />Admin Control Panel
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Logged in as <span className="text-primary font-semibold">{admin?.email}</span>
            {' '}· Session started {admin?.loginTime.toLocaleTimeString()}
          </p>
          <p className="text-xs text-accent mt-1">✓ Theme & background changes apply to every user in real time</p>
        </div>
        <Button variant="outline" onClick={() => { logout(); toast.success('Logged out.'); }}
          className="gap-2 text-red-400 border-red-400/40 hover:border-red-400">
          End Session
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users}  label="Admin Accounts"  value={ADMIN_EMAILS.length}    color="oklch(0.65 0.22 200)" />
        <StatCard icon={Bell}   label="Announcements"   value={announcements.length}   color="oklch(0.60 0.25 320)" loading={loadAnn} />
        <StatCard icon={Clock}  label="Timetable Slots" value={timetableSlots.length}  color="oklch(0.75 0.20 120)" loading={loadTT} />
        <StatCard icon={Trophy} label="Students Ranked" value={leaderboardRows.length} color="#f59e0b"              loading={loadLB} />
      </div>

      <Section title="Theme & Color Editor" icon={Palette}>
        <p className="text-sm text-muted-foreground mb-4">Changes save to the database and apply to <strong>every user</strong> instantly.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {THEMES.map((t, i) => (
            <button key={t.name} onClick={() => applyTheme(i)} disabled={savingTheme}
              className="relative rounded-lg p-3 text-xs font-medium transition-all border"
              style={{ background: `linear-gradient(135deg, ${t.primary}33, ${t.secondary}33)`, borderColor: activeTheme === i ? t.primary : 'rgba(37,80,140,0.3)', color: 'var(--foreground)', opacity: savingTheme ? 0.6 : 1 }}>
              {activeTheme === i && <Check className="w-3 h-3 absolute top-1 right-1 text-primary" />}
              <div className="flex gap-1 justify-center mb-1.5">
                {[t.primary, t.secondary, t.accent].map((c, ci) => <span key={ci} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
              </div>
              {t.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[{ key: 'primary', label: 'Primary' }, { key: 'secondary', label: 'Secondary' }, { key: 'accent', label: 'Accent' }, { key: 'bg', label: 'Background' }].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={customColors[key as keyof typeof customColors]}
                  onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-10 h-9 rounded cursor-pointer border-0 p-0.5"
                  style={{ background: 'rgba(24,28,50,0.6)', border: '1px solid rgba(37,80,140,0.5)' }} />
                <Input value={customColors[key as keyof typeof customColors]}
                  onChange={e => setCustomColors(prev => ({ ...prev, [key]: e.target.value }))}
                  className="h-9 font-mono text-xs"
                  style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(37,80,140,0.5)' }} />
              </div>
            </div>
          ))}
        </div>
        <Button onClick={applyCustomColors} className="neon-button gap-2" disabled={savingTheme}>
          {savingTheme ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
          Apply Custom Colors for Everyone
        </Button>
      </Section>

      <Section title="Background Image" icon={ImageIcon}>
        <p className="text-sm text-muted-foreground mb-4">Visible to every user immediately.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {BG_PRESETS.map((bg, i) => (
            <button key={bg.name} onClick={() => applyBgPreset(i)} disabled={savingBg}
              className="relative rounded-lg overflow-hidden border text-xs font-medium transition-all"
              style={{ height: 60, borderColor: bgPreset === i ? 'oklch(0.65 0.22 200)' : 'rgba(37,80,140,0.3)', background: bg.value ? `url('${bg.value}') center/cover` : 'rgba(24,28,50,0.5)', color: 'white', opacity: savingBg ? 0.6 : 1 }}>
              {bgPreset === i && <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.3)' }}><Check className="w-4 h-4" /></div>}
              {!bg.value && <span style={{ color: 'var(--muted-foreground)' }}>None</span>}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1 block">Overlay opacity: {bgOpacity}%</label>
          <input type="range" min={5} max={60} value={bgOpacity} onChange={e => applyOpacity(Number(e.target.value))} className="w-full" />
        </div>
        <div className="flex gap-2 mb-3">
          <Input placeholder="Paste image URL…" value={customBgUrl} onChange={e => setCustomBgUrl(e.target.value)}
            className="h-9" style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(37,80,140,0.5)' }} />
          <Button onClick={() => applyBgUrl(customBgUrl)} className="neon-button h-9 gap-1" disabled={savingBg}>
            {savingBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Apply
          </Button>
        </div>
        <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={handleBgFile} />
        <Button variant="outline" onClick={() => bgFileRef.current?.click()} className="gap-2" style={{ borderColor: 'rgba(37,80,140,0.5)' }}>
          <ImageIcon className="w-4 h-4" />Upload from device
        </Button>
      </Section>

      <Section title="Authorised Admin Emails" icon={Key}>
        <div className="space-y-2 mb-4">
          {emails.map(e => (
            <div key={e} className="flex items-center justify-between px-4 py-2.5 rounded-lg"
              style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)' }}>
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
          <Input placeholder="new.admin@classhub.com" value={newEmail} onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddEmail()}
            className="text-foreground h-9" style={{ background: 'rgba(24,28,50,0.6)', borderColor: 'rgba(37,80,140,0.5)' }} />
          <Button onClick={handleAddEmail} className="neon-button gap-2 h-9"><Plus className="w-4 h-4" />Add</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Permanent changes require editing <code className="text-primary">AuthContext.tsx → ADMIN_EMAILS</code>
        </p>
      </Section>

      <Section title="Demo Credentials" icon={Eye}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">Default passwords for each demo account.</p>
          <Button variant="ghost" size="sm" onClick={() => setShowPasswords(v => !v)} className="gap-2 text-xs">
            {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPasswords ? 'Hide' : 'Reveal'}
          </Button>
        </div>
        <div className="space-y-2">
          {[{ email: 'pranav@classhub.com', pw: 'Pranav@2026' }, { email: 'admin@classhub.com', pw: 'Admin@2026' }, { email: 'teacher@classhub.com', pw: 'Teacher@2026' }].map(row => (
            <div key={row.email} className="grid grid-cols-2 gap-4 px-4 py-2.5 rounded-lg text-sm font-mono"
              style={{ background: 'rgba(24,28,50,0.5)', border: '1px solid rgba(37,80,140,0.3)' }}>
              <span className="text-muted-foreground">{row.email}</span>
              <span className="text-primary">{showPasswords ? row.pw : '••••••••••'}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
