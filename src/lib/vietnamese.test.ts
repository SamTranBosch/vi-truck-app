import { describe, expect, it } from 'vitest';
import { hasSound, hasTone, parseSyllable, spellTokens, stripTone } from './vietnamese';

describe('parseSyllable', () => {
  it('reads the six tones', () => {
    const tones = ['ma', 'mà', 'má', 'mả', 'mã', 'mạ'].map((s) => parseSyllable(s).tone);
    expect(tones).toEqual(['ngang', 'huyen', 'sac', 'hoi', 'nga', 'nang']);
  });

  it('splits onset, nucleus and coda', () => {
    expect(parseSyllable('nhà')).toMatchObject({ onset: 'nh', nucleus: 'a', coda: '', tone: 'huyen' });
    expect(parseSyllable('ếch')).toMatchObject({ onset: '', nucleus: 'ê', coda: 'ch', tone: 'sac' });
    expect(parseSyllable('chuột')).toMatchObject({ onset: 'ch', nucleus: 'uô', coda: 't', tone: 'nang' });
    expect(parseSyllable('đĩa')).toMatchObject({ onset: 'đ', nucleus: 'ia', coda: '', tone: 'nga' });
    expect(parseSyllable('ngựa')).toMatchObject({ onset: 'ng', nucleus: 'ưa', tone: 'nang' });
    expect(parseSyllable('bánh')).toMatchObject({ onset: 'b', nucleus: 'a', coda: 'nh' });
    expect(parseSyllable('ghe')).toMatchObject({ onset: 'gh', nucleus: 'e' });
  });

  it('keeps hat, horn and breve when removing the tone', () => {
    expect(stripTone('ở').text).toBe('ơ');
    expect(stripTone('ế').text).toBe('ê');
    expect(stripTone('ừ').text).toBe('ư');
    expect(stripTone('ằ').text).toBe('ă');
  });

  it('treats "gi" as an onset only before a vowel', () => {
    expect(parseSyllable('gia').onset).toBe('gi');
    expect(parseSyllable('gì')).toMatchObject({ onset: 'g', nucleus: 'i' });
  });

  it('is not fooled by digraphs: "chó" does not start with c', () => {
    expect(hasSound('chó', { onset: 'c' })).toBe(false);
    expect(hasSound('cá', { onset: 'c' })).toBe(true);
    expect(hasSound('khỉ', { onset: 'k' })).toBe(false);
    expect(hasSound('ghe', { onset: 'g' })).toBe(false);
  });
});

describe('hasSound / hasTone', () => {
  it('matches vowels by nucleus, so ô and ơ are not o', () => {
    expect(hasSound('thỏ', { vowel: 'o' })).toBe(true);
    expect(hasSound('hổ', { vowel: 'o' })).toBe(false);
    expect(hasSound('hổ', { vowel: 'ô' })).toBe(true);
    expect(hasSound('cờ', { vowel: 'ơ' })).toBe(true);
    expect(hasSound('đĩa', { vowel: 'i' })).toBe(false);
    expect(hasSound('đĩa', { vowel: 'ia' })).toBe(true);
  });

  it('works on multi-syllable words', () => {
    expect(hasSound('cô giáo', { onset: 'gi' })).toBe(true);
    expect(hasTone('cô giáo', 'sac')).toBe(true);
    expect(hasTone('cô giáo', 'huyen')).toBe(false);
  });
});

describe('spellTokens (đánh vần)', () => {
  it('spells a toned syllable like the book: cờ – a – ca – huyền – cà', () => {
    const t = spellTokens('cà');
    expect(t.map((x) => x.show)).toEqual(['c', 'a', 'ca', 'huyền', 'cà']);
    expect(t.map((x) => x.say)).toEqual(['cờ', 'a', 'ca', 'huyền', 'cà']);
  });

  it('skips the tone step when there is no tone mark', () => {
    expect(spellTokens('ca').map((x) => x.say)).toEqual(['cờ', 'a', 'ca']);
  });

  it('ends on the written word', () => {
    expect(spellTokens('bễ').at(-1)).toMatchObject({ kind: 'word', say: 'bễ' });
  });
});
