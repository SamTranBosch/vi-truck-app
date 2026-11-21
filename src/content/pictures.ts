/**
 * Word -> picture. Emoji are used instead of image files: no copyright questions,
 * no downloads, and they render crisply on every iPhone and iPad.
 * Every word used in a picture activity must be listed here (a test enforces it).
 */
export const PICS: Record<string, string> = {
  // school
  'sách': '📚', 'cặp': '🎒', 'bút': '🖊️', 'thước': '📏', 'cô giáo': '👩‍🏫', 'lớp học': '🏫',
  // a c
  'ca': '☕', 'gà': '🐔', 'cá': '🐟', 'cà': '🍆', 'nhà': '🏠', 'lá': '🍃', 'thỏ': '🐰',
  'cờ': '🇻🇳', 'cú': '🦉', 'vịt': '🦆', 'dê': '🐐',
  // tones
  'bò': '🐄', 'nho': '🍇', 'bóng': '⚽', 'chó': '🐕', 'hổ': '🐯',
  // o ô
  'cô': '👩‍🏫', 'cọ': '🌴', 'tổ': '🪺', 'rổ': '🧺', 'xô': '🪣', 'hồ': '🏞️', 'dế': '🦗',
  // hỏi nặng
  'cỏ': '🌱', 'ngựa': '🐴', 'chuột': '🐭', 'vẹt': '🦜', 'chuối': '🍌',
  // ơ d
  'nơ': '🎀', 'phở': '🍜', 'bơ': '🥑', 'xe': '🚗', 'táo': '🍎', 'dâu': '🍓', 'dừa': '🥥', 'khỉ': '🐒',
  // đ e
  'đèn': '💡', 'đá': '🪨', 'đàn': '🎸', 'đĩa': '🍽️', 'sẻ': '🐦', 'ghe': '🛶', 'bé': '👶', 'dứa': '🍍',
  // ê l
  'lê': '🍐', 'bê': '🐮', 'ếch': '🐸', 'lửa': '🔥', 'lúa': '🌾', 'lọ': '🏺',
  // b ngã
  'bánh': '🍰', 'bí': '🎃', 'vẽ': '🎨', 'đũa': '🥢', 'sữa': '🥛', 'võ': '🥋',
  // g h
  'ga': '🚉', 'gấu': '🐻', 'gạo': '🍚', 'gỗ': '🪵', 'hoa': '🌸', 'hành': '🧅',
  // reading lines (Tập đọc): single words and short lines that have a picture
  'cò': '🦢', 'ô': '☂️', 'đa': '🌳', 'đò': '⛴️', 'dẻ': '🌰', 'lồ ô': '🎋', 'cá cờ': '🐠', 'cờ đỏ': '🇻🇳', 'le le': '🦆', 'đồ cổ': '🏺', 'cổ': '🦒',
  // i ia
  'ví': '👛', 'chỉ': '🧵', 'bìa': '📕', 'chìa': '🔑',
  // World 2 (lessons 16-31)
  'ghế': '🪑', 'ghẹ': '🦀', 'ghi': '✍️',
  'giá': '🌱', 'giá đỗ': '🌱', 'giò': '🥩', 'giỏ': '🧺', 'kì đà': '🦎', 'kẻ': '📏', 'kể': '📖', 'kéo': '✂️',
  'khế': '⭐', 'khoai': '🥔', 'me': '🥜', 'mẹ': '👩‍👧', 'mèo': '🐱', 'mũ': '🧢',
  'na': '🍈', 'nai': '🦌', 'nồi': '🍲', 'nhện': '🕷️',
  'ngà': '🐘', 'nghé': '🐃', 'ngô': '🌽', 'ngỗng': '🦢', 'nghe': '👂', 'nghỉ': '🛌', 'nghệ': '🍠',
  'pi a nô': '🎹', 'pa nô': '🪧', 'pin': '🔋', 'phà': '⛴️', 'cà phê': '☕', 'phố cổ': '🏘️',
  'quả lê': '🍐', 'rổ cá': '🧺🐟', 'quả cam': '🍊', 'quần': '👖', 'quạ': '🐦', 'rùa': '🐢', 'rau': '🥬', 'rồng': '🐉',
  'sóc': '🐿️', 'sò': '🐚', 'sổ': '📓', 'xe ca': '🚌', 'xương': '🦴',
  'tay': '✋', 'tô': '🥣', 'tỏi': '🧄', 'thìa': '🥄', 'thư': '✉️', 'tivi': '📺',
  'tre': '🎍', 'trà': '🍵', 'trứng': '🥚', 'trăng': '🌙',
  'tủ': '🗄️', 'sư tử': '🦁', 'cá thu': '🐟', 'chữ': '🔤',
  'cua': '🦀', 'cà chua': '🍅', 'múa': '💃', 'dưa': '🍉', 'mưa': '🌧️',
  // world 3 (container truck)
  've': '🦗', 'vở': '📓', 'y tá': '👩‍⚕️', 'ý': '💡',
  'y tế': '🏥', 'xe đạp': '🚲', 'khám': '🩺', 'quả trám': '🍇',
  'vạm vỡ': '💪', 'tháp rùa': '🏯', 'múa sạp': '🕺', 'sáp nẻ': '🧴',
  'chăm chỉ': '🧹', 'cặp da': '💼', 'tằm': '🐛', 'tắm': '🛁',
  'nằm': '🛏️', 'thắp': '🕯️', 'bắp ngô': '🌽', 'gắp': '🥢',
  'nấm': '🍄', 'mầm': '🌱', 'sâm cầm': '🦆', 'tập múa': '🩰',
  'cá mập': '🦈', 'cấp cứu': '🚑', 'củ sâm': '🌿', 'kem': '🍦',
  'dép': '🩴', 'tem thư': '📮', 'xem ti vi': '📺', 'rèm': '🪟',
  'lễ phép': '🙇', 'cá chép': '🎏', 'ngõ hẹp': '🛣️', 'đêm': '🌃',
  'bếp lửa': '🔥', 'nệm': '🛌', 'nếm': '👅', 'mềm': '🧸',
  'nếp': '🍚', 'xếp': '🧱', 'bìm bịp': '🐦', 'chim': '🐦',
  'nhím': '🦔', 'cà tím': '🍆', 'kìm': '🔧', 'kịp': '🏃',
  'nhíp': '🤏', 'diêm': '🔥', 'yếm': '👚', 'tấm thiệp': '💌',
  'dừa xiêm': '🥥', 'múa kiếm': '🤺', 'liềm': '🌾', 'tấm liếp': '🎋',
  'diếp cá': '☘️', 'kim tiêm': '💉', 'đom đóm': '🪲', 'họp tổ': '👥',
  'khóm tre': '🎍', 'chỏm mũ': '🧢', 'xóm quê': '🏡', 'cọp': '🐯',
  'gom góp': '📦',
};

export function pic(word: string): string | undefined {
  return PICS[word];
}
