/* =============================================================
   Sidequest Scribe — a gamer's quest journal
   Offline-first PWA · IndexedDB storage · WebAudio SFX
   ============================================================= */
'use strict';
const VERSION = '1.1.0';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pad = n => String(n).padStart(2, '0');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cssVar = n => getComputedStyle(document.body).getPropertyValue(n).trim();
const hashN = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const startOfDay = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
const fmtStamp = ts => { const d = new Date(ts); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
const fmtLong = ts => new Date(ts).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const fmtShort = ts => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const ago = ts => { const m = Math.round((Date.now() - ts) / 60000); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.round(m / 60); if (h < 24) return h + ' hr ago'; return Math.round(h / 24) + ' days ago'; };

/* ---------- icons ---------- */
const EMB = {
  sword: 'M19.5 2H22v2.5L11.2 15.3l-2.5-2.5zM5.6 12.4L7 11l6 6-1.4 1.4-1.6-1.6-3.3 3.3a1.6 1.6 0 0 1-2.3-2.3l3.3-3.3z',
  shield: 'M12 2l8 3v6c0 5.2-3.4 9.4-8 11-4.6-1.6-8-5.8-8-11V5zm0 3.2L7 7v4c0 3.4 2 6.4 5 7.8z',
  controller: 'M7 7h10a5 5 0 0 1 4.9 4l.9 5.2a2.8 2.8 0 0 1-4.8 2.4L15.6 16H8.4L6 18.6a2.8 2.8 0 0 1-4.8-2.4L2.1 11A5 5 0 0 1 7 7zm0 2.5v1.5H5.5v1.5H7V14h1.5v-1.5H10V11H8.5V9.5zm9 .3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-1.8 2.4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
  potion: 'M9 2h6v2h-1v4.3l5.2 7.9A3.7 3.7 0 0 1 16.1 22H7.9a3.7 3.7 0 0 1-3.1-5.8L10 8.3V4H9z',
  star: 'M12 2l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18.2l-6.4 3.5L7 14.5l-5.3-5 7.2-.9z',
  heart: 'M12 21.3l-1.4-1.3C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.6 11.6z',
  skull: 'M12 2a9 9 0 0 0-9 9c0 3 1.4 5.3 3.5 6.6V21a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3.4C19.6 16.3 21 14 21 11a9 9 0 0 0-9-9zM8.5 10a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zm7 0a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM12 15l1.3 2.4h-2.6z',
  gem: 'M6 3h12l4 6-10 13L2 9zm1.2 2L4.8 8.5h4L10 5zm6.8 0l1.2 3.5h4L16.8 5z',
  crown: 'M2 7l5 4.5L12 4l5 7.5L22 7l-2 12H4zM4.5 20.5h15V22h-15z',
  key: 'M7.5 3a5.5 5.5 0 0 1 5.2 7.3L22 19.6V22h-3.5v-2h-2v-2h-2l-3.2-3.2A5.5 5.5 0 1 1 7.5 3zM6 6.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z',
  mushroom: 'M12 2.5C6.2 2.5 1.5 6.6 1.5 11.5c0 1 .8 1.5 1.7 1.5h17.6c.9 0 1.7-.5 1.7-1.5 0-4.9-4.7-9-10.5-9zM7 6.2a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zm10 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM12 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8.5 14h7v5a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3z',
  moon: 'M20.5 14.5A9 9 0 1 1 9.5 3.5a7.2 7.2 0 0 0 11 11z',
  flame: 'M12 2c.8 3.6 6.5 6.3 6.5 12.2A6.5 6.5 0 0 1 5.5 14.2c0-3 1.6-5 2.6-6 .1 2 .9 3.6 2.4 4.2C9.8 8.6 11.5 5 12 2z',
  quill: 'M21 2C13.5 3 8.4 8.6 6.6 15.1l-1.9 5.8 1.4.6 2.6-4.7C14.8 16 19.6 9.6 21 2zM3 21.5h9V23H3z',
  book: 'M3 4.5C5.5 3.5 8.5 3.5 11.2 5v15.5C8.5 19 5.5 19 3 20zm18 0c-2.5-1-5.5-1-8.2.5v15.5c2.7-1.5 5.7-1.5 8.2-.5z',
  trophy: 'M7 3h10v2h3.5v2.5A4.5 4.5 0 0 1 16.6 12 5 5 0 0 1 13 14.8V17h3v2H8v-2h3v-2.2A5 5 0 0 1 7.4 12 4.5 4.5 0 0 1 3.5 7.5V5H7zm0 4H5.5v.5A2.5 2.5 0 0 0 7 9.8zm10 0v2.8a2.5 2.5 0 0 0 1.5-2.3V7zM6 20h12v2H6z',
  planet: 'M12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM2.5 17.5c-1-1.7 1.6-4.4 5.4-6.6l.4 1.9c-2.6 1.6-4.2 3.2-3.9 3.9.6 1 5.4-.4 10.3-3.2 4.9-2.8 8.3-5.9 7.8-7-.3-.6-2-.4-4.4.4l-1.5-1.3c3.7-1.4 6.9-1.7 7.6-.3 1 1.8-2.9 6-8.8 9.4-5.9 3.4-11.5 4.5-12.9 2.8z',
  ghost: 'M12 2a8 8 0 0 0-8 8v12l2.7-2 2.6 2 2.7-2 2.7 2 2.6-2L20 22V10a8 8 0 0 0-8-8zM9 8.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zm6 0a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z',
  dice: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2.5 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM7.5 15a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z'
};
const UI = {
  gear: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',
  back: 'M15 5l-7 7 7 7', camera: 'M3.5 8h3.5l2-3h6l2 3h3.5v11h-17zM12 10.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l5 5', palette: 'M12 3a9 9 0 0 0 0 18c1.4 0 2-1 2-2 0-1.2-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7.5 11.5h.01M9.5 7.5h.01M14.5 7.5h.01',
  plus: 'M12 5v14M5 12h14', trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  close: 'M6 6l12 12M18 6L6 18', share: 'M12 3v12M7 8l5-5 5 5M5 13v7h14v-7', download: 'M12 4v11M7 10l5 5 5-5M5 20h14', upload: 'M12 20V9M7 14l5-5 5 5M5 4h14',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2', pin: 'M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7', sort: 'M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4', play: 'M7 4l13 8-13 8z',
  book: 'M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z', image: 'M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9h.01',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2'
};
const icon = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="${EMB[n] || EMB.star}"/></svg>`;
const ui = n => `<svg class="ui" viewBox="0 0 24 24" aria-hidden="true"><path d="${UI[n]}"/></svg>`;

/* ---------- catalogs ---------- */
const BOOK_TYPES = [
  { id: 'tome', name: 'Leather Tome' }, { id: 'novel', name: 'Cloth Novel' }, { id: 'grimoire', name: 'Grimoire' },
  { id: 'cartridge', name: 'Game Cartridge' }, { id: 'pixel', name: '8-Bit Codex' }, { id: 'holo', name: 'Holo Datapad' }];
const COLORS = ['#7a1f2b', '#a8322d', '#c8642a', '#d9a326', '#3f6b2f', '#1f6f5c', '#1f4e79', '#2b3a8c', '#4b2a7a', '#7a2a6a', '#3a2a20', '#6b4a2b', '#2a2a2e', '#d8d2c0', '#0f8b8d', '#e05780'];
const TRIMS = [
  { id: '#e8c15a', name: 'Gold' }, { id: '#cfd6de', name: 'Silver' }, { id: '#c27c43', name: 'Bronze' }, { id: '#4ff0ff', name: 'Neon Cyan' },
  { id: '#ff4fd8', name: 'Neon Pink' }, { id: '#7dff6a', name: '1-Up Green' }, { id: '#1a1a1a', name: 'Obsidian' }, { id: '#fff4dc', name: 'Ivory' }];
const PATTERNS = [
  { id: 'none', name: 'Plain' }, { id: 'stripes', name: 'Stripes' }, { id: 'dots', name: 'Dots' }, { id: 'checker', name: 'Checker' },
  { id: 'scales', name: 'Dragon Scales' }, { id: 'circuit', name: 'Circuit' }];
const FONTS = [
  { id: 'cinzel', name: 'Royal', css: "'Cinzel', serif", s: 1 }, { id: 'medieval', name: 'Medieval', css: "'MedievalSharp', cursive", s: 1.05 },
  { id: 'uncial', name: 'Elder Rune', css: "'Uncial Antiqua', serif", s: .95 }, { id: 'pirata', name: 'Blackletter', css: "'Pirata One', cursive", s: 1.15 },
  { id: 'press', name: 'Arcade', css: "'Press Start 2P', monospace", s: .62 }, { id: 'vt', name: 'Terminal', css: "'VT323', monospace", s: 1.35 },
  { id: 'orbitron', name: 'Sci-Fi', css: "'Orbitron', sans-serif", s: .85 }, { id: 'caveat', name: 'Handwritten', css: "'Caveat', cursive", s: 1.3 }];
const INKS = [
  { id: 'caveat', name: 'Handwritten', css: "'Caveat', cursive", size: 22 }, { id: 'patrick', name: 'Notebook', css: "'Patrick Hand', cursive", size: 19 },
  { id: 'elite', name: 'Typewriter', css: "'Special Elite', monospace", size: 15 }, { id: 'vt', name: 'Terminal', css: "'VT323', monospace", size: 21 },
  { id: 'serif', name: 'Classic', css: "Georgia, 'Times New Roman', serif", size: 16 }, { id: 'clean', name: 'Clean', css: "-apple-system, system-ui, sans-serif", size: 15.5 }];
const PAPERS = [
  { id: 'parchment', name: 'Parchment', sw: '#ecd8ab' }, { id: 'lined', name: 'Lined', sw: '#fbf8ef' }, { id: 'grid', name: 'Graph', sw: '#e6eef0' },
  { id: 'midnight', name: 'Midnight', sw: '#22253a' }, { id: 'terminal', name: 'Terminal', sw: '#0b1d10' }];
const POSES = [['auto', 'Auto'], ['upright', 'Standing'], ['lean', 'Leaning'], ['flat', 'Lying Flat']];
const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Steam Deck', 'Mobile', 'Retro', 'VR', 'Other'];
const TAGS = [
  { id: 'note', name: 'Note', icon: 'quill', color: '#8a6f4a' }, { id: 'quest', name: 'Quest', icon: 'star', color: '#d39a17' },
  { id: 'boss', name: 'Boss', icon: 'crown', color: '#c0392b' }, { id: 'loot', name: 'Loot', icon: 'gem', color: '#14937f' },
  { id: 'lore', name: 'Lore', icon: 'book', color: '#6a4bb0' }, { id: 'death', name: 'Died', icon: 'skull', color: '#4d4d55' },
  { id: 'secret', name: 'Secret', icon: 'key', color: '#2b6cb0' }, { id: 'win', name: 'Milestone', icon: 'flame', color: '#e0621f' }];
const THEMES = [
  { id: 'classic', name: 'Grand Oak Library', desc: 'Candlelit oak & leather', a: '#4d2e1c', b: '#21120a', x: '#f4b942' },
  { id: 'arcane', name: 'Arcane Spire', desc: 'Starlit stone & crystals', a: '#33255a', b: '#100a22', x: '#7ef3ff' },
  { id: 'neon', name: 'Neon Archive', desc: 'Synthwave data stacks', a: '#121a3d', b: '#03040c', x: '#ff3df2' },
  { id: 'pixel', name: 'Pixel Dungeon', desc: '8-bit bricks & torches', a: '#4d4d5c', b: '#1c1c24', x: '#ffd23f' },
  { id: 'frost', name: 'Frostkeep Vault', desc: 'Icy halls of lore', a: '#2d4f6d', b: '#0a1726', x: '#bdf3ff' },
  { id: 'starship', name: 'Starship Datavault', desc: 'Sci-fi records deck', a: '#26303a', b: '#080c10', x: '#5cff9d' },
  { id: 'haunted', name: 'Haunted Manor', desc: 'Cobwebs & ghostly candles', a: '#2e2433', b: '#0c080f', x: '#9dffb0' },
  { id: 'sakura', name: 'Sakura Tea House', desc: 'Moon window & petals', a: '#5c2f3c', b: '#24121a', x: '#ffb7c5' },
  { id: 'forge', name: 'Dwarven Forge', desc: 'Iron, stone & embers', a: '#3d2a22', b: '#120a07', x: '#ff8a2a' },
  { id: 'atlantis', name: 'Sunken Atlantis', desc: 'Brass portholes & bubbles', a: '#0f4a55', b: '#03141c', x: '#6ff7e1' }];
const DUST_MODE = { neon: 'pixel', pixel: 'pixel', starship: 'pixel', frost: 'flake', sakura: 'petal', forge: 'ember', atlantis: 'bubble' };
const SORTS = [['custom', 'Shelf Order'], ['recent', 'Last Played'], ['title', 'A–Z'], ['newest', 'Newest'], ['platform', 'Platform'], ['color', 'Color'], ['entries', 'Most Entries'], ['type', 'Book Type']];
const ARRANGE = [['tidy', 'Tidy'], ['cozy', 'Cozy'], ['chaotic', 'Chaotic']];
const ACH = {
  first_book: { n: 'Once Upon a Save File', d: 'Create your first journal', xp: 50, i: 'book' },
  first_entry: { n: 'Dear Diary, I Died Again', d: 'Write your first entry', xp: 30, i: 'quill' },
  photo: { n: "Screenshot or It Didn't Happen", d: 'Add your first photo', xp: 30, i: 'star' },
  ten: { n: 'Chatterbox Chronicler', d: 'Write 10 entries', xp: 75, i: 'flame' },
  fifty: { n: 'Tome Titan', d: 'Write 50 entries', xp: 200, i: 'crown' },
  hundred: { n: 'The Lore Is Endless', d: 'Write 100 entries', xp: 400, i: 'trophy' },
  five_books: { n: 'Backlog Librarian', d: 'Have 5 journals on your shelf', xp: 100, i: 'gem' },
  boss: { n: 'Boss Battle Bard', d: 'Log a Boss entry', xp: 40, i: 'skull' },
  death5: { n: 'Git Gud', d: 'Log 5 deaths', xp: 60, i: 'ghost' },
  night: { n: 'Night Owl Grinder', d: 'Write an entry between midnight and 4 AM', xp: 40, i: 'moon' },
  backup: { n: 'Save Scummer', d: 'Export a backup of your library', xp: 50, i: 'shield' },
  decor: { n: 'Interior Decorator', d: 'Change the library theme', xp: 25, i: 'potion' },
  fashion: { n: 'Cover Story', d: 'Re-customize an existing journal', xp: 25, i: 'heart' },
  dice: { n: 'Natural 20', d: 'Roll a 20 on the shelf die', xp: 20, i: 'dice' },
  curtains: { n: 'Do Not Disturb', d: 'Close the curtains for some focused grinding', xp: 15, i: 'moon' }
};
const LEVEL_TITLES = [[1, 'Wandering Novice'], [2, 'Apprentice Scribe'], [3, 'Quest Scrivener'], [5, 'Lorekeeper'], [7, 'Archivist'], [10, 'Grand Chronicler'], [15, 'Legendary Loremaster'], [20, 'Mythic Scribe']];
const DEFAULT_BOOK = { title: '', platform: 'PC', type: 'tome', color: '#7a1f2b', trim: '#e8c15a', pattern: 'none', emblem: 'sword', font: 'cinzel', ink: 'caveat', paper: 'parchment', height: 'm', thick: 'm', pose: 'auto' };

/* ---------- state ---------- */
const S = { books: [], entries: {}, counts: {}, current: null, entryCount: 0, settings: {}, profile: {}, libQ: '' };
const J = { tab: 'log', q: '', tag: 'all', curTag: 'note', photo: null };
const DEF_SETTINGS = { theme: 'classic', sound: true, volume: .6, dust: true, sort: 'old', location: null, weather: null, introDone: false, lastBackup: null, shelfSort: 'custom', shelfStyle: 'cozy', curtains: 'open' };
const DEF_PROFILE = { xp: 0, achievements: {}, deaths: 0 };
const saveSettings = () => localStorage.setItem('ssc.settings', JSON.stringify(S.settings));
const saveProfile = () => localStorage.setItem('ssc.profile', JSON.stringify(S.profile));
function loadLocal() {
  try { S.settings = Object.assign({}, DEF_SETTINGS, JSON.parse(localStorage.getItem('ssc.settings') || '{}')); } catch { S.settings = { ...DEF_SETTINGS }; }
  try { S.profile = Object.assign({}, DEF_PROFILE, JSON.parse(localStorage.getItem('ssc.profile') || '{}')); } catch { S.profile = { ...DEF_PROFILE }; }
  S.profile.achievements = S.profile.achievements || {};
  if (!THEMES.some(t => t.id === S.settings.theme)) S.settings.theme = 'classic';
}

/* =============================================================
   IndexedDB
   ============================================================= */
const DB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('sidequest-scribe', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        d.createObjectStore('books', { keyPath: 'id' });
        d.createObjectStore('entries', { keyPath: 'id' }).createIndex('bookId', 'bookId');
        d.createObjectStore('photos', { keyPath: 'id' });
      };
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  req(store, fn, mode = 'readonly') {
    return new Promise((res, rej) => {
      const t = this.db.transaction(store, mode); const q = fn(t.objectStore(store));
      t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    });
  },
  all: (s) => DB.req(s, o => o.getAll()),
  get: (s, id) => DB.req(s, o => o.get(id)),
  put: (s, v) => DB.req(s, o => o.put(v), 'readwrite'),
  del: (s, id) => DB.req(s, o => o.delete(id), 'readwrite'),
  clear: (s) => DB.req(s, o => o.clear(), 'readwrite'),
  byBook: (id) => DB.req('entries', o => o.index('bookId').getAll(id)),
  putMany(s, arr) {
    return new Promise((res, rej) => {
      const t = this.db.transaction(s, 'readwrite'); const o = t.objectStore(s); arr.forEach(v => o.put(v));
      t.oncomplete = res; t.onerror = () => rej(t.error);
    });
  }
};
async function recount() {
  S.counts = {}; const all = await DB.all('entries');
  all.forEach(e => { S.counts[e.bookId] = (S.counts[e.bookId] || 0) + 1; }); S.entryCount = all.length;
}

/* =============================================================
   Sound effects (synthesized — no audio files needed)
   ============================================================= */
const SFX = {
  ctx: null, master: null, noiseBuf: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = S.settings.volume; this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate; const b = this.ctx.createBuffer(1, len, this.ctx.sampleRate); const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; this.noiseBuf = b;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + .02);
  },
  setVol(v) { if (this.master) this.master.gain.value = v; },
  ok() { return this.ctx && S.settings.sound; },
  tone(f, dur, { type = 'square', vol = .2, at = 0, slide = null, attack = .005 } = {}) {
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime + at;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + .05);
  },
  noise(dur, { at = 0, vol = .2, type = 'bandpass', freq = 1200, q = 1, sweep = null } = {}) {
    if (!this.ok()) return; const c = this.ctx, t = c.currentTime + at;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur); f.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random() * .5); s.stop(t + dur + .05);
  },
  play(name) {
    const T = this; if (!T.ok()) return;
    switch (name) {
      case 'tap': T.tone(720, .05, { type: 'triangle', vol: .14 }); break;
      case 'click': T.tone(980, .04, { vol: .08 }); break;
      case 'pull': T.noise(.28, { freq: 500, sweep: 180, vol: .3, type: 'lowpass' }); T.tone(150, .25, { type: 'sine', vol: .35, slide: 70 }); break;
      case 'flip': T.noise(.32, { freq: 3200, sweep: 700, vol: .2, q: .7 }); T.noise(.2, { at: .13, freq: 1900, sweep: 600, vol: .12 }); break;
      case 'open': T.noise(.6, { freq: 400, sweep: 2600, vol: .14, q: .5 }); T.tone(392, .35, { type: 'triangle', vol: .12, at: .18 }); T.tone(587, .45, { type: 'triangle', vol: .12, at: .3 }); T.tone(784, .6, { type: 'sine', vol: .08, at: .42 }); break;
      case 'close': T.noise(.22, { freq: 900, sweep: 250, vol: .22, type: 'lowpass' }); T.tone(120, .2, { type: 'sine', vol: .35, slide: 55 }); break;
      case 'scribble': for (let i = 0; i < 7; i++) T.noise(.05, { at: i * .05, freq: 2500 + Math.random() * 3000, vol: .1, q: 5 }); break;
      case 'save': T.play('scribble'); T.tone(988, .08, { at: .38, vol: .13 }); T.tone(1319, .28, { at: .46, vol: .13 }); break;
      case 'coin': T.tone(988, .07, { vol: .13 }); T.tone(1319, .22, { at: .07, vol: .13 }); break;
      case 'levelup': [523, 659, 784, 1047, 1319].forEach((f, i) => T.tone(f, .16, { at: i * .09, vol: .14 })); T.tone(1568, .6, { at: .48, vol: .12, type: 'triangle' }); break;
      case 'achieve': [784, 988, 1175].forEach((f, i) => T.tone(f, .7, { at: i * .06, type: 'triangle', vol: .11 })); T.tone(1568, .7, { at: .26, type: 'sine', vol: .1 }); break;
      case 'delete': T.tone(440, .1, { vol: .12 }); T.tone(330, .1, { at: .09, vol: .12 }); T.tone(196, .32, { at: .18, vol: .12, slide: 80 }); T.noise(.4, { at: .15, freq: 2000, sweep: 200, vol: .12 }); break;
      case 'camera': T.noise(.04, { freq: 5000, vol: .35, type: 'highpass' }); T.noise(.07, { at: .07, freq: 3000, vol: .25, type: 'highpass' }); T.tone(1800, .05, { at: .02, type: 'sine', vol: .05 }); break;
      case 'dice': for (let i = 0; i < 6; i++) T.noise(.04, { at: i * .065 + Math.random() * .02, freq: 1400 + i * 260, vol: .2, q: 3 }); T.tone(1047, .15, { at: .42, vol: .1 }); break;
      case 'theme': T.noise(.7, { freq: 250, sweep: 4200, vol: .14 }); [392, 523, 659, 784].forEach((f, i) => T.tone(f, .3, { at: .2 + i * .07, type: 'sine', vol: .11 })); break;
      case 'error': T.tone(190, .12, { type: 'sawtooth', vol: .1 }); T.tone(150, .2, { at: .12, type: 'sawtooth', vol: .1 }); break;
      case 'start': [262, 330, 392, 523, 659].forEach((f, i) => T.tone(f, .14, { at: i * .07, vol: .13 })); T.tone(1047, .5, { at: .36, type: 'triangle', vol: .1 }); break;
      case 'chime': T.tone(1319, .5, { type: 'sine', vol: .09 }); T.tone(1760, .6, { at: .08, type: 'sine', vol: .06 }); break;
      case 'glug': [0, .12, .24].forEach((a, i) => T.tone(300 - i * 40, .1, { at: a, type: 'sine', vol: .25, slide: 500 })); break;
      case 'thunder': T.noise(1.4, { freq: 180, sweep: 50, vol: .18, type: 'lowpass' }); break;
      case 'whoosh': T.noise(.4, { freq: 300, sweep: 3000, vol: .12, q: .6 }); break;
      case 'curtain': T.noise(.9, { freq: 700, sweep: 1900, vol: .13, q: .4 }); for (let i = 0; i < 6; i++) T.tone(2300 + Math.random() * 500, .05, { at: .05 + i * .08, type: 'triangle', vol: .035 }); break;
      case 'shuffle': for (let i = 0; i < 5; i++) T.noise(.12, { at: i * .09, freq: 600 + i * 150, sweep: 250, vol: .16, type: 'lowpass' }); T.tone(160, .2, { at: .5, type: 'sine', vol: .25, slide: 80 }); break;
    }
  }
};

/* =============================================================
   Visual FX: particles, toasts, xp, level up
   ============================================================= */
const FX = {
  cv: null, ctx: null, parts: [], w: 0, h: 0, dirty: false,
  init() { this.cv = $('#fx'); this.ctx = this.cv.getContext('2d'); this.resize(); },
  resize() { const a = $('#app'); const dpr = Math.min(2, devicePixelRatio || 1); this.w = a.clientWidth; this.h = a.clientHeight; this.cv.width = this.w * dpr; this.cv.height = this.h * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); },
  burst(x, y, o = {}) {
    const cols = o.colors || [cssVar('--accent'), '#ffffff', cssVar('--accent2')];
    for (let i = 0; i < (o.n || 26); i++) {
      const a = o.angle != null ? o.angle + rand(-(o.spread || .6), o.spread || .6) : rand(0, Math.PI * 2); const sp = rand(o.min || 1.5, o.max || 5.5);
      this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.g ?? .13, life: 1, decay: rand(.012, .028), s: rand(2.5, o.size || 6), c: pick(cols), shape: o.shape || 'pixel', r: rand(0, 6), vr: rand(-.2, .2) });
    }
  },
  frame() {
    const c = this.ctx; if (!this.parts.length) { if (this.dirty) { c.clearRect(0, 0, this.w, this.h); this.dirty = false; } return; }
    c.clearRect(0, 0, this.w, this.h); this.dirty = true;
    for (const p of this.parts) {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .985; p.life -= p.decay; p.r += p.vr;
      c.globalAlpha = clamp(p.life, 0, 1); c.fillStyle = p.c;
      if (p.shape === 'spark') { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillRect(-p.s, -.8, p.s * 2, 1.6); c.fillRect(-.8, -p.s, 1.6, p.s * 2); c.restore(); }
      else if (p.shape === 'conf') { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); }
      else c.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.s), Math.round(p.s));
    }
    c.globalAlpha = 1; this.parts = this.parts.filter(p => p.life > 0 && p.y < this.h + 20);
  }
};
function centerIn(box, el) { const r = el.getBoundingClientRect(), b = box.getBoundingClientRect(); box.scrollTo({ top: box.scrollTop + (r.top - b.top) - box.clientHeight / 2 + r.height / 2, behavior: 'smooth' }); }
function ptOf(el) { const a = $('#app').getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 }; }

const toastQ = []; let toastBusy = false;
function toast(html, opts = {}) { toastQ.push({ html, opts }); if (!toastBusy) nextToast(); }
async function nextToast() {
  const t = toastQ.shift(); if (!t) { toastBusy = false; return; } toastBusy = true;
  const el = document.createElement('div'); el.className = 'toast ' + (t.opts.cls || ''); el.innerHTML = t.html; $('#toasts').appendChild(el);
  await sleep(30); el.classList.add('show'); if (t.opts.sound) SFX.play(t.opts.sound);
  await sleep(t.opts.ms || 2600); el.classList.remove('show'); await sleep(450); el.remove(); nextToast();
}
const info = (msg, ms = 2000) => toast(`<span>${msg}</span>`, { cls: 'plain', ms });
function floatXP(n, el) {
  const p = el ? ptOf(el) : { x: FX.w / 2, y: FX.h / 2 }; const f = document.createElement('div'); f.className = 'xpfloat'; f.textContent = `+${n} XP`;
  f.style.left = (p.x - 30) + 'px'; f.style.top = (p.y - 20) + 'px'; $('#app').appendChild(f); setTimeout(() => f.remove(), 1400);
}

/* ---------- XP / levels / achievements ---------- */
const levelOf = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
const xpFor = L => 40 * (L - 1) * (L - 1);
const titleFor = L => { let t = LEVEL_TITLES[0][1]; for (const [l, n] of LEVEL_TITLES) if (L >= l) t = n; return t; };
function updatePlayer() {
  const xp = S.profile.xp, L = levelOf(xp), a = xpFor(L), b = xpFor(L + 1);
  $('#pLv').textContent = L; $('#pTitle').textContent = titleFor(L); $('#pXP').style.width = ((xp - a) / (b - a) * 100).toFixed(1) + '%';
}
function addXP(n, el) {
  const before = levelOf(S.profile.xp); S.profile.xp += n; saveProfile(); updatePlayer(); if (el !== false) floatXP(n, el);
  const after = levelOf(S.profile.xp); if (after > before) setTimeout(() => levelUp(after), 700);
}
function unlock(key) {
  if (S.profile.achievements[key] || !ACH[key]) return; const a = ACH[key];
  S.profile.achievements[key] = Date.now(); saveProfile();
  toast(`<span class="ti">${icon(a.i)}</span><span><small>Achievement Unlocked · +${a.xp} XP</small><b>${esc(a.n)}</b></span>`, { cls: 'ach', sound: 'achieve', ms: 3000 });
  addXP(a.xp, false);
}
function levelUp(L) {
  SFX.play('levelup'); const d = document.createElement('div'); d.className = 'levelup';
  d.innerHTML = `<div class="rays"></div><div class="lvtxt"><h2>LEVEL UP!</h2><p>Level ${L} · ${esc(titleFor(L))}</p></div>`; $('#app').appendChild(d);
  for (let i = 0; i < 4; i++) setTimeout(() => FX.burst(FX.w * rand(.15, .85), FX.h * .35, { n: 40, shape: 'conf', size: 9, max: 7, colors: ['#ffd23f', '#ff5a3d', '#3df5ff', '#7dff6a', '#ff4fd8', '#fff'] }), i * 180);
  setTimeout(() => d.classList.add('out'), 2300); setTimeout(() => d.remove(), 2850);
}

/* =============================================================
   Book rendering
   ============================================================= */
const SPINE_SHADE = 'linear-gradient(90deg, rgba(0,0,0,.5) 0%, rgba(255,255,255,.24) 14%, rgba(255,255,255,.06) 32%, rgba(0,0,0,.05) 62%, rgba(0,0,0,.48) 100%)';
const COVER_SHADE = 'linear-gradient(90deg, rgba(0,0,0,.45) 0, rgba(255,255,255,.14) 5%, transparent 11%), radial-gradient(120% 90% at 30% 15%, rgba(255,255,255,.16), transparent 60%), linear-gradient(transparent 55%, rgba(0,0,0,.32))';
const HEAD_SHADE = 'linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.45)), radial-gradient(120% 140% at 20% 0, rgba(255,255,255,.18), transparent 60%)';
function patternCSS(p) {
  switch (p) {
    case 'stripes': return 'repeating-linear-gradient(135deg, rgba(255,255,255,.1) 0 5px, transparent 5px 11px)';
    case 'dots': return 'radial-gradient(rgba(255,255,255,.2) 1.2px, transparent 1.8px) 0 0/8px 8px';
    case 'checker': return 'conic-gradient(rgba(0,0,0,.18) 25%, transparent 0 50%, rgba(0,0,0,.18) 0 75%, transparent 0) 0 0/10px 10px';
    case 'scales': return 'radial-gradient(circle at 50% 100%, transparent 4px, rgba(0,0,0,.25) 5px, transparent 6px) 0 0/10px 7px';
    case 'circuit': return 'linear-gradient(90deg, rgba(255,255,255,.13) 1px, transparent 1px) 0 0/12px 12px, linear-gradient(rgba(255,255,255,.13) 1px, transparent 1px) 0 0/12px 12px';
    default: return 'linear-gradient(transparent, transparent)';
  }
}
const fontOf = b => FONTS.find(f => f.id === b.font) || FONTS[0];
const inkOf = b => INKS.find(f => f.id === b.ink) || INKS[0];
const dimsOf = b => ({ h: { s: 106, m: 122, t: 138 }[b.height] || 122, w: { s: 32, m: 40, l: 50 }[b.thick] || 40 });
function bookVars(b) { const f = fontOf(b); return `--c:${b.color};--trim:${b.trim};--font:${f.css};--fs:${(12 * f.s).toFixed(1)}px;`; }
function spineHTML(b, cls = '', extra = '') {
  const { h, w } = dimsOf(b);
  return `<button class="book t-${b.type} ${cls}" data-id="${b.id}" style="${bookVars(b)}--h:${h}px;--w:${w}px;background:${SPINE_SHADE}, ${patternCSS(b.pattern)}, ${b.color};${extra}" aria-label="${esc(b.title)}">
    <span class="band b1"></span><span class="emb">${icon(b.emblem)}</span><span class="stitle">${esc(b.title || 'Untitled')}</span><span class="band b2"></span></button>`;
}
function coverHTML(b, style = '') {
  return `<div class="cover t-${b.type}" style="${bookVars(b)}background:${COVER_SHADE}, ${patternCSS(b.pattern)}, ${b.color};${style}">
    <span class="cemb">${icon(b.emblem)}</span><span class="ctitle">${esc(b.title || 'Untitled Quest')}</span><span class="cplat">${esc(b.platform || '')}</span></div>`;
}
const miniSpine = (type) => `<span class="book mini t-${type}" style="--c:#7a1f2b;--trim:#e8c15a;--h:46px;--w:18px;background:${SPINE_SHADE}, #7a1f2b"><span class="band b1"></span><span class="band b2"></span></span>`;
// A book lying on its side: outer box is h×w, inner spine rotated -90°
function flatHTML(b, cls = '', outer = '', st = '') {
  const { h, w } = dimsOf(b);
  return `<div class="flat ${outer}" style="${st}width:${h}px;height:${w}px;left:${(hashN(b.id) % 9) - 4}px"><div class="rot" style="width:${w}px;height:${h}px;left:${(h - w) / 2}px;top:${(w - h) / 2}px">${spineHTML(b, cls)}</div></div>`;
}

const DECOS = {
  potion: `<svg viewBox="0 0 40 56" class="deco" data-deco="potion"><rect x="16" y="1" width="8" height="7" rx="1.5" fill="#8b5a2b"/><path d="M15 8h10v10l9 13a12 12 0 0 1-10 21h-8A12 12 0 0 1 6 31l9-13z" fill="rgba(210,235,255,.22)" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/><g class="liq"><path d="M8 33h24a11 11 0 0 1-8 17h-8A11 11 0 0 1 8 33z" fill="var(--accent2)" opacity=".9"/></g><circle cx="15" cy="40" r="2" fill="#fff" opacity=".7"/><circle cx="22" cy="44" r="1.3" fill="#fff" opacity=".5"/><path d="M13 12v10" stroke="rgba(255,255,255,.5)" stroke-width="1.5"/></svg>`,
  d20: `<svg viewBox="0 0 40 46" class="deco" data-deco="d20"><path d="M20 3l16 9.5v21L20 43 4 33.5v-21z" fill="#b8312f" stroke="#6e1a18" stroke-width="1.2"/><path d="M20 3L9 28h22zM9 28L4 12.5M31 28l5-15.5M9 28l11 15 11-15" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/><path d="M20 3L9 28h22z" fill="rgba(255,255,255,.08)"/><text x="20" y="24" font-size="7" text-anchor="middle" fill="#fff" font-family="'Press Start 2P',monospace">20</text></svg>`,
  plant: `<svg viewBox="0 0 40 56" class="deco" data-deco="plant"><path d="M10 38h20l-3 17H13z" fill="#b5623a"/><rect x="8" y="35" width="24" height="5" rx="1.5" fill="#d27a4b"/><path d="M20 36C18 26 10 22 6 22c3 6 8 10 14 14z" fill="#3f8a3a"/><path d="M20 36c1-12 8-18 13-19-2 7-6 13-13 19z" fill="#4ea347"/><path d="M20 36c-1-10 1-20 4-26 2 8 0 17-4 26z" fill="#5cb852"/></svg>`,
  candle: `<svg viewBox="0 0 40 56" class="deco" data-deco="candle"><ellipse cx="20" cy="53" rx="13" ry="3" fill="#c9a24a"/><rect x="14" y="26" width="12" height="26" rx="2" fill="#f3e6c8"/><path d="M14 30c3 2 4 0 6 3s4-1 6 0" fill="none" stroke="#e5d2a6" stroke-width="2"/><g class="cflame"><path d="M20 10c3 5 5 8 5 11a5 5 0 0 1-10 0c0-3 2-6 5-11z" fill="#ffb22e"/><path d="M20 15c1.6 3 2.5 4.5 2.5 6a2.5 2.5 0 0 1-5 0c0-1.5.9-3 2.5-6z" fill="#fff6c8"/></g><circle cx="20" cy="18" r="14" fill="rgba(255,190,90,.18)"/></svg>`,
  pad: `<svg viewBox="0 0 48 40" class="deco" style="width:48px;height:40px" data-deco="pad"><path d="M12 10h24a10 10 0 0 1 9.8 8l1.6 10a6 6 0 0 1-10.2 5L33 29H15l-4.2 4a6 6 0 0 1-10.2-5l1.6-10A10 10 0 0 1 12 10z" fill="#2c2f3a" stroke="#14161c" stroke-width="1.2"/><path d="M11 17v8M7 21h8" stroke="#9aa3b5" stroke-width="3" stroke-linecap="round"/><circle cx="34" cy="18" r="2.2" fill="#e74c3c"/><circle cx="38.5" cy="22" r="2.2" fill="#3498db"/><circle cx="29.5" cy="22" r="2.2" fill="#f1c40f"/><circle cx="34" cy="26" r="2.2" fill="#2ecc71"/></svg>`,
  hourglass: `<svg viewBox="0 0 40 56" class="deco" data-deco="hourglass"><rect x="7" y="3" width="26" height="4" rx="1.5" fill="#8b5a2b"/><rect x="7" y="49" width="26" height="4" rx="1.5" fill="#8b5a2b"/><path d="M11 7h18c0 10-7 13-7 21s7 11 7 21H11c0-10 7-13 7-21s-7-11-7-21z" fill="rgba(220,240,255,.25)" stroke="rgba(255,255,255,.6)"/><path d="M14 13h12c-1 4-4 7-6 9-2-2-5-5-6-9zM12.5 47c1-6 4-9 7.5-10 3.5 1 6.5 4 7.5 10z" fill="#e9c46a"/><path d="M20 28v9" stroke="#e9c46a" stroke-width="1"/></svg>`
};

/* =============================================================
   Library screen — sorting, poses, search
   ============================================================= */
const LEAN_DEG = 11, LEAN_SIN = Math.sin(LEAN_DEG * Math.PI / 180);
function hueOf(hex) {
  const n = parseInt(String(hex).slice(1), 16) || 0; const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < .08) return 400 + (mx + mn) * 50;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360;
}
function sortedBooks() {
  const t = (a, b) => (a.title || '').localeCompare(b.title || '', undefined, { numeric: true, sensitivity: 'base' });
  const by = {
    custom: (a, b) => (a.order ?? 0) - (b.order ?? 0), recent: (a, b) => (b.updated || 0) - (a.updated || 0), title: t,
    newest: (a, b) => (b.created || 0) - (a.created || 0), platform: (a, b) => (a.platform || '').localeCompare(b.platform || '') || t(a, b),
    color: (a, b) => hueOf(a.color) - hueOf(b.color), entries: (a, b) => (S.counts[b.id] || 0) - (S.counts[a.id] || 0) || t(a, b),
    type: (a, b) => BOOK_TYPES.findIndex(x => x.id === a.type) - BOOK_TYPES.findIndex(x => x.id === b.type) || t(a, b)
  };
  return [...S.books].sort(by[S.settings.shelfSort] || by.custom);
}
function poseOf(b) {
  if (b.pose && b.pose !== 'auto') return b.pose;
  const st = S.settings.shelfStyle; if (st === 'tidy') return 'upright';
  const h = hashN(b.id + 'pose') % 100, f = st === 'chaotic' ? 32 : 15, l = st === 'chaotic' ? 30 : 17;
  return h < f ? 'flat' : h < f + l ? 'lean' : 'upright';
}
function libStatsText() {
  const n = S.books.length; return n ? `${n} journal${n === 1 ? '' : 's'} · ${S.entryCount} entr${S.entryCount === 1 ? 'y' : 'ies'}` : 'Your quest library awaits';
}
function renderLibrary(drop = false, freshId = null) {
  const wrap = $('#shelves'); const W = (wrap.clientWidth || 340) - 22;
  const q = (S.libQ || '').trim().toLowerCase(), searching = !!q;
  let books = sortedBooks(); if (searching) books = books.filter(b => `${b.title} ${b.platform}`.toLowerCase().includes(q));
  // Group books into placement units: standing, leaning, or piles of flat books
  const units = []; let pile = null;
  for (const b of books) {
    const pose = poseOf(b), { h, w } = dimsOf(b);
    if (pose === 'flat') {
      if (pile && pile.books.length < 3 && pile.th + w <= 136) { pile.books.push(b); pile.th += w; pile.w = Math.max(pile.w, h + 13); }
      else { pile = { kind: 'pile', books: [b], th: w, w: h + 13 }; units.push(pile); }
      continue;
    }
    pile = null;
    if (pose === 'lean') { const m = Math.round(h * LEAN_SIN) - 2; units.push({ kind: 'lean', b, m, w: w + 3 + m }); }
    else units.push({ kind: 'up', b, w: w + 3 });
  }
  if (!searching) units.push({ kind: 'ghost', w: 47 });
  const shelves = []; let cur = [], acc = 0;
  for (const u of units) { if (acc + u.w > W && cur.length) { shelves.push({ items: cur, used: acc }); cur = []; acc = 0; } cur.push(u); acc += u.w; }
  if (cur.length || !shelves.length) shelves.push({ items: cur, used: acc });
  const minShelves = Math.max(3, Math.ceil((wrap.clientHeight || 400) / 160));
  while (shelves.length < minShelves) shelves.push({ items: [], used: 0 });
  const decoKeys = Object.keys(DECOS); let di = 0, bi = 0;
  const cls = b => `${b.id === freshId ? 'fresh ' : ''}${searching ? 'match' : ''}`;
  const delay = () => `--d:${(bi++ * .045).toFixed(3)}s`;
  const html = shelves.map((sh, si) => {
    let inner = sh.items.map((u, i, arr) => {
      if (u.kind === 'ghost') return `<button class="ghost" id="ghostBook" aria-label="New journal">${ui('plus')}</button>`;
      if (u.kind === 'up') return spineHTML(u.b, (drop ? 'drop ' : '') + cls(u.b), delay());
      if (u.kind === 'lean') {
        const n = arr[i + 1]; const right = !!n && (n.kind === 'up' || n.kind === 'lean');
        return `<div class="slot ${right ? 'lean-r' : 'lean-l'}" style="--lean:${LEAN_DEG}deg;${right ? 'margin-right' : 'margin-left'}:${u.m}px">${spineHTML(u.b, (drop ? 'drop ' : '') + cls(u.b), delay())}</div>`;
      }
      return `<div class="pile" style="width:${u.w - 3}px">${u.books.map(b => flatHTML(b, cls(b), drop ? 'drop' : '', delay() + ';')).join('')}</div>`;
    }).join('');
    const room = W - sh.used;
    if (room > 54 && !searching) { const k = decoKeys[(si * 2 + di++) % decoKeys.length]; inner += DECOS[k].replace('class="deco"', `class="deco${sh.items.length ? '' : (si % 2 ? '' : ' left')}"`); }
    if (!sh.items.length && room > 140 && si % 2 && !searching) inner = DECOS[decoKeys[(si + 3) % decoKeys.length]].replace('class="deco"', 'class="deco left"') + inner;
    return `<div class="shelf">${inner}</div>`;
  }).join('');
  let extra = '';
  if (!S.books.length) extra = `<div class="hint" style="top:56px">◀ Tap to start your first journal</div>`;
  else if (searching && !books.length) extra = `<div class="noresults"><b>No tomes found</b>Nothing on the shelves matches “${esc(S.libQ)}”.</div>`;
  wrap.innerHTML = html + extra;
  $('#libStats').textContent = searching ? `${books.length} of ${S.books.length} journals match` : libStatsText();
  renderLibBar();
}
function renderLibBar() {
  const last = [...S.books].sort((a, b) => (b.updated || 0) - (a.updated || 0))[0];
  $('#libbar').innerHTML = (last ? `<button class="cta alt" id="btnContinue">${ui('play')}<span class="t">Continue: ${esc(last.title)}</span></button>` : '') +
    `<button class="cta" id="btnNew" ${last ? 'style="flex:0 0 auto;padding:14px 16px"' : ''}>${ui('plus')}<span class="t">${last ? 'New' : 'Begin a New Quest'}</span></button>`;
}
function renderLibTools() {
  const lbl = t => `<span class="chiplabel">${t}</span>`;
  $('#sortRow').innerHTML = lbl('Sort') + SORTS.map(([k, n]) => `<button class="tagchip ${S.settings.shelfSort === k ? 'on' : ''}" data-sort="${k}" style="--tc:rgba(var(--glow),.5)">${n}</button>`).join('');
  $('#arrRow').innerHTML = lbl('Arrange') + ARRANGE.map(([k, n]) => `<button class="tagchip ${S.settings.shelfStyle === k ? 'on' : ''}" data-arr="${k}" style="--tc:rgba(var(--glow),.5)">${n}</button>`).join('');
}
function toggleLibTools(force) {
  const t = $('#libtools'); const show = force ?? t.hidden; t.hidden = !show; $('#btnLibSearch').classList.toggle('on', show);
  if (show) { renderLibTools(); SFX.play('whoosh'); setTimeout(() => $('#libSearch').focus({ preventScroll: true }), 60); }
  else { $('#libSearch').blur(); if (S.libQ) { S.libQ = ''; $('#libSearch').value = ''; renderLibrary(false); } SFX.play('tap'); }
}
function idleWiggle() {
  if (!$('#library').classList.contains('active') || document.hidden) return;
  const b = pick($$('#shelves .book')); if (!b) return; b.classList.remove('wiggle'); void b.offsetWidth; b.classList.add('wiggle'); setTimeout(() => b.classList.remove('wiggle'), 700);
}

/* ---------- open / close a book ---------- */
let busy = false;
async function loadEntries(id) { if (!S.entries[id]) S.entries[id] = (await DB.byBook(id)).sort((a, b) => a.ts - b.ts); return S.entries[id]; }
function showScreen(id) { $$('.screen').forEach(s => s.classList.toggle('active', s.id === id)); }
async function openBook(id, el) {
  if (busy) return; const b = S.books.find(x => x.id === id); if (!b) return; busy = true;
  try {
    SFX.play('pull'); if (el) el.classList.add('pulled');
    $('#libSearch').blur();
    await Promise.all([loadEntries(id), sleep(el ? 300 : 0)]);
    S.current = b; Object.assign(J, { tab: 'log', q: '', tag: 'all', photo: null }); $('#searchbar').hidden = true; $('#searchIn').value = '';
    renderJournal();
    const app = $('#app'), ar = app.getBoundingClientRect(), locked = app.clientWidth < app.clientHeight && ar.width > ar.height;
    if (el && !locked) {
      const r = el.getBoundingClientRect();
      const fly = document.createElement('div'); fly.className = 'flybook';
      fly.innerHTML = `<div class="fb-pages paper" data-paper="${b.paper}" style="position:absolute;margin:0"></div><div class="fb-cover">${coverHTML(b)}</div>`;
      Object.assign(fly.style, { left: (r.left - ar.left) + 'px', top: (r.top - ar.top) + 'px', width: r.width + 'px', height: r.height + 'px' });
      app.appendChild(fly); void fly.offsetWidth;
      const W = Math.min(ar.width * .68, 290), H = W * 1.36;
      fly.classList.add('grow'); Object.assign(fly.style, { left: (ar.width - W) / 2 + 'px', top: (ar.height - H) / 2 + 'px', width: W + 'px', height: H + 'px' });
      SFX.play('whoosh'); await sleep(540);
      fly.classList.add('opening'); SFX.play('open');
      FX.burst(ar.width / 2 + 20, ar.height / 2, { n: 34, shape: 'spark', g: .02, max: 4, size: 7 });
      await sleep(600);
      showScreen('journal'); fly.classList.add('fade'); setTimeout(() => fly.remove(), 450);
    } else { showScreen('journal'); SFX.play('open'); }
    el && el.classList.remove('pulled');
    scrollLogToEnd(false);
  } finally { busy = false; }
}
function closeBook() {
  SFX.play('close'); const id = S.current && S.current.id; showScreen('library'); renderLibrary(false);
  const el = id && $(`#shelves .book[data-id="${id}"]`); if (el) { el.classList.add('returned'); setTimeout(() => el.classList.remove('returned'), 600); }
  S.current = null; $('#entryText').blur();
}

