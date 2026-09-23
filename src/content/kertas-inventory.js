// Repository evidence is separate from the owner's intended catalogue.
// An existing source file does not establish commercial or editorial readiness.
export const inventoryProvenance = {
  checkedOn: '2026-09-22',
  repository: 'https://github.com/chandragumelar/kertas-kecil',
  revision: 'c6fda93aa4dcc1d4d7b342b1c152a059d70f6786',
  source: 'https://github.com/chandragumelar/kertas-kecil/blob/c6fda93aa4dcc1d4d7b342b1c152a059d70f6786/gen.py',
  findings: [
    'Generator dan worksheet HTML untuk buku aktivitas usia 3 tahun ditemukan.',
    'Seri usia 2, 3, 4, dan 5 disebut dalam generator; artefak terpisah usia 2, 4, dan 5 tidak ditemukan.',
    'Tidak ditemukan artefak Coding book for kid pada tree main yang diperiksa.',
    'Tidak ada GitHub release; kesiapan jual setiap buku belum terverifikasi.',
  ],
};

export const inventoryNote = 'The owner lists four Busy books for ages 2, 3, 4, and 5, and five Coding books across ages 2–5. No Coding book artefacts were found in the repository reviewed. The five-book count remains unverified.';

export const printableBooks = [
  ...[2, 3, 4, 5].map((age) => ({
    id: `busy-${age}`,
    kind: 'busy',
    age,
    title: `Busy book · age ${age}`,
    status: age === 3 ? 'Source available; sale readiness unverified' : 'Series listed; readiness unverified',
    evidence: age === 3
      ? 'An age-3 activity book generator and worksheet HTML are present in the repository.'
      : 'This age is named in the generator’s series; a separate book file was not found.',
    source: `${inventoryProvenance.source}#L${age === 3 ? '2' : '997'}`,
    availability: age === 3 ? 'source-available' : 'unverified',
    price: null,
    action: null,
  })),

];

export const kertasOfferings = [
  { id: 'printable', title: 'Buku worksheet', state: 'inventory-review', price: null, action: null },
  { id: 'interactive', title: 'Worksheet interaktif', state: 'planned', description: 'Untuk HP dan tablet. Produk belum dibuat.', price: null, action: null },
  { id: 'custom-printable', title: 'Buku worksheet custom', state: 'concept', description: 'Gagasan layanan sudah ada; layanan belum dieksekusi.', price: null, action: null },
  { id: 'invitation', title: 'Custom digital invitation', state: 'past-work', description: 'Satu karya terdahulu tersedia. Penawaran layanan berulang belum dibentuk.', price: null, action: { label: 'Buka karya Berry', href: 'https://berryisthree.pika-xu.com/' } },
];

// Customer-facing examples remain separate from the availability of each service.
// Add published work here when its destination is ready.
export const invitationExamples = [
  {
    id: 'berry-is-three', title: 'Berry is Three',
    href: 'https://berryisthree.pika-xu.com/',
    description: {
      id: 'Contoh undangan digital untuk ulang tahun ketiga Berry.',
      en: 'An example digital invitation for Berry’s third birthday.',
    },
    actionLabel: { id: 'Lihat undangan Berry', en: 'View Berry’s invitation' },
  },
];

export const customCollections = [
  {
    id: 'worksheets', state: 'coming-soon', action: null,
    title: { id: 'Buku Worksheet Custom', en: 'Custom Worksheet Books' },
    description: {
      id: 'Buku worksheet dengan nama anak dan tema pilihan Anda. Aktivitas disesuaikan dengan usia anak, untuk belajar sambil bermain atau hadiah ulang tahun.',
      en: 'Worksheet books with your child’s name and chosen theme. Activities matched to their age, for playful learning or a birthday gift.',
    },
  },
  {
    id: 'storybooks', state: 'coming-soon', action: null,
    title: { id: 'Buku Cerita Personal', en: 'Personalized Storybooks' },
    description: {
      id: 'Jadikan anak tokoh utama dalam buku cerita dengan nama dan wajah karakter yang dipersonalisasi. Hadiah ulang tahun atau kenang-kenangan yang terasa miliknya.',
      en: 'Make a child the main character, with personalized names and faces. A birthday gift or keepsake with a story of their own.',
    },
  },
];

// No per-book records are fabricated from an age range.
export const codingCollection = {
  title: 'Coding books', ageRange: '2–5', ownerReportedCount: 5,
  verifiedCount: null, status: 'Collection details being verified',
  price: null, action: null,
};
