import type { Activity, Lesson, LessonKind, Story } from './types';

/**
 * World 6 (crane truck): lessons 79–93 of Tiếng Việt 1, Tập 1 (Cánh Diều) plus the end-of-term review (pp. 166–169), same order as the book:
 * âng âc, story, review, eng ec, iêng yêng iêc, ong oc, ông ôc, story, review, ung uc, ưng ưc, uông uôc, ương ươc, story, review, Ôn tập cuối học kì I.
 * Vần, words and order follow the book (pages 142–169, checked page by page); sentences and story wording are our own.
 * Sound answers are computed from the words (lib/vietnamese.ts).
 */

const storyNeighbours: Story = {
  id: 'hang-xom',
  title: 'Hàng xóm',
  scenes: [
    { emoji: '🦦😷', text: 'Chồn mẹ bị ốm, nằm trong chăn. Mấy chú chồn con rất lo.' },
    { emoji: '🐦🌳', text: 'Chim sẻ đậu trên cành cây, nhìn thấy chuyện ở nhà chồn.' },
    { emoji: '🐘💦', text: 'Sẻ báo tin cho bác voi. Bác voi lấy vòi hút nước, mang đến giúp nhà chồn.' },
    { emoji: '🐿️🍲', text: 'Sẻ còn báo tin cho cô sóc. Cô sóc nấu cháo, mang sang cho chồn mẹ.' },
    { emoji: '🦘💊', text: 'Nhận được tin của sẻ, chuột túi cũng chạy tới giúp, chăm sóc cả nhà chồn.' },
    { emoji: '🦦🙏', text: 'Chồn mẹ rất cảm động, nói lời cảm ơn mọi người đã giúp đỡ.' },
  ],
};

const storyGirlBear: Story = {
  id: 'co-be-va-con-gau',
  title: 'Cô bé và con gấu',
  scenes: [
    { emoji: '👧🦋', text: 'Bố mẹ đi vắng, cô bé ở nhà một mình, chạy ra vườn bắt bướm.' },
    { emoji: '🐻😨', text: 'Bỗng một con gấu to xuất hiện sau hàng rào. Cô bé đứng im vì sợ.' },
    { emoji: '🐻🤕', text: 'Cô bé thấy gấu ngồi xuống, ôm chân đau. Cô bé thấy đỡ sợ hơn.' },
    { emoji: '👧🪡', text: 'Cô bé nhẹ nhàng nhổ chiếc gai đâm vào chân gấu.' },
    { emoji: '👨‍👩‍👧😮', text: 'Bố mẹ về nhà, nghe cô bé kể lại mọi chuyện, ai cũng ngạc nhiên và khen con.' },
    { emoji: '🐻🍯', text: 'Hôm sau, gấu mang mật ong đến tặng cô bé để tỏ lòng biết ơn.' },
  ],
};

const storyCrane: Story = {
  id: 'ong-lao-va-seu-nho',
  title: 'Ông lão và sếu nhỏ',
  scenes: [
    { emoji: '👴🌲', text: 'Ông lão đi vào rừng, nghe tiếng kêu khẽ bên bờ nước. Ông thấy một chú sếu nhỏ bị thương.' },
    { emoji: '🦩😨', text: 'Mấy con sếu lớn thấy ông lão thì sợ hãi, bay lên cao.' },
    { emoji: '👴🩹', text: 'Ông lão nhẹ nhàng băng vết thương cho sếu nhỏ. Sếu bố và sếu mẹ đứng xa nhìn.' },
    { emoji: '👴🕊️', text: 'Khi vết thương đã lành, ông lão thả sếu nhỏ về với bố mẹ.' },
    { emoji: '🏠🦩', text: 'Gia đình sếu mang quà đến cảm ơn ông lão.' },
    { emoji: '🌅👴', text: 'Ông lão ước mình có đôi cánh. Từ đó, đàn sếu hay bay về thăm ông.' },
  ],
};

const lesson = (id: string, kind: LessonKind, title: string, label: string, teaches: Lesson['teaches'], activities: Activity[]): Lesson => ({
  id, kind, title, label, teaches, activities,
});

const rhyme = (r: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { rhyme: r }, words });
const sound = (onset: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { onset }, words });

