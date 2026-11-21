import { describe, expect, it } from 'vitest';
import { needsInstallHint, type InstallEnv } from './install';

const base: InstallEnv = { userAgent: '', platform: '', maxTouchPoints: 0, standalone: false, displayStandalone: false };

describe('install hint', () => {
  it('shows on iPhone Safari in a tab', () => {
    expect(needsInstallHint({ ...base, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' })).toBe(true);
  });
  it('shows on iPadOS that reports as a Mac with touch', () => {
    expect(needsInstallHint({ ...base, userAgent: 'Mozilla/5.0 (Macintosh)', platform: 'MacIntel', maxTouchPoints: 5 })).toBe(true);
  });
  it('is hidden once installed', () => {
    expect(needsInstallHint({ ...base, userAgent: 'iPhone', standalone: true })).toBe(false);
    expect(needsInstallHint({ ...base, userAgent: 'iPhone', displayStandalone: true })).toBe(false);
  });
  it('is hidden on a real Mac and on Android', () => {
    expect(needsInstallHint({ ...base, userAgent: 'Mozilla/5.0 (Macintosh)', platform: 'MacIntel', maxTouchPoints: 0 })).toBe(false);
    expect(needsInstallHint({ ...base, userAgent: 'Mozilla/5.0 (Linux; Android 14)' })).toBe(false);
  });
});
