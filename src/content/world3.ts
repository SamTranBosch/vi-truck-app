import type { Activity, Lesson, LessonKind, Story } from './types';

/**
 * World 3 (container truck): lessons 32–47 of Tiếng Việt 1, Tập 1 (Cánh Diều), same order as the book:
 * story, review, v y, chữ hoa, am ap, ăm ăp, story, review, âm âp, em ep, êm êp, im ip, story, review,
 * iêm yêm iêp, om op. Vần, words and order follow the book (pages 60–85, checked page by page);
 * sentences and story wording are our own. Sound answers are computed from the words (lib/vietnamese.ts).
 */

const storyKids: Story = {
  id: 'de-con-nghe-loi-me',
  title: 'Dê con nghe lời mẹ',
  scenes: [
    { emoji: '🐐🧺', text: 'Dê mẹ đi chợ. Trước khi đi, dê mẹ dặn đàn dê con: Không được mở cửa cho người lạ.' },
    { emoji: '🐺🚪', text: 'Dê mẹ vừa đi khỏi, chó sói đến gõ cửa. Giọng sói nghe rất khàn.' },
    { emoji: '🐐🙅', text: 'Đàn dê con nhận ra đó không phải tiếng mẹ. Cả đàn không ai mở cửa.' },
    { emoji: '🐺💨', text: 'Thấy đàn dê con không mở cửa, sói đành bỏ đi.' },
    { emoji: '🐐🥕', text: 'Dê mẹ về nhà, khen đàn dê con ngoan, biết nghe lời mẹ.' },
  ],
};

const storyRabbit: Story = {
  id: 'chu-tho-thong-minh',
  title: 'Chú thỏ thông minh',
  scenes: [
    { emoji: '🐇🌸', text: 'Thỏ con ra bờ sông hái hoa.' },
    { emoji: '🐊💧', text: 'Thỏ xuống mép nước uống. Bỗng cá sấu ngoi lên.' },
    { emoji: '🐊😡', text: 'Cá sấu gầm lên để dọa thỏ, rồi định nuốt chửng thỏ.' },
    { emoji: '🐇💡', text: 'Thỏ nghĩ ra một mẹo. Thỏ nói: Anh há miệng thật to, tôi sẽ chui vào cho dễ nuốt.' },
    { emoji: '🐊😮', text: 'Cá sấu nghe lời thỏ, há miệng thật to.' },
    { emoji: '🐇🏃', text: 'Thỏ nhảy vọt ra ngoài, chạy vào rừng tre thoát thân.' },
  ],
};

const storyPigs: Story = {
  id: 'ba-chu-lon-con',
  title: 'Ba chú lợn con',
  scenes: [
    { emoji: '🐷🐷🐷', text: 'Ba chú lợn con đã lớn. Mẹ bảo các con ra ở riêng, mỗi chú tự làm một ngôi nhà.' },
    { emoji: '🌾🪵🧱', text: 'Chú lợn anh làm nhà bằng rơm. Chú lợn thứ hai làm nhà bằng gỗ. Chú lợn út làm nhà bằng gạch.' },
    { emoji: '🐺🌾', text: 'Chó sói đến nhà lợn anh, thổi một hơi là nhà rơm bay mất.' },
    { emoji: '🐺🪵', text: 'Sói đến nhà lợn thứ hai, nhà gỗ cũng đổ.' },
    { emoji: '🐷🍽️', text: 'Hai chú lợn chạy sang nhà lợn út. Ba anh em ngồi ăn cơm trong ngôi nhà gạch chắc chắn.' },
    { emoji: '🐺😞', text: 'Sói thổi mãi mà không phá được nhà gạch, đành bỏ đi. Ba anh em sống vui vẻ bên nhau.' },
  ],
};

const lesson = (id: string, kind: LessonKind, title: string, label: string, teaches: Lesson['teaches'], activities: Activity[]): Lesson => ({
  id, kind, title, label, teaches, activities,
});

const rhyme = (r: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { rhyme: r }, words });
const sound = (onset: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { onset }, words });
const vowel = (v: string, words: string[]): Activity => ({ type: 'hunt', kind: 'sound', target: { vowel: v }, words });

/** The 12 vần of this world, used as distractors (never the targets). */
const VAN = ['am', 'ap', 'ăm', 'ăp', 'âm', 'âp', 'em', 'ep', 'êm', 'êp', 'im', 'ip', 'iêm', 'iêp', 'om', 'op'];
const others = (...not: string[]) => VAN.filter((v) => !not.includes(v)).slice(0, 9);