/** Every vần of the book, in the order it is taught (Worlds 3–6). */
const ORDER = [
  'am', 'ap', 'ăm', 'ăp', 'âm', 'âp', 'em', 'ep', 'êm', 'êp', 'im', 'ip', 'iêm', 'iêp', 'om', 'op', 'ôm', 'ôp', 'ơm', 'ơp', 'um', 'up', 'uôm', 'ươm', 'ươp',
  'an', 'at', 'ăn', 'ăt', 'ân', 'ât', 'en', 'et', 'ên', 'êt',
  'in', 'it', 'iên', 'iêt', 'yên', 'yêt', 'on', 'ot', 'ôn', 'ôt', 'ơn', 'ơt', 'un', 'ut', 'ưt', 'uôn', 'uôt', 'ươn', 'ươt', 'ang', 'ac', 'ăng', 'ăc',
  'âng', 'âc', 'eng', 'ec', 'iêng', 'iêc', 'ong', 'oc', 'ông', 'ôc', 'ung', 'uc', 'ưng', 'ưc', 'uông', 'uôc', 'ương', 'ươc',
];
/** Distractor tiles for a find-the-vần step: nine vần taught earlier than the targets. */
const others = (...targets: string[]) =>
  ORDER.slice(0, ORDER.indexOf(targets[0])).filter((v) => !targets.includes(v)).slice(-9);

