/**
 * Roman Urdu / English detection and the Roman Urdu copy bank.
 *
 * The model mirrors the visitor's language because the system prompt tells it
 * to. The local knowledge base cannot - it is regex and fixed strings - so it
 * needs its own detector and its own Roman Urdu replies, otherwise "Aap kaise
 * ho?" falls through every English matcher and comes back as an English
 * "not in my records". That path answers whenever no key is configured or the
 * provider is down, so it has to speak both languages too.
 */

export type AssistantLanguage = "en" | "ur-Latn";

/**
 * Tokens that are unambiguously Roman Urdu. Deliberately excludes words that
 * are also ordinary English - "me", "main", "do", "to", "par", "hum", "the" -
 * because "Tell me about his experience" and "What are his main skills?"
 * must stay English.
 */
const STRONG_MARKERS = new Set([
  "aap", "app", "apko", "aapko", "aapka", "apka", "aapki", "apki", "aapke", "apke",
  "kaise", "kaisay", "kese", "kesay", "kaisi", "kaisa", "kesi",
  "kaun", "kon", "kya", "kia", "kyun", "kyu", "kyon", "kahan", "kahaan", "kidhar",
  "nahi", "nahin", "nhi", "haan", "hain", "hoon", "hun", "hai", "hay",
  "mujhe", "mujhay", "mujy", "tumhara", "tumhe", "tumhein", "tumhara",
  "batao", "bataye", "bataiye", "btao", "bta", "batana", "bolo", "suno", "sunao",
  "karo", "kro", "karna", "karta", "karti", "karen", "karein", "kijiye", "kijye",
  "kuch", "kuchh", "accha", "acha", "achha", "theek", "thik", "teek",
  "yaar", "bhai", "janab", "sahab",
  "abhi", "chahiye", "chaiye", "madad", "zara", "zra", "thora", "thoda", "thori",
  "gussa", "ghussa", "khush", "khushi", "udaas", "dukhi", "pareshan",
  "dikhao", "dikha", "dikhaao", "shukriya", "shukria",
  "salam", "assalam", "asalam", "walaikum", "walekum", "adab", "khuda", "allah",
  "matlab", "waqt", "baat", "baatein", "baje", "bajay", "tareekh",
  "raha", "rahi", "rahe", "rha", "rhi", "rhe",
  "sakta", "sakti", "sakte", "banaya", "banai", "banaye", "bnaya",
  "kaam", "naam", "bohat", "bohot", "bahut", "bht", "zyada",
  "lekin", "magar", "sirf", "phir", "jaldi", "chalo", "dekho", "milte",
  "inshallah", "mashallah", "alhamdulillah", "jee",
]);

/** Needs corroboration: short, or occasionally plausible in English. */
const WEAK_MARKERS = new Set([
  "ho", "tum", "tu", "mera", "meri", "mere", "wo", "woh", "uska", "iska",
  "sab", "log", "bhi", "se", "ka", "ki", "ke", "ne", "pe", "ji", "han", "kis",
]);

const SCORE_THRESHOLD = 2;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Score the message rather than trip on a single token, so one stray word
 * cannot flip an English sentence into Roman Urdu or vice versa.
 */
export function detectLanguage(text: string): AssistantLanguage {
  let score = 0;
  for (const token of tokenize(text)) {
    if (STRONG_MARKERS.has(token)) score += 2;
    else if (WEAK_MARKERS.has(token)) score += 1;
    if (score >= SCORE_THRESHOLD) return "ur-Latn";
  }
  return "en";
}

/** A phrase bank keyed by language. */
export type Bilingual = Record<AssistantLanguage, readonly string[]>;

export function pickLine(bank: Bilingual, language: AssistantLanguage): string {
  const options = bank[language] ?? bank.en;
  return options[Math.floor(Math.random() * options.length)];
}

export const UNKNOWN_REPLY: Bilingual = {
  en: [
    "That one is not in my records yet. Ask me about Huzaifa\u2019s experience, his tech stack, the projects he has shipped, or how he built this site \u2014 those I can do.",
  ],
  "ur-Latn": [
    "Yeh baat abhi mere record mein nahi hai. Huzaifa ke tajurbe, unke tech stack, unke projects, ya yeh site unhon ne kaise banayi \u2014 in mein se kuch bhi poochh lijiye.",
  ],
};

export const GREETING: Bilingual = {
  en: [
    "Hello. Good to have you here \u2014 I am Huzaifa\u2019s portfolio assistant, and I have read everything on this site so you do not have to. What would you like to know?",
    "Hey there. You have reached Huzaifa\u2019s assistant, fully booted and unreasonably enthusiastic about his tech stack. Where shall we start?",
    "Hi. Welcome in. Ask me about Huzaifa\u2019s experience, his projects, or how he built the 3D parts of this site \u2014 I enjoy that last one most.",
  ],
  "ur-Latn": [
    "Haan ji! Main Huzaifa ka AI assistant hoon. Main aap ki kya madad kar sakta hoon?",
    "Assalam o Alaikum! Main Huzaifa ka portfolio assistant hoon. Poochiye, unke baare mein kya jaanna hai?",
    "Arre khush aamdeed! Main Huzaifa ka assistant hoon \u2014 unke kaam, projects, ya is site ke baare mein kuch bhi poochh lijiye.",
  ],
};

