export const ITEM_CATEGORIES = [
  { id: 'mobile_phone', label: 'Mobile Phone', icon: '📱' },
  { id: 'wallet', label: 'Wallet', icon: '👛' },
  { id: 'laptop', label: 'Laptop', icon: '💻' },
  { id: 'id_card', label: 'ID Card', icon: '🪪' },
  { id: 'keys', label: 'Keys', icon: '🔑' },
  { id: 'earbuds', label: 'Earbuds', icon: '🎧' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'bags', label: 'Bags', icon: '🎒' },
  { id: 'jewelry', label: 'Jewelry', icon: '💍' },
  { id: 'clothing', label: 'Clothing', icon: '👕' },
  { id: 'sports_equipment', label: 'Sports Eq.', icon: '⚽' },
  { id: 'other', label: 'Other', icon: '📦' }
];

export const BADGES = {
  trusted_helper: { label: 'Trusted Helper', icon: '🤝', color: 'text-blue-400 bg-blue-400/10' },
  community_hero: { label: 'Community Hero', icon: '🦸', color: 'text-purple-400 bg-purple-400/10' },
  verified_finder: { label: 'Verified Finder', icon: '🔍', color: 'text-green-400 bg-green-400/10' },
  super_contributor: { label: 'Super Contributor', icon: '⭐', color: 'text-yellow-400 bg-yellow-400/10' }
};

export const QUESTION_SUGGESTIONS = {
  mobile_phone: [
    "What is the wallpaper or screensaver on the phone?",
    "What color is the phone case or cover?",
    "List any apps pinned to your home screen"
  ],
  wallet: [
    "What cards were inside the wallet? (credit, debit, ID, etc)",
    "What is the color and material of the wallet?",
    "Was there any cash? If yes, approximately how much?"
  ],
  laptop: [
    "What stickers are on the lid of the laptop?",
    "What is the wallpaper on the desktop?",
    "What color is the laptop charger?"
  ],
  keys: [
    "What is on the keychain (tags, charms, other keys)?",
    "How many keys are on the ring?",
    "What is the color of the keychain/holder?"
  ],
  id_card: [
    "What is the ID number on the card?",
    "What is the name of the institution or organization on the card?",
    "What is the expiry date on the card?"
  ],
  bags: [
    "What color is the inner lining of the bag?",
    "What brand or logo is on the bag?",
    "What is inside the bag? List major items"
  ]
};
