import type { Activity, Lesson, LessonKind, Story } from './types';

/**
 * World 2 (cement mixer): lessons 16–31 of Tiếng Việt 1, Tập 1 (Cánh Diều), same order as the book:
 * gh, gi k, kh m, n nh, story, review, ng ngh, p ph, qu r, s x, story, review, t th, tr ch, u ư, ua ưa.
 * Letters, words and the order follow the book (pages 32–59, checked page by page); sentences and
 * story wording are our own. Sound answers are computed from the words (lib/vietnamese.ts).
 */

const storyTwoFriends: Story = {
  id: 'doi-ban',
  title: 'Đôi bạn',
  scenes: [
    { emoji: '🐿️🐿️', text: 'Trong rừng có hai bạn sóc rất thân nhau: sóc nâu và sóc đỏ.' },
    { emoji: '⛈️🌲', text: 'Đêm đó, trong rừng có mưa to gió lớn.' },
    { emoji: '🌅🐿️', text: 'Sáng sớm thức dậy, sóc nâu nghĩ đến bạn. Sóc nâu đi tìm quả thông.' },
    { emoji: '🧺🌰', text: 'Sóc nâu nhặt được một giỏ quả thông đầy.' },
    { emoji: '🏠🐿️', text: 'Khi trở về nhà, sóc nâu thấy bạn đang đứng chờ ở cửa.' },
    { emoji: '🤗🐿️', text: 'Hai bạn gặp lại nhau, ôm nhau thật vui.' },
  ],
};

const storyAntDove: Story = {
  id: 'kien-va-bo-cau',
  title: 'Kiến và bồ câu',
  scenes: [
    { emoji: '🐜💦', text: 'Kiến xuống suối uống nước thì bị rơi xuống nước.' },
    { emoji: '🕊️🍃', text: 'Bồ câu thấy kiến, thả một chiếc lá xuống suối cho kiến bám vào.' },
    { emoji: '🏹🕊️', text: 'Bác thợ săn giương cung, định bắn bồ câu.' },
    { emoji: '🐜🦶', text: 'Kiến cắn vào chân bác thợ săn. Bồ câu bay đi thoát nạn.' },
  ],
};

const lesson = (id: string, kind: LessonKind, title: string, label: string, teaches: Lesson['teaches'], activities: Activity[]): Lesson => ({
  id, kind, title, label, teaches, activities,
});

const sound = (onset: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { onset }, words });
const vowel = (v: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { vowel: v }, words });

