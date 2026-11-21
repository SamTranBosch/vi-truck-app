import type { Activity, Lesson, LessonKind, Story } from './types';

/**
 * World 4 (tank truck): lessons 48–62 of Tiếng Việt 1, Tập 1 (Cánh Diều) plus the mid-term review (pp. 92–95), same order as the book:
 * ôm ôp, ơm ơp, story, review, Ôn tập giữa học kì I, um up, uôm, ươm ươp, an at, story, review, ăn ăt, ân ât, en et, ên êt, story.
 * Vần, words and order follow the book (pages 86–114, checked page by page); sentences and story wording are our own.
 * Sound answers are computed from the words (lib/vietnamese.ts).
 */

const storyDuckLark: Story = {
  id: 'vit-va-son-ca',
  title: 'Vịt và sơn ca',
  scenes: [
    { emoji: '🐦🎶', text: 'Sơn ca đậu trên gốc cây hót rất hay. Vịt con đứng nghe, thấy hay quá.' },
    { emoji: '🦆😞', text: 'Vịt con học hát nhưng giọng khàn khàn, chẳng hay chút nào. Vịt buồn, nghĩ mình chẳng giúp được ai.' },
    { emoji: '🐥😱', text: 'Bỗng có tiếng kêu cứu: gà con bị rơi xuống hồ sen. Vịt và các bạn cùng chạy tới.' },
    { emoji: '🦆🏊', text: 'Vịt lao xuống nước, bơi thật nhanh và cứu gà con vào bờ.' },
    { emoji: '🐔🦆', text: 'Các bạn vây quanh khen vịt. Vịt hiểu ra rằng mình cũng có ích.' },
  ],
};

const storyWolfSquirrel: Story = {
  id: 'soi-va-soc',
  title: 'Sói và sóc',
  scenes: [
    { emoji: '🐿️🌳', text: 'Sóc đang chuyền cành, chẳng may rơi xuống đúng chỗ chó sói đang nằm ngủ.' },
    { emoji: '🐺😠', text: 'Sói tỉnh dậy, định ăn thịt sóc. Sóc van nài: Xin bác tha cho cháu.' },
    { emoji: '🐺❓', text: 'Sói nói: Ta sẽ thả cháu, nếu cháu nói cho ta biết vì sao các cháu lúc nào cũng vui vẻ.' },
    { emoji: '🐿️🌲', text: 'Sóc nhảy lên cây rồi đáp: Bác hay tức giận nên bác buồn. Chúng cháu không làm hại ai nên chúng cháu vui.' },
  ],
};

const storyLionMouse: Story = {
  id: 'su-tu-va-chuot-nhat',
  title: 'Sư tử và chuột nhắt',
  scenes: [
    { emoji: '🦁🐭', text: 'Sư tử đi kiếm mồi, bắt được một con chuột nhắt bé xíu.' },
    { emoji: '🦁😮', text: 'Sư tử định ăn thịt chuột. Chuột van xin: Xin ngài tha cho tôi, sau này tôi sẽ báo đáp.' },
    { emoji: '🐭🤝', text: 'Sư tử tha cho chuột nhắt. Chuột hứa sẽ giúp sư tử khi cần.' },
    { emoji: '🦁😂', text: 'Sư tử phì cười: Bé xíu như cậu mà giúp được ta ư?' },
    { emoji: '🦁🕸️', text: 'Một hôm sư tử mắc vào lưới của thợ săn. Chuột nhắt chạy tới, cắn đứt lưới cứu sư tử.' },
    { emoji: '🦁💛', text: 'Sư tử cảm ơn chuột nhắt. Từ đó hai bạn trở thành bạn tốt của nhau.' },
  ],
};

const lesson = (id: string, kind: LessonKind, title: string, label: string, teaches: Lesson['teaches'], activities: Activity[]): Lesson => ({
  id, kind, title, label, teaches, activities,
});

const rhyme = (r: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { rhyme: r }, words });
const sound = (onset: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { onset }, words });

/** Vần taught up to this world, used as distractors (never the targets). */
const VAN = [
  'am', 'ap', 'ăm', 'ăp', 'âm', 'âp', 'em', 'ep', 'êm', 'êp', 'im', 'ip', 'om', 'op', 'ôm', 'ôp', 'ơm', 'ơp', 'um', 'up',
  'an', 'at', 'ăn', 'ăt', 'ân', 'ât', 'en', 'et', 'ên', 'êt',
];
const others = (...not: string[]) => VAN.filter((v) => !not.includes(v)).slice(-9);