export const WORLD3: Lesson[] = [
  lesson('bai-32', 'story', 'Bài 32: Dê con nghe lời mẹ', '📖', {}, [{ type: 'story', story: storyKids }]),
  lesson('bai-33', 'review', 'Bài 33: Ôn tập', '🔁', {}, [
    {
      type: 'combine',
      onsets: ['t', 'th', 'tr', 'ch'],
      vowels: ['a', 'o', 'ô', 'ơ', 'u', 'ư', 'ua', 'ưa'],
      blocked: [],
      need: 8,
    },
    { type: 'read', lines: ['Thỏ nghĩ rùa sẽ thua.', 'Thỏ la cà chỗ nọ.', 'Rùa cố bò, rùa chả nghỉ.', 'Giữa trưa, rùa bỏ xa thỏ.'] },
    { type: 'pick', mode: 'read', words: ['thỏ', 'rùa', 'tủ', 'chữ'] },
  ]),
  lesson('bai-34', 'letters', 'Bài 34: v – y', 'v y', { letters: ['v', 'y'] }, [
    { type: 'meet', words: ['ve', 'y tá'], marks: ['v', 'y'] },
    { type: 'spell', words: ['ve', 'vở'] },
    sound('v', ['ve', 'vẽ', 'vở', 'ví', 'y tá', 'ý']),
    vowel('y', ['y tá', 'y tế', 'ý', 've', 'vẽ', 'vở']),
    { type: 'findLetter', targets: ['v', 'y'], others: ['u', 'ư', 'i', 'r', 'x', 'n', 'm', 'a', 'e'] },
    { type: 'pick', mode: 'read', words: ['ve', 'vẽ', 'vở', 'y tá'] },
    { type: 'read', lines: ['Dì Tư là y tá.', 'Dì ghé nhà Hà.', 'Hà vẽ ve, vẽ lá.', 'Dì chỉ cho Hà vẽ.'] },
    { type: 'trace', items: ['v', 've', 'y', 'y tá'] },
  ]),
  lesson('bai-35', 'letters', 'Bài 35: Chữ hoa', 'A a', {}, [
    { type: 'capital', letters: ['a', 'b', 'c', 'd'] },
    { type: 'capital', letters: ['h', 'l', 'm', 't'] },
    { type: 'read', lines: ['Má ở thị xã về.', 'Má có quà cho cả nhà.', 'Ba có trà, Hà có mía.', 'Bé Lê có sữa.'] },
    { type: 'trace', items: ['A', 'Hà', 'Lê', 'Dì Tư'] },
  ]),
  lesson('bai-36', 'letters', 'Bài 36: am – ap', 'am ap', { letters: ['am', 'ap'] }, [
    { type: 'meet', words: ['quả cam', 'xe đạp'], marks: ['am', 'ap'] },
    { type: 'spell', words: ['am', 'cam', 'ap', 'đạp'] },
    rhyme('am', ['khám', 'quả trám', 'vạm vỡ', 'tháp rùa', 'múa sạp', 'sáp nẻ']),
    rhyme('ap', ['tháp rùa', 'múa sạp', 'sáp nẻ', 'khám', 'quả trám', 'vạm vỡ']),
    { type: 'findLetter', targets: ['am', 'ap'], others: others('am', 'ap') },
    { type: 'pick', mode: 'read', words: ['quả cam', 'xe đạp', 'khám', 'sáp nẻ'] },
    { type: 'read', lines: ['Bé Lam đạp xe.', 'Mẹ có quả cam.', 'Cả nhà ra bờ hồ.', 'Bố chỉ Tháp Rùa.'] },
    { type: 'trace', items: ['am', 'quả cam', 'ap', 'xe đạp'] },
  ]),
  lesson('bai-37', 'letters', 'Bài 37: ăm – ăp', 'ăm ăp', { letters: ['ăm', 'ăp'] }, [
    { type: 'meet', words: ['chăm chỉ', 'cặp da'], marks: ['ăm', 'ăp'] },
    { type: 'spell', words: ['ăm', 'tắm', 'ăp', 'gắp'] },
    rhyme('ăm', ['tằm', 'tắm', 'nằm', 'thắp', 'bắp ngô', 'gắp']),
    rhyme('ăp', ['thắp', 'bắp ngô', 'gắp', 'tằm', 'tắm', 'nằm']),
    { type: 'findLetter', targets: ['ăm', 'ăp'], others: others('ăm', 'ăp') },
    { type: 'pick', mode: 'read', words: ['chăm chỉ', 'cặp da', 'tắm', 'gắp'] },
    { type: 'read', lines: ['Bé Chi chăm chỉ.', 'Bà bị cảm, mẹ chăm bà.', 'Bố pha sữa cho bà.', 'Bé gắp cá cho bà.'] },
    { type: 'trace', items: ['ăm', 'chăm chỉ', 'ăp', 'cặp da'] },
  ]),
  lesson('bai-38', 'story', 'Bài 38: Chú thỏ thông minh', '📖', {}, [{ type: 'story', story: storyRabbit }]),
  lesson('bai-39', 'review', 'Bài 39: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Bé Chi chăm chỉ lắm.', 'Bé đi khắp nhà.', 'Bé đạp xe, bé vẽ ve.', 'Bé khám cho chó Lu.'] },
    { type: 'findLetter', targets: ['am', 'ap'], others: ['ăm', 'ăp', 'âm', 'âp', 'em', 'ep', 'im', 'ip', 'om'] },
    { type: 'pick', mode: 'read', words: ['quả cam', 'cặp da', 'xe đạp', 'tắm'] },
  ]),
  lesson('bai-40', 'letters', 'Bài 40: âm – âp', 'âm âp', { letters: ['âm', 'âp'] }, [
    { type: 'meet', words: ['củ sâm', 'cá mập'], marks: ['âm', 'âp'] },
    { type: 'spell', words: ['âm', 'sâm', 'âp', 'mập'] },
    rhyme('âm', ['nấm', 'mầm', 'sâm cầm', 'tập múa', 'cá mập', 'cấp cứu']),
    rhyme('âp', ['tập múa', 'cá mập', 'cấp cứu', 'nấm', 'mầm', 'sâm cầm']),
    { type: 'findLetter', targets: ['âm', 'âp'], others: others('âm', 'âp') },
    { type: 'pick', mode: 'read', words: ['nấm', 'mầm', 'cá mập', 'tập múa'] },
    { type: 'read', lines: ['Bé Lê mê ti vi.', 'Ti vi có cá mập.', 'Bé Lê sợ, bé la.', 'Có mẹ, bé Lê chả sợ.'] },
    { type: 'trace', items: ['âm', 'củ sâm', 'âp', 'cá mập'] },
  ]),
  lesson('bai-41', 'letters', 'Bài 41: em – ep', 'em ep', { letters: ['em', 'ep'] }, [
    { type: 'meet', words: ['kem', 'dép'], marks: ['em', 'ep'] },
    { type: 'spell', words: ['em', 'kem', 'ep', 'dép'] },
    rhyme('em', ['tem thư', 'xem ti vi', 'rèm', 'lễ phép', 'cá chép', 'ngõ hẹp']),
    rhyme('ep', ['lễ phép', 'cá chép', 'ngõ hẹp', 'tem thư', 'xem ti vi', 'rèm']),
    { type: 'findLetter', targets: ['em', 'ep'], others: others('em', 'ep') },
    { type: 'pick', mode: 'read', words: ['kem', 'dép', 'xem ti vi', 'tem thư'] },
    { type: 'read', lines: ['Bé Hà có kem.', 'Bố mua dép cho bé.', 'Bé xem ti vi.', 'Bé Lê lễ phép.'] },
    { type: 'trace', items: ['em', 'kem', 'ep', 'dép'] },
  ]),
  lesson('bai-42', 'letters', 'Bài 42: êm – êp', 'êm êp', { letters: ['êm', 'êp'] }, [
    { type: 'meet', words: ['đêm', 'bếp lửa'], marks: ['êm', 'êp'] },
    { type: 'spell', words: ['êm', 'đêm', 'êp', 'bếp'] },
    rhyme('êm', ['nệm', 'nếm', 'mềm', 'nếp', 'xếp', 'bếp lửa']),
    rhyme('êp', ['nếp', 'xếp', 'bếp lửa', 'nệm', 'nếm', 'mềm']),
    { type: 'findLetter', targets: ['êm', 'êp'], others: others('êm', 'êp') },
    { type: 'pick', mode: 'read', words: ['đêm', 'bếp lửa', 'nếp', 'xếp'] },
    { type: 'read', lines: ['Đêm ở quê là êm ả.', 'Bếp lửa ở nhà bà.', 'Mẹ nếm cá kho.', 'Bé xếp đồ.'] },
    { type: 'trace', items: ['êm', 'đêm', 'êp', 'bếp lửa'] },
  ]),
  lesson('bai-43', 'letters', 'Bài 43: im – ip', 'im ip', { letters: ['im', 'ip'] }, [
    { type: 'meet', words: ['bìm bịp', 'nhím'], marks: ['im', 'ip'] },
    { type: 'spell', words: ['im', 'chim', 'ip', 'kịp'] },
    rhyme('im', ['nhím', 'cà tím', 'kìm', 'kịp', 'nhíp', 'chim']),
    rhyme('ip', ['kịp', 'nhíp', 'bìm bịp', 'nhím', 'cà tím', 'kìm']),
    { type: 'findLetter', targets: ['im', 'ip'], others: others('im', 'ip') },
    { type: 'pick', mode: 'read', words: ['chim', 'cà tím', 'kìm', 'nhím'] },
    { type: 'read', lines: ['Bé Hà có cà tím.', 'Chim sẻ ở bờ hồ.', 'Bé chỉ nhím cho bà.', 'Mẹ có kìm, có nhíp.'] },
    { type: 'trace', items: ['im', 'chim', 'ip', 'kịp'] },
  ]),
  lesson('bai-44', 'story', 'Bài 44: Ba chú lợn con', '📖', {}, [{ type: 'story', story: storyPigs }]),
  lesson('bai-45', 'review', 'Bài 45: Ôn tập', '🔁', {}, [
    { type: 'read', lines: ['Đêm ở quê êm ả.', 'Bé nằm nệm êm.', 'Mẹ xếp đồ cho bé.', 'Bà ủ ấm cho bé.'] },
    { type: 'findLetter', targets: ['em', 'êm'], others: ['am', 'ăm', 'âm', 'im', 'ep', 'êp', 'ip', 'om', 'op'] },
    { type: 'pick', mode: 'read', words: ['kem', 'đêm', 'nhím', 'dép'] },
  ]),
  lesson('bai-46', 'letters', 'Bài 46: iêm – yêm – iêp', 'iêm', { letters: ['iêm', 'yêm', 'iêp'] }, [
    { type: 'meet', words: ['diêm', 'yếm', 'tấm thiệp'], marks: ['iêm', 'yêm', 'iêp'] },
    { type: 'spell', words: ['iêm', 'diêm', 'iêp', 'diếp'] },
    rhyme('iêm', ['dừa xiêm', 'múa kiếm', 'liềm', 'tấm liếp', 'diếp cá', 'tấm thiệp']),
    rhyme('iêp', ['tấm liếp', 'diếp cá', 'tấm thiệp', 'dừa xiêm', 'múa kiếm', 'kim tiêm']),
    { type: 'findLetter', targets: ['iêm', 'iêp'], others: others('iêm', 'iêp') },
    { type: 'pick', mode: 'read', words: ['diêm', 'tấm thiệp', 'kim tiêm', 'dừa xiêm'] },
    { type: 'read', lines: ['Bé Lê có tấm thiệp.', 'Bà có dừa xiêm.', 'Bé Hà mê múa kiếm.', 'Mẹ để diêm ở bếp.'] },
    { type: 'trace', items: ['iêm', 'diêm', 'iêp', 'tấm thiệp'] },
  ]),
  lesson('bai-47', 'letters', 'Bài 47: om – op', 'om op', { letters: ['om', 'op'] }, [
    { type: 'meet', words: ['đom đóm', 'họp tổ'], marks: ['om', 'op'] },
    { type: 'spell', words: ['om', 'đóm', 'op', 'họp'] },
    rhyme('om', ['khóm tre', 'chỏm mũ', 'xóm quê', 'cọp', 'họp tổ', 'gom góp']),
    rhyme('op', ['cọp', 'họp tổ', 'gom góp', 'khóm tre', 'chỏm mũ', 'xóm quê']),
    { type: 'findLetter', targets: ['om', 'op'], others: others('om', 'op') },
    { type: 'pick', mode: 'read', words: ['đom đóm', 'họp tổ', 'cọp', 'chỏm mũ'] },
    { type: 'read', lines: ['Lừa và ngựa đi xa.', 'Lừa nhờ ngựa chở đồ.', 'Ngựa chả nghe.', 'Lừa ngã ra bờ cỏ.'] },
    { type: 'trace', items: ['om', 'đom đóm', 'op', 'họp tổ'] },
  ]),
];
