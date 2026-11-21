/** "Add to Home Screen" only helps on iPhone / iPad Safari, where installing is manual. */
export interface InstallEnv {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  /** navigator.standalone (iOS only) */
  standalone: boolean;
  /** matchMedia('(display-mode: standalone)') */
  displayStandalone: boolean;
}

export function isIos(e: InstallEnv): boolean {
  if (/iPhone|iPad|iPod/.test(e.userAgent)) return true;
  // iPadOS reports itself as a Mac, but a Mac has no touch screen
  return e.platform === 'MacIntel' && e.maxTouchPoints > 1;
}

export function needsInstallHint(e: InstallEnv): boolean {
  return isIos(e) && !e.standalone && !e.displayStandalone;
}

export function currentEnv(): InstallEnv {
  const nav = (typeof navigator === 'undefined' ? {} : navigator) as Partial<Navigator> & { standalone?: boolean };
  let displayStandalone = false;
  try {
    displayStandalone = typeof window !== 'undefined' && !!window.matchMedia?.('(display-mode: standalone)').matches;
  } catch {
    /* ignore */
  }
  return {
    userAgent: nav.userAgent ?? '',
    platform: nav.platform ?? '',
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    standalone: nav.standalone === true,
    displayStandalone,
  };
}