export const WORLD4: Lesson[] = [
  lesson('bai-48', 'letters', 'Bài 48: ôm – ôp', 'ôm ôp', { letters: ['ôm', 'ôp'] }, [
    { type: 'meet', words: ['tôm', 'hộp sữa'], marks: ['ôm', 'ôp'] },
    { type: 'spell', words: ['ôm', 'tôm', 'ôp', 'hộp'] },
    rhyme('ôm', ['cốm', 'đốm lửa', 'chôm chôm', 'lốp xe', 'tốp ca', 'hộp sữa']),
    rhyme('ôp', ['lốp xe', 'tốp ca', 'hộp sữa', 'cốm', 'đồ gốm', 'tôm']),
    { type: 'findLetter', targets: ['ôm', 'ôp'], others: others('ôm', 'ôp') },
    { type: 'pick', mode: 'read', words: ['tôm', 'hộp sữa', 'lốp xe', 'đồ gốm'] },
    { type: 'read', lines: ['Mẹ mua tôm cho bé.', 'Bà có hộp sữa.', 'Bố có đồ gốm.', 'Bé Mi mê hộp sữa.'] },
    { type: 'trace', items: ['ôm', 'tôm', 'ôp', 'hộp sữa'] },
  ]),
  lesson('bai-49', 'letters', 'Bài 49: ơm – ơp', 'ơm ơp', { letters: ['ơm', 'ơp'] }, [
    { type: 'meet', words: ['cơm', 'tia chớp'], marks: ['ơm', 'ơp'] },
    { type: 'spell', words: ['ơm', 'cơm', 'ơp', 'chớp'] },
    rhyme('ơm', ['bơm', 'bờm ngựa', 'nơm', 'lớp', 'đớp cá', 'lợp nhà']),
    rhyme('ơp', ['lớp', 'đớp cá', 'lợp nhà', 'bơm', 'bờm ngựa', 'nơm']),
    { type: 'findLetter', targets: ['ơm', 'ơp'], others: others('ơm', 'ơp') },
    { type: 'pick', mode: 'read', words: ['cơm', 'tia chớp', 'bơm', 'lớp'] },
    { type: 'read', lines: ['Bé Hà có cơm.', 'Bố bơm xe đạp.', 'Có tia chớp, bé sợ.', 'Bé Lê đi lớp.'] },
    { type: 'trace', items: ['ơm', 'cơm', 'ơp', 'tia chớp'] },
  ]),
  lesson('bai-50', 'story', 'Bài 50: Vịt và sơn ca', '📖', {}, [{ type: 'story', story: storyDuckLark }]),
  lesson('bai-51', 'review', 'Bài 51: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Rùa nhí đi tìm chỗ ở.', 'Gặp thỏ, rùa chỉ ra nhà.', 'Thỏ chả có nhà.', 'Rùa cho thỏ ở nhờ.'] },
    { type: 'findLetter', targets: ['ôm', 'ơm'], others: ['om', 'op', 'ôp', 'ơp', 'um', 'up', 'em', 'êm', 'am'] },
    { type: 'pick', mode: 'read', words: ['diêm', 'yếm', 'lốp xe', 'tôm'] },
  ]),
  lesson('on-giua-ki', 'review', 'Ôn tập giữa học kì I', '🏁', {}, [
    { type: 'read', lines: ['Lớp cũ họp ở khóm tre.', 'Sẻ kể lể rôm rả.', 'Gà mẹ chăm lũ gà nhỏ.', 'Cua khệ nệ ôm yếm.'] },
    sound('gh', ['ghế', 'ghẹ', 'ghi', 'gà', 'gỗ', 'gấu']),
    { type: 'findLetter', targets: ['am', 'âm'], others: ['ăm', 'em', 'êm', 'im', 'om', 'ôm', 'ơm', 'um', 'uôm'] },
    { type: 'pick', mode: 'read', words: ['hộp sữa', 'lốp xe', 'tấm thiệp', 'nệm'] },
    { type: 'trace', items: ['khóm tre', 'lớp', 'họp'] },
  ]),
  lesson('bai-52', 'letters', 'Bài 52: um – up', 'um up', { letters: ['um', 'up'] }, [
    { type: 'meet', words: ['chum', 'búp bê'], marks: ['um', 'up'] },
    { type: 'spell', words: ['um', 'chum', 'up', 'búp'] },
    rhyme('um', ['chùm nho', 'tôm hùm', 'mũm mĩm', 'cúp', 'giúp đỡ', 'búp chè']),
    rhyme('up', ['cúp', 'giúp đỡ', 'búp chè', 'chùm nho', 'tôm hùm', 'mũm mĩm']),
    { type: 'findLetter', targets: ['um', 'up'], others: others('um', 'up') },
    { type: 'pick', mode: 'read', words: ['chum', 'búp bê', 'chùm nho', 'cúp'] },
    { type: 'read', lines: ['Bà có chùm nho.', 'Bé Hà giúp bà.', 'Hà ôm búp bê.', 'Bé Lê có cúp.'] },
    { type: 'trace', items: ['um', 'chum', 'up', 'búp bê'] },
  ]),
  lesson('bai-53', 'letters', 'Bài 53: uôm', 'uôm', { letters: ['uôm'] }, [
    { type: 'meet', words: ['buồm', 'quả muỗm'], marks: ['uôm'] },
    { type: 'spell', words: ['uôm', 'buồm', 'um', 'tùm'] },
    rhyme('uôm', ['buồm', 'quả muỗm', 'nhuộm', 'sum họp', 'um tùm', 'chùm nho']),
    rhyme('um', ['sum họp', 'um tùm', 'chùm nho', 'buồm', 'quả muỗm', 'nhuộm']),
    { type: 'findLetter', targets: ['uôm', 'um'], others: others('um', 'up').filter((v) => v !== 'um') },
    { type: 'pick', mode: 'read', words: ['buồm', 'quả muỗm', 'sum họp', 'um tùm'] },
    { type: 'read', lines: ['Bà có quả muỗm.', 'Cả nhà sum họp.', 'Bố nhuộm mũ cho bé.', 'Bé xem buồm ở hồ.'] },
    { type: 'trace', items: ['uôm', 'buồm', 'quả muỗm'] },
  ]),
  lesson('bai-54', 'letters', 'Bài 54: ươm – ươp', 'ươm', { letters: ['ươm', 'ươp'] }, [
    { type: 'meet', words: ['bươm bướm', 'quả mướp'], marks: ['ươm', 'ươp'] },
    { type: 'spell', words: ['ươm', 'gươm', 'ươp', 'mướp'] },
    rhyme('ươm', ['gươm', 'cườm', 'bươm bướm', 'quả mướp', 'ướp cá', 'chùm nho']),
    rhyme('ươp', ['quả mướp', 'ướp cá', 'tướp', 'gươm', 'cườm', 'chùm nho']),
    { type: 'findLetter', targets: ['ươm', 'ươp'], others: others('ươm', 'ươp') },
    { type: 'pick', mode: 'read', words: ['bươm bướm', 'quả mướp', 'gươm', 'cườm'] },
    { type: 'read', lines: ['Bé Hà có cườm.', 'Bố có gươm gỗ.', 'Mẹ ướp cá.', 'Bươm bướm ở bờ hồ.'] },
    { type: 'trace', items: ['ươm', 'gươm', 'ươp', 'quả mướp'] },
  ]),
  lesson('bai-55', 'letters', 'Bài 55: an – at', 'an at', { letters: ['an', 'at'] }, [
    { type: 'meet', words: ['bàn', 'nhà hát'], marks: ['an', 'at'] },
    { type: 'spell', words: ['an', 'bàn', 'at', 'hát'] },
    rhyme('an', ['nhãn', 'thợ hàn', 'màn', 'bát', 'hạt đỗ', 'nhà hát']),
    rhyme('at', ['bát', 'hạt đỗ', 'nhà hát', 'nhãn', 'thợ hàn', 'ngan']),
    { type: 'findLetter', targets: ['an', 'at'], others: others('an', 'at') },
    { type: 'pick', mode: 'read', words: ['bàn', 'nhà hát', 'nhãn', 'bát'] },
    { type: 'read', lines: ['Bà có bàn gỗ.', 'Cả nhà đi nhà hát.', 'Mẹ để bát ở bàn.', 'Bé Hà có nhãn.'] },
    { type: 'trace', items: ['an', 'bàn', 'at', 'nhà hát'] },
  ]),
  lesson('bai-56', 'story', 'Bài 56: Sói và sóc', '📖', {}, [{ type: 'story', story: storyWolfSquirrel }]),
  lesson('bai-57', 'review', 'Bài 57: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Quạ ghé xóm gà.', 'Gà tía la om sòm.', 'Cả xóm ùa ra.', 'Quạ sợ quá.'] },
    { type: 'findLetter', targets: ['um', 'uôm'], others: ['up', 'ươm', 'ươp', 'om', 'ôm', 'ơm', 'an', 'at', 'am'] },
    { type: 'pick', mode: 'read', words: ['chùm nho', 'bươm bướm', 'buồm', 'tôm hùm'] },
  ]),
  lesson('bai-58', 'letters', 'Bài 58: ăn – ăt', 'ăn ăt', { letters: ['ăn', 'ăt'] }, [
    { type: 'meet', words: ['chăn', 'mắt'], marks: ['ăn', 'ăt'] },
    { type: 'spell', words: ['ăn', 'chăn', 'ăt', 'mắt'] },
    rhyme('ăn', ['củ sắn', 'thợ lặn', 'trăn', 'chim cắt', 'bắt cá', 'mắt']),
    rhyme('ăt', ['chim cắt', 'bắt cá', 'mắt', 'củ sắn', 'thợ lặn', 'trăn']),
    { type: 'findLetter', targets: ['ăn', 'ăt'], others: others('ăn', 'ăt') },
    { type: 'pick', mode: 'read', words: ['chăn', 'mắt', 'trăn', 'bắt cá'] },
    { type: 'read', lines: ['Bà có chăn ấm.', 'Mắt bé Lê to.', 'Bé bắt cá ở hồ.', 'Mẹ chỉ trăn cho bé.'] },
    { type: 'trace', items: ['ăn', 'chăn', 'ăt', 'mắt'] },
  ]),
  lesson('bai-59', 'letters', 'Bài 59: ân – ât', 'ân ât', { letters: ['ân', 'ât'] }, [
    { type: 'meet', words: ['cân', 'vật'], marks: ['ân', 'ât'] },
    { type: 'spell', words: ['ân', 'cân', 'ât', 'vật'] },
    rhyme('ân', ['sân', 'mận', 'cân', 'tất', 'vật', 'mật']),
    rhyme('ât', ['tất', 'vật', 'mật', 'sân', 'mận', 'cân']),
    { type: 'findLetter', targets: ['ân', 'ât'], others: others('ân', 'ât') },
    { type: 'pick', mode: 'read', words: ['cân', 'vật', 'tất', 'mận'] },
    { type: 'read', lines: ['Bà có mận.', 'Bé Hà có tất ấm.', 'Mẹ cân mận cho bà.', 'Bé xem vật ở sân.'] },
    { type: 'trace', items: ['ân', 'cân', 'ât', 'vật'] },
  ]),
  lesson('bai-60', 'letters', 'Bài 60: en – et', 'en et', { letters: ['en', 'et'] }, [
    { type: 'meet', words: ['xe ben', 'vẹt'], marks: ['en', 'et'] },
    { type: 'spell', words: ['en', 'ben', 'et', 'vẹt'] },
    rhyme('en', ['khen', 'rèn', 'đèn', 'quét', 'hét', 'mẹt']),
    rhyme('et', ['quét', 'hét', 'mẹt', 'khen', 'rèn', 'đèn']),
    { type: 'findLetter', targets: ['en', 'et'], others: others('en', 'et') },
    { type: 'pick', mode: 'read', words: ['xe ben', 'vẹt', 'đèn', 'quét'] },
    { type: 'read', lines: ['Bé Hà khen mẹ.', 'Mẹ quét nhà.', 'Đèn ở nhà bà.', 'Vẹt hét to.'] },
    { type: 'trace', items: ['en', 'xe ben', 'et', 'vẹt'] },
  ]),
  lesson('bai-61', 'letters', 'Bài 61: ên – êt', 'ên êt', { letters: ['ên', 'êt'] }, [
    { type: 'meet', words: ['tên lửa', 'tết'], marks: ['ên', 'êt'] },
    { type: 'spell', words: ['ên', 'nến', 'êt', 'tết'] },
    rhyme('ên', ['nến', 'bến xe', 'sên', 'tết nơ', 'rết', 'tết']),
    rhyme('êt', ['tết nơ', 'rết', 'tết', 'nến', 'bến xe', 'sên']),
    { type: 'findLetter', targets: ['ên', 'êt'], others: others('ên', 'êt') },
    { type: 'pick', mode: 'read', words: ['tên lửa', 'tết', 'sên', 'bến xe'] },
    { type: 'read', lines: ['Bé Lê mê tên lửa.', 'Cả nhà ra bến xe.', 'Về quê ăn tết.', 'Bà thắp nến cho bé.'] },
    { type: 'trace', items: ['ên', 'tên lửa', 'êt', 'tết'] },
  ]),
  lesson('bai-62', 'story', 'Bài 62: Sư tử và chuột nhắt', '📖', {}, [{ type: 'story', story: storyLionMouse }]),
];
