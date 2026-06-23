import React, {
  createContext, useContext, useEffect, useState, useCallback,
} from 'react';
import { supabase } from '@/lib/supabase';

export interface SiteSettings {
  theme_primary:   string;
  theme_secondary: string;
  theme_accent:    string;
  theme_bg:        string;
  bg_image_url:    string;
  bg_opacity:      number;
}

const DEFAULTS: SiteSettings = {
  theme_primary:   'oklch(0.65 0.22 200)',
  theme_secondary: 'oklch(0.60 0.25 320)',
  theme_accent:    'oklch(0.75 0.20 120)',
  theme_bg:        'oklch(0.12 0.01 280)',
  bg_image_url:    '',
  bg_opacity:      15,
};

interface CtxValue {
  settings: SiteSettings;
  saveSettings: (patch: Partial<SiteSettings>) => Promise<void>;
  loading: boolean;
}

const Ctx = createContext<CtxValue | null>(null);

function applySettings(s: SiteSettings) {
  const root = document.documentElement;
  root.style.setProperty('--primary',       s.theme_primary);
  root.style.setProperty('--secondary',     s.theme_secondary);
  root.style.setProperty('--accent',        s.theme_accent);
  root.style.setProperty('--background',    s.theme_bg);
  root.style.setProperty('--color-dark-bg', s.theme_bg);

  const el = document.getElementById('bg-layer');
  if (el) {
    el.style.backgroundImage   = s.bg_image_url ? `url('${s.bg_image_url}')` : 'none';
    el.style.backgroundSize     = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.opacity            = String(s.bg_opacity / 100);
  }
}

function rowsToSettings(rows: { key: string; value: string }[]): SiteSettings {
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return {
    theme_primary:   map['theme_primary']   ?? DEFAULTS.theme_primary,
    theme_secondary: map['theme_secondary'] ?? DEFAULTS.theme_secondary,
    theme_accent:    map['theme_accent']    ?? DEFAULTS.theme_accent,
    theme_bg:        map['theme_bg']        ?? DEFAULTS.theme_bg,
    bg_image_url:    map['bg_image_url']    ?? DEFAULTS.bg_image_url,
    bg_opacity:      Number(map['bg_opacity'] ?? DEFAULTS.bg_opacity),
  };
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const s = rowsToSettings(data);
          setSettings(s);
          applySettings(s);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => {
          supabase
            .from('site_settings')
            .select('key, value')
            .then(({ data, error }) => {
              if (!error && data) {
                const s = rowsToSettings(data);
                setSettings(s);
                applySettings(s);
              }
            });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const saveSettings = useCallback(async (patch: Partial<SiteSettings>) => {
    const rows = Object.entries(patch).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    const { error } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' });
    if (error) throw error;
    setSettings(prev => {
      const next = { ...prev, ...patch };
      applySettings(next);
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ settings, saveSettings, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSiteSettings must be inside SiteSettingsProvider');
  return ctx;
}
