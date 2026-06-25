// Prompt template packs — niche-targeted starting points for users.
// Owner: Ng'ang'a Makumi

export interface PromptPack {
  id: string;
  category: string;
  label: string;
  prompt: string;
  recommendedStyle: string;
  icon: string;
}

export const PROMPT_PACKS: PromptPack[] = [
  // === CHURCH & MINISTRY ===
  {
    id: 'church-service-poster',
    category: 'Church',
    label: 'Sunday Service Poster',
    prompt: 'A majestic Sunday church service poster, golden sunrise behind a cross, rays of light breaking through clouds, white doves flying, bold typography space at top, ornate border, vibrant colors, religious art, high detail',
    recommendedStyle: 'cinematic',
    icon: '✝️',
  },
  {
    id: 'church-crusade',
    category: 'Church',
    label: 'Crusade Flyer',
    prompt: 'A massive outdoor gospel crusade at dusk, thousands of people with raised hands, stage with bright lights, tent in background, dramatic sky, worship atmosphere, African landscape, cinematic wide shot',
    recommendedStyle: 'cinematic',
    icon: '⛪',
  },
  {
    id: 'church-wedding',
    category: 'Church',
    label: 'Wedding Announcement',
    prompt: 'An elegant Christian wedding announcement, white roses, gold rings, soft pastel background, scripture text space, romantic atmosphere, luxury wedding card design, intricate floral border',
    recommendedStyle: 'realistic',
    icon: '💍',
  },

  // === REAL ESTATE ===
  {
    id: 'real-estate-empty-room',
    category: 'Real Estate',
    label: 'Stage Empty Room',
    prompt: 'A modern empty living room interior, large windows with natural light, hardwood floors, neutral walls, ready for virtual staging, professional real estate photography, wide angle, 4K',
    recommendedStyle: 'realistic',
    icon: '🏠',
  },
  {
    id: 'real-estate-furnished',
    category: 'Real Estate',
    label: 'Furnished Living Room',
    prompt: 'A beautifully furnished modern living room, beige sofa with throw pillows, wooden coffee table, indoor plants, large window with city view, warm ambient lighting, professional real estate photography, 8K, hyperdetailed',
    recommendedStyle: 'realistic',
    icon: '🛋️',
  },
  {
    id: 'real-estate-exterior',
    category: 'Real Estate',
    label: 'House Exterior',
    prompt: 'A modern 4-bedroom maisonette exterior in Nairobi, white and grey facade, manicured garden, paved driveway, evening lighting with warm interior lights, blue sky, professional real estate photography',
    recommendedStyle: 'realistic',
    icon: '🏡',
  },

  // === SCHOOL & EDUCATION ===
  {
    id: 'school-textbook-illustration',
    category: 'School',
    label: 'Textbook Illustration',
    prompt: 'A vibrant educational illustration for a primary school science textbook, water cycle diagram, friendly cartoon style, clear labels, colorful, child-friendly, 2D flat illustration',
    recommendedStyle: 'cartoon',
    icon: '📚',
  },
  {
    id: 'school-exam-cover',
    category: 'School',
    label: 'Exam Cover',
    prompt: 'A professional school exam cover design, geometric pattern border, graduation cap icon, school name placeholder space at top, navy blue and gold color scheme, academic atmosphere, clean layout',
    recommendedStyle: 'realistic',
    icon: '🎓',
  },
  {
    id: 'school-event-poster',
    category: 'School',
    label: 'Sports Day Poster',
    prompt: 'A vibrant school sports day poster, children running track, colorful balloons, trophy in foreground, dynamic action composition, bright primary colors, school event flyer style, energetic',
    recommendedStyle: 'cartoon',
    icon: '🏃',
  },

  // === SOCIAL MEDIA CONTENT ===
  {
    id: 'social-tiktok-bg',
    category: 'Social',
    label: 'TikTok Background',
    prompt: 'A trendy TikTok green screen background, abstract gradient, purple and orange waves, modern, eye-catching, portrait orientation, social media ready, high saturation',
    recommendedStyle: '3d',
    icon: '🎵',
  },
  {
    id: 'social-youtube-thumb',
    category: 'Social',
    label: 'YouTube Thumbnail',
    prompt: 'A high-energy YouTube thumbnail background, dramatic explosion effect, bright yellow and red accents, surprised facial expression space on right, action movie style, ultra saturated, clickbait energy',
    recommendedStyle: 'cinematic',
    icon: '▶️',
  },
  {
    id: 'social-instagram-quote',
    category: 'Social',
    label: 'Instagram Quote',
    prompt: 'A minimal Instagram quote background, soft gradient sky, mountain silhouette, calming pastel colors, motivational quote space at center, zen atmosphere, portrait orientation',
    recommendedStyle: 'watercolor',
    icon: '📸',
  },

  // === ANIME & CARTOON ===
  {
    id: 'anime-hero-portrait',
    category: 'Anime',
    label: 'Anime Hero',
    prompt: 'A young anime hero with spiky black hair and emerald green eyes, wearing a flowing white and gold battle robe, standing on a cliff at sunset, dramatic wind, Studio Ghibli inspired, cel shaded, vibrant colors, key visual',
    recommendedStyle: 'anime',
    icon: '⚔️',
  },
  {
    id: 'anime-cute-character',
    category: 'Anime',
    label: 'Cute Mascot',
    prompt: 'A cute chibi anime mascot character, big sparkling eyes, pastel pink hair, fluffy dress, holding a star wand, kawaii style, soft lighting, white background, official artwork',
    recommendedStyle: 'anime',
    icon: '🌸',
  },

  // === BUSINESS ===
  {
    id: 'business-logo',
    category: 'Business',
    label: 'Logo Concept',
    prompt: 'A modern minimalist logo concept for a tech startup, geometric letter A monogram, gold gradient on dark background, clean lines, professional branding, vector style',
    recommendedStyle: '3d',
    icon: '🏢',
  },
  {
    id: 'business-product-shot',
    category: 'Business',
    label: 'Product Shot',
    prompt: 'A professional product photography shot of a sleek smartphone on a marble surface, soft studio lighting, reflection, bokeh background, commercial advertisement quality, 8K, hyperdetailed',
    recommendedStyle: 'realistic',
    icon: '📱',
  },
];

export const PROMPT_CATEGORIES = ['All', 'Church', 'Real Estate', 'School', 'Social', 'Anime', 'Business'];
