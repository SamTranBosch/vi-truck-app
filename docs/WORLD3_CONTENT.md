# World 3 (container truck): lessons 32-47, book pages 60-85

Every lesson was read from the page images (three pages per picture) before the data was written.
What follows the book: the vần and their order, the picture words of each page (where an emoji exists), the story plots (from the
picture questions on pp. 60, 70, 80), the capital-letter table (p. 64-65), the review themes.
What is ours: all reading sentences (the book's texts are copyrighted; ours use only letters and vần taught so far, checked by tests),
the story wording, and the pictures (Noto emoji instead of the book's photos).

| Lesson | Book page | Content here | Differences worth knowing |
|---|---|---|---|
| 32 story Dê con nghe lời mẹ | 60 | five scenes, one per picture | Plot inferred from the five picture questions (mother's warning, the wolf at the door, the kids refuse, the wolf leaves, mother praises) |
| 33 review | 61 | t / th / tr / ch x u ư ua ưa grid, reading about the hare and the tortoise | Book's "put the sentences in order" step is not done; the grid takes its place |
| 34 v, y | 62-63 | ve, y tá; v hunt, y hunt (y tá, y tế, ý) | The book also uses y in "y tế xã"; we show "y tế" |
| 35 Chữ hoa | 64-65 | tap the capital of a, b, c, d and h, l, m, t; read "Chia quà"-style lines; trace A, Hà, Lê, Dì Tư | New activity "capital". Only 8 of the 29 capitals are drilled; the full table is not shown |
| 36 am, ap | 66-67 | quả cam, xe đạp; hunts with khám, quả trám, vạm vỡ / tháp rùa, múa sạp, sáp nẻ | vạm vỡ shown as a flexed arm, múa sạp as a dancer |
| 37 ăm, ăp | 68-69 | chăm chỉ, cặp da; tằm, tắm, nằm / thắp, bắp ngô, gắp | |
| 38 story Chú thỏ thông minh | 70 | six scenes, one per picture | Plot inferred from the six questions; the rabbit's trick is our wording |
| 39 review | 71 | reading, find am / ap among look-alikes, pick | The book's "find in the text" step is replaced by a letter hunt |
| 40 âm, âp | 72-73 | củ sâm, cá mập; nấm, mầm, sâm cầm / tập múa, cá mập, cấp cứu | củ sâm is drawn as a herb (no ginseng emoji); cấp cứu (ambulance) replaces the book's "đập/tấp" matching |
| 41 em, ep | 74-75 | kem, dép; tem thư, xem ti vi, rèm / lễ phép, cá chép, ngõ hẹp | cá chép is the carp streamer emoji |
| 42 êm, êp | 76-77 | đêm, bếp lửa; nệm, nếm, mềm / nếp, xếp, bếp lửa | The book's "fruit into two baskets" game is turned into two hunts with the same words |
| 43 im, ip | 78-79 | bìm bịp, nhím; nhím, cà tím, kìm, chim / kịp, nhíp, bìm bịp | bìm bịp has no emoji of its own, so a small bird is used |
| 44 story Ba chú lợn con | 80 | six scenes, one per picture | Plot is the well-known tale, matched to the six questions |
| 45 review | 81 | reading, em / êm hunt among look-alikes, pick | |
| 46 iêm, yêm, iêp | 82-83 | diêm, yếm, tấm thiệp; dừa xiêm, múa kiếm, liềm / tấm liếp, diếp cá, tấm thiệp | yêm is taught together with iêm (same sound, written yêm when no consonant stands before it) |
| 47 om, op | 84-85 | đom đóm, họp tổ; khóm tre, chỏm mũ, xóm quê / cọp, họp tổ, gom góp | "gom góp" contains both vần, so it is right in both hunts |

## New in the code
- `SoundTarget` can be a whole vần (`{ rhyme: 'am' }`); hunts compute the answer from the words.
- `spellTokens('am')` gives a - mờ - am (a vần with no consonant before it), `CODA_SAY` holds the names of the final consonants.
- `isDecodable` now demands the whole vần to be taught for any syllable with a final consonant (the old `allowCodas` flag is gone).
- Activity `capital` (Chữ hoa), component `Capital.tsx`.
- Container truck drawing: `ContainerArt` in `TruckArts.tsx`.

## Rules the tests enforce
Same as World 2, plus: no vần is read before its lesson (final ng, nh, ch, c are still left for World 5), every taught vần is read at least once,
capital rounds only use taught letters.

## Hero picture (optional)
`src/assets/hero/truck-container.webp`, 3:4 portrait, replaces the drawn container truck. Canva prompt that suits the style:
"Cute cartoon container truck (blue container on a red cab) at a harbour with a gantry crane and stacked colourful containers,
bright flat colours, thick dark-blue outlines, child friendly, portrait 3:4, no text".
