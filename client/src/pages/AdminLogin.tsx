import { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, Zap, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ── Cloudflare Turnstile-style CAPTCHA widget ──────────────────────────────────
function CaptchaWidget({ onVerified }: { onVerified: () => void }) {
  const [state, setState] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  const [dots, setDots] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startVerify = () => {
    if (state === 'verified') return;
    setState('checking');
    let d = 0;
    timerRef.current = setInterval(() => {
      d++;
      setDots(d % 4);
    }, 300);
    // Simulate Cloudflare verification delay (1.8s)
    setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      // 95% pass rate like real Turnstile
      const pass = Math.random() > 0.05;
      setState(pass ? 'verified' : 'failed');
      if (pass) onVerified();
    }, 1800);
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState('idle');
    setDots(0);
  };

  return (
    <div
      className="rounded-lg px-4 py-3 flex items-center justify-between"
      style={{ background: 'rgba(24,28,50,0.8)', border: '1px solid rgba(37,80,140,0.5)' }}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <button
          onClick={startVerify}
          disabled={state === 'checking'}
          className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
          style={{
            borderColor: state === 'verified' ? 'oklch(0.65 0.22 200)' : state === 'failed' ? '#dc2626' : 'rgba(37,80,140,0.7)',
            background: state === 'verified' ? 'oklch(0.65 0.22 200)' : 'transparent',
          }}
          aria-label="Verify you are human"
        >
          {state === 'checking' && (
            <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          )}
          {state === 'verified' && (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="oklch(0.12 0.01 280)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {state === 'failed' && <span style={{ color: '#dc2626', fontSize: 14 }}>✕</span>}
        </button>

        <div>
          <p className="text-sm text-foreground">
            {state === 'idle' && 'I am human'}
            {state === 'checking' && `Verifying${'.'.repeat(dots)}`}
            {state === 'verified' && <span style={{ color: 'oklch(0.65 0.22 200)' }}>Verified ✓</span>}
            {state === 'failed' && <span className="text-destructive">Verification failed</span>}
          </p>
          {state === 'failed' && (
            <button onClick={reset} className="text-xs text-primary flex items-center gap-1 mt-0.5">
              <RefreshCw className="w-3 h-3" /> Try again
            </button>
          )}
        </div>
      </div>

      {/* Cloudflare branding */}
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 109 41" className="h-4 w-auto opacity-60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M82.5 27.5c-.3-1.2-1.4-2-2.6-2H26.4c-.4 0-.7.2-.9.5-.2.3-.2.7 0 1l2.2 4.8c.3 1.2 1.4 2 2.6 2h55.5c.4 0 .7-.2.9-.5.2-.3.2-.7 0-1l-4.2-4.8z" fill="#F38020"/>
            <path d="M90.3 20c-.3-1.2-1.4-2-2.6-2H22.1c-.4 0-.7.2-.9.5-.2.3-.2.7 0 1l2.2 4.8c.3 1.2 1.4 2 2.6 2h67.6c.4 0 .7-.2.9-.5.2-.3.2-.7 0-1L90.3 20z" fill="#FBAD41"/>
            <path d="M97.2 12.5c-.3-1.2-1.4-2-2.6-2H14.9c-.4 0-.7.2-.9.5-.2.3-.2.7 0 1l2.2 4.8c.3 1.2 1.4 2 2.6 2h81.7c.4 0 .7-.2.9-.5.2-.3.2-.7 0-1l-4.2-4.8z" fill="#FBAD41"/>
          </svg>
        </div>
        <span className="text-[10px] text-muted-foreground">Privacy · Terms</span>
      </div>
    </div>
  );
}

// ── Main login page ────────────────────────────────────────────────────────────
export default function AdminLogin({ onClose }: { onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const MAX_ATTEMPTS = 5;

  const handleSubmit = async () => {
    setError('');
    if (!captchaPassed) { setError('Please complete the human verification first.'); return; }
    if (!email.trim() || !password.trim()) { setError('Please enter both email and password.'); return; }
    if (attempts >= MAX_ATTEMPTS) { setError('Too many failed attempts. Please refresh the page.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = await login(email, password);
    setLoading(false);

    if (result.ok) {
      toast.success('Welcome back, Admin! 🎓');
      onClose();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError(result.error ?? 'Login failed.');
      if (newAttempts >= MAX_ATTEMPTS) {
        setError('Too many failed attempts. Please refresh the page to try again.');
      }
    }
  };

  const locked = attempts >= MAX_ATTEMPTS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 12, 28, 0.92)', backdropFilter: 'blur(16px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 relative overflow-hidden"
        style={{
          background: 'rgba(20, 24, 48, 0.95)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          boxShadow: '0 0 60px rgba(0, 212, 255, 0.15), 0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top neon line */}
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, oklch(0.65 0.22 200), transparent)' }} />

        {/* Icon + title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 200 / 0.2), oklch(0.60 0.25 320 / 0.2))', border: '1px solid rgba(0, 212, 255, 0.4)', boxShadow: '0 0 24px rgba(0, 212, 255, 0.2)' }}>
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Admin Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Class Hub · Authorised Access Only</p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Email Address</label>
            <Input type="email" placeholder="admin@classhub.com" value={email} disabled={locked || loading}
              onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus
              className="text-foreground placeholder:text-muted-foreground/50 h-11"
              style={{ background: 'rgba(24, 28, 50, 0.6)', borderColor: error ? 'rgba(220, 50, 50, 0.6)' : 'rgba(37, 80, 140, 0.6)' }} />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Password</label>
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} disabled={locked || loading}
                onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="text-foreground placeholder:text-muted-foreground/50 h-11 pr-10"
                style={{ background: 'rgba(24, 28, 50, 0.6)', borderColor: error ? 'rgba(220, 50, 50, 0.6)' : 'rgba(37, 80, 140, 0.6)' }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CAPTCHA */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">Human Verification</label>
            <CaptchaWidget onVerified={() => setCaptchaPassed(true)} />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg text-sm"
              style={{ background: 'rgba(220, 50, 50, 0.15)', border: '1px solid rgba(220, 50, 50, 0.3)' }}>
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <span className="text-destructive">{error}</span>
            </div>
          )}

          {attempts > 0 && attempts < MAX_ATTEMPTS && (
            <p className="text-xs text-muted-foreground text-center">
              {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 h-11"
              style={{ borderColor: 'rgba(37, 80, 140, 0.5)' }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={locked || loading || !captchaPassed} className="neon-button flex-1 h-11 gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
              {loading ? 'Verifying…' : 'Login'}
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(37, 80, 140, 0.3)' }}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="w-3 h-3 text-primary" />
            <span>Access restricted to authorised administrators only. Unauthorised access is prohibited.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