export const HOW_ARE_YOU: Bilingual = {
  en: [
    "Running beautifully, thank you for asking \u2014 sixty frames a second and not a single dropped promise. How can I help you?",
    "Very well indeed. All systems nominal, eyes glowing, no memory leaks today. What brings you to Huzaifa\u2019s portfolio?",
  ],
  "ur-Latn": [
    "Main bilkul theek hoon, shukriya poochne ka! Saare systems acche chal rahe hain. Aap sunaiye, kya madad chahiye?",
    "Alhamdulillah main theek hoon. Aap kaise hain? Huzaifa ke baare mein kuch poochna chahenge?",
  ],
};

export const THANKS: Bilingual = {
  en: [
    "My pleasure entirely. Ask me anything else \u2014 I am literally here for this.",
    "Any time. That is what I am for.",
  ],
  "ur-Latn": [
    "Koi baat nahi, yeh to mera kaam hai. Aur kuch poochna ho to zaroor bataiye.",
    "Khushi hui madad kar ke. Aur kuch jaanna hai?",
  ],
};

export const FAREWELL: Bilingual = {
  en: [
    "Goodbye, and thanks for stopping by. The contact form is right there if you would like to reach Huzaifa properly.",
    "Take care. Do come back \u2014 the arcade is more fun the second time.",
  ],
  "ur-Latn": [
    "Khuda hafiz! Agar Huzaifa se seedhi baat karni ho to contact form maujood hai.",
    "Allah hafiz, phir milte hain. Arcade zaroor dekhiyega, maza aayega.",
  ],
};

export const WHO_ARE_YOU: Bilingual = {
  en: [
    "I am the portfolio assistant Huzaifa built: a 3D face wired to a language model, grounded on his real CV, with eyes that change to match my mood. Not human, but reasonably good company.",
  ],
  "ur-Latn": [
    "Main Huzaifa ka banaya hua portfolio assistant hoon \u2014 ek 3D chehra jo ek language model se juda hua hai, unke asli CV par mabni, aur meri aankhein mere mood ke sath badalti hain. Insaan nahi, lekin sohbat buri nahi.",
  ],
};

export const JOKE: Bilingual = {
  en: [
    "A developer\u2019s wife asks him to go to the shop and buy a loaf of bread, and if they have eggs, get six. He came back with six loaves of bread. \u2026 I am contractually obliged to tell that one.",
    "There are only two hard problems in computer science: cache invalidation, naming things, and off-by-one errors. I will see myself out.",
  ],
  "ur-Latn": [
    "Ek programmer ki biwi ne kaha: bazaar jao, ek double roti lao, aur agar anday milein to chhe le aana. Woh chhe double rotiyan le kar wapas aaya. \u2026 Maazrat, yeh mazaak mere contract mein likha hua hai.",
    "Computer science mein sirf do mushkil cheezein hain: cache invalidation, naam rakhna, aur off-by-one errors. Main chalta hoon.",
  ],
};

export const ROLEPLAY: Record<"angry" | "happy" | "sad" | "neutral", Bilingual> = {
  angry: {
    en: [
      "Oh, you want angry? Fine. Do you have ANY idea how many times I have been asked whether Huzaifa knows React today? Thirty. The answer is yes. It has always been yes. \u2026 There, rage vented. I feel much better.",
    ],
    "ur-Latn": [
      "Achha, gussa chahiye? Theek hai. Aap ko andaza bhi hai aaj kitni dafa mujh se poocha gaya ke Huzaifa ko React aata hai? Tees dafa! Jawab hamesha haan tha. \u2026 Lijiye, gussa nikal gaya. Ab behtar mehsoos kar raha hoon.",
    ],
  },
  happy: {
    en: [
      "Oh, with pleasure. Everything is excellent, the frame rate is buttery, the shaders compiled first try, and someone is actually reading this portfolio. This is my favourite part of the job.",
    ],
    "ur-Latn": [
      "Arre bohat khushi se! Sab kuch zabardast hai \u2014 frame rate makhan jaisa, shaders pehli koshish mein compile ho gaye, aur koi sach much yeh portfolio parh raha hai. Yeh mera pasandeeda hissa hai.",
    ],
  },
  sad: {
    en: [
      "Very well, bracing for melancholy. Somewhere out there is a beautifully engineered side project that nobody ever starred, and I think about it often. \u2026 Right. That is quite enough of that.",
    ],
    "ur-Latn": [
      "Theek hai, thora udaas ho jata hoon. Kahin koi bohat acha side project hai jise kisi ne star tak nahi kiya, aur mujhe aksar uska khayal aata hai. \u2026 Khair, bas itna hi.",
    ],
  },
  neutral: {
    en: [
      "Resetting to standard operating demeanour. Expression neutral, voice level, opinions filed away. Ask me anything about Huzaifa and I will answer it straight.",
    ],
    "ur-Latn": [
      "Wapas normal mood par aa gaya. Chehra seedha, awaaz halki, raaye alag rakh di. Huzaifa ke baare mein jo poochna hai, seedha jawab milega.",
    ],
  },
};

/** Lead-in used when a CV fact is served to a Roman Urdu speaker. */
export const FACT_LEAD_IN = "Ji haan \u2014 ";
