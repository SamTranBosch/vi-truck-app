import type { Lesson, Story } from './types';

/**
 * World 1 (fire truck): Mở đầu + lessons 1–15 of Tiếng Việt 1, Tập 1 (Cánh Diều), same order as the book.
 * Wording, pictures and stories are our own; only the sequence of letters and tones follows the book.
 * Sound and tone answers are NOT stored: they are computed from the words (see lib/vietnamese.ts).
 */

const storyTwoGoats: Story = {
  id: 'hai-con-de',
  title: 'Hai con dê',
  scenes: [
    { emoji: '🐐🌉', text: 'Hai con dê cùng muốn qua cầu.' },
    { emoji: '🐐🐐', text: 'Cầu hẹp quá. Hai con dê gặp nhau giữa cầu.' },
    { emoji: '💢🐐', text: 'Con nào cũng không chịu nhường. Chúng húc nhau.' },
    { emoji: '💦🐐', text: 'Cả hai cùng rơi xuống nước.' },
  ],
};

const storyChickSchool: Story = {
  id: 'ga-con-di-hoc',
  title: 'Gà con đi học',
  scenes: [
    { emoji: '🐣', text: 'Gà con muốn đi học.' },
    { emoji: '🎒🐥', text: 'Gà con đeo cặp đến lớp.' },
    { emoji: '👩‍🏫📖', text: 'Cô giáo dạy gà con đọc chữ.' },
    { emoji: '🌟🐥', text: 'Gà con đọc được chữ đầu tiên. Gà con rất vui.' },
  ],
};

const storyHareTortoise: Story = {
  id: 'tho-va-rua',
  title: 'Thỏ và rùa',
  scenes: [
    { emoji: '🐰🐢', text: 'Thỏ và rùa thi chạy.' },
    { emoji: '🐰💨', text: 'Thỏ chạy rất nhanh, rùa đi chậm rãi.' },
    { emoji: '🐰💤', text: 'Thỏ nằm ngủ dưới gốc cây.' },
    { emoji: '🐢🏁', text: 'Rùa đi mãi không nghỉ và về đích trước.' },
  ],
};

