// Hero "Arrival" — configuration: device tiers, scene layouts, copy.

/** Pick a render tier. ?tier=full|lite|still overrides (handy for testing). */
export function detectTier() {
  if (typeof window === 'undefined') return 'lite';
  const q = new URLSearchParams(window.location.search).get('tier');
  if (q === 'full' || q === 'lite' || q === 'still') return q;

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'still';

  // Force full animation so the user always sees the truck arrive, 
  // bypassing aggressive connection/memory checks that might disable it.
  return 'full';
}

/** Scene geometry. Scene is an SVG viewBox; vanishing point (vx,vy). */
export function makeLayout(portrait, tier) {
  const light = tier !== 'full';
  if (portrait) {
    return {
      portrait: true, W: 900, H: 1600, vx: 450, vy: 520,
      roadHalf: 640, sF: 0.44, off: 400, q: 1.15,
      lampsPerSide: light ? 5 : 7, sMaxLamp: 0.62, lampU: 1.5,
      dust: light ? 0 : 15, embers: light ? 0 : 4,
    };
  }
  return {
    portrait: false, W: 1600, H: 900, vx: 990, vy: 505,
    roadHalf: 820, sF: 0.66, off: 380, q: 1,
    lampsPerSide: light ? 7 : 11, sMaxLamp: 1.05, lampU: 1,
    dust: 30, embers: 8,
  };
}

export const SCENE_TIMES = {
  firstFlame: 0.25, // s
  wordmark: 1,
  headlightsOn: 1.9,
  line1: 2.4,
  line2: 3.4,
  ledOn: 5.4,
  flicker: 6.55,
  sub: 6,
  cue: 7,
  stop: 10,
  clarity: 11,
  clockEnd: 11.5,
};

export const COPY = {
  en: {
    name: 'TheatreOnWheels',
    tag: 'Theatre on Wheels',
    lines: ['Something is', 'on its way.'],
    h1: 'Something is on its way.',
    sub: 'A theatre that travels, with worlds inside.',
    clarity: 'One door, many worlds inside a travelling theatre.',
    reserve: 'Reserve',
    scroll: 'Scroll',
    nudge: 'Scroll to step closer',
    sound: 'Enter with sound',
    soundOn: 'Sound on',
    render: 'Design render',
    trust: ['IIT Bhubaneswar', 'Startup India', 'Startup Odisha'],
  },
  hi: {
    name: 'गौड़ीय दर्शन',
    tag: 'थिएटर ऑन व्हील्स',
    lines: ['कुछ', 'आ रहा है।'],
    h1: 'कुछ आ रहा है।',
    sub: 'एक रंगमंच, जो यात्रा करता है, जिसके भीतर कई दुनिया हैं।',
    clarity: 'एक दरवाज़ा, चलती-फिरती थिएटर के भीतर कई दुनिया।',
    reserve: 'आरक्षित करें',
    scroll: 'स्क्रॉल',
    nudge: 'पास आने के लिए स्क्रॉल करें',
    sound: 'ध्वनि के साथ प्रवेश',
    soundOn: 'ध्वनि चालू',
    render: 'डिज़ाइन रेंडर',
    trust: ['आईआईटी भुवनेश्वर', 'स्टार्टअप इंडिया', 'स्टार्टअप ओडिशा'],
  },
  or: {
    name: 'ଗୌଡ଼ୀୟ ଦର୍ଶନ',
    tag: 'ଥିଏଟର ଅନ୍ ହ୍ୱିଲ୍ସ',
    lines: ['କିଛି', 'ଆସୁଛି।'],
    h1: 'କିଛି ଆସୁଛି।',
    sub: 'ଏକ ରଙ୍ଗମଞ୍ଚ, ଯାହା ଯାତ୍ରା କରେ, ଯାହା ଭିତରେ ଅନେକ ଦୁନିଆ ଅଛି।',
    clarity: 'ଗୋଟିଏ କବାଟ, ଯାତ୍ରା କରୁଥିବା ଥିଏଟର ଭିତରେ ଅନେକ ଦୁନିଆ।',
    reserve: 'ସଂରକ୍ଷଣ',
    scroll: 'ସ୍କ୍ରୋଲ୍',
    nudge: 'ପାଖକୁ ଆସିବା ପାଇଁ ସ୍କ୍ରୋଲ୍ କରନ୍ତୁ',
    sound: 'ଧ୍ୱନି ସହ ପ୍ରବେଶ',
    soundOn: 'ଧ୍ୱନି ଚାଲୁ',
    render: 'ଡିଜାଇନ୍ ରେଣ୍ଡର',
    trust: ['ଆଇଆଇଟି ଭୁବନେଶ୍ୱର', 'ଷ୍ଟାର୍ଟଅପ୍ ଇଣ୍ଡିଆ', 'ଷ୍ଟାର୍ଟଅପ୍ ଓଡ଼ିଶା'],
  },
};

export const LANG_LABEL = { en: 'EN', hi: 'हिं', or: 'ଓଡ଼ି' };

/** Language fonts are loaded lazily — only when that language is chosen. */
export const LANG_FONTS = {
  hi: 'https://fonts.googleapis.com/css2?family=Hind:wght@300;400&family=Tiro+Devanagari+Hindi&display=swap',
  or: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Oriya:wght@300;400;500&display=swap',
};