export const WORLD2: Lesson[] = [
  lesson('bai-16', 'letters', 'Bài 16: gh', 'gh', { letters: ['gh'] }, [
    { type: 'meet', words: ['ghế', 'gỗ'], marks: ['gh', 'g'] },
    { type: 'spell', words: ['ghế', 'gỗ'] },
    sound('gh', ['ghế', 'ghẹ', 'ghi', 'gà', 'gỗ', 'gấu']),
    sound('g', ['gà', 'gỗ', 'gạo', 'ghế', 'ghẹ', 'ghi']),
    { type: 'findLetter', targets: ['gh'], others: ['g', 'h', 'k', 'n', 'm', 'e', 'ê', 'i', 'a'] },
    { type: 'pick', mode: 'read', words: ['ghế', 'gỗ', 'gà', 'ghẹ'] },
    { type: 'read', lines: ['Bé Hà có ghế gỗ.', 'Hồ có ghế đá.', 'Bé Lê ở ghế da.'] },
    { type: 'trace', items: ['gh', 'ghế', 'gỗ', '6', '7'] },
  ]),
  lesson('bai-17', 'letters', 'Bài 17: gi – k', 'gi k', { letters: ['gi', 'k'] }, [
    { type: 'meet', words: ['giá đỗ', 'kì đà'], marks: ['gi', 'k'] },
    { type: 'spell', words: ['giá', 'kì'] },
    sound('gi', ['giò', 'giỏ', 'giá', 'kẻ', 'kể', 'kéo']),
    sound('k', ['kẻ', 'kể', 'kéo', 'giò', 'giá', 'gà']),
    { type: 'findLetter', targets: ['gi', 'k'], others: ['g', 'h', 'kh', 'i', 'c', 'n', 'm', 'e', 'a'] },
    { type: 'pick', mode: 'read', words: ['giá', 'giò', 'giỏ', 'kẻ'] },
    { type: 'read', lines: ['Bé Kì có giò.', 'Bà có giỏ cá.', 'Kì đà ở bờ hồ.'] },
    { type: 'trace', items: ['gi', 'giá đỗ', 'k', 'kì đà'] },
  ]),
  lesson('bai-18', 'letters', 'Bài 18: kh – m', 'kh m', { letters: ['kh', 'm'] }, [
    { type: 'meet', words: ['khế', 'me'], marks: ['kh', 'm'] },
    { type: 'spell', words: ['khế', 'me'] },
    sound('kh', ['khế', 'khỉ', 'khoai', 'mèo', 'mẹ', 'mũ']),
    sound('m', ['mèo', 'mẹ', 'mũ', 'khế', 'khỉ', 'gà']),
    { type: 'findLetter', targets: ['kh', 'm'], others: ['k', 'h', 'n', 'nh', 'r', 'g', 'e', 'a', 'o'] },
    { type: 'pick', mode: 'read', words: ['khế', 'me', 'mẹ', 'khỉ'] },
    { type: 'read', lines: ['Mẹ có cá kho.', 'Bé Mi có khế.', 'Bố có me, có khế.'] },
    { type: 'trace', items: ['kh', 'khế', 'm', 'me'] },
  ]),
  lesson('bai-19', 'letters', 'Bài 19: n – nh', 'n nh', { letters: ['n', 'nh'] }, [
    { type: 'meet', words: ['nơ', 'nho'], marks: ['n', 'nh'] },
    { type: 'spell', words: ['nơ', 'nho'] },
    sound('n', ['na', 'nai', 'nồi', 'nhà', 'nhện', 'nho']),
    sound('nh', ['nhà', 'nhện', 'nho', 'na', 'nai', 'nồi']),
    { type: 'findLetter', targets: ['n', 'nh'], others: ['m', 'h', 'r', 'ng', 'k', 'u', 'a', 'o', 'e'] },
    { type: 'pick', mode: 'read', words: ['nhà', 'nho', 'na', 'nơ'] },
    { type: 'read', lines: ['Nhà bà ở bờ hồ.', 'Nhà bà có na, có nho.', 'Hồ nhỏ, có cá mè.'] },
    { type: 'trace', items: ['n', 'nơ', 'nh', 'nho', '8', '9'] },
  ]),
  lesson('bai-20', 'story', 'Bài 20: Đôi bạn', '📖', {}, [{ type: 'story', story: storyTwoFriends }]),
  lesson('bai-21', 'review', 'Bài 21: Ôn tập', '🔁', {}, [
    {
      type: 'combine',
      onsets: ['c', 'k', 'g', 'gh'],
      vowels: ['a', 'o', 'ô', 'ơ', 'e', 'ê', 'i', 'ia'],
      blocked: ['ce', 'cê', 'ci', 'cia', 'ka', 'ko', 'kô', 'kơ', 'ge', 'gê', 'gi', 'gia', 'gha', 'gho', 'ghô', 'ghơ', 'ghia'],
      need: 8,
    },
    { type: 'read', lines: ['Mẹ ở nhà.', 'Bi bế bé Li.', 'Bé Li nhớ mẹ.', 'Mẹ có me, có khế.'] },
    { type: 'pick', mode: 'read', words: ['kẻ', 'ghế', 'giỏ', 'khế'] },
  ]),
  lesson('bai-22', 'letters', 'Bài 22: ng – ngh', 'ng ngh', { letters: ['ng', 'ngh'] }, [
    { type: 'meet', words: ['ngà', 'nghé'], marks: ['ng', 'ngh'] },
    { type: 'spell', words: ['ngà', 'nghé'] },
    sound('ng', ['ngô', 'ngựa', 'ngỗng', 'nghé', 'nghe', 'nghỉ']),
    sound('ngh', ['nghé', 'nghe', 'nghệ', 'ngô', 'ngựa', 'nhà']),
    { type: 'findLetter', targets: ['ng', 'ngh'], others: ['n', 'nh', 'g', 'gh', 'h', 'm', 'a', 'e', 'i'] },
    { type: 'pick', mode: 'read', words: ['ngô', 'nghé', 'ngà', 'nghệ'] },
    { type: 'read', lines: ['Bà nghe bé Lê.', 'Nghé ở bờ hồ.', 'Bà có ngô, có nghệ.', 'Bé Hà nghỉ ở nhà bà.'] },
    { type: 'trace', items: ['ng', 'ngà', 'ngh', 'nghé'] },
  ]),
  lesson('bai-23', 'letters', 'Bài 23: p – ph', 'p ph', { letters: ['p', 'ph'] }, [
    { type: 'meet', words: ['pi a nô', 'phố cổ'], marks: ['p', 'ph'] },
    { type: 'spell', words: ['pi', 'phố'] },
    sound('p', ['pi a nô', 'pa nô', 'pin', 'phở', 'phà', 'cà phê']),
    sound('ph', ['phở', 'phà', 'cà phê', 'phố cổ', 'pin', 'pa nô']),
    { type: 'findLetter', targets: ['p', 'ph'], others: ['b', 'd', 'q', 'h', 'f', 'k', 'g', 'a', 'o'] },
    { type: 'pick', mode: 'read', words: ['phở', 'phà', 'pi a nô', 'phố cổ'] },
    { type: 'read', lines: ['Bà có pi a nô.', 'Mẹ pha cà phê.', 'Bố đi phố.', 'Bé Li có phở.'] },
    { type: 'trace', items: ['p', 'pi a nô', 'ph', 'phố cổ'] },
  ]),
  lesson('bai-24', 'letters', 'Bài 24: qu – r', 'qu r', { letters: ['qu', 'r'] }, [
    { type: 'meet', words: ['quả lê', 'rổ cá'], marks: ['qu', 'r'] },
    { type: 'spell', words: ['quả', 'rổ'] },
    sound('qu', ['quả lê', 'quả cam', 'quần', 'rùa', 'rau', 'rổ']),
    sound('r', ['rùa', 'rau', 'rồng', 'quả lê', 'quần', 'gà']),
    { type: 'findLetter', targets: ['qu', 'r'], others: ['q', 'u', 'v', 'n', 'm', 's', 'x', 'a', 'e'] },
    { type: 'pick', mode: 'read', words: ['quả lê', 'rổ', 'quạ', 'khế'] },
    { type: 'read', lines: ['Rổ có quả lê.', 'Quạ ở bờ hồ.', 'Mẹ có rổ khế, rổ me.'] },
    { type: 'trace', items: ['qu', 'quả lê', 'r', 'rổ cá'] },
  ]),
  lesson('bai-25', 'letters', 'Bài 25: s – x', 's x', { letters: ['s', 'x'] }, [
    { type: 'meet', words: ['sẻ', 'xe ca'], marks: ['s', 'x'] },
    { type: 'spell', words: ['sẻ', 'xe'] },
    sound('s', ['sóc', 'sò', 'sổ', 'xô', 'xe', 'xương']),
    sound('x', ['xô', 'xe', 'xương', 'sóc', 'sò', 'sách']),
    { type: 'findLetter', targets: ['s', 'x'], others: ['r', 'ch', 'tr', 't', 'th', 'k', 'a', 'e', 'o'] },
    { type: 'pick', mode: 'read', words: ['sẻ', 'sổ', 'xô', 'xe ca'] },
    { type: 'read', lines: ['Xe ca ở bờ hồ.', 'Sẻ ở nhà bà.', 'Bi có sổ, có xô.'] },
    { type: 'trace', items: ['s', 'sẻ', 'x', 'xe ca'] },
  ]),
  lesson('bai-26', 'story', 'Bài 26: Kiến và bồ câu', '📖', {}, [{ type: 'story', story: storyAntDove }]),
  lesson('bai-27', 'review', 'Bài 27: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Bà ở quê, xa nhà Bi.', 'Bi nhớ bà, bà nhớ Bi.', 'Bà có na, có me.'] },
    {
      type: 'combine',
      onsets: ['ng', 'ngh'],
      vowels: ['a', 'o', 'ô', 'ơ', 'e', 'ê', 'i'],
      blocked: ['nge', 'ngê', 'ngi', 'ngha', 'ngho', 'nghô', 'nghơ'],
      need: 6,
    },
    { type: 'pick', mode: 'read', words: ['ngô', 'nghé', 'nghệ', 'ngà'] },
  ]),
  lesson('bai-28', 'letters', 'Bài 28: t – th', 't th', { letters: ['t', 'th'] }, [
    { type: 'meet', words: ['tổ', 'thỏ'], marks: ['t', 'th'] },
    { type: 'spell', words: ['tổ', 'thỏ'] },
    sound('t', ['tổ', 'tô', 'tỏi', 'thỏ', 'thìa', 'thư']),
    sound('th', ['thỏ', 'thìa', 'thư', 'tay', 'tivi', 'tổ']),
    { type: 'findLetter', targets: ['t', 'th'], others: ['tr', 'ch', 'h', 'n', 'm', 'l', 'a', 'o', 'e'] },
    { type: 'pick', mode: 'read', words: ['tổ', 'thỏ', 'thìa', 'tô'] },
    { type: 'read', lines: ['Thỏ ở tổ.', 'Bé Thơ bế thỏ.', 'Thơ có thìa, có tô.'] },
    { type: 'trace', items: ['t', 'tổ', 'th', 'thỏ'] },
  ]),
  lesson('bai-29', 'letters', 'Bài 29: tr – ch', 'tr ch', { letters: ['tr', 'ch'] }, [
    { type: 'meet', words: ['tre', 'chó'], marks: ['tr', 'ch'] },
    { type: 'spell', words: ['tre', 'chó'] },
    sound('tr', ['trà', 'trứng', 'trăng', 'chó', 'chỉ', 'chuối']),
    sound('ch', ['chó', 'chỉ', 'chuột', 'trà', 'trứng', 'tre']),
    { type: 'findLetter', targets: ['tr', 'ch'], others: ['t', 'th', 'c', 'h', 'r', 'k', 'a', 'o', 'e'] },
    { type: 'pick', mode: 'read', words: ['tre', 'chó', 'trà', 'chỉ'] },
    { type: 'read', lines: ['Chị Trà có trà.', 'Chị Trà bế bé Chi.', 'Chó ở bờ hồ.'] },
    { type: 'trace', items: ['tr', 'tre', 'ch', 'chó'] },
  ]),
  lesson('bai-30', 'letters', 'Bài 30: u – ư', 'u ư', { letters: ['u', 'ư'] }, [
    { type: 'meet', words: ['tủ', 'sư tử'], marks: ['u', 'ư'] },
    { type: 'spell', words: ['tủ', 'sư'] },
    vowel('u', ['tủ', 'cú', 'mũ', 'cá thu', 'sư tử', 'thư']),
    vowel('ư', ['sư tử', 'thư', 'chữ', 'tủ', 'cú', 'mũ']),
    { type: 'findLetter', targets: ['u', 'ư'], others: ['o', 'ô', 'ơ', 'i', 'n', 'm', 'a', 'e', 'c'] },
    { type: 'pick', mode: 'read', words: ['tủ', 'cú', 'mũ', 'thư'] },
    { type: 'read', lines: ['Bé Thơ có tủ.', 'Sư tử ở bờ hồ.', 'Chú Tú có mũ.', 'Cú ở tổ.'] },
    { type: 'trace', items: ['u', 'tủ', 'ư', 'sư tử'] },
  ]),
  lesson('bai-31', 'letters', 'Bài 31: ua – ưa', 'ua ưa', { letters: ['ua', 'ưa'] }, [
    { type: 'meet', words: ['cua', 'ngựa'], marks: ['ua', 'ưa'] },
    { type: 'spell', words: ['cua', 'ngựa'] },
    vowel('ua', ['cua', 'rùa', 'cà chua', 'múa', 'ngựa', 'sữa']),
    vowel('ưa', ['ngựa', 'sữa', 'dưa', 'mưa', 'cua', 'rùa']),
    { type: 'findLetter', targets: ['ua', 'ưa'], others: ['u', 'ư', 'ia', 'a', 'o', 'e', 'i', 'ơ', 'ô'] },
    { type: 'pick', mode: 'read', words: ['cua', 'rùa', 'ngựa', 'dưa'] },
    { type: 'read', lines: ['Bé Lê có quả dưa.', 'Mẹ mua cà chua.', 'Cua ở bờ hồ.', 'Bà mua sữa cho bé.'] },
    { type: 'trace', items: ['ua', 'cua', 'ưa', 'ngựa'] },
  ]),
];
