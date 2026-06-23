import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";

export interface SiteSettings {
  theme_primary: string;
  theme_secondary: string;
  theme_accent: string;
  theme_bg: string;
  bg_image_url: string;
  bg_opacity: number;
}

const DEFAULTS: SiteSettings = {
  theme_primary: "oklch(0.65 0.22 200)",
  theme_secondary: "oklch(0.60 0.25 320)",
  theme_accent: "oklch(0.75 0.20 120)",
  theme_bg: "oklch(0.12 0.01 280)",
  bg_image_url: "",
  bg_opacity: 15,
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  saveSettings: (patch: Partial<SiteSettings>) => Promise<void>;
  loading: boolean;
}

const SiteSettingsContext =
  createContext<SiteSettingsContextType | null>(null);

function applySettings(settings: SiteSettings) {
  const root = document.documentElement;

  // Primary Theme
  root.style.setProperty("--primary", settings.theme_primary);
  root.style.setProperty("--secondary", settings.theme_secondary);
  root.style.setProperty("--accent", settings.theme_accent);
  root.style.setProperty("--background", settings.theme_bg);

  // Derived Theme
  root.style.setProperty("--ring", settings.theme_primary);

  root.style.setProperty("--sidebar", settings.theme_bg);
  root.style.setProperty("--sidebar-primary", settings.theme_primary);
  root.style.setProperty("--sidebar-accent", settings.theme_secondary);
  root.style.setProperty("--sidebar-ring", settings.theme_primary);

  root.style.setProperty("--card", settings.theme_bg);
  root.style.setProperty("--popover", settings.theme_bg);
  root.style.setProperty("--input", settings.theme_bg);

  root.style.setProperty("--chart-1", settings.theme_primary);
  root.style.setProperty("--chart-2", settings.theme_secondary);
  root.style.setProperty("--chart-3", settings.theme_accent);
  root.style.setProperty("--chart-4", settings.theme_primary);
  root.style.setProperty("--chart-5", settings.theme_secondary);

  root.style.setProperty("--color-dark-bg", settings.theme_bg);

  // Background image
  const bg = document.getElementById("bg-layer");

  if (bg) {
    if (settings.bg_image_url) {
      bg.style.backgroundImage = `url("${settings.bg_image_url}")`;
      bg.style.backgroundSize = "cover";
      bg.style.backgroundPosition = "center";
    } else {
      bg.style.backgroundImage = "none";
    }

    bg.style.opacity = String(settings.bg_opacity / 100);
  }
}

function rowsToSettings(
  rows: { key: string; value: string }[]
): SiteSettings {
  const map: Record<string, string> = {};

  rows.forEach((row) => {
    map[row.key] = row.value;
  });

  return {
    theme_primary: map.theme_primary ?? DEFAULTS.theme_primary,
    theme_secondary: map.theme_secondary ?? DEFAULTS.theme_secondary,
    theme_accent: map.theme_accent ?? DEFAULTS.theme_accent,
    theme_bg: map.theme_bg ?? DEFAULTS.theme_bg,
    bg_image_url: map.bg_image_url ?? DEFAULTS.bg_image_url,
    bg_opacity: Number(map.bg_opacity ?? DEFAULTS.bg_opacity),
  };
}

export function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key,value");

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const next = rowsToSettings(data ?? []);

    setSettings(next);
    applySettings(next);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const channel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadSettings]);

  const saveSettings = useCallback(
    async (patch: Partial<SiteSettings>) => {
      const updated = {
        ...settings,
        ...patch,
      };

      // Apply instantly
      setSettings(updated);
      applySettings(updated);

      const rows = Object.entries(patch).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      const { error } = await supabase
        .from("site_settings")
        .upsert(rows, {
          onConflict: "key",
        });

      if (error) {
        console.error(error);

        // Rollback
        setSettings(settings);
        applySettings(settings);

        throw error;
      }
    },
    [settings]
  );

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        saveSettings,
        loading,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);

  if (!context) {
    throw new Error(
      "useSiteSettings must be used inside SiteSettingsProvider"
    );
  }

  return context;
}