/* =============================================================
   Journal screen
   ============================================================= */
function renderJournal() {
  const b = S.current; if (!b) return; const ink = inkOf(b); const arr = S.entries[b.id] || [];
  const jr = $('#journal'); jr.setAttribute('style', `${bookVars(b)}--ink-font:${ink.css};--ink-size:${ink.size}px;`);
  const head = $('#jhead'); head.className = 'jhead t-' + b.type;
  head.style.background = `${HEAD_SHADE}, ${patternCSS(b.pattern)}, ${b.color}`;
  head.innerHTML = `<button class="jbtn" id="jBack" aria-label="Back to shelf">${ui('back')}</button>
    <span class="jemb">${icon(b.emblem)}</span>
    <div class="jtitle"><h2>${esc(b.title)}</h2><small>${esc(b.platform)} · ${arr.length} entr${arr.length === 1 ? 'y' : 'ies'}</small></div>
    <button class="jbtn" id="jSearch" aria-label="Search">${ui('search')}</button>
    <button class="jbtn" id="jEdit" aria-label="Customize">${ui('palette')}</button>`;
  $('#paper').dataset.paper = b.paper;
  $$('#jtabs button').forEach(t => t.classList.toggle('on', t.dataset.tab === J.tab));
  $$('.pane').forEach(p => p.classList.toggle('active', p.id === 'pane' + J.tab[0].toUpperCase() + J.tab.slice(1)));
  $('#composer').hidden = J.tab !== 'log';
  renderTagRow(); renderFilterTags();
  if (J.tab === 'log') renderEntries(); else if (J.tab === 'gallery') renderGallery(); else renderStats();
  $('#sortBtn').innerHTML = ui('sort');
}
function renderTagRow() {
  $('#tagRow').innerHTML = TAGS.map(t => `<button type="button" class="tagchip ${J.curTag === t.id ? 'on' : ''}" data-tag="${t.id}" style="--tc:${t.color}">${icon(t.icon)}${t.name}</button>`).join('');
}
function renderFilterTags() {
  $('#filterTags').innerHTML = `<button class="tagchip ${J.tag === 'all' ? 'on' : ''}" data-ftag="all" style="--tc:#666">All</button>` +
    TAGS.map(t => `<button class="tagchip ${J.tag === t.id ? 'on' : ''}" data-ftag="${t.id}" style="--tc:${t.color}">${icon(t.icon)}${t.name}</button>`).join('') +
    `<button class="tagchip ${J.tag === 'photo' ? 'on' : ''}" data-ftag="photo" style="--tc:#e05780">${ui('camera')}Photos</button>`;
}
function filtered() {
  let arr = [...(S.entries[S.current.id] || [])];
  if (J.q) { const q = J.q.toLowerCase(); arr = arr.filter(e => (e.text || '').toLowerCase().includes(q)); }
  if (J.tag === 'photo') arr = arr.filter(e => e.photoId); else if (J.tag !== 'all') arr = arr.filter(e => e.tag === J.tag);
  if (S.settings.sort === 'new') arr.reverse();
  return arr;
}
const rotFor = id => ((hashN(id) % 5) - 2) * .7;
function entryHTML(e, cls = '') {
  const t = TAGS.find(x => x.id === e.tag) || TAGS[0];
  return `<article class="entry ${cls}" data-id="${e.id}">
    <header class="stamp">${ui('clock')}<time>${fmtStamp(e.ts)}</time>${e.edited ? '<em>(edited)</em>' : ''}<span class="tag" style="--tc:${t.color}">${icon(t.icon)}${t.name}</span></header>
    ${e.text ? `<p class="etext">${esc(e.text).replace(/\n/g, '<br>')}</p>` : ''}
    ${e.photoId ? `<figure class="polaroid" style="--rot:${rotFor(e.id)}deg"><img data-photo="${e.photoId}" alt="Screenshot"><figcaption>${fmtShort(e.ts)}</figcaption></figure>` : ''}
    <div class="eactions"><button data-act="edit">${ui('edit')}Edit</button>${e.photoId ? `<button data-act="view">${ui('image')}View</button>` : ''}<button data-act="del" class="del">${ui('trash')}Delete</button></div>
  </article>`;
}
function renderEntries(newId = null) {
  const list = $('#entries'); const all = S.entries[S.current.id] || []; const arr = filtered();
  if (!all.length) {
    list.innerHTML = `<div class="empty"><div class="big">${icon('quill')}</div><h3>A blank page awaits</h3><p>Every legend starts with a single save.<br>Log your first moment below!</p></div>`; return;
  }
  if (!arr.length) { list.innerHTML = `<div class="empty"><div class="big">${icon('ghost')}</div><h3>Nothing found</h3><p>No entries match that search.</p></div>`; return; }
  const first = startOfDay(all[0].ts); let html = '', last = '';
  for (const e of arr) {
    const k = dayKey(e.ts);
    if (k !== last) { const n = Math.round((startOfDay(e.ts) - first) / 864e5) + 1; html += `<div class="chapter"><div><b>Day ${n} of the Quest</b><small>${fmtLong(e.ts)}</small></div></div>`; last = k; }
    html += entryHTML(e, e.id === newId ? 'inked' : '');
  }
  list.innerHTML = html; hydratePhotos(list);
}
const photoCache = new Map();
async function getPhoto(id) { if (photoCache.has(id)) return photoCache.get(id); const p = await DB.get('photos', id); const d = p ? p.data : ''; photoCache.set(id, d); return d; }
function hydratePhotos(root) { $$('img[data-photo]', root).forEach(async img => { img.src = await getPhoto(img.dataset.photo); }); }
function scrollLogToEnd(smooth = true) {
  const p = $('#paneLog'); requestAnimationFrame(() => { const top = S.settings.sort === 'new' ? 0 : p.scrollHeight; p.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' }); });
}
function renderGallery() {
  const arr = (S.entries[S.current.id] || []).filter(e => e.photoId).reverse(); const pane = $('#paneGallery');
  if (!arr.length) { pane.innerHTML = `<div class="empty"><div class="big">${icon('star')}</div><h3>No memories yet</h3><p>Snap a screenshot of an epic moment and it'll be pinned here.</p></div>`; return; }
  pane.innerHTML = `<div class="shead">Memory Wall</div><div class="gallery">${arr.map(e => `<button class="gtile" data-eid="${e.id}" style="--rot:${rotFor(e.id)}deg"><img data-photo="${e.photoId}" alt=""><span>${fmtShort(e.ts)}</span></button>`).join('')}</div>`;
  hydratePhotos(pane);
}
function renderStats() {
  const arr = S.entries[S.current.id] || []; const pane = $('#paneStats');
  if (!arr.length) { pane.innerHTML = `<div class="empty"><div class="big">${icon('trophy')}</div><h3>No stats yet</h3><p>Your quest stats will appear after your first entry.</p></div>`; return; }
  const days = [...new Set(arr.map(e => dayKey(e.ts)))].sort();
  let longest = 0, cur = 0, prev = null;
  for (const d of days) { const t = new Date(d + 'T00:00').getTime(); cur = (prev && Math.round((t - prev) / 864e5) === 1) ? cur + 1 : 1; longest = Math.max(longest, cur); prev = t; }
  const lastDay = new Date(days[days.length - 1] + 'T00:00').getTime(); const gap = Math.round((startOfDay(Date.now()) - lastDay) / 864e5); const streak = gap <= 1 ? cur : 0;
  const words = arr.reduce((s, e) => s + (e.text ? e.text.trim().split(/\s+/).filter(Boolean).length : 0), 0);
  const hours = new Array(24).fill(0); arr.forEach(e => hours[new Date(e.ts).getHours()]++); const ph = hours.indexOf(Math.max(...hours));
  const phTxt = new Date(2000, 0, 1, ph).toLocaleTimeString(undefined, { hour: 'numeric' });
  const counts = TAGS.map(t => ({ t, n: arr.filter(e => e.tag === t.id).length })).filter(x => x.n); const max = Math.max(...counts.map(x => x.n), 1);
  const span = Math.round((startOfDay(arr[arr.length - 1].ts) - startOfDay(arr[0].ts)) / 864e5) + 1;
  pane.innerHTML = `<div class="shead">Quest Stats</div><div class="statgrid">
    <div class="stat"><b>${arr.length}</b><span>Entries</span></div><div class="stat"><b>${arr.filter(e => e.photoId).length}</b><span>Screenshots</span></div>
    <div class="stat"><b>${days.length}</b><span>Days Logged</span></div><div class="stat"><b>${span}</b><span>Day Adventure</span></div>
    <div class="stat"><b>${streak}</b><span>Current Streak</span></div><div class="stat"><b>${longest}</b><span>Best Streak</span></div>
    <div class="stat"><b>${words}</b><span>Words Written</span></div><div class="stat"><b style="font-size:13px">${phTxt}</b><span>Peak Gaming Hour</span></div>
    <div class="stat wide"><span>Entry Types</span><div class="bars">${counts.map(x => `<div class="barrow"><span>${x.t.name}</span><span class="tr"><i style="width:${x.n / max * 100}%;--tc:${x.t.color}"></i></span><span>${x.n}</span></div>`).join('')}</div></div>
    <div class="stat wide"><span>Quest Began</span><b style="font-size:11px;line-height:1.6;margin:6px 0 0">${fmtLong(arr[0].ts)}</b></div>
  </div>`;
}

/* ---------- composer ---------- */
function readImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => {
      const max = 1600, s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .84));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); }; img.src = url;
  });
}
function renderPhotoPreview() {
  const p = $('#ppreview'); if (!J.photo) { p.hidden = true; p.innerHTML = ''; return; }
  p.hidden = false; p.innerHTML = `<img src="${J.photo}" alt=""><span>Screenshot attached!</span><button type="button" id="rmPhoto">Remove</button>`;
}
function autoGrow() { const t = $('#entryText'); t.style.height = '46px'; t.style.height = Math.min(130, t.scrollHeight + 2) + 'px'; }
async function submitEntry() {
  const b = S.current; if (!b) return; const ta = $('#entryText'); const text = ta.value.trim();
  if (!text && !J.photo) { SFX.play('error'); const c = $('#composer'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); return; }
  let photoId = null;
  if (J.photo) { photoId = uid(); await DB.put('photos', { id: photoId, bookId: b.id, data: J.photo }); photoCache.set(photoId, J.photo); }
  const e = { id: uid(), bookId: b.id, text, tag: J.curTag, photoId, ts: Date.now() };
  await DB.put('entries', e); (S.entries[b.id] = S.entries[b.id] || []).push(e); S.entryCount++; S.counts[b.id] = (S.counts[b.id] || 0) + 1;
  b.updated = e.ts; await DB.put('books', b);
  ta.value = ''; autoGrow(); J.photo = null; renderPhotoPreview();
  if (J.q || J.tag !== 'all') { J.q = ''; J.tag = 'all'; $('#searchIn').value = ''; renderFilterTags(); }
  SFX.play('save');
  const sb = $('#saveBtn'), p = ptOf(sb); FX.burst(p.x, p.y, { n: 30, angle: -Math.PI / 2 - .5, spread: 1, max: 7, shape: 'spark' });
  renderEntries(e.id); $('#jhead small').textContent = `${b.platform} · ${S.entries[b.id].length} entr${S.entries[b.id].length === 1 ? 'y' : 'ies'}`;
  const el = $(`.entry[data-id="${e.id}"]`);
  if (el) { const q = document.createElement('span'); q.className = 'quillfx'; q.innerHTML = icon('quill'); el.appendChild(q); setTimeout(() => q.remove(), 1200); centerIn($('#paneLog'), el); }
  addXP(10 + (photoId ? 15 : 0), sb);
  const all = S.entries[b.id], n = S.entryCount;
  unlock('first_entry'); if (photoId) unlock('photo'); if (n >= 10) unlock('ten'); if (n >= 50) unlock('fifty'); if (n >= 100) unlock('hundred');
  if (e.tag === 'boss') unlock('boss');
  if (e.tag === 'death') { S.profile.deaths = (S.profile.deaths || 0) + 1; saveProfile(); if (S.profile.deaths >= 5) unlock('death5'); }
  if (new Date(e.ts).getHours() < 4) unlock('night');
  if (all.length % 25 === 0) toast(`<span class="ti">${icon('book')}</span><span><small>Milestone</small><b>${all.length} entries in ${esc(b.title)}!</b></span>`, { sound: 'chime' });
}
async function deleteEntry(id) {
  const b = S.current, arr = S.entries[b.id], e = arr.find(x => x.id === id); if (!e) return;
  const ok = await confirmBox({ icon: 'skull', title: 'Erase this entry?', msg: 'This memory will be lost to the void. There is no respawn.', ok: 'Erase', danger: true }); if (!ok) return;
  const el = $(`.entry[data-id="${id}"]`); SFX.play('delete');
  if (el) { const p = ptOf(el); FX.burst(p.x, p.y, { n: 30, colors: ['#888', '#bbb', '#555'], g: .05 }); el.classList.add('poof'); await sleep(420); }
  await DB.del('entries', id); if (e.photoId) { await DB.del('photos', e.photoId); photoCache.delete(e.photoId); }
  arr.splice(arr.indexOf(e), 1); S.entryCount = Math.max(0, S.entryCount - 1); S.counts[b.id] = Math.max(0, (S.counts[b.id] || 1) - 1); renderJournal();
}
function editEntry(id) {
  const e = (S.entries[S.current.id] || []).find(x => x.id === id); if (!e) return; let tag = e.tag;
  const m = $('#modal'); m.hidden = false;
  m.innerHTML = `<div class="mbox" style="text-align:left"><h3 style="text-align:center">Edit Entry</h3><p style="text-align:center;font-size:12px">${fmtStamp(e.ts)}</p>
    <div class="tagrow" id="edTags" style="margin:10px 0 6px">${TAGS.map(t => `<button class="tagchip ${t.id === tag ? 'on' : ''}" data-t="${t.id}" style="--tc:${t.color}">${icon(t.icon)}${t.name}</button>`).join('')}</div>
    <textarea class="txt" id="edText">${esc(e.text)}</textarea>
    <div class="btnrow"><button class="btn" data-m="no">Cancel</button><button class="btn primary" data-m="ok">Save</button></div></div>`;
  $('#edTags').onclick = ev => { const c = ev.target.closest('[data-t]'); if (!c) return; tag = c.dataset.t; $$('#edTags .tagchip').forEach(x => x.classList.toggle('on', x === c)); SFX.play('tap'); };
  m.onclick = async ev => {
    const a = ev.target.closest('[data-m]'); if (!a && ev.target !== m) return;
    if (a && a.dataset.m === 'ok') {
      const txt = $('#edText').value.trim(); if (!txt && !e.photoId) { SFX.play('error'); return; }
      Object.assign(e, { text: txt, tag, edited: Date.now() }); await DB.put('entries', e); SFX.play('scribble'); m.hidden = true; m.innerHTML = ''; renderEntries();
      const el = $(`.entry[data-id="${e.id}"]`); if (el) el.classList.add('inked');
      return;
    }
    SFX.play('tap'); m.hidden = true; m.innerHTML = '';
  };
}
function openLightbox(eid) {
  const e = (S.entries[S.current.id] || []).find(x => x.id === eid); if (!e || !e.photoId) return; SFX.play('camera');
  const lb = $('#lightbox'); lb.hidden = false;
  lb.innerHTML = `<button class="jbtn lbx" data-lb="close">${ui('close')}</button><div class="lbimg"><img id="lbImg" alt=""></div>
    <div class="lbcap"><b>${fmtStamp(e.ts)}</b>${esc((e.text || '').slice(0, 160))}</div>
    <div class="lbbar"><button class="btn" data-lb="share">${ui('share')}Save / Share</button><button class="btn primary" data-lb="close">Close</button></div>`;
  getPhoto(e.photoId).then(d => { $('#lbImg').src = d; });
  lb.onclick = async ev => {
    const a = ev.target.closest('[data-lb]'); if (!a) return;
    if (a.dataset.lb === 'share') {
      const d = await getPhoto(e.photoId); const blob = await (await fetch(d)).blob();
      const f = new File([blob], `${(S.current.title || 'quest').replace(/[^\w]+/g, '-')}-${dayKey(e.ts)}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f] }); } catch { } }
      else { const u = URL.createObjectURL(blob); const l = document.createElement('a'); l.href = u; l.download = f.name; l.click(); setTimeout(() => URL.revokeObjectURL(u), 3000); }
      return;
    }
    lb.hidden = true; lb.innerHTML = '';
  };
}

/* =============================================================
   Sheets & dialogs
   ============================================================= */
let sheetKind = null;
function sheetOpen(html, kind) { sheetKind = kind; $('#sheetBody').innerHTML = html; $('#sheetBody').scrollTop = 0; $('#sheet').classList.add('open'); SFX.play('whoosh'); }
function sheetClose() { $('#sheet').classList.remove('open'); sheetKind = null; document.activeElement && document.activeElement.blur && document.activeElement.blur(); }
function confirmBox({ icon: ic = 'skull', title, msg, ok = 'OK', cancel = 'Cancel', danger = false }) {
  return new Promise(res => {
    const m = $('#modal'); m.hidden = false; SFX.play('tap');
    m.innerHTML = `<div class="mbox"><div class="micon">${icon(ic)}</div><h3>${esc(title)}</h3><p>${msg}</p><div class="btnrow">${cancel ? `<button class="btn" data-m="no">${esc(cancel)}</button>` : ''}<button class="btn ${danger ? 'danger' : 'primary'}" data-m="ok">${esc(ok)}</button></div></div>`;
    m.onclick = ev => { const a = ev.target.closest('[data-m]'); if (!a && ev.target !== m) return; m.hidden = true; m.innerHTML = ''; res(!!a && a.dataset.m === 'ok'); };
  });
}

/* ---------- book editor (preview stays pinned while options scroll) ---------- */
const E = { draft: null, isNew: true };
function randomBook() {
  const d = { ...E.draft };
  Object.assign(d, { type: pick(BOOK_TYPES).id, color: pick(COLORS), trim: pick(TRIMS).id, pattern: pick(PATTERNS).id, emblem: pick(Object.keys(EMB)), font: pick(FONTS).id, ink: pick(INKS).id, paper: pick(PAPERS).id, height: pick(['s', 'm', 't']), thick: pick(['s', 'm', 'l']) });
  return d;
}
const optBtn = (k, v, label, on, extra = '') => `<button class="opt ${on ? 'on' : ''}" data-k="${k}" data-v="${esc(v)}" ${extra}>${label}</button>`;
function openEditor(book) {
  E.isNew = !book;
  E.draft = book ? { pose: 'auto', ...book } : { ...DEFAULT_BOOK, color: pick(COLORS), emblem: pick(['sword', 'shield', 'controller', 'potion', 'star', 'gem', 'crown', 'mushroom']) };
  const d = E.draft;
  sheetOpen(`<h3 class="sh-title">${E.isNew ? 'Begin a New Quest' : 'Customize Journal'}</h3>
    <div class="pv-sticky"><div class="preview-stage" id="pvStage"></div></div>
    <div class="group"><div class="glabel">Game Title</div><input id="edTitle" class="txt" maxlength="42" placeholder="e.g. The Legend of Something" value="${esc(d.title)}" autocomplete="off"></div>
    <div class="group"><div class="glabel">Platform</div><div class="opts">${PLATFORMS.map(p => optBtn('platform', p, p, d.platform === p)).join('')}</div></div>
    <div class="group"><div class="glabel">Book Type</div><div class="opts">${BOOK_TYPES.map(t => optBtn('type', t.id, miniSpine(t.id) + t.name, d.type === t.id)).join('')}</div></div>
    <div class="group"><div class="glabel">Cover Color</div><div class="swatches">${COLORS.map(c => `<button class="swatch ${d.color === c ? 'on' : ''}" data-k="color" data-v="${c}" style="background:${c}"></button>`).join('')}<label class="swatch custom ${COLORS.includes(d.color) ? '' : 'on'}" title="Custom"><input type="color" id="edColor" value="${d.color}"></label></div></div>
    <div class="group"><div class="glabel">Trim &amp; Lettering</div><div class="opts">${TRIMS.map(t => optBtn('trim', t.id, `<span class="swatch" style="width:18px;height:18px;background:${t.id}"></span>${t.name}`, d.trim === t.id)).join('')}</div></div>
    <div class="group"><div class="glabel">Pattern</div><div class="opts">${PATTERNS.map(p => optBtn('pattern', p.id, p.name, d.pattern === p.id)).join('')}</div></div>
    <div class="group"><div class="glabel">Emblem</div><div class="opts">${Object.keys(EMB).map(k => optBtn('emblem', k, icon(k), d.emblem === k, 'style="width:46px;height:46px;justify-content:center;padding:0;font-size:22px" aria-label="' + k + '"')).join('')}</div></div>
    <div class="group"><div class="glabel">Title Font</div><div class="opts">${FONTS.map(f => optBtn('font', f.id, `<span class="fs" style="font-family:${f.css};font-size:${(15 * f.s).toFixed(0)}px">${f.name}</span>`, d.font === f.id)).join('')}</div></div>
    <div class="group"><div class="glabel">Ink (Entry Handwriting)</div><div class="opts">${INKS.map(f => optBtn('ink', f.id, `<span style="font-family:${f.css};font-size:${Math.min(20, f.size)}px">${f.name}</span>`, d.ink === f.id)).join('')}</div></div>
    <div class="group"><div class="glabel">Paper</div><div class="opts">${PAPERS.map(p => optBtn('paper', p.id, `<span class="swatch" style="width:18px;height:18px;border-radius:4px;background:${p.sw}"></span>${p.name}`, d.paper === p.id)).join('')}</div></div>
    <div class="group"><div class="glabel">Spine Height</div><div class="opts">${[['s', 'Short'], ['m', 'Medium'], ['t', 'Tall']].map(([v, n]) => optBtn('height', v, n, d.height === v)).join('')}</div></div>
    <div class="group"><div class="glabel">Thickness</div><div class="opts">${[['s', 'Slim'], ['m', 'Regular'], ['l', 'Chunky']].map(([v, n]) => optBtn('thick', v, n, d.thick === v)).join('')}</div></div>
    <div class="group"><div class="glabel">Shelf Pose</div><div class="opts">${POSES.map(([v, n]) => optBtn('pose', v, n, d.pose === v)).join('')}</div><p class="fine">“Auto” follows the shelf arrangement style (Tidy / Cozy / Chaotic) in the shelf search menu.</p></div>
    <div class="btnrow"><button class="btn" data-act="random">${icon('dice')} Randomize</button><button class="btn primary" data-act="savebook">${icon('quill')} ${E.isNew ? 'Add to Shelf' : 'Save Changes'}</button></div>
    ${E.isNew ? '' : `<button class="btn danger wide" data-act="delbook">${ui('trash')} Banish this Journal</button>`}`, 'editor');
  renderPreview();
}
function poseDemoHTML(d) {
  const pose = !d.pose || d.pose === 'auto' ? 'upright' : d.pose; const { h } = dimsOf(d);
  if (pose === 'flat') return `<div class="pile">${flatHTML(d)}</div>`;
  if (pose === 'lean') return `<div class="slot lean-r" style="--lean:${LEAN_DEG}deg;margin-right:${Math.round(h * LEAN_SIN) - 22}px">${spineHTML(d)}</div>`;
  return spineHTML(d);
}
function renderPreview(anim = 'pop') {
  const st = $('#pvStage'); if (!st) return; const d = { ...E.draft, id: E.draft.id || 'preview', title: E.draft.title || 'Untitled Quest' };
  st.innerHTML = poseDemoHTML(d) + coverHTML(d); st.classList.remove('pop', 'spin'); void st.offsetWidth; if (anim) st.classList.add(anim);
}
function syncEditorUI() {
  const d = E.draft;
  $$('#sheetBody [data-k]').forEach(b => b.classList.toggle('on', String(d[b.dataset.k]) === b.dataset.v));
  const cu = $('#sheetBody .swatch.custom'); if (cu) cu.classList.toggle('on', !COLORS.includes(d.color)); const ci = $('#edColor'); if (ci) ci.value = d.color;
}
async function saveBook() {
  const d = E.draft; d.title = ($('#edTitle').value || '').trim();
  if (!d.title) {
    SFX.play('error'); const t = $('#edTitle'); const body = $('#sheetBody');
    body.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => t.focus({ preventScroll: true }), 300);
    t.style.animation = 'shake .4s'; setTimeout(() => t.style.animation = '', 450); info('Give your quest a name first!'); return;
  }
  if (E.isNew) {
    d.id = uid(); d.created = Date.now(); d.updated = Date.now(); d.order = S.books.reduce((m, b) => Math.max(m, b.order ?? 0), 0) + 1;
    await DB.put('books', d); S.books.push(d); S.entries[d.id] = []; S.counts[d.id] = 0;
    sheetClose(); SFX.play('levelup');
    if (S.libQ) { S.libQ = ''; $('#libSearch').value = ''; }
    renderLibrary(false, d.id);
    const el = $(`#shelves .book[data-id="${d.id}"]`); if (el) { centerIn($('#shelves'), el); setTimeout(() => { const p = ptOf(el); FX.burst(p.x, p.y, { n: 50, shape: 'spark', max: 6 }); }, 250); }
    addXP(25, el || undefined); unlock('first_book'); if (S.books.length >= 5) unlock('five_books');
    toast(`<span class="ti">${icon(d.emblem)}</span><span><small>New Quest Added</small><b>${esc(d.title)}</b></span>`, { ms: 2200 });
  } else {
    const i = S.books.findIndex(b => b.id === d.id); S.books[i] = d; await DB.put('books', d);
    sheetClose(); SFX.play('coin'); unlock('fashion');
    if (S.current && S.current.id === d.id) { S.current = d; renderJournal(); const h = $('#jhead'); const p = ptOf(h); FX.burst(p.x, p.y, { n: 36, shape: 'spark' }); }
    else renderLibrary(false, d.id);
  }
}
async function deleteBook() {
  const d = E.draft; const n = (await DB.byBook(d.id)).length;
  const ok = await confirmBox({ icon: 'skull', title: 'Banish this journal?', msg: `<b>${esc(d.title)}</b> and its ${n} entr${n === 1 ? 'y' : 'ies'} will be permanently erased. Consider exporting a backup first.`, ok: 'Banish', danger: true });
  if (!ok) return;
  const ents = await DB.byBook(d.id); for (const e of ents) { await DB.del('entries', e.id); if (e.photoId) await DB.del('photos', e.photoId); }
  await DB.del('books', d.id); S.books = S.books.filter(b => b.id !== d.id); delete S.entries[d.id]; delete S.counts[d.id]; S.entryCount = Math.max(0, S.entryCount - ents.length);
  sheetClose(); SFX.play('delete'); if (S.current && S.current.id === d.id) { S.current = null; showScreen('library'); }
  renderLibrary(false); info(`${esc(d.title)} was banished.`);
}

/* ---------- settings ---------- */
function openSettings(scrollTo) {
  const p = S.profile, L = levelOf(p.xp), a = xpFor(L), b = xpFor(L + 1); const loc = S.settings.location, w = S.settings.weather;
  const got = Object.keys(p.achievements).length, total = Object.keys(ACH).length;
  sheetOpen(`<h3 class="sh-title">Scribe's Quarters</h3>
    <div class="profilecard"><div class="lvbig">${L}</div><div style="flex:1;min-width:0"><b>${esc(titleFor(L))}</b><span class="xpbar"><i style="width:${((p.xp - a) / (b - a) * 100).toFixed(1)}%"></i></span><small>${p.xp - a} / ${b - a} XP to Level ${L + 1} · ${got}/${total} achievements</small></div></div>
    <div class="group"><div class="glabel">Library Theme</div><div class="themes">${THEMES.map(t => `<button class="themecard ${S.settings.theme === t.id ? 'on' : ''}" data-theme-id="${t.id}" style="--a:${t.a};--b:${t.b};--x:${t.x}"><i></i><span>${t.name}</span><small>${t.desc}</small></button>`).join('')}</div></div>
    <div class="group"><div class="glabel">Sound &amp; Effects</div>
      <div class="row"><span>Sound effects<small>Page flips, quills, chiptune chimes</small></span><button class="toggle ${S.settings.sound ? 'on' : ''}" data-act="sound"><i></i></button></div>
      <div class="row"><span>Volume<input type="range" id="volIn" min="0" max="1" step="0.05" value="${S.settings.volume}"></span></div>
      <div class="row"><span>Floating particles<small>Dust, petals, embers, bubbles — depends on theme</small></span><button class="toggle ${S.settings.dust ? 'on' : ''}" data-act="dust"><i></i></button></div>
    </div>
    <div class="group" id="grpWin"><div class="glabel">Window to the Outside</div>
      <div class="row"><span>Curtains<small>Tip: tap the window itself to open or close them</small></span><button class="toggle ${S.settings.curtains !== 'closed' ? 'on' : ''}" data-act="curtains"><i></i></button></div>
      <div class="row"><span>${loc ? 'Location saved' : 'Location not set'}<small>${loc ? `Checked ${ago(loc.ts)} · re-checks every 30 days` : 'Showing your local time of day only'}${w ? ` · Sky updated ${ago(w.ts)}` : ''}</small></span></div>
      <div class="btnrow"><button class="btn" data-act="loc">${ui('pin')} Update Location</button><button class="btn" data-act="sky">${ui('refresh')} Refresh Sky</button></div>
      <p class="fine">Sky conditions come from the free Open-Meteo public weather service. Time of day follows your real sunrise &amp; sunset. Your coordinates stay on this device and are only sent to fetch the weather.</p>
    </div>
    <div class="group"><div class="glabel">Backup &amp; Restore</div>
      <div class="btnrow" style="margin-top:0"><button class="btn primary" data-act="export">${ui('download')} Export Library</button><button class="btn" data-act="import">${ui('upload')} Restore</button></div>
      <p class="fine">${S.settings.lastBackup ? `Last backup: ${fmtStamp(S.settings.lastBackup)}.` : 'No backup yet — export one so your quests are safe!'} The backup is a single .json file with every journal, entry &amp; screenshot. Save it to Files or iCloud Drive.</p>
    </div>
    <div class="group" id="grpAch"><div class="glabel">Achievements · ${got}/${total}</div><div class="achlist">${Object.entries(ACH).map(([k, v]) => `<div class="ach ${p.achievements[k] ? 'got' : ''}"><span class="ai">${icon(p.achievements[k] ? v.i : 'key')}</span><div><b>${p.achievements[k] ? esc(v.n) : '???'}</b><small>${esc(v.d)}</small></div><em>+${v.xp}</em></div>`).join('')}</div></div>
    <div class="group"><div class="glabel">Danger Zone</div><button class="btn danger wide" style="margin-top:0" data-act="wipe">${ui('trash')} Erase Entire Library</button></div>
    <p class="fine" style="text-align:center;margin-top:20px">Sidequest Scribe v${VERSION} · Works offline · Made for adventurers</p>`, 'settings');
  if (scrollTo) setTimeout(() => { const g = $(scrollTo); if (g) { const bd = $('#sheetBody'); bd.scrollTo({ top: bd.scrollTop + g.getBoundingClientRect().top - bd.getBoundingClientRect().top - 10, behavior: 'smooth' }); } }, 350);
}
async function applyTheme(id, from) {
  const t = THEMES.find(x => x.id === id) || THEMES[0];
  if (from) {
    SFX.play('theme'); const w = document.createElement('div'); w.className = 'wipe'; const p = ptOf(from);
    w.style.clipPath = `circle(0px at ${p.x}px ${p.y}px)`; w.style.transition = 'clip-path .45s ease-in, opacity .45s'; $('#app').appendChild(w); void w.offsetWidth;
    w.style.clipPath = `circle(150% at ${p.x}px ${p.y}px)`; await sleep(460);
    document.body.dataset.theme = t.id; w.style.opacity = '0'; setTimeout(() => w.remove(), 500);
  } else document.body.dataset.theme = t.id;
  S.settings.theme = t.id; saveSettings(); $('meta[name=theme-color]').setAttribute('content', t.b); Dust.recolor();
  requestAnimationFrame(() => Win.init()); // window shape changes per theme
  if (from) { unlock('decor'); $$('.themecard').forEach(c => c.classList.toggle('on', c.dataset.themeId === t.id)); }
}

/* ---------- curtains ---------- */
function setCurtains(open, anim) {
  $('#windowWrap').classList.toggle('closed', !open); document.body.dataset.curtains = open ? 'open' : 'closed';
  if (anim) $$('.drape').forEach(d => { d.classList.remove('sway'); void d.offsetWidth; d.classList.add('sway'); });
}
function toggleCurtains() {
  const open = S.settings.curtains === 'closed'; S.settings.curtains = open ? 'open' : 'closed'; saveSettings();
  setCurtains(open, true); SFX.play('curtain');
  if (open) setTimeout(() => windowTip(true), 800); else { unlock('curtains'); showTip('Curtains drawn · cozy mode'); }
}

/* ---------- backup ---------- */
async function exportLibrary() {
  info('Packing your save file…', 1200);
  const [books, entries, photos] = await Promise.all([DB.all('books'), DB.all('entries'), DB.all('photos')]);
  const data = { app: 'Sidequest Scribe', format: 1, version: VERSION, exportedAt: new Date().toISOString(), theme: S.settings.theme, shelfSort: S.settings.shelfSort, shelfStyle: S.settings.shelfStyle, profile: S.profile, books, entries, photos };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const d = new Date(); const name = `SidequestScribe-Backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
  const file = new File([blob], name, { type: 'application/json' }); const mb = (blob.size / 1048576).toFixed(2);
  const go = await confirmBox({ icon: 'shield', title: 'Save file ready!', msg: `${books.length} journals · ${entries.length} entries · ${photos.length} screenshots (${mb} MB).<br>Tap <b>Save Backup</b> and choose “Save to Files”.`, ok: 'Save Backup', cancel: 'Cancel' });
  if (!go) return;
  let done = false;
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Sidequest Scribe Backup' }); done = true; } catch (e) { if (e.name === 'AbortError') return; } }
  if (!done) { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 4000); }
  S.settings.lastBackup = Date.now(); saveSettings(); unlock('backup'); SFX.play('coin');
}
async function importLibrary(file) {
  let data; try { data = JSON.parse(await file.text()); } catch { SFX.play('error'); return info('That file is not a valid backup.'); }
  if (!data || data.app !== 'Sidequest Scribe' || !Array.isArray(data.books) || !Array.isArray(data.entries)) { SFX.play('error'); return info('That file is not a Sidequest Scribe backup.'); }
  const ok = await confirmBox({ icon: 'book', title: 'Restore this backup?', msg: `${data.books.length} journals · ${data.entries.length} entries from ${data.exportedAt ? fmtStamp(Date.parse(data.exportedAt)) : 'an earlier save'}.<br><b>This replaces your current library.</b>`, ok: 'Restore', danger: true });
  if (!ok) return;
  await Promise.all(['books', 'entries', 'photos'].map(s => DB.clear(s)));
  await DB.putMany('books', data.books); await DB.putMany('entries', data.entries); await DB.putMany('photos', data.photos || []);
  if (data.profile) { S.profile = Object.assign({}, DEF_PROFILE, data.profile); saveProfile(); }
  if (data.shelfSort) S.settings.shelfSort = data.shelfSort; if (data.shelfStyle) S.settings.shelfStyle = data.shelfStyle; saveSettings();
  if (data.theme) applyTheme(data.theme);
  photoCache.clear(); S.entries = {}; S.books = await DB.all('books'); await recount();
  sheetClose(); showScreen('library'); renderLibrary(true); updatePlayer(); SFX.play('levelup'); info('Library restored! Welcome back, adventurer.', 2600);
}
async function wipeAll() {
  const ok = await confirmBox({ icon: 'skull', title: 'Erase EVERYTHING?', msg: 'All journals, entries, screenshots, XP and achievements will be deleted. This is a permanent Game Over.', ok: 'Erase All', danger: true });
  if (!ok) return; const ok2 = await confirmBox({ icon: 'ghost', title: 'Are you really sure?', msg: 'Last chance to export a backup first!', ok: 'Yes, erase', danger: true }); if (!ok2) return;
  await Promise.all(['books', 'entries', 'photos'].map(s => DB.clear(s)));
  S.books = []; S.entries = {}; S.counts = {}; S.entryCount = 0; photoCache.clear(); S.profile = { ...DEF_PROFILE, achievements: {} }; saveProfile();
  sheetClose(); showScreen('library'); renderLibrary(true); updatePlayer(); SFX.play('delete'); info('The library is empty. A new adventure begins.');
}

/* =============================================================
   Sky window — real weather + time of day
   ============================================================= */
const SKY = { cond: 'clear', phase: 'day', sun: .5, moon: .5, wind: 5 };
const COND_NAMES = { clear: 'Clear skies', partly: 'Partly cloudy', overcast: 'Overcast', fog: 'Foggy', rain: 'Rainy', snow: 'Snowy', storm: 'Thunderstorm' };
const PHASE_NAMES = { dawn: 'Dawn', day: 'Daytime', dusk: 'Dusk', night: 'Night' };
const LOC_MAX_AGE = 30 * 864e5, WX_MAX_AGE = 30 * 60 * 1000;
function condFromCode(c) {
  if (c == null) return 'clear'; if (c === 0) return 'clear'; if (c <= 2) return 'partly'; if (c === 3) return 'overcast'; if (c === 45 || c === 48) return 'fog';
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return 'rain'; if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'snow'; if (c >= 95) return 'storm'; return 'partly';
}
function computePhase() {
  const now = new Date(), m = now.getHours() * 60 + now.getMinutes(); const w = S.settings.weather;
  const sr = (w && w.sunrise) || 390, ss = (w && w.sunset) || 1080; let ph;
  if (m < sr - 40 || m > ss + 40) ph = 'night'; else if (m < sr + 40) ph = 'dawn'; else if (m > ss - 40) ph = 'dusk'; else ph = 'day';
  SKY.phase = ph; SKY.sun = clamp((m - sr) / (ss - sr), 0, 1); const nightLen = 1440 - (ss - sr); SKY.moon = clamp(((m - ss + 1440) % 1440) / nightLen, 0, 1);
  if (document.body.dataset.phase !== ph) document.body.dataset.phase = ph;
}
function applyWeather() {
  const w = S.settings.weather; const prev = SKY.cond; SKY.cond = w ? condFromCode(w.code) : 'clear'; SKY.wind = w ? (w.wind || 5) : 5;
  computePhase(); if (prev !== SKY.cond) Win.setup();
}
function requestLocation() {
  return new Promise(res => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(p => {
      S.settings.location = { lat: +p.coords.latitude.toFixed(3), lon: +p.coords.longitude.toFixed(3), ts: Date.now() }; saveSettings(); res(S.settings.location);
    }, () => { if (S.settings.location) { S.settings.location.ts = Date.now(); saveSettings(); } res(null); }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 3600000 });
  });
}
async function refreshWeather(force) {
  const loc = S.settings.location; if (!loc) { applyWeather(); return false; }
  const w = S.settings.weather; if (!force && w && Date.now() - w.ts < WX_MAX_AGE) { applyWeather(); return true; }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=weather_code,is_day,cloud_cover,wind_speed_10m&daily=sunrise,sunset&timezone=auto&forecast_days=1`;
    const r = await fetch(url, { cache: 'no-store' }); if (!r.ok) throw new Error('wx'); const j = await r.json();
    const toMin = s => { const t = String(s).split('T')[1] || '06:30'; const [h, m] = t.split(':'); return (+h) * 60 + (+m); };
    S.settings.weather = { code: j.current.weather_code, cloud: j.current.cloud_cover, wind: j.current.wind_speed_10m, sunrise: toMin(j.daily.sunrise[0]), sunset: toMin(j.daily.sunset[0]), ts: Date.now() };
    saveSettings(); applyWeather(); return true;
  } catch { applyWeather(); return false; }
}
async function skyMaintenance() {
  const loc = S.settings.location;
  if (loc && Date.now() - loc.ts > LOC_MAX_AGE) { await requestLocation(); await refreshWeather(true); }
  else await refreshWeather(false);
}
const SKIES = {
  night: [[0, '#070b1f'], [.6, '#152048'], [1, '#22305e']], dawn: [[0, '#2f3f82'], [.55, '#e9917a'], [1, '#ffd49a']],
  day: [[0, '#2f84e0'], [.7, '#8ccdf8'], [1, '#c4e8ff']], dusk: [[0, '#231f5e'], [.5, '#b44f7a'], [1, '#ff9a5a']]
};
const Win = {
  cv: null, ctx: null, w: 86, h: 102, t: 0, clouds: [], drops: [], flakes: [], stars: [], flash: 0, bolt: null,
  init() {
    this.cv = $('#skycv'); this.ctx = this.cv.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    this.w = this.cv.clientWidth || 86; this.h = this.cv.clientHeight || 102; this.cv.width = this.w * dpr; this.cv.height = this.h * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.stars = Array.from({ length: 46 }, () => ({ x: Math.random() * this.w, y: Math.random() * this.h * .7, r: Math.random() * 1.2 + .4, p: Math.random() * 6 }));
    this.setup();
  },
  setup() {
    const c = SKY.cond, w = this.w, h = this.h; const n = { clear: 1, partly: 4, overcast: 7, fog: 3, rain: 7, snow: 6, storm: 8 }[c];
    const sp = 1 + (SKY.wind || 5) / 18;
    this.clouds = Array.from({ length: n }, () => ({ x: Math.random() * w * 1.4 - w * .2, y: 6 + Math.random() * h * .42, s: .55 + Math.random() * .6, v: (.04 + Math.random() * .07) * sp }));
    this.drops = (c === 'rain' || c === 'storm') ? Array.from({ length: c === 'storm' ? 90 : 65 }, () => ({ x: Math.random() * w, y: Math.random() * h, l: rand(6, 11), v: rand(4, 6.5) })) : [];
    this.flakes = c === 'snow' ? Array.from({ length: 60 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: rand(.7, 2), v: rand(.25, .7), p: Math.random() * 6 })) : [];
  },
  cloud(x, y, s, col) {
    const c = this.ctx; c.fillStyle = col; c.beginPath();
    for (const [dx, dy, r] of [[0, 2, 8], [9, -4, 10], [20, 0, 9], [13, 5, 9], [27, 4, 6]]) { c.moveTo(x + dx * s + r * s, y + dy * s); c.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); }
    c.fill();
  },
  land(P, C) {
    const c = this.ctx, w = this.w, h = this.h;
    const back = { night: '#0e1428', day: '#3b6d4a', dawn: '#4a3a58', dusk: '#3b2a48' }[P], front = { night: '#070a16', day: '#244a30', dawn: '#2a2036', dusk: '#22162e' }[P];
    c.fillStyle = back; c.beginPath(); c.moveTo(0, h * .78); c.quadraticCurveTo(w * .3, h * .66, w * .55, h * .76); c.quadraticCurveTo(w * .8, h * .84, w, h * .72); c.lineTo(w, h); c.lineTo(0, h); c.fill();
    c.fillStyle = front; const tx = w * .18, ty = h * .58; c.fillRect(tx, ty, 10, h * .3); for (let i = 0; i < 3; i++) c.fillRect(tx - 1 + i * 4.5, ty - 3, 3, 3);
    c.beginPath(); c.moveTo(tx - 2, ty); c.lineTo(tx + 5, ty - 12); c.lineTo(tx + 12, ty); c.fill();
    if (P === 'night' || P === 'dusk') { c.fillStyle = '#ffd36b'; c.shadowColor = '#ffb22e'; c.shadowBlur = 6; c.fillRect(tx + 3.5, ty + 6, 3, 4); c.shadowBlur = 0; }
    c.fillStyle = front; c.beginPath(); c.moveTo(0, h * .88); c.quadraticCurveTo(w * .4, h * .8, w * .7, h * .9); c.quadraticCurveTo(w * .85, h * .94, w, h * .86); c.lineTo(w, h); c.lineTo(0, h); c.fill();
    for (const [px, ph] of [[.62, 16], [.72, 22], [.8, 14], [.9, 19]]) { const x = w * px, y = h * .9; c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x, y - ph); c.lineTo(x + 5, y); c.fill(); }
    if (C === 'snow') { c.fillStyle = 'rgba(240,248,255,.75)'; c.beginPath(); c.moveTo(0, h * .88); c.quadraticCurveTo(w * .4, h * .8, w * .7, h * .9); c.quadraticCurveTo(w * .85, h * .94, w, h * .86); c.lineTo(w, h * .89); c.quadraticCurveTo(w * .4, h * .84, 0, h * .91); c.fill(); }
  },
  draw() {
    const c = this.ctx; if (!c) return; const { w, h } = this; const P = SKY.phase, C = SKY.cond; this.t++;
    const g = c.createLinearGradient(0, 0, 0, h); SKIES[P].forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const gloom = { clear: 0, partly: .06, overcast: .42, fog: .35, rain: .5, snow: .3, storm: .62 }[C];
    if (P !== 'day') { const a = (P === 'night' ? 1 : .35) * (1 - gloom * 1.5); if (a > 0) { c.fillStyle = '#fff'; for (const s of this.stars) { c.globalAlpha = clamp(a * (.45 + .55 * Math.sin(this.t * .06 + s.p)), 0, 1); c.fillRect(s.x, s.y, s.r, s.r); } c.globalAlpha = 1; } }
    const arc = f => ({ x: w * .12 + f * w * .76, y: h * .62 - Math.sin(f * Math.PI) * h * .48 });
    if (P !== 'night') {
      const p = arc(SKY.sun); c.globalAlpha = 1 - gloom; const col = P === 'day' ? '255,246,200' : '255,170,100';
      const rg = c.createRadialGradient(p.x, p.y, 2, p.x, p.y, 28); rg.addColorStop(0, `rgba(${col},.9)`); rg.addColorStop(1, `rgba(${col},0)`); c.fillStyle = rg; c.fillRect(p.x - 30, p.y - 30, 60, 60);
      c.fillStyle = P === 'day' ? '#fffbe6' : '#ffc27a'; c.beginPath(); c.arc(p.x, p.y, 7, 0, Math.PI * 2); c.fill(); c.globalAlpha = 1;
    } else {
      const p = arc(SKY.moon); c.globalAlpha = 1 - gloom * .9;
      const rg = c.createRadialGradient(p.x, p.y, 2, p.x, p.y, 22); rg.addColorStop(0, 'rgba(220,230,255,.55)'); rg.addColorStop(1, 'rgba(220,230,255,0)'); c.fillStyle = rg; c.fillRect(p.x - 24, p.y - 24, 48, 48);
      c.fillStyle = '#f4f1e0'; c.beginPath(); c.arc(p.x, p.y, 6.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(180,180,170,.5)'; c.beginPath(); c.arc(p.x - 2, p.y - 1.5, 1.4, 0, 7); c.arc(p.x + 2, p.y + 2, 1, 0, 7); c.fill(); c.globalAlpha = 1;
    }
    if (gloom) { c.fillStyle = P === 'night' ? `rgba(18,22,34,${gloom})` : `rgba(105,114,128,${gloom})`; c.fillRect(0, 0, w, h); }
    const ccol = (C === 'rain' || C === 'storm') ? (P === 'night' ? 'rgba(48,52,66,.95)' : 'rgba(92,98,110,.95)') : P === 'night' ? 'rgba(70,78,110,.85)' : P === 'day' ? 'rgba(255,255,255,.95)' : 'rgba(250,200,185,.92)';
    for (const cl of this.clouds) { cl.x += cl.v; if (cl.x > w + 10) cl.x = -36 * cl.s - 10; this.cloud(cl.x, cl.y, cl.s, ccol); }
    if (C === 'storm' && this.flash <= 0 && Math.random() < .005) {
      this.flash = 1; const x0 = rand(w * .2, w * .8); this.bolt = [[x0, 0]]; let x = x0; for (let y = 8; y < h * .8; y += rand(6, 12)) { x += rand(-7, 7); this.bolt.push([x, y]); }
      if (Math.random() < .35 && S.settings.curtains !== 'closed') setTimeout(() => { if ($('#library').classList.contains('active')) SFX.play('thunder'); }, 600);
    }
    if (this.flash > 0) { c.fillStyle = `rgba(230,235,255,${this.flash * .55})`; c.fillRect(0, 0, w, h); if (this.flash > .6 && this.bolt) { c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.beginPath(); this.bolt.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } this.flash -= .05; }
    this.land(P, C);
    if (this.drops.length) { c.strokeStyle = P === 'night' ? 'rgba(170,190,230,.55)' : 'rgba(210,225,245,.7)'; c.lineWidth = 1; c.beginPath(); for (const d of this.drops) { d.y += d.v; d.x -= .8; if (d.y > h) { d.y = -d.l; d.x = Math.random() * (w + 20); } c.moveTo(d.x, d.y); c.lineTo(d.x - 1.4, d.y + d.l); } c.stroke(); }
    if (this.flakes.length) { c.fillStyle = 'rgba(255,255,255,.9)'; for (const f of this.flakes) { f.y += f.v; f.x += Math.sin(this.t * .03 + f.p) * .35; if (f.y > h) { f.y = -3; f.x = Math.random() * w; } c.beginPath(); c.arc(f.x, f.y, f.r, 0, 7); c.fill(); } }
    if (C === 'fog') { for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(225,230,236,.22)'; const y = h * (.35 + i * .17) + Math.sin(this.t * .01 + i) * 3; c.fillRect(-5, y, w + 10, 9 + i * 2); } }
  }
};
function showTip(text) {
  const tip = $('#wtip'); tip.textContent = text; tip.classList.add('show');
  clearTimeout(showTip.t); showTip.t = setTimeout(() => tip.classList.remove('show'), 2400);
}
function windowTip(silent) {
  const loc = S.settings.location;
  showTip(loc ? `${COND_NAMES[SKY.cond]} · ${PHASE_NAMES[SKY.phase]}` : `${PHASE_NAMES[SKY.phase]} · enable weather in ⚙`);
  if (!silent) SFX.play(SKY.cond === 'storm' ? 'thunder' : 'chime');
}

/* ---------- ambient particles (themed) ---------- */
const Dust = {
  cv: null, ctx: null, parts: [], w: 0, h: 0, col: '255,176,80', mode: 'mote',
  init() { this.cv = $('#dust'); this.ctx = this.cv.getContext('2d'); this.resize(); this.recolor(); },
  resize() { const dpr = Math.min(2, devicePixelRatio || 1); this.w = this.cv.clientWidth; this.h = this.cv.clientHeight; this.cv.width = this.w * dpr; this.cv.height = this.h * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); },
  falls() { return this.mode === 'petal' || this.mode === 'flake'; },
  make(any) {
    const fall = this.falls(), m = this.mode;
    const vy = fall ? rand(.25, .6) : m === 'ember' ? rand(-1.1, -.4) : m === 'bubble' ? rand(-.6, -.2) : rand(-.28, -.08);
    return { x: Math.random() * this.w, y: any ? Math.random() * this.h : (fall ? -8 : this.h + 5), vx: rand(-.12, .12), vy, r: m === 'petal' ? rand(2.5, 4.5) : m === 'bubble' ? rand(1.5, 4) : rand(.6, 2), p: Math.random() * 6, a: rand(.3, .75), rot: Math.random() * 6 };
  },
  recolor() {
    this.col = cssVar('--glow') || '255,176,80'; this.mode = DUST_MODE[document.body.dataset.theme] || 'mote';
    const n = { petal: 26, flake: 40, bubble: 26, ember: 36 }[this.mode] || 34;
    if (this.cv) this.parts = Array.from({ length: n }, () => this.make(true));
  },
  frame() {
    const c = this.ctx; if (!c) return; c.clearRect(0, 0, this.w, this.h); const t = performance.now() / 1000, m = this.mode;
    for (const p of this.parts) {
      p.x += p.vx + Math.sin(t * .6 + p.p) * (m === 'petal' ? .5 : .12); p.y += p.vy; p.rot += .02;
      if (p.y < -10 || p.y > this.h + 10 || p.x < -10 || p.x > this.w + 10) Object.assign(p, this.make(false));
      const fl = .55 + .45 * Math.sin(t * (m === 'ember' ? 6 : 2) + p.p); c.globalAlpha = p.a * fl;
      if (m === 'pixel') { c.fillStyle = `rgb(${this.col})`; c.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.r * 1.3), Math.ceil(p.r * 1.3)); }
      else if (m === 'petal') { c.fillStyle = '#ffc4d2'; c.save(); c.translate(p.x, p.y); c.rotate(p.rot + Math.sin(t + p.p)); c.beginPath(); c.ellipse(0, 0, p.r, p.r * .55, 0, 0, 7); c.fill(); c.restore(); }
      else if (m === 'bubble') { c.globalAlpha = p.a * .8; c.strokeStyle = 'rgba(200,255,250,.8)'; c.lineWidth = .8; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.stroke(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(p.x - p.r * .4, p.y - p.r * .5, 1, 1); }
      else if (m === 'ember') { c.fillStyle = fl > .8 ? '#ffe08a' : '#ff7a1a'; c.fillRect(p.x, p.y, p.r * 1.2, p.r * 1.2); }
      else if (m === 'flake') { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); }
      else { c.fillStyle = `rgb(${this.col})`; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); }
    }
    c.globalAlpha = 1;
  },
  clear() { this.ctx && this.ctx.clearRect(0, 0, this.w, this.h); }
};