export const WORLD1: Lesson[] = [
  {
    id: 'mo-dau',
    kind: 'intro',
    title: 'Mở đầu: Em là học sinh',
    label: '🎒',
    teaches: {},
    activities: [
      { type: 'meet', words: ['sách', 'cặp', 'bút', 'thước', 'cô giáo', 'lớp học'] },
      { type: 'pick', mode: 'hear', words: ['sách', 'cặp', 'bút', 'thước', 'cô giáo', 'lớp học'] },
    ],
  },
  {
    id: 'bai-1',
    kind: 'letters',
    title: 'Bài 1: a – c',
    label: 'a c',
    teaches: { letters: ['a', 'c'] },
    activities: [
      { type: 'meet', words: ['ca', 'cá'], marks: ['a', 'c'] },
      { type: 'spell', words: ['ca'] },
      { type: 'hunt', kind: 'sound', target: { vowel: 'a' }, words: ['gà', 'cá', 'cà', 'nhà', 'lá', 'thỏ'] },
      { type: 'hunt', kind: 'sound', target: { onset: 'c' }, words: ['cờ', 'cú', 'cá', 'cà', 'vịt', 'dê'] },
      { type: 'findLetter', targets: ['a', 'c'], others: ['e', 'o', 's', 't', 'n', 'v', 'h', 'i', 'k', 'd'] },
      { type: 'trace', items: ['a', 'c', 'ca'] },
    ],
  },
  {
    id: 'bai-2',
    kind: 'tones',
    title: 'Bài 2: cà – cá',
    label: 'cà cá',
    teaches: { tones: ['huyen', 'sac'] },
    activities: [
      { type: 'meet', words: ['cà', 'cá'] },
      { type: 'spell', words: ['cà', 'cá'] },
      { type: 'hunt', kind: 'tone', tone: 'huyen', words: ['bò', 'gà', 'nhà', 'cà', 'thỏ', 'nho'] },
      { type: 'hunt', kind: 'tone', tone: 'sac', words: ['cá', 'lá', 'cú', 'bóng', 'chó', 'hổ'] },
      { type: 'trace', items: ['cà', 'cá'] },
    ],
  },
  { id: 'bai-3', kind: 'story', title: 'Bài 3: Hai con dê', label: '📖', teaches: {}, activities: [{ type: 'story', story: storyTwoGoats }] },
  {
    id: 'bai-4',
    kind: 'letters',
    title: 'Bài 4: o – ô',
    label: 'o ô',
    teaches: { letters: ['o', 'ô'] },
    activities: [
      { type: 'meet', words: ['nho', 'cô'], marks: ['o', 'ô'] },
      { type: 'spell', words: ['co', 'cô'] },
      { type: 'hunt', kind: 'sound', target: { vowel: 'o' }, words: ['thỏ', 'nho', 'bò', 'cọ', 'dê', 'gà'] },
      { type: 'hunt', kind: 'sound', target: { vowel: 'ô' }, words: ['hổ', 'tổ', 'rổ', 'xô', 'hồ', 'dế'] },
      { type: 'findLetter', targets: ['o', 'ô'], others: ['e', 'd', 'h', 'r', 'k', 'x', 'v', 'n', 't', 's'] },
      { type: 'trace', items: ['o', 'ô', 'cô'] },
    ],
  },
  {
    id: 'bai-5',
    kind: 'tones',
    title: 'Bài 5: cỏ – cọ',
    label: 'cỏ cọ',
    teaches: { tones: ['hoi', 'nang'] },
    activities: [
      { type: 'meet', words: ['cỏ', 'cọ'] },
      { type: 'spell', words: ['cỏ', 'cọ'] },
      { type: 'hunt', kind: 'tone', tone: 'hoi', words: ['hổ', 'thỏ', 'cỏ', 'rổ', 'bò', 'cá'] },
      { type: 'hunt', kind: 'tone', tone: 'nang', words: ['cọ', 'vịt', 'ngựa', 'chuột', 'vẹt', 'chuối'] },
      { type: 'pick', mode: 'read', words: ['cỏ', 'cọ', 'cô', 'cá'] },
      { type: 'trace', items: ['cỏ', 'cọ'] },
    ],
  },
  {
    id: 'bai-6',
    kind: 'letters',
    title: 'Bài 6: ơ – d',
    label: 'ơ d',
    teaches: { letters: ['ơ', 'd'] },
    activities: [
      { type: 'meet', words: ['cờ', 'dê'], marks: ['ơ', 'd'] },
      { type: 'spell', words: ['cờ', 'da'] },
      { type: 'hunt', kind: 'sound', target: { vowel: 'ơ' }, words: ['nơ', 'phở', 'bơ', 'cờ', 'xe', 'táo'] },
      { type: 'hunt', kind: 'sound', target: { onset: 'd' }, words: ['dê', 'dế', 'dâu', 'dừa', 'khỉ', 'táo'] },
      { type: 'findLetter', targets: ['ơ', 'd'], others: ['a', 'c', 'o', 'ô', 's', 'x', 'v', 'n', 'r', 'k'] },
      { type: 'pick', mode: 'read', words: ['cờ', 'cà', 'cá', 'cỏ'] },
      { type: 'trace', items: ['ơ', 'd', 'da'] },
    ],
  },
  {
    id: 'bai-7',
    kind: 'letters',
    title: 'Bài 7: đ – e',
    label: 'đ e',
    teaches: { letters: ['đ', 'e'] },
    activities: [
      { type: 'meet', words: ['đèn', 'xe'], marks: ['đ', 'e'] },
      { type: 'spell', words: ['đa', 'đe'] },
      { type: 'hunt', kind: 'sound', target: { onset: 'đ' }, words: ['đèn', 'đá', 'đàn', 'đĩa', 'xe', 'lá'] },
      { type: 'hunt', kind: 'sound', target: { vowel: 'e' }, words: ['xe', 'sẻ', 'ghe', 'bé', 'dứa', 'cá'] },
      { type: 'findLetter', targets: ['đ', 'e'], others: ['d', 'a', 'o', 's', 'x', 'v', 'n', 'r', 'k', 'c'] },
      { type: 'pick', mode: 'read', words: ['đá', 'cờ', 'cô', 'cá'] },
      { type: 'trace', items: ['đ', 'e', 'đe', '0', '1'] },
    ],
  },
  { id: 'bai-8', kind: 'story', title: 'Bài 8: Gà con đi học', label: '📖', teaches: {}, activities: [{ type: 'story', story: storyChickSchool }] },
  {
    id: 'bai-9',
    kind: 'review',
    title: 'Bài 9: Ôn tập',
    label: '🔁',
    teaches: {},
    activities: [
      { type: 'combine', onsets: ['c', 'd', 'đ'], vowels: ['a', 'o', 'ô', 'ơ', 'e'], blocked: ['ce'], need: 6 },
      { type: 'pick', mode: 'read', words: ['đá', 'cọ', 'cờ', 'cỏ'] },
    ],
  },
  {
    id: 'bai-10',
    kind: 'letters',
    title: 'Bài 10: ê – l',
    label: 'ê l',
    teaches: { letters: ['ê', 'l'] },
    activities: [
      { type: 'meet', words: ['lê', 'bê'], marks: ['ê', 'l'] },
      { type: 'spell', words: ['lê', 'la'] },
      { type: 'hunt', kind: 'sound', target: { vowel: 'ê' }, words: ['lê', 'bê', 'dế', 'ếch', 'gà', 'cá'] },
      { type: 'hunt', kind: 'sound', target: { onset: 'l' }, words: ['lửa', 'lúa', 'lá', 'lê', 'gà', 'thỏ'] },
      { type: 'findLetter', targets: ['ê', 'l'], others: ['e', 'a', 'o', 's', 'x', 'v', 'n', 'r', 'k', 'c'] },
      { type: 'pick', mode: 'read', words: ['lê', 'lá', 'lọ', 'đá'] },
      { type: 'trace', items: ['ê', 'l', 'lê'] },
    ],
  },
  {
    id: 'bai-11',
    kind: 'tones',
    title: 'Bài 11: b – bễ',
    label: 'b bễ',
    teaches: { letters: ['b'], tones: ['nga'] },
    activities: [
      { type: 'meet', words: ['bê', 'bí'], marks: ['b'] },
      { type: 'spell', words: ['bê', 'bễ'] },
      { type: 'hunt', kind: 'sound', target: { onset: 'b' }, words: ['bò', 'bóng', 'bánh', 'bí', 'lá', 'gà'] },
      { type: 'hunt', kind: 'tone', tone: 'nga', words: ['vẽ', 'đũa', 'sữa', 'võ', 'cá', 'gà'] },
      { type: 'pick', mode: 'read', words: ['bò', 'bê', 'cọ', 'lê'] },
      { type: 'trace', items: ['b', 'bê', 'bễ', '2', '3'] },
    ],
  },
  {
    id: 'bai-12',
    kind: 'letters',
    title: 'Bài 12: g – h',
    label: 'g h',
    teaches: { letters: ['g', 'h'] },
    activities: [
      { type: 'meet', words: ['ga', 'hồ'], marks: ['g', 'h'] },
      { type: 'spell', words: ['ga', 'hồ'] },
      { type: 'hunt', kind: 'sound', target: { onset: 'g' }, words: ['gà', 'gấu', 'gạo', 'gỗ', 'hổ', 'cá'] },
      { type: 'hunt', kind: 'sound', target: { onset: 'h' }, words: ['hổ', 'hoa', 'hành', 'hồ', 'gấu', 'cá'] },
      { type: 'findLetter', targets: ['g', 'h'], others: ['a', 'c', 'o', 'ô', 's', 'x', 'v', 'n', 'r', 'k'] },
      { type: 'pick', mode: 'read', words: ['gà', 'hồ', 'hổ', 'ga'] },
      { type: 'trace', items: ['g', 'ga', 'h', 'hồ'] },
    ],
  },
  {
    id: 'bai-13',
    kind: 'letters',
    title: 'Bài 13: i – ia',
    label: 'i ia',
    teaches: { letters: ['i', 'ia'] },
    activities: [
      { type: 'meet', words: ['bí', 'đĩa'], marks: ['i', 'ia'] },
      { type: 'spell', words: ['bi', 'bìa'] },
      { type: 'hunt', kind: 'sound', target: { vowel: 'i' }, words: ['bí', 'ví', 'chỉ', 'khỉ', 'gà', 'hổ'] },
      { type: 'hunt', kind: 'sound', target: { vowel: 'ia' }, words: ['đĩa', 'bìa', 'chìa', 'bí', 'khỉ', 'hổ'] },
      { type: 'findLetter', targets: ['i'], others: ['a', 'c', 'o', 'ô', 's', 'x', 'v', 'n', 'r', 'k', 'l'] },
      { type: 'pick', mode: 'read', words: ['bí', 'đĩa', 'bìa', 'gà'] },
      { type: 'trace', items: ['i', 'bìa', '4', '5'] },
    ],
  },
  { id: 'bai-14', kind: 'story', title: 'Bài 14: Thỏ và rùa', label: '📖', teaches: {}, activities: [{ type: 'story', story: storyHareTortoise }] },
  {
    id: 'bai-15',
    kind: 'review',
    title: 'Bài 15: Ôn tập',
    label: '🔁',
    teaches: {},
    activities: [
      { type: 'combine', onsets: ['l', 'b', 'h', 'g'], vowels: ['a', 'o', 'ô', 'ơ', 'e', 'ê', 'i', 'ia'], blocked: ['ge', 'gê', 'gi', 'gia'], need: 8 },
      { type: 'pick', mode: 'read', words: ['bí', 'lê', 'hổ', 'gà', 'đĩa'] },
    ],
  },
];

export const WORLD1_IDS = WORLD1.map((l) => l.id);
