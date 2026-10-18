export interface ShowcaseProject {
  id: string;
  index: string;
  title: string;
  category: string;
  year: string;
  status: string;
  summary: string;
  craftDetail: string;
  image: string;
  specs: { label: string; value: string }[];
  interactiveTabId: 'lullaby' | 'nightlight' | 'routes' | 'toys' | 'storybook' | 'growth';
}

export interface StoryScene {
  id: string;
  chapterNumber: string;
  timeStamp: string;
  title: string;
  subtitle: string;
  location: string;
  narrative: string; // Strictly under 150 words per Section 05 Golden Rule
  pipQuote: string;
  wordCount: number;
  illustrationTheme: 'crib-star' | 'nursery-desk' | 'silence-bell' | 'rooftop-lantern';
  interactiveHint: string;
}

export interface StorybookPage {
  pageNumber: number;
  title: string;
  text: string;
  soundNote: number; // Frequency in Hz
  sceneCode: 'moon-slip' | 'cloud-net' | 'lantern-glow' | 'owl-tea' | 'sweet-slumber';
}

export interface GrowthMilestone {
  heightInches: string;
  ageLabel: string;
  title: string;
  skillUnlocked: string;
  note: string;
}

export interface DeliveryStop {
  id: string;
  code: string;
  name: string;
  resident: string;
  dreamParcel: string;
  eta: string;
  x: number;
  y: number;
  altitudeFt: number;
  lullabyKey: string;
}

export interface AttachedMelody {
  label: string;
  bpm: number;
  notes: number[]; // 8-step primary frequency per step (0 = rest)
}

export interface GuestbookWish {
  id: string;
  visitorName: string;
  creatureType: string;
  dreamWish: string;
  timestamp: string;
  mood: 'Cozy Cream' | 'Starlight Indigo';
  attachedMelody?: AttachedMelody;
}

export const PIP_CANON_PROFILE = {
  name: 'Pip',
  title: 'Junior Dream Engineer',
  workplace: 'Midnight Nursery · Studio 04, Cloud-Crib District',
  track: 'Track 1 · Official Canon ("Same Baby, 1,000 Websites")',
  whatPipIs:
    'A sleepy, gentle baby with a smooth round porcelain-white skull face, huge soft eye sockets lit by warm amber pinpricks, a tiny crooked smile, and a star-stitched bedtime nightcap tied with a dusty-pink ribbon bow.',
  personality:
    'Curious, sleepy, a little clumsy, and easily delighted. Pip giggles at floating dust motes, collects lost lullaby notes in jam jars, and dislikes long stretches of silence.',
  craft:
    'Designs and delivers handcrafted dreams, music-box lullabies, porcelain nightlights, and illustrated bedtime stories that help the neighborhood’s little creatures drift safely to sleep.',
  traits: [
    { label: 'Name', value: 'Pip (Badge #004-PIP)' },
    { label: 'Species & Look', value: 'Friendly Skull Baby · Warm Amber Eye Pinpricks · Starry Nightcap with Pink Bow' },
    { label: 'Role', value: 'Junior Dream Engineer at Midnight Nursery' },
    { label: 'Shift Hours', value: '19:30 Dusk Bell to 05:15 First Sparrow' },
    { label: 'Signature Tool', value: 'Brass-Keyed Celesta Music Box & Crescent Porcelain Lantern' },
    { label: 'Golden Rule', value: '100% cozy, kind, and gentle — never scary, dark, or gory' },
  ],
};