/* =============================================================
   Intro / boot
   ============================================================= */
function introPressStart() {
  $('#introAction').innerHTML = `<button class="press" id="pressStart">PRESS START</button>`;
  $('#pressStart').onclick = () => {
    SFX.init(); SFX.play('start'); const p = ptOf($('#pressStart')); FX.burst(p.x, p.y, { n: 40, shape: 'spark', colors: ['#ffcf4a', '#fff', '#ff8a3d'] });
    $('#introAction').innerHTML = `<div class="loccard"><div class="minwin"></div><h3>A Window to Your World</h3>
      <p>Your library has a little window that mirrors the real sky outside — rain, snow, sunsets and starry nights. Allow your location so it can match your weather and time of day. It's checked again every 30 days.</p>
      <div class="btnrow"><button class="btn" id="locSkip">Not now</button><button class="btn primary" id="locAllow">${ui('pin')} Allow</button></div></div>`;
    $('#locSkip').onclick = () => { SFX.play('tap'); finishIntro(); };
    $('#locAllow').onclick = async () => {
      SFX.play('tap'); $('#locAllow').textContent = 'Scrying the skies…';
      const loc = await requestLocation(); if (loc) await refreshWeather(true); else info('No problem — the window will follow your local time.');
      finishIntro();
    };
  };
}
function finishIntro() {
  S.settings.introDone = true; saveSettings(); const i = $('#intro'); i.classList.add('gone'); setTimeout(() => i.remove(), 750);
  renderLibrary(true); SFX.play('flip');
}
function introReturning() {
  $('#introAction').innerHTML = `<div class="loadbar"><i></i></div><div class="loadtxt">LOADING SAVE FILE…</div>`;
  const done = () => { if (!$('#intro') || $('#intro').classList.contains('gone')) return; $('#intro').classList.add('gone'); setTimeout(() => $('#intro') && $('#intro').remove(), 750); renderLibrary(true); SFX.play('flip'); };
  $('#intro').addEventListener('click', () => { SFX.init(); done(); }); setTimeout(done, 1450);
}

