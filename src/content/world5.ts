import type { Activity, Lesson, LessonKind, Story } from './types';

/**
 * World 5 (dump truck): lessons 63–78 of Tiếng Việt 1, Tập 1 (Cánh Diều), same order as the book:
 * review, in it, iên iêt, yên yêt, on ot, story, review, ôn ôt, ơn ơt, un ut ưt, uôn uôt, story, review, ươn ươt, ang ac, ăng ăc.
 * Vần, words and order follow the book (pages 115–141, checked page by page); sentences and story wording are our own.
 * Sound answers are computed from the words (lib/vietnamese.ts).
 */

const storyClouds: Story = {
  id: 'may-den-va-may-trang',
  title: 'Mây đen và mây trắng',
  scenes: [
    { emoji: '☁️💬', text: 'Mây trắng thấy mây đen thì chê: Trông bạn đen đúa, xấu xí quá!' },
    { emoji: '☁️😶', text: 'Mây đen lặng im, nghĩ mãi về điều mây trắng nói.' },
    { emoji: '🌧️😢', text: 'Mây đen buồn quá, bật khóc. Nước mắt mây đen rơi xuống thành mưa.' },
    { emoji: '🌾🌸', text: 'Mưa rơi xuống, mang nước về cho cánh đồng, cho cây cỏ, hoa lá tươi tốt.' },
    { emoji: '☁️😳', text: 'Mây trắng thấy vậy thì xấu hổ. Mây trắng tự trách mình đã chê mây đen.' },
  ],
};

const storyWindSun: Story = {
  id: 'than-gio-va-mat-troi',
  title: 'Thần gió và Mặt Trời',
  scenes: [
    { emoji: '🌬️😤', text: 'Thần gió kiêu ngạo, lúc nào cũng khoe mình khỏe nhất.' },
    { emoji: '🌬️☀️', text: 'Thần gió nói với Mặt Trời: Ta đố ngươi làm người đi đường cởi áo. Mặt Trời nhận lời.' },
    { emoji: '🌬️🧥', text: 'Thần gió dương oai, thổi thật mạnh. Người đi đường càng ôm chặt áo hơn.' },
    { emoji: '☀️😅', text: 'Mặt Trời thử sức, tỏa nắng ấm. Người đi đường thấy nóng, liền tự cởi áo ra.' },
  ],
};

const lesson = (id: string, kind: LessonKind, title: string, label: string, teaches: Lesson['teaches'], activities: Activity[]): Lesson => ({
  id, kind, title, label, teaches, activities,
});

const rhyme = (r: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { rhyme: r }, words });

/** Every vần of the book so far, in the order it is taught (Worlds 3–5). */
const ORDER = [
  'am', 'ap', 'ăm', 'ăp', 'âm', 'âp', 'em', 'ep', 'êm', 'êp', 'im', 'ip', 'iêm', 'iêp', 'om', 'op', 'ôm', 'ôp', 'ơm', 'ơp', 'um', 'up', 'uôm', 'ươm', 'ươp',
  'an', 'at', 'ăn', 'ăt', 'ân', 'ât', 'en', 'et', 'ên', 'êt',
  'in', 'it', 'iên', 'iêt', 'yên', 'yêt', 'on', 'ot', 'ôn', 'ôt', 'ơn', 'ơt', 'un', 'ut', 'ưt', 'uôn', 'uôt', 'ươn', 'ươt', 'ang', 'ac', 'ăng', 'ăc',
];
/** Distractor tiles for a find-the-vần step: nine vần taught earlier than the targets (so nothing unknown is shown). */
const others = (...targets: string[]) =>
  ORDER.slice(0, ORDER.indexOf(targets[0])).filter((v) => !targets.includes(v)).slice(-9);