export const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: 'lullaby-lab',
    index: '01',
    title: 'The Lullaby Lab Music Box',
    category: 'Acoustic Dream Engineering',
    year: 'Autumn 2026',
    status: 'Interactive Synth Live',
    summary:
      'A pastel brass-wound celesta music box that weaves 16-step star chimes into weightless bedtime melodies for restless hedgehogs and cloud bunnies.',
    craftDetail:
      'Built with tuned brass tines and a golden winding key. Visitors can wind the spring, compose custom starlight patterns, or play Pip’s three signature nocturnal waltzes.',
    image: '/baby/assets/pip_lullaby_box.png',
    specs: [
      { label: 'Tuning', value: '432 Hz Warm Celesta' },
      { label: 'Polyphony', value: '6-Note Star Scale' },
      { label: 'Power', value: '3 Turns of Golden Key' },
    ],
    interactiveTabId: 'lullaby',
  },
  {
    id: 'nightlight-collection',
    index: '02',
    title: 'Porcelain Nightlight Collection',
    category: 'Luminous Industrial Craft',
    year: 'Autumn 2026',
    status: '4 Lamps + Torch Mode',
    summary:
      'Translucent bone-china crescent lamps and brass handle lanterns calibrated between 1800K candle-amber and 2700K warm milk.',
    craftDetail:
      'Each lamp is glazed by hand so shadows never look sharp or frightening. Includes an interactive Nightlight Torch mode to inspect hidden bedtime doodles.',
    image: '/baby/assets/pip_dream_lantern.png',
    specs: [
      { label: 'Color Temp', value: '1800K – 2700K Warm' },
      { label: 'Housing', value: 'Glazed Porcelain & Brass' },
      { label: 'Burn Time', value: 'All Night Until Dawn' },
    ],
    interactiveTabId: 'nightlight',
  },
  {
    id: 'dream-delivery-routes',
    index: '03',
    title: 'Dream Delivery Flight Routes',
    category: 'Nocturnal Cartography',
    year: 'Autumn 2026',
    status: '5 Active Rooftop Stops',
    summary:
      'Pip’s nightly cloud-glider flight chart across the sleepy rooftops of Whispering Willows, Owl Post Bakery, and Moonbeam Lighthouse.',
    craftDetail:
      'Tracks wind currents, chimney drafts, and exact dream-parcel drop-offs so every little creature receives the right dream before midnight.',
    image: '/baby/assets/pip_avatar_cloud.png',
    specs: [
      { label: 'Cruising Alt', value: '420 Cloud Feet' },
      { label: 'Vehicle', value: 'Cumulus Cushion Mk.II' },
      { label: 'On-Time Rate', value: '99.4% Before Yawn #3' },
    ],
    interactiveTabId: 'routes',
  },
  {
    id: 'rattle-block-toys',
    index: '04',
    title: 'Rattle & Block Nursery Toybox',
    category: 'Tactile Play Inventions',
    year: 'Summer 2026',
    status: 'Playable Toy Physics',
    summary:
      'Hand-carved maple alphabet blocks (h-a-X-♡) paired with a star-shaped brass chime rattle that produces soothing acoustic clicks when stacked.',
    craftDetail:
      'Designed with rounded corners and soft pastel milk-paint finishes. Visitors can stack the blocks, shuffle towers, and shake the rattle.',
    image: '/baby/assets/pip_toybox_blocks.svg',
    specs: [
      { label: 'Material', value: 'Sanded Maple & Brass' },
      { label: 'Finish', value: 'Non-Toxic Berry & Cream' },
      { label: 'Acoustics', value: 'Soft Maraca & Wood Pitch' },
    ],
    interactiveTabId: 'toys',
  },
  {
    id: 'bedtime-storybook',
    index: '05',
    title: 'The Night Pip Dropped the Moon',
    category: 'Illustrated Flipbook',
    year: 'Spring 2026',
    status: '5-Page Interactive Book',
    summary:
      'A hand-stitched cloth and paper bedtime storybook written and illustrated by Pip after a clumsy Tuesday shift on the cloud balcony.',
    craftDetail:
      'Features page-by-page turn animations, keyboard arrow navigation, and synchronized music-box chime cues on every spread.',
    image: '/baby/pip.jpg',
    specs: [
      { label: 'Length', value: '5 Illustrated Spreads' },
      { label: 'Binding', value: 'Pink Ribbon & Linen' },
      { label: 'Reading Time', value: '2 Cozy Minutes' },
    ],
    interactiveTabId: 'storybook',
  },
  {
    id: 'growth-chart',
    index: '06',
    title: 'Pip’s Nursery Wall Growth Chart',
    category: 'Skills & Milestones',
    year: '2025 – 2026',
    status: '6 Pencil Notches',
    summary:
      'Instead of a human resume, Pip’s engineering capabilities are penciled directly onto the wooden nursery doorframe in Cloud Inches.',
    craftDetail:
      'Click each pencil notch from 14.0" (First Rattle Spark) to 28.5" (Junior Dream Engineer Certification) to inspect Pip’s craft progression.',
    image: '/baby/assets/pip_growth_chart.svg',
    specs: [
      { label: 'Current Height', value: '28.5 Cloud Inches' },
      { label: 'Nightcap Bonus', value: '+3.2 Inches (Fluffed)' },
      { label: 'Next Goal', value: 'Senior Cloud Architect' },
    ],
    interactiveTabId: 'growth',
  },
];