/* ---------- layout / orientation ---------- */
function fitViewport() {
  const h = window.visualViewport ? visualViewport.height : innerHeight; document.documentElement.style.setProperty('--vh', h + 'px');
  if (window.scrollY) window.scrollTo(0, 0);
}
function orient() {
  let a = 0; if (screen.orientation && typeof screen.orientation.angle === 'number') a = screen.orientation.angle; else if (typeof window.orientation === 'number') a = window.orientation;
  document.documentElement.classList.toggle('rot-neg', a === 270 || a === -90);
}
let lastW = 0;
function onResize() {
  fitViewport(); orient();
  setTimeout(() => {
    FX.resize(); Dust.resize(); Win.init();
    const w = $('#shelves').clientWidth; if (w !== lastW && $('#library').classList.contains('active')) { lastW = w; renderLibrary(false); }
  }, 120);
}

/* ---------- main loop ---------- */
let frameN = 0;
function loop() {
  requestAnimationFrame(loop); if (document.hidden) return; frameN++;
  const lib = $('#library').classList.contains('active');
  if (lib && frameN % 2 === 0) { Win.draw(); if (S.settings.dust) Dust.frame(); }
  FX.frame();
}

/* ---------- events ---------- */
function bindEvents() {
  ['pointerdown', 'touchend', 'click'].forEach(ev => document.addEventListener(ev, () => SFX.init(), { capture: true, passive: true }));
  $('#brandIc').innerHTML = icon('quill'); $('#btnSettings').innerHTML = ui('gear'); $('#btnLibSearch').innerHTML = ui('search'); $('#libSearchClose').innerHTML = ui('close'); $('#sheetX').innerHTML = ui('close');
  $('#camBtn').insertAdjacentHTML('afterbegin', ui('camera')); $('#saveBtn').innerHTML = icon('quill'); $('#lbCover').innerHTML = icon('quill');
  const tabs = { log: ['book', 'Journal'], gallery: ['image', 'Memories'], stats: ['chart', 'Stats'] };
  $$('#jtabs button').forEach(b => { const [i, n] = tabs[b.dataset.tab]; b.innerHTML = ui(i) + n; });

  $('#btnSettings').onclick = () => { SFX.play('tap'); openSettings(); };
  $('#playerChip').onclick = () => { SFX.play('coin'); openSettings('#grpAch'); };
  $('#window').onclick = toggleCurtains;
  $('#libbar').onclick = e => {
    if (e.target.closest('#btnNew')) { SFX.play('tap'); openEditor(null); }
    else if (e.target.closest('#btnContinue')) { const last = [...S.books].sort((a, b) => (b.updated || 0) - (a.updated || 0))[0]; if (last) openBook(last.id, $(`#shelves .book[data-id="${last.id}"]`)); }
  };

  // library search / sort / arrange
  $('#btnLibSearch').onclick = () => toggleLibTools();
  $('#libSearchClose').onclick = () => toggleLibTools(false);
  $('#libSearch').addEventListener('input', e => { S.libQ = e.target.value; renderLibrary(false); });
  $('#libSearch').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } });
  $('#libtools').addEventListener('click', e => {
    const s = e.target.closest('[data-sort]'), a = e.target.closest('[data-arr]');
    if (s && s.dataset.sort !== S.settings.shelfSort) { S.settings.shelfSort = s.dataset.sort; saveSettings(); renderLibTools(); SFX.play('shuffle'); $('#shelves').scrollTop = 0; renderLibrary(true); }
    if (a && a.dataset.arr !== S.settings.shelfStyle) { S.settings.shelfStyle = a.dataset.arr; saveSettings(); renderLibTools(); SFX.play('shuffle'); renderLibrary(true); }
  });

  // shelves: tap = open, long-press = customize
  const sh = $('#shelves'); let lp = null, lpFired = false, sx = 0, sy = 0;
  sh.addEventListener('pointerdown', e => {
    const b = e.target.closest('.book'); lpFired = false; if (!b) return; sx = e.clientX; sy = e.clientY;
    lp = setTimeout(() => { lpFired = true; SFX.play('pull'); b.classList.add('wiggle'); setTimeout(() => b.classList.remove('wiggle'), 600); openEditor(S.books.find(x => x.id === b.dataset.id)); }, 560);
  });
  const cancelLP = () => { clearTimeout(lp); lp = null; };
  sh.addEventListener('pointerup', cancelLP); sh.addEventListener('pointercancel', cancelLP);
  sh.addEventListener('pointermove', e => { if (lp && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) cancelLP(); });
  sh.addEventListener('scroll', cancelLP, { passive: true });
  sh.addEventListener('contextmenu', e => e.preventDefault());
  sh.addEventListener('click', e => {
    if (lpFired) { lpFired = false; return; }
    const b = e.target.closest('.book'); if (b) return openBook(b.dataset.id, b);
    if (e.target.closest('.ghost')) { SFX.play('tap'); return openEditor(null); }
    const d = e.target.closest('.deco'); if (d) {
      d.classList.remove('tap'); void d.getBoundingClientRect(); d.classList.add('tap'); const k = d.dataset.deco, p = ptOf(d);
      if (k === 'd20') { SFX.play('dice'); const n = 1 + Math.floor(Math.random() * 20); setTimeout(() => { info(n === 20 ? 'NAT 20! Critical success!' : n === 1 ? 'Rolled a 1… critical fail!' : `You rolled a ${n}`); if (n === 20) { unlock('dice'); FX.burst(p.x, p.y, { n: 50, shape: 'conf', size: 8 }); } }, 450); }
      else if (k === 'potion') { SFX.play('glug'); FX.burst(p.x, p.y - 10, { n: 14, angle: -Math.PI / 2, spread: .5, colors: [cssVar('--accent2'), '#fff'], g: .05, max: 3 }); info('+1 HP · Tastes like elderberries'); }
      else if (k === 'candle') { SFX.play('whoosh'); FX.burst(p.x, p.y - 14, { n: 16, angle: -Math.PI / 2, spread: .4, colors: ['#ffb22e', '#ffe27a'], g: -.02, max: 2 }); }
      else if (k === 'pad') { SFX.play('coin'); info('↑ ↑ ↓ ↓ ← → ← → B A'); }
      else SFX.play('tap');
    }
  });

  // journal header
  $('#jhead').onclick = e => {
    if (e.target.closest('#jBack')) closeBook();
    else if (e.target.closest('#jEdit')) { SFX.play('tap'); openEditor(S.current); }
    else if (e.target.closest('#jSearch')) { SFX.play('tap'); const s = $('#searchbar'); s.hidden = !s.hidden; if (!s.hidden) { J.tab = 'log'; renderJournal(); } else { J.q = ''; J.tag = 'all'; $('#searchIn').value = ''; renderJournal(); } }
  };
  $('#jtabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (!b || J.tab === b.dataset.tab) return; SFX.play('flip'); J.tab = b.dataset.tab; renderJournal(); if (J.tab === 'log') scrollLogToEnd(false); };
  $('#searchIn').addEventListener('input', e => { J.q = e.target.value.trim(); renderEntries(); });
  $('#sortBtn').onclick = () => { S.settings.sort = S.settings.sort === 'new' ? 'old' : 'new'; saveSettings(); SFX.play('flip'); renderEntries(); scrollLogToEnd(false); info(S.settings.sort === 'new' ? 'Newest entries first' : 'Oldest entries first (chronicle order)', 1400); };
  $('#filterTags').onclick = e => { const b = e.target.closest('[data-ftag]'); if (!b) return; J.tag = b.dataset.ftag; SFX.play('tap'); renderFilterTags(); renderEntries(); };
  $('#tagRow').onclick = e => { const b = e.target.closest('[data-tag]'); if (!b) return; J.curTag = b.dataset.tag; SFX.play('tap'); renderTagRow(); };
  $('#entries').onclick = e => {
    const a = e.target.closest('[data-act]'); const en = e.target.closest('.entry'); if (!en) return;
    if (a) { const id = en.dataset.id; if (a.dataset.act === 'del') deleteEntry(id); else if (a.dataset.act === 'edit') editEntry(id); else if (a.dataset.act === 'view') openLightbox(id); return; }
    if (e.target.closest('.polaroid')) return openLightbox(en.dataset.id);
    if (window.getSelection && String(window.getSelection()).length) return;
    const was = en.classList.contains('open'); $$('.entry.open').forEach(x => x.classList.remove('open')); if (!was) { en.classList.add('open'); SFX.play('click'); }
  };
  $('#paneGallery').onclick = e => { const t = e.target.closest('[data-eid]'); if (t) openLightbox(t.dataset.eid); };

  // composer
  const ta = $('#entryText');
  ta.addEventListener('input', autoGrow);
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submitEntry(); } });
  $('#composer').addEventListener('submit', e => { e.preventDefault(); submitEntry(); });
  $('#saveBtn').addEventListener('pointerdown', e => e.preventDefault());
  $('#photoIn').addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
    try { J.photo = await readImage(f); SFX.play('camera'); renderPhotoPreview(); const p = ptOf($('#camBtn')); FX.burst(p.x, p.y, { n: 18, colors: ['#fff', '#ffe'], g: .02, max: 3 }); }
    catch { SFX.play('error'); info("Couldn't read that image."); }
  });
  $('#ppreview').onclick = e => { if (e.target.id === 'rmPhoto') { J.photo = null; renderPhotoPreview(); SFX.play('tap'); } };

  // sheet
  $('#sheetBg').onclick = () => { SFX.play('tap'); sheetClose(); };
  $('#sheetX').onclick = () => { SFX.play('tap'); sheetClose(); };
  $('#sheetBody').addEventListener('input', e => {
    if (e.target.id === 'edTitle') { E.draft.title = e.target.value; const st = $('#pvStage'); if (st) st.querySelectorAll('.stitle,.ctitle').forEach(n => n.textContent = e.target.value || 'Untitled Quest'); }
    if (e.target.id === 'edColor') { E.draft.color = e.target.value; syncEditorUI(); renderPreview(null); }
    if (e.target.id === 'volIn') { S.settings.volume = +e.target.value; SFX.setVol(S.settings.volume); saveSettings(); }
  });
  $('#sheetBody').addEventListener('change', e => { if (e.target.id === 'volIn') SFX.play('coin'); });
  $('#sheetBody').addEventListener('click', async e => {
    const k = e.target.closest('[data-k]');
    if (k && sheetKind === 'editor') { E.draft[k.dataset.k] = k.dataset.v; syncEditorUI(); renderPreview(k.dataset.k === 'type' ? 'spin' : 'pop'); SFX.play(k.dataset.k === 'type' || k.dataset.k === 'pose' ? 'flip' : 'tap'); return; }
    const th = e.target.closest('[data-theme-id]'); if (th) { if (th.dataset.themeId !== S.settings.theme) applyTheme(th.dataset.themeId, th); return; }
    const a = e.target.closest('[data-act]'); if (!a) return;
    switch (a.dataset.act) {
      case 'random': { E.draft = randomBook(); E.draft.title = $('#edTitle').value; SFX.play('dice'); syncEditorUI(); renderPreview('spin'); const p = ptOf(a); FX.burst(p.x, p.y, { n: 20, shape: 'conf' }); break; }
      case 'savebook': await saveBook(); break;
      case 'delbook': await deleteBook(); break;
      case 'sound': S.settings.sound = !S.settings.sound; saveSettings(); a.classList.toggle('on', S.settings.sound); SFX.play('coin'); break;
      case 'dust': S.settings.dust = !S.settings.dust; saveSettings(); a.classList.toggle('on', S.settings.dust); if (!S.settings.dust) Dust.clear(); SFX.play('tap'); break;
      case 'curtains': toggleCurtains(); a.classList.toggle('on', S.settings.curtains !== 'closed'); break;
      case 'loc': { a.textContent = 'Locating…'; const l = await requestLocation(); if (l) { await refreshWeather(true); SFX.play('chime'); info(`Sky synced · ${COND_NAMES[SKY.cond]}`); } else { SFX.play('error'); info('Location unavailable. Check Settings › Privacy › Location Services for Safari Websites.', 3200); } openSettings('#grpWin'); break; }
      case 'sky': { if (!S.settings.location) { info('Set your location first.'); break; } a.textContent = 'Refreshing…'; const ok = await refreshWeather(true); SFX.play(ok ? 'chime' : 'error'); info(ok ? `Sky synced · ${COND_NAMES[SKY.cond]}, ${PHASE_NAMES[SKY.phase]}` : 'Could not reach the weather service.'); openSettings('#grpWin'); break; }
      case 'export': await exportLibrary(); break;
      case 'import': $('#importIn').click(); break;
      case 'wipe': await wipeAll(); break;
    }
  });
  $('#importIn').addEventListener('change', async e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) await importLibrary(f); });

  // viewport & lifecycle
  if (window.visualViewport) { visualViewport.addEventListener('resize', fitViewport); visualViewport.addEventListener('scroll', () => window.scrollTo(0, 0)); }
  window.addEventListener('resize', onResize); window.addEventListener('orientationchange', onResize);
  if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', onResize);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { computePhase(); skyMaintenance(); } });
  document.addEventListener('gesturestart', e => e.preventDefault());
  ['#app', '#scene', '#journal', '#library'].forEach(s => $(s).addEventListener('scroll', e => { e.target.scrollTop = 0; e.target.scrollLeft = 0; }));
}

async function boot() {
  loadLocal(); fitViewport(); orient();
  document.body.dataset.theme = S.settings.theme;
  bindEvents();
  try { await DB.open(); S.books = await DB.all('books'); await recount(); }
  catch (e) { console.error(e); info('Storage is unavailable (Private Browsing?). Entries may not save.', 4000); }
  FX.init(); Dust.init(); applyTheme(S.settings.theme); setCurtains(S.settings.curtains !== 'closed', false);
  applyWeather(); Win.init(); updatePlayer(); lastW = $('#shelves').clientWidth; renderLibrary(false);
  requestAnimationFrame(loop);
  setInterval(computePhase, 60 * 1000); setInterval(() => skyMaintenance(), 5 * 60 * 1000); setInterval(idleWiggle, 7000);
  if (!S.settings.introDone) introPressStart(); else { introReturning(); skyMaintenance(); }
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
  document.fonts && document.fonts.ready.then(() => { if ($('#library').classList.contains('active') && $('#intro') == null) renderLibrary(false); });
}
boot();
