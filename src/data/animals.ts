export type AnimalId =
  | 'singa'
  | 'harimau'
  | 'buaya'
  | 'beruang'
  | 'serigala'
  | 'badak'
  | 'hiu'
  | 'elang';

export interface WildAnimal {
  id: AnimalId;
  name: string;
  soundWord: string;
  habitat: string;
  shadowClue: string;
  voiceQuizClue: string;
  funFact: string;
  realPhotoUrl: string;
  accentBg: string;
  accentBorder: string;
  praiseLine: string;
}

export const WILD_ANIMALS: WildAnimal[] = [
  {
    id: 'singa',
    name: 'Singa',
    soundWord: 'Roaaar!',
    habitat: 'Padang Sabana',
    shadowClue: 'Lihat bayangan yang punya rambut surai melingkar di kepalanya!',
    voiceQuizClue: 'Suaraku Roaaar! Aku tinggal di padang rumput sabana dan punya rambut surai tebal di kepalaku.',
    funFact: 'Singa dijuluki Raja Hutan dan suka mengaum keras.',
    realPhotoUrl: '/src/assets/images/real_singa_1794894202893.jpg',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-300',
    praiseLine: 'Hebat sekali! Kamu pintar mencocokkan Singa si Raja Hutan!',
  },
  {
    id: 'harimau',
    name: 'Harimau',
    soundWord: 'Grrr!',
    habitat: 'Hutan Rimba',
    shadowClue: 'Cari bayangan kucing besar dengan ekor panjang melengkung!',
    voiceQuizClue: 'Suaraku Grrr! Aku kucing besar yang bulunya berwarna oranye dengan garis belang hitam.',
    funFact: 'Harimau punya belang oranye dan hitam yang keren.',
    realPhotoUrl: '/src/assets/images/real_harimau_1794894123398.jpg',
    accentBg: 'bg-orange-50',
    accentBorder: 'border-orange-300',
    praiseLine: 'Wah, jeli sekali! Itu benar bayangan Harimau!',
  },
  {
    id: 'buaya',
    name: 'Buaya',
    soundWord: 'Kraak!',
    habitat: 'Sungai & Rawa',
    shadowClue: 'Perhatikan bayangan yang bermoncong panjang dan punggung bergerigi!',
    voiceQuizClue: 'Suaraku Kraak! Aku suka berjemur di tepi sungai dengan moncong panjang dan gigi tajam.',
    funFact: 'Buaya pandai berenang di sungai dan punya gigi yang kuat.',
    realPhotoUrl: '/src/assets/images/real_buaya_1794894204503.jpg',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-300',
    praiseLine: 'Pintar banget! Kamu berhasil menemukan bayangan Buaya!',
  },
  {
    id: 'beruang',
    name: 'Beruang',
    soundWord: 'Groaaam!',
    habitat: 'Hutan Pegunungan',
    shadowClue: 'Temukan bayangan bertubuh gemuk dengan dua telinga bulat di atas!',
    voiceQuizClue: 'Suaraku Groaaam! Tubuhku besar berbulu cokelat tebal dan telingaku bulat.',
    funFact: 'Beruang bertubuh besar dan sangat suka mencari madu dan ikan.',
    realPhotoUrl: '/src/assets/images/real_beruang_1794894203184.jpg',
    accentBg: 'bg-stone-100',
    accentBorder: 'border-stone-300',
    praiseLine: 'Luar biasa! Jawabanmu tepat sekali, itu Beruang!',
  },
  {
    id: 'serigala',
    name: 'Serigala',
    soundWord: 'Auuu!',
    habitat: 'Hutan Utara',
    shadowClue: 'Cari bayangan bertelinga runcing dan berekor lebat!',
    voiceQuizClue: 'Suaraku Auuu! Aku punya telinga runcing dan suka melolong di padang rumput.',
    funFact: 'Serigala suka melolong bersama teman-temannya saat malam tiba.',
    realPhotoUrl: '/src/assets/images/real_serigala_1794894204517.jpg',
    accentBg: 'bg-slate-100',
    accentBorder: 'border-slate-300',
    praiseLine: 'Keren sekali! Kamu hebat, itu memang bayangan Serigala!',
  },
  {
    id: 'badak',
    name: 'Badak',
    soundWord: 'Hmph!',
    habitat: 'Rimba & Sabana',
    shadowClue: 'Lihat bayangan bertubuh kokoh dengan cula melengkung di hidungnya!',
    voiceQuizClue: 'Suaraku Hmph! Kulitku tebal berwarna abu-abu dan aku punya cula kuat di hidungku.',
    funFact: 'Badak memiliki kulit tebal dan cula kuat di bagian hidungnya.',
    realPhotoUrl: '/src/assets/images/real_badak_1794894121116.jpg',
    accentBg: 'bg-zinc-100',
    accentBorder: 'border-zinc-300',
    praiseLine: 'Jempol dua buat kamu! Tepat sekali, itu Badak!',
  },
  {
    id: 'hiu',
    name: 'Hiu',
    soundWord: 'Byuur!',
    habitat: 'Lautan Luas',
    shadowClue: 'Cari bayangan ikan besar dengan sirip runcing tinggi di punggungnya!',
    voiceQuizClue: 'Byuur! Aku berenang cepat di dalam air laut biru dan punya sirip tinggi di punggungku.',
    funFact: 'Hiu berenang sangat cepat di dalam air laut.',
    realPhotoUrl: '/src/assets/images/real_hiu_1794894224209.jpg',
    accentBg: 'bg-sky-50',
    accentBorder: 'border-sky-300',
    praiseLine: 'Hore, betul sekali! Kamu menemukan bayangan Hiu!',
  },
  {
    id: 'elang',
    name: 'Elang',
    soundWord: 'Kiiik!',
    habitat: 'Langit & Tebing',
    shadowClue: 'Temukan bayangan burung gagah dengan sayap lebar membentang!',
    voiceQuizClue: 'Suaraku Kiiik! Aku burung gagah yang terbang tinggi di langit dengan sayap lebar.',
    funFact: 'Elang punya mata yang sangat tajam dan sayap yang lebar.',
    realPhotoUrl: '/src/assets/images/real_elang_1794894122204.jpg',
    accentBg: 'bg-yellow-50',
    accentBorder: 'border-yellow-300',
    praiseLine: 'Bagus sekali! Matamu tajam seperti Elang!',
  },
];

export const PRAISE_SHORT_LIST = [
  'Hebat sekali!',
  'Pintar banget!',
  'Luar biasa!',
  'Keren sekali!',
  'Jempol dua!',
  'Wah, tepat sekali!',
];

export const ENCOURAGE_RETRY_LIST = [
  'Hampir tepat! Yuk coba lihat bentuk bayangannya lagi ya!',
  'Belum pas nih, coba cocokkan dengan bayangan yang lain!',
  'Semangat! Perhatikan bentuk telinga, ekor, atau sayapnya ya!',
];