export const WORLD6: Lesson[] = [
  lesson('bai-79', 'letters', 'Bài 79: âng – âc', 'âng âc', { letters: ['âng', 'âc'] }, [
    { type: 'meet', words: ['nhà tầng', 'quả gấc'], marks: ['âng', 'âc'] },
    { type: 'spell', words: ['âng', 'tầng', 'âc', 'gấc'] },
    rhyme('âng', ['vầng trăng', 'ngẩng lên', 'nhà tầng', 'bậc thang', 'nhấc lên', 'quả gấc']),
    rhyme('âc', ['bậc thang', 'nhấc lên', 'quả gấc', 'vầng trăng', 'ngẩng lên', 'nhà tầng']),
    { type: 'findLetter', targets: ['âng', 'âc'], others: others('âng', 'âc') },
    { type: 'pick', mode: 'read', words: ['nhà tầng', 'quả gấc', 'vầng trăng', 'bậc thang'] },
    { type: 'read', lines: ['Nhà bà có bậc thang.', 'Vầng trăng sáng ở bờ hồ.', 'Mẹ có quả gấc.', 'Bé ngẩng lên nhìn nhà tầng.'] },
    { type: 'trace', items: ['âng', 'nhà tầng', 'âc', 'quả gấc'] },
  ]),
  lesson('bai-80', 'story', 'Bài 80: Hàng xóm', '📖', {}, [{ type: 'story', story: storyNeighbours }]),
  lesson('bai-81', 'review', 'Bài 81: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Bác thợ săn gặp vượn mẹ.', 'Vượn mẹ ôm vượn con.', 'Bác thợ nhìn vượn mẹ.', 'Bác bỏ nghề săn bắn.'] },
    { type: 'findLetter', targets: ['âng', 'âc'], others: ['ang', 'ac', 'ăng', 'ăc', 'ân', 'ât', 'ăn', 'ăt', 'am'] },
    { type: 'pick', mode: 'read', words: ['nhà tầng', 'quả gấc', 'thang', 'măng'] },
  ]),
  lesson('bai-82', 'letters', 'Bài 82: eng – ec', 'eng ec', { letters: ['eng', 'ec'] }, [
    { type: 'meet', words: ['xà beng', 'béc giê'], marks: ['eng', 'ec'] },
    { type: 'spell', words: ['eng', 'beng', 'ec', 'téc'] },
    rhyme('eng', ['xà beng', 'xẻng', 'gõ kẻng', 'xe téc', 'béc giê', 'lợn']),
    rhyme('ec', ['xe téc', 'béc giê', 'lợn eng éc', 'xà beng', 'xẻng', 'gõ kẻng']),
    { type: 'findLetter', targets: ['eng', 'ec'], others: others('eng', 'ec') },
    { type: 'pick', mode: 'read', words: ['xà beng', 'xẻng', 'xe téc', 'béc giê'] },
    { type: 'read', lines: ['Bố có xà beng.', 'Bé Lê có xẻng.', 'Xe téc ở bờ hồ.', 'Béc giê ở nhà bà.'] },
    { type: 'trace', items: ['eng', 'xà beng', 'ec', 'xe téc'] },
  ]),
  lesson('bai-83', 'letters', 'Bài 83: iêng – yêng – iêc', 'iêng', { letters: ['iêng', 'yêng', 'iêc'] }, [
    { type: 'meet', words: ['gõ chiêng', 'yểng', 'xiếc'], marks: ['iêng', 'yêng', 'iêc'] },
    { type: 'spell', words: ['iêng', 'chiêng', 'iêc', 'xiếc'] },
    rhyme('iêng', ['củ riềng', 'khiêng', 'gõ chiêng', 'tiệc', 'xiếc', 'yểng']),
    rhyme('iêc', ['tiệc', 'xiếc', 'cá diếc', 'củ riềng', 'khiêng', 'gõ chiêng']),
    { type: 'findLetter', targets: ['iêng', 'iêc'], others: others('iêng', 'iêc') },
    { type: 'pick', mode: 'read', words: ['gõ chiêng', 'yểng', 'xiếc', 'tiệc'] },
    { type: 'read', lines: ['Bà có củ riềng.', 'Bé Hà xem xiếc.', 'Chim yểng ở nhà bà.', 'Cả nhà dự tiệc.'] },
    { type: 'trace', items: ['iêng', 'gõ chiêng', 'iêc', 'xiếc'] },
  ]),
  lesson('bai-84', 'letters', 'Bài 84: ong – oc', 'ong oc', { letters: ['ong', 'oc'] }, [
    { type: 'meet', words: ['bóng', 'sóc'], marks: ['ong', 'oc'] },
    { type: 'spell', words: ['ong', 'bóng', 'oc', 'sóc'] },
    rhyme('ong', ['chong chóng', 'ong', 'võng', 'cóc', 'đọc', 'hạt ngọc']),
    rhyme('oc', ['cóc', 'đọc', 'hạt ngọc', 'chong chóng', 'ong', 'võng']),
    { type: 'findLetter', targets: ['ong', 'oc'], others: others('ong', 'oc') },
    { type: 'pick', mode: 'read', words: ['bóng', 'sóc', 'ong', 'cóc'] },
    { type: 'read', lines: ['Bé có bóng to.', 'Sóc ở khóm tre.', 'Ong ở vườn bà.', 'Bé Hà đọc chữ.'] },
    { type: 'trace', items: ['ong', 'bóng', 'oc', 'sóc'] },
  ]),
  lesson('bai-85', 'letters', 'Bài 85: ông – ôc', 'ông ôc', { letters: ['ông', 'ôc'] }, [
    { type: 'meet', words: ['dòng sông', 'gốc đa'], marks: ['ông', 'ôc'] },
    { type: 'spell', words: ['ông', 'sông', 'ôc', 'gốc'] },
    rhyme('ông', ['thông', 'đồng lúa', 'ngỗng', 'cốc', 'thợ mộc', 'ốc']),
    rhyme('ôc', ['cốc', 'thợ mộc', 'ốc', 'thông', 'đồng lúa', 'ngỗng']),
    { type: 'findLetter', targets: ['ông', 'ôc'], others: others('ông', 'ôc') },
    { type: 'pick', mode: 'read', words: ['dòng sông', 'gốc đa', 'thông', 'ốc'] },
    { type: 'read', lines: ['Bé xem dòng sông.', 'Gốc đa ở nhà bà.', 'Ngỗng ở bờ sông.', 'Ốc ở bờ hồ.'] },
    { type: 'trace', items: ['ông', 'dòng sông', 'ôc', 'gốc đa'] },
  ]),
  lesson('bai-86', 'story', 'Bài 86: Cô bé và con gấu', '📖', {}, [{ type: 'story', story: storyGirlBear }]),
  lesson('bai-87', 'review', 'Bài 87: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Ông tặng Long con yểng.', 'Lông yểng đen biếc.', 'Yểng biết hót.', 'Long mê yểng.'] },
    { type: 'findLetter', targets: ['eng', 'ec'], others: ['ang', 'ac', 'ăng', 'ăc', 'âng', 'âc', 'en', 'et', 'iêc'] },
    { type: 'pick', mode: 'read', words: ['xà beng', 'gõ chiêng', 'xiếc', 'thông'] },
  ]),
  lesson('bai-88', 'letters', 'Bài 88: ung – uc', 'ung uc', { letters: ['ung', 'uc'] }, [
    { type: 'meet', words: ['sung', 'cúc'], marks: ['ung', 'uc'] },
    { type: 'spell', words: ['ung', 'sung', 'uc', 'cúc'] },
    rhyme('ung', ['thùng rác', 'bông súng', 'sung', 'cá nục', 'khóm trúc', 'xúc đất']),
    rhyme('uc', ['cá nục', 'khóm trúc', 'xúc đất', 'cúc', 'thùng rác', 'bông súng']),
    { type: 'findLetter', targets: ['ung', 'uc'], others: others('ung', 'uc') },
    { type: 'pick', mode: 'read', words: ['sung', 'cúc', 'thùng rác', 'bông súng'] },
    { type: 'read', lines: ['Bà có bông cúc.', 'Mẹ mua sung.', 'Bé bỏ rác ở thùng.', 'Xe xúc đất ở bờ hồ.'] },
    { type: 'trace', items: ['ung', 'sung', 'uc', 'cúc'] },
  ]),
  lesson('bai-89', 'letters', 'Bài 89: ưng – ưc', 'ưng ưc', { letters: ['ưng', 'ưc'] }, [
    { type: 'meet', words: ['lưng', 'cá mực'], marks: ['ưng', 'ưc'] },
    { type: 'spell', words: ['ưng', 'lưng', 'ưc', 'mực'] },
    rhyme('ưng', ['chim ưng', 'trứng', 'gừng', 'rừng', 'thức đêm', 'lực sĩ']),
    rhyme('ưc', ['thức đêm', 'lực sĩ', 'cá mực', 'chim ưng', 'trứng', 'gừng']),
    { type: 'findLetter', targets: ['ưng', 'ưc'], others: others('ưng', 'ưc') },
    { type: 'pick', mode: 'read', words: ['lưng', 'cá mực', 'trứng', 'rừng'] },
    { type: 'read', lines: ['Bé có trứng gà.', 'Mẹ có củ gừng.', 'Rừng ở gần nhà bà.', 'Cá mực ở biển.'] },
    { type: 'trace', items: ['ưng', 'lưng', 'ưc', 'cá mực'] },
  ]),
  lesson('bai-90', 'letters', 'Bài 90: uông – uôc', 'uông', { letters: ['uông', 'uôc'] }, [
    { type: 'meet', words: ['chuông', 'đuốc'], marks: ['uông', 'uôc'] },
    { type: 'spell', words: ['uông', 'chuông', 'uôc', 'đuốc'] },
    rhyme('uông', ['xuống', 'luống', 'buồng', 'thuốc', 'guốc', 'buộc']),
    rhyme('uôc', ['thuốc', 'guốc', 'buộc', 'xuống', 'luống', 'buồng']),
    { type: 'findLetter', targets: ['uông', 'uôc'], others: others('uông', 'uôc') },
    { type: 'pick', mode: 'read', words: ['chuông', 'đuốc', 'thuốc', 'buồng'] },
    { type: 'read', lines: ['Bé uống thuốc.', 'Bà có chuông.', 'Bé xuống sân.', 'Bố có đuốc.'] },
    { type: 'trace', items: ['uông', 'chuông', 'uôc', 'đuốc'] },
  ]),
  lesson('bai-91', 'letters', 'Bài 91: ương – ươc', 'ương', { letters: ['ương', 'ươc'] }, [
    { type: 'meet', words: ['gương', 'thước'], marks: ['ương', 'ươc'] },
    { type: 'spell', words: ['ương', 'gương', 'ươc', 'thước'] },
    rhyme('ương', ['giọt sương', 'giường', 'sân trường', 'lược', 'thược dược', 'rước đèn']),
    rhyme('ươc', ['lược', 'thược dược', 'rước đèn', 'giọt sương', 'giường', 'sân trường']),
    { type: 'findLetter', targets: ['ương', 'ươc'], others: others('ương', 'ươc') },
    { type: 'pick', mode: 'read', words: ['gương', 'thước', 'giường', 'sân trường'] },
    { type: 'read', lines: ['Bà có gương.', 'Bé có thước.', 'Bé ra sân trường.', 'Giường ở nhà bà.'] },
    { type: 'trace', items: ['ương', 'gương', 'ươc', 'thước'] },
  ]),
  lesson('bai-92', 'story', 'Bài 92: Ông lão và sếu nhỏ', '📖', {}, [{ type: 'story', story: storyCrane }]),
  lesson('bai-93', 'review', 'Bài 93: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Ông bà thương em.', 'Ông đưa em đến trường.', 'Hết giờ, ông đón em về.', 'Bà pha nước cho em.'] },
    { type: 'findLetter', targets: ['uông', 'ương'], others: ['uôn', 'ươn', 'ung', 'ưng', 'ong', 'ông', 'uc', 'ưc', 'uôc'] },
    { type: 'pick', mode: 'read', words: ['thước', 'chuông', 'gương', 'giường'] },
  ]),
  lesson('on-cuoi-ki', 'review', 'Ôn tập cuối học kì I', '🏆', {}, [
    { type: 'read', lines: ['Đêm trăng, bà chỉ cho Bi.', 'Chú bé ở trên cung trăng.', 'Chú bé buồn vì nhớ nhà.', 'Mặt đất quá xa.'] },
    sound('ngh', ['nghé', 'nghe', 'nghệ', 'ngỗng', 'ngô', 'ngựa']),
    { type: 'findLetter', targets: ['ương', 'ưng'], others: ['ươn', 'ươc', 'uông', 'uôn', 'ung', 'ưc', 'ong', 'ông', 'ang'] },
    { type: 'pick', mode: 'read', words: ['gương', 'quả mướp', 'thước', 'trứng'] },
    { type: 'trace', items: ['trăng', 'cung', 'nhớ'] },
  ]),
];
