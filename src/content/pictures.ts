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
  'cờ': '🚩', 'cú': '🦉', 'vịt': '🦆', 'dê': '🐐',
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
  'cò': '🦢', 'ô': '☂️', 'đa': '🌳', 'đò': '⛴️', 'dẻ': '🌰', 'lồ ô': '🎋', 'cá cờ': '🐠', 'cờ đỏ': '🚩', 'le le': '🦆', 'đồ cổ': '🏺',
  // i ia
  'ví': '👛', 'chỉ': '🧵', 'bìa': '📕', 'chìa': '🔑',
};

export function pic(word: string): string | undefined {
  return PICS[word];
}