// Strictly under 150 words per scene (Golden Rule: Story Over Text)
export const STORY_SCENES: StoryScene[] = [
  {
    id: 'scene-1',
    chapterNumber: 'Chapter 01',
    timeStamp: '20:15 · Dusk Arrival',
    title: 'The Falling Star Crib',
    subtitle: 'How a tiny skull baby floated down in a basket of cumulus wool',
    location: 'Upper Cloud Balcony, Midnight Nursery',
    narrative:
      'One velvet October evening, a stray shooting star snagged its tail on a sleepy cumulus cloud. Instead of sparks, out tumbled a woven wicker crib lined with warm flannel. Inside sat Pip: a tiny baby with a smooth porcelain skull face, two cozy amber pinpricks glowing in huge eye sockets, and a crooked little grin. Pip wasn’t scary at all—the first thing Pip did was sneeze, giggle, and hug a porcelain crescent moon.',
    pipQuote: '“Achoo! Oh—did I drop my star in your teacup?”',
    wordCount: 75,
    illustrationTheme: 'crib-star',
    interactiveHint: 'Click the falling star in the diorama to hear Pip’s first giggle chime.',
  },
  {
    id: 'scene-2',
    chapterNumber: 'Chapter 02',
    timeStamp: '22:00 · The Apprentice Workbench',
    title: 'First Shift at Midnight Nursery',
    subtitle: 'Learning to wind music boxes without tangling the pink ribbon bow',
    location: 'Workshop Bench #4, Lullaby Wing',
    narrative:
      'The elder Sand-Owls noticed that Pip hated quiet rooms. Whenever silence settled over the nursery, Pip tapped little wooden blocks together until a gentle melody emerged. They tied a star-patterned nightcap onto Pip’s smooth head with a pink bow and appointed Pip Junior Dream Engineer. Pip’s workbench is stacked with brass keys, warm milk bottles, and blueprints for non-spooky nightlights that keep closet shadows friendly.',
    pipQuote: '“Three turns of the golden key makes the cloud stay extra bouncy!”',
    wordCount: 73,
    illustrationTheme: 'nursery-desk',
    interactiveHint: 'Click the workbench music box in the scene to test Pip’s tuning fork.',
  },
  {
    id: 'scene-3',
    chapterNumber: 'Chapter 03',
    timeStamp: '03:17 · The Great Silence',
    title: 'The Night the Crickets Forgot Their Song',
    subtitle: 'When the whole valley woke up restless, one little lantern lit the sky',
    location: 'Whispering Willows Rooftops',
    narrative:
      'At 3:17 AM on the longest night of winter, a chilly fog muffled every cricket in the valley. Down below, baby badgers and dormice began to toss and turn. Clumsy but brave, Pip climbed onto a puffy cloud cushion, held up the Crescent Porcelain Lantern, and wound the Lullaby Lab box to full chime. Silver notes drifted down chimneys like warm snowflakes, tucking the whole town back under their quilts.',
    pipQuote: '“No creature stays awake on Pip’s watch—not even the grumpy owls!”',
    wordCount: 76,
    illustrationTheme: 'silence-bell',
    interactiveHint: 'Click the lantern beam to scatter warm chime notes across the rooftops.',
  },
  {
    id: 'scene-4',
    chapterNumber: 'Chapter 04',
    timeStamp: '05:00 · Dawn Check-Out',
    title: 'Keeper of the First Lullaby',
    subtitle: 'Where Pip is floating next—and why your dream wish matters',
    location: 'Starlight Archive & Guestbook Wall',
    narrative:
      'Now, every evening at dusk, Pip checks the Midnight Nursery Guestbook before takeoff. Whether a visitor needs a brave dream before a big exam, a cozy rainstorm melody, or just a friendly wave from a little skull baby on a cloud, Pip packs it into a brass-latched parcel. Before the sun peeks over the hills, Pip drinks warm honey milk, straightens the pink nightcap bow, and waves goodnight to you.',
    pipQuote: '“Leave a wish on my wall below! I’ll deliver it on tonight’s cloud route.”',
    wordCount: 77,
    illustrationTheme: 'rooftop-lantern',
    interactiveHint: 'Click Pip’s cloud parcel to jump straight to the Live Dream Guestbook.',
  },
];