export const WORLD5: Lesson[] = [
  lesson('bai-63', 'review', 'Bài 63: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Bố mẹ đưa Vân về quê.', 'Gần nhà bà có bạn Tâm.', 'Vân và Tâm kết bạn.', 'Bà dẫn Vân đi gặt lúa.'] },
    { type: 'findLetter', targets: ['ân', 'ât'], others: ['an', 'at', 'ăn', 'ăt', 'en', 'et', 'ên', 'êt', 'âm'] },
    { type: 'pick', mode: 'read', words: ['cân', 'vật', 'mận', 'tết'] },
  ]),
  lesson('bai-64', 'letters', 'Bài 64: in – it', 'in it', { letters: ['in', 'it'] }, [
    { type: 'meet', words: ['đèn pin', 'quả mít'], marks: ['in', 'it'] },
    { type: 'spell', words: ['in', 'pin', 'it', 'mít'] },
    rhyme('in', ['nhìn', 'tin', 'nín', 'chín', 'vịt', 'thịt']),
    rhyme('it', ['vịt', 'thịt', 'quả mít', 'nhìn', 'tin', 'chín']),
    { type: 'findLetter', targets: ['in', 'it'], others: others('in', 'it') },
    { type: 'pick', mode: 'read', words: ['đèn pin', 'quả mít', 'vịt', 'thịt'] },
    { type: 'read', lines: ['Gần nhà Ngân có hồ sen.', 'Sen nở kín hồ.', 'Bà có quả mít.', 'Mẹ mua thịt cho bé.'] },
    { type: 'trace', items: ['in', 'đèn pin', 'it', 'quả mít'] },
  ]),
  lesson('bai-65', 'letters', 'Bài 65: iên – iêt', 'iên', { letters: ['iên', 'iêt'] }, [
    { type: 'meet', words: ['cô tiên', 'Việt Nam'], marks: ['iên', 'iêt'] },
    { type: 'spell', words: ['iên', 'tiên', 'iêt', 'viết'] },
    rhyme('iên', ['biển', 'kiến', 'đèn điện', 'cô tiên', 'viết', 'biệt thự']),
    rhyme('iêt', ['viết', 'biệt thự', 'Việt Nam', 'biển', 'kiến', 'đèn điện']),
    { type: 'findLetter', targets: ['iên', 'iêt'], others: others('iên', 'iêt') },
    { type: 'pick', mode: 'read', words: ['cô tiên', 'biển', 'kiến', 'viết'] },
    { type: 'read', lines: ['Biển Việt Nam rất đẹp.', 'Kiến bò ở bờ hồ.', 'Hà viết chữ đẹp.', 'Bé nhìn cô tiên.'] },
    { type: 'trace', items: ['iên', 'cô tiên', 'iêt', 'viết'] },
  ]),
  lesson('bai-66', 'letters', 'Bài 66: yên – yêt', 'yên', { letters: ['yên', 'yêt'] }, [
    { type: 'meet', words: ['yên ngựa', 'Nam Yết'], marks: ['yên', 'yêt'] },
    { type: 'spell', words: ['yên', 'yến', 'yêt', 'yết'] },
    rhyme('yên', ['yên ngựa', 'yên xe', 'chim yến', 'niêm yết', 'yết kiến', 'Nam Yết']),
    rhyme('yêt', ['niêm yết', 'yết kiến', 'Nam Yết', 'yên ngựa', 'yên xe', 'chim yến']),
    { type: 'findLetter', targets: ['yên', 'yêt'], others: others('yên', 'yêt') },
    { type: 'pick', mode: 'read', words: ['yên ngựa', 'chim yến', 'yên xe', 'niêm yết'] },
    { type: 'read', lines: ['Bé Hà có yên xe.', 'Chim yến ở nhà bà.', 'Bố chỉ Nam Yết cho bé.', 'Yên ngựa ở nhà Hà.'] },
    { type: 'trace', items: ['yên', 'yên ngựa', 'yêt', 'yết kiến'] },
  ]),
  lesson('bai-67', 'letters', 'Bài 67: on – ot', 'on ot', { letters: ['on', 'ot'] }, [
    { type: 'meet', words: ['mẹ con', 'chim hót'], marks: ['on', 'ot'] },
    { type: 'spell', words: ['on', 'con', 'ot', 'hót'] },
    rhyme('on', ['nón lá', 'ném còn', 'mẹ con', 'quả nhót', 'rót trà', 'sọt cá']),
    rhyme('ot', ['quả nhót', 'rót trà', 'sọt cá', 'nón lá', 'ném còn', 'mẹ con']),
    { type: 'findLetter', targets: ['on', 'ot'], others: others('on', 'ot') },
    { type: 'pick', mode: 'read', words: ['mẹ con', 'chim hót', 'nón lá', 'rót trà'] },
    { type: 'read', lines: ['Mẹ con Hà ở nhà bà.', 'Chim hót ở bờ hồ.', 'Bé rót trà cho bà.', 'Bà có nón lá.'] },
    { type: 'trace', items: ['on', 'mẹ con', 'ot', 'chim hót'] },
  ]),
  lesson('bai-68', 'story', 'Bài 68: Mây đen và mây trắng', '📖', {}, [{ type: 'story', story: storyClouds }]),
  lesson('bai-69', 'review', 'Bài 69: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Rô con vọt lên bờ.', 'Bờ hồ khô cạn.', 'Rô con vọt về nhà.', 'Rô con xin mẹ tha thứ.'] },
    { type: 'findLetter', targets: ['on', 'ot'], others: ['in', 'it', 'iên', 'iêt', 'yên', 'yêt', 'an', 'at', 'ân'] },
    { type: 'pick', mode: 'read', words: ['đèn pin', 'chim hót', 'nón lá', 'cô tiên'] },
  ]),
  lesson('bai-70', 'letters', 'Bài 70: ôn – ôt', 'ôn ôt', { letters: ['ôn', 'ôt'] }, [
    { type: 'meet', words: ['thôn xóm', 'cột cờ'], marks: ['ôn', 'ôt'] },
    { type: 'spell', words: ['ôn', 'chồn', 'ôt', 'rốt'] },
    rhyme('ôn', ['đôn', 'chồn', 'trốn tìm', 'cà rốt', 'lá lốt', 'thốt nốt']),
    rhyme('ôt', ['cà rốt', 'lá lốt', 'thốt nốt', 'đôn', 'chồn', 'trốn tìm']),
    { type: 'findLetter', targets: ['ôn', 'ôt'], others: others('ôn', 'ôt') },
    { type: 'pick', mode: 'read', words: ['thôn xóm', 'cột cờ', 'cà rốt', 'chồn'] },
    { type: 'read', lines: ['Thôn xóm có cột cờ.', 'Mẹ mua cà rốt.', 'Chồn trốn ở bờ hồ.', 'Bé Lê trốn, bé Hà tìm.'] },
    { type: 'trace', items: ['ôn', 'thôn xóm', 'ôt', 'cột cờ'] },
  ]),
  lesson('bai-71', 'letters', 'Bài 71: ơn – ơt', 'ơn ơt', { letters: ['ơn', 'ơt'] }, [
    { type: 'meet', words: ['sơn ca', 'vợt'], marks: ['ơn', 'ơt'] },
    { type: 'spell', words: ['ơn', 'sơn', 'ơt', 'vợt'] },
    rhyme('ơn', ['lợn', 'sơn nhà', 'cơn mưa', 'thớt', 'ớt', 'vợt']),
    rhyme('ơt', ['thớt', 'ớt', 'vợt', 'lợn', 'sơn nhà', 'cơn mưa']),
    { type: 'findLetter', targets: ['ơn', 'ơt'], others: others('ơn', 'ơt') },
    { type: 'pick', mode: 'read', words: ['sơn ca', 'vợt', 'lợn', 'ớt'] },
    { type: 'read', lines: ['Bà có ớt.', 'Bố sơn nhà cho bà.', 'Sơn ca hót ở bờ hồ.', 'Bé Hà có vợt.'] },
    { type: 'trace', items: ['ơn', 'sơn ca', 'ơt', 'vợt'] },
  ]),
  lesson('bai-72', 'letters', 'Bài 72: un – ut – ưt', 'un ut', { letters: ['un', 'ut', 'ưt'] }, [
    { type: 'meet', words: ['phun', 'bút', 'mứt'], marks: ['un', 'ut', 'ưt'] },
    { type: 'spell', words: ['un', 'phun', 'ut', 'bút', 'mứt'] },
    rhyme('un', ['phun', 'chú lùn', 'cún con', 'bút', 'mứt', 'chim cút']),
    rhyme('ut', ['bút', 'chim cút', 'râm bụt', 'phun', 'mứt', 'chú lùn']),
    rhyme('ưt', ['mứt', 'nứt nẻ', 'ấm sứt', 'bút', 'phun', 'cún con']),
    { type: 'findLetter', targets: ['un', 'ut', 'ưt'], others: others('un', 'ut', 'ưt') },
    { type: 'pick', mode: 'read', words: ['phun', 'bút', 'mứt', 'cún con'] },
    { type: 'read', lines: ['Bé Hà làm mứt.', 'Cún con ở nhà bà.', 'Bố mua bút cho bé.', 'Chim cút ở bờ hồ.'] },
    { type: 'trace', items: ['un', 'phun', 'ut', 'bút', 'ưt', 'mứt'] },
  ]),
  lesson('bai-73', 'letters', 'Bài 73: uôn – uôt', 'uôn', { letters: ['uôn', 'uôt'] }, [
    { type: 'meet', words: ['chuồn chuồn', 'chuột'], marks: ['uôn', 'uôt'] },
    { type: 'spell', words: ['uôn', 'buồn', 'uôt', 'chuột'] },
    rhyme('uôn', ['cá chuồn', 'cuộn chỉ', 'buồn bã', 'vuốt nhọn', 'tuốt lúa', 'chuột']),
    rhyme('uôt', ['vuốt nhọn', 'tuốt lúa', 'chuột', 'cá chuồn', 'cuộn chỉ', 'buồn bã']),
    { type: 'findLetter', targets: ['uôn', 'uôt'], others: others('uôn', 'uôt') },
    { type: 'pick', mode: 'read', words: ['chuột', 'cuộn chỉ', 'buồn bã', 'tuốt lúa'] },
    { type: 'read', lines: ['Chuột út buồn bã.', 'Bé Hà có cuộn chỉ.', 'Chuột ở nhà bà.', 'Mẹ chuột làm bếp.'] },
    { type: 'trace', items: ['uôn', 'cuộn chỉ', 'uôt', 'chuột'] },
  ]),
  lesson('bai-74', 'story', 'Bài 74: Thần gió và Mặt Trời', '📖', {}, [{ type: 'story', story: storyWindSun }]),
  lesson('bai-75', 'review', 'Bài 75: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Con thú đó rất hiền.', 'Nó nằm thu lu ở sân.', 'Chuột mẹ la lớn.', 'Đó là kẻ thù của chuột.'] },
    { type: 'findLetter', targets: ['ôn', 'ơn'], others: ['on', 'ot', 'ôt', 'ơt', 'un', 'ut', 'ưt', 'uôn', 'uôt'] },
    { type: 'pick', mode: 'read', words: ['cà rốt', 'lợn', 'phun', 'cuộn chỉ'] },
  ]),
  lesson('bai-76', 'letters', 'Bài 76: ươn – ươt', 'ươn', { letters: ['ươn', 'ươt'] }, [
    { type: 'meet', words: ['con lươn', 'lướt ván'], marks: ['ươn', 'ươt'] },
    { type: 'spell', words: ['ươn', 'lươn', 'ươt', 'lướt'] },
    rhyme('ươn', ['con lươn', 'vượn', 'vườn', 'trượt', 'vượt', 'lướt ván']),
    rhyme('ươt', ['lướt ván', 'trượt', 'vượt', 'con lươn', 'vượn', 'vườn']),
    { type: 'findLetter', targets: ['ươn', 'ươt'], others: others('ươn', 'ươt') },
    { type: 'pick', mode: 'read', words: ['con lươn', 'lướt ván', 'vượn', 'vườn'] },
    { type: 'read', lines: ['Vượn ở vườn bà.', 'Bố chỉ con lươn cho bé.', 'Bé xem lướt ván.', 'Thỏ sợ ướt.'] },
    { type: 'trace', items: ['ươn', 'con lươn', 'ươt', 'lướt ván'] },
  ]),
  lesson('bai-77', 'letters', 'Bài 77: ang – ac', 'ang ac', { letters: ['ang', 'ac'] }, [
    { type: 'meet', words: ['thang', 'vạc'], marks: ['ang', 'ac'] },
    { type: 'spell', words: ['ang', 'thang', 'ac', 'vạc'] },
    rhyme('ang', ['cá vàng', 'dưa gang', 'chở hàng', 'bác sĩ', 'con hạc', 'bản nhạc']),
    rhyme('ac', ['bác sĩ', 'con hạc', 'bản nhạc', 'cá vàng', 'dưa gang', 'chở hàng']),
    { type: 'findLetter', targets: ['ang', 'ac'], others: others('ang', 'ac') },
    { type: 'pick', mode: 'read', words: ['thang', 'vạc', 'cá vàng', 'con hạc'] },
    { type: 'read', lines: ['Bố có thang gỗ.', 'Cá vàng ở hồ.', 'Mẹ chở dưa gang.', 'Bé Hà mê bản nhạc.'] },
    { type: 'trace', items: ['ang', 'thang', 'ac', 'vạc'] },
  ]),
  lesson('bai-78', 'letters', 'Bài 78: ăng – ăc', 'ăng ăc', { letters: ['ăng', 'ăc'] }, [
    { type: 'meet', words: ['măng', 'tắc kè'], marks: ['ăng', 'ăc'] },
    { type: 'spell', words: ['ăng', 'măng', 'ăc', 'xắc'] },
    rhyme('ăng', ['răng', 'găng', 'tia nắng', 'xắc', 'quả lắc', 'tắc kè']),
    rhyme('ăc', ['xắc', 'quả lắc', 'tắc kè', 'răng', 'găng', 'tia nắng']),
    { type: 'findLetter', targets: ['ăng', 'ăc'], others: others('ăng', 'ăc') },
    { type: 'pick', mode: 'read', words: ['măng', 'tắc kè', 'răng', 'găng'] },
    { type: 'read', lines: ['Mẹ có xắc da.', 'Bé Hà có găng ấm.', 'Tia nắng ở bờ hồ.', 'Tắc kè ở nhà bà.'] },
    { type: 'trace', items: ['ăng', 'măng', 'ăc', 'xắc'] },
  ]),
];
