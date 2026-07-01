"use client";

import * as React from "react";

const COLOR_SCHEMES = ["light", "dark"] as const;
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

type ColorScheme = (typeof COLOR_SCHEMES)[number];
type ThemeSetting = ColorScheme | "system";

export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: "class" | `data-${string}`;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: string[];
}

interface ThemeProviderState {
  theme?: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  resolvedTheme?: ColorScheme;
  themes: string[];
  systemTheme?: ColorScheme;
}

const ThemeProviderContext = React.createContext<ThemeProviderState>({
  setTheme: () => {},
  themes: [],
});

function getSystemTheme(): ColorScheme {
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function disableTransitions(nonce?: string) {
  const style = document.createElement("style");
  if (nonce) {
    style.setAttribute("nonce", nonce);
  }
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(style);
  return () => {
    window.getComputedStyle(document.body);
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1);
  };
}

function resolveTheme(
  theme: ThemeSetting,
  enableSystem: boolean,
  defaultTheme: string,
): ColorScheme {
  if (theme === "system" && enableSystem) {
    return getSystemTheme();
  }
  if (theme === "system") {
    return defaultTheme === "light" ? "light" : "dark";
  }
  return theme === "light" ? "light" : "dark";
}

function applyThemeToDocument(
  resolved: ColorScheme,
  attribute: ThemeProviderProps["attribute"],
  disableTransitionOnChange: boolean,
) {
  const cleanupTransition = disableTransitionOnChange
    ? disableTransitions()
    : undefined;
  const root = document.documentElement;

  if (attribute === "class") {
    root.classList.remove(...COLOR_SCHEMES);
    root.classList.add(resolved);
  } else if (attribute) {
    root.setAttribute(attribute, resolved);
  }

  root.style.colorScheme = resolved;
  cleanupTransition?.();
}

function readStoredTheme(storageKey: string, defaultTheme: string): ThemeSetting {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage may be unavailable
  }
  return defaultTheme === "system"
    ? "system"
    : defaultTheme === "light"
      ? "light"
      : "dark";
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "dark",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "theme",
  themes = ["light", "dark"],
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeSetting>(defaultTheme as ThemeSetting);
  const [systemTheme, setSystemTheme] = React.useState<ColorScheme>("dark");
  const [resolvedTheme, setResolvedTheme] = React.useState<ColorScheme>(
    defaultTheme === "light" ? "light" : "dark",
  );
  const [ready, setReady] = React.useState(false);

  const setTheme = React.useCallback<React.Dispatch<React.SetStateAction<string>>>(
    (value) => {
      setThemeState((current) => {
        const next = typeof value === "function" ? value(current) : value;
        try {
          localStorage.setItem(storageKey, next);
        } catch {
          // ignore write failures
        }
        return next as ThemeSetting;
      });
    },
    [storageKey],
  );

  React.useLayoutEffect(() => {
    const stored = readStoredTheme(storageKey, defaultTheme);
    const system = getSystemTheme();
    const resolved = resolveTheme(stored, enableSystem, defaultTheme);

    setThemeState(stored);
    setSystemTheme(system);
    setResolvedTheme(resolved);
    applyThemeToDocument(resolved, attribute, disableTransitionOnChange);
    setReady(true);
  }, [attribute, defaultTheme, disableTransitionOnChange, enableSystem, storageKey]);

  React.useLayoutEffect(() => {
    if (!ready) {
      return;
    }

    const resolved = resolveTheme(theme, enableSystem, defaultTheme);
    setResolvedTheme(resolved);
    applyThemeToDocument(resolved, attribute, disableTransitionOnChange);
  }, [attribute, defaultTheme, disableTransitionOnChange, enableSystem, ready, theme]);

  React.useEffect(() => {
    if (!enableSystem) {
      return;
    }

    const media = window.matchMedia(MEDIA_QUERY);
    const onChange = () => {
      const nextSystem = getSystemTheme();
      setSystemTheme(nextSystem);
      if (theme === "system") {
        setResolvedTheme(nextSystem);
        applyThemeToDocument(nextSystem, attribute, disableTransitionOnChange);
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [attribute, disableTransitionOnChange, enableSystem, theme]);

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) {
        return;
      }
      setThemeState(event.newValue as ThemeSetting);
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  const value = React.useMemo<ThemeProviderState>(
    () => ({
      theme,
      setTheme,
      resolvedTheme: theme === "system" ? systemTheme : resolvedTheme,
      themes: enableSystem ? [...themes, "system"] : themes,
      systemTheme: enableSystem ? systemTheme : undefined,
    }),
    [enableSystem, resolvedTheme, setTheme, systemTheme, theme, themes],
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme(): ThemeProviderState {
  return React.useContext(ThemeProviderContext);
}