export const STORYBOOK_PAGES: StorybookPage[] = [
  {
    pageNumber: 1,
    title: 'Page 1 · Polishing the Crescent',
    text: 'Every Tuesday before bedtime, Pip polished the big porcelain Crescent Moon with a flannel handkerchief. “Hold still, Mr. Moon,” Pip whispered, standing on tiptoe atop a stack of three alphabet blocks.',
    soundNote: 523.25, // C5
    sceneCode: 'moon-slip',
  },
  {
    pageNumber: 2,
    title: 'Page 2 · The Clumsy Giggle',
    text: 'A tiny feather tickled Pip’s smooth nose-socket. “Hic—giggle!” went Pip. The blocks wobbled, the pink nightcap bow flopped over both glowing eyes, and—whoops!—the golden Crescent Moon slipped right off the cloud balcony!',
    soundNote: 587.33, // D5
    sceneCode: 'cloud-net',
  },
  {
    pageNumber: 3,
    title: 'Page 3 · Diving into Indigo',
    text: 'Pip didn’t panic (okay, Pip panicked for two seconds). Grabbing the butterfly cloud-net and whistling for Puff the Cumulus Cushion, Pip swooped down through the lavender mist after the tumbling amber glow.',
    soundNote: 659.25, // E5
    sceneCode: 'lantern-glow',
  },
  {
    pageNumber: 4,
    title: 'Page 4 · The Bakery Chimney Catch',
    text: 'Just two inches above the Owl Post Bakery chimney, Pip stretched out both tiny bony hands—and PLOP! The moon landed softly in a basket of warm cinnamon buns, glowing brighter and sweeter than ever.',
    soundNote: 783.99, // G5
    sceneCode: 'owl-tea',
  },
  {
    pageNumber: 5,
    title: 'Page 5 · Cinnamon-Scented Dreams',
    text: 'When Pip hung the moon back in the sky, the whole neighborhood noticed something wonderful: for the rest of the week, every single bedtime dream smelled faintly of warm cinnamon sugar. The End.',
    soundNote: 1046.5, // C6
    sceneCode: 'sweet-slumber',
  },
];

export const GROWTH_MILESTONES: GrowthMilestone[] = [
  {
    heightInches: '28.5"',
    ageLabel: 'Current · Oct 2026',
    title: 'Junior Dream Engineer (Certified)',
    skillUnlocked: 'Full-Stack Lullaby Synthesis & Multi-Rooftop Cloud Navigation',
    note: 'Can carry 12 dream parcels at once without dropping the lantern!',
  },
  {
    heightInches: '25.0"',
    ageLabel: 'Month 9',
    title: 'Porcelain Nightlight Glazer',
    skillUnlocked: '1800K Warm Amber Glow Calibration & Shadow Softening',
    note: 'Invented the sleeping crescent moon lamp with the brass handle.',
  },
  {
    heightInches: '22.0"',
    ageLabel: 'Month 7',
    title: 'Storybook Author & Illustrator',
    skillUnlocked: 'Crayon, Gouache & Ribbon-Bound Bedtime Tales',
    note: 'Wrote "The Night Pip Dropped the Moon" using only non-toxic berry ink.',
  },
  {
    heightInches: '19.5"',
    ageLabel: 'Month 5',
    title: 'Celesta Key Winder',
    skillUnlocked: '16-Step Polyphonic Star Chimes & Tempo Control',
    note: 'Learned that three winds of the golden key equals one full Rem-sleep cycle.',
  },
  {
    heightInches: '16.5"',
    ageLabel: 'Month 3',
    title: 'Block Tower Architect',
    skillUnlocked: '6-Block Vertical Equilibrium (h-a-X-♡ Stack)',
    note: 'Only knocks the tower over on purpose when someone needs a laugh.',
  },
  {
    heightInches: '14.0"',
    ageLabel: 'Day 1 · Arrival',
    title: 'First Rattle Spark & Giggle',
    skillUnlocked: 'Warm Amber Eye-Pinprick Tracking & Friendly Wave',
    note: 'Arrived in a wicker cloud basket wearing a slightly oversized starry nightcap.',
  },
];

export const DELIVERY_STOPS: DeliveryStop[] = [
  {
    id: 'stop-1',
    code: 'NRS-01',
    name: 'Midnight Nursery Hangar',
    resident: 'Pip & The Elder Sand-Owls',
    dreamParcel: 'Warm Milk & Starlight Calibration',
    eta: '20:00 Departed',
    x: 110,
    y: 230,
    altitudeFt: 480,
    lullabyKey: 'C Major',
  },
  {
    id: 'stop-2',
    code: 'WW-02',
    name: 'Whispering Willows Hollow',
    resident: 'Barnaby the Hedgehog Family',
    dreamParcel: 'Parcel #14: Acorn Orchard Picnic Dream',
    eta: '21:15 Delivered',
    x: 270,
    y: 145,
    altitudeFt: 340,
    lullabyKey: 'F Major',
  },
  {
    id: 'stop-3',
    code: 'OPB-03',
    name: 'Owl Post Cinnamon Bakery',
    resident: 'Pippa the Dormouse Baker',
    dreamParcel: 'Parcel #19: Zero-Gravity Muffin Cloud',
    eta: '22:30 En Route',
    x: 455,
    y: 215,
    altitudeFt: 390,
    lullabyKey: 'G Major',
  },
  {
    id: 'stop-4',
    code: 'CCT-04',
    name: 'Cloud-Crib Observatory Tower',
    resident: 'Little Leo the Star-Kitten',
    dreamParcel: 'Parcel #23: Chasing Yarn-Comets Across Saturn',
    eta: '23:15 Scheduled',
    x: 640,
    y: 115,
    altitudeFt: 520,
    lullabyKey: 'A Minor (Cozy)',
  },
  {
    id: 'stop-5',
    code: 'MBL-05',
    name: 'Moonbeam Coastal Lighthouse',
    resident: 'Captain Puffin & Baby Seal',
    dreamParcel: 'Parcel #31: Gentle Tide & Warm Blanket Harbour',
    eta: '23:55 Final Stop',
    x: 810,
    y: 185,
    altitudeFt: 410,
    lullabyKey: 'D Major',
  },
];

export const INITIAL_GUESTBOOK_WISHES: GuestbookWish[] = [
  {
    id: 'wish-1',
    visitorName: 'Sai Ram (haX.baby)',
    creatureType: 'Cloud Bunny',
    dreamWish: 'Wishing every first-time builder a joyful 48 hours of shipping cute things. Start small, build together!',
    timestamp: '17 Oct · 17:17 IST',
    mood: 'Cozy Cream',
  },
  {
    id: 'wish-2',
    visitorName: 'Milo & Barnaby',
    creatureType: 'Sleepy Hedgehog',
    dreamWish: 'Pip, please send a dream where all our CSS grids align on the first try and the warm milk never cools down.',
    timestamp: '17 Oct · 21:04 IST',
    mood: 'Starlight Indigo',
  },
  {
    id: 'wish-3',
    visitorName: 'Clara from Studio 9',
    creatureType: 'Night-Owl',
    dreamWish: 'The Lullaby Lab music box actually made me yawn in the best way. Keep that pink nightcap bow straight, Pip!',
    timestamp: '18 Oct · 01:12 IST',
    mood: 'Cozy Cream',
    attachedMelody: {
      label: 'Cloud Nine Waltz (88 BPM)',
      bpm: 88,
      notes: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 880.0, 1046.5],
    },
  },
];
