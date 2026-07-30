export interface Book {
  id: string;
  title: string;
  author: string;
  status: "read" | "reading";
  notes: string;
  buyUrl: string;
  color: string;
  coverUrl?: string;
}

export const DEFAULT_BOOKS: Book[] = [
  {
    id: "psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    status: "read",
    notes: "Money behavior beats money math. The chapter on 'enough' lives in my head rent free.",
    buyUrl: "https://www.amazon.com/dp/0857197681",
    color: "#c9a24a",
  },
  {
    id: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    status: "read",
    notes: "The reason my phone stays in another room when I'm building.",
    buyUrl: "https://www.amazon.com/dp/1455586692",
    color: "#4a6d8c",
  },
  {
    id: "zero-to-one",
    title: "Zero to One",
    author: "Peter Thiel",
    status: "read",
    notes: "Contrarian questions and the courage to build something new instead of copying.",
    buyUrl: "https://www.amazon.com/dp/0804139296",
    color: "#b5543c",
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    status: "read",
    notes: "Systems over goals. How the gym, piano, and shipping apps all actually happen.",
    buyUrl: "https://www.amazon.com/dp/0735211299",
    color: "#5f7d5a",
  },
  {
    id: "pragmatic-programmer",
    title: "The Pragmatic Programmer",
    author: "Hunt & Thomas",
    status: "read",
    notes: "The book I wish someone handed me in my first engineering class.",
    buyUrl: "https://www.amazon.com/dp/0135957052",
    color: "#3f4a5a",
  },
  {
    id: "shoe-dog",
    title: "Shoe Dog",
    author: "Phil Knight",
    status: "read",
    notes: "A founder story that reads like a thriller. Nike almost died about twelve times.",
    buyUrl: "https://www.amazon.com/dp/1501135929",
    color: "#8c5a7a",
  },
  {
    id: "cant-hurt-me",
    title: "Can't Hurt Me",
    author: "David Goggins",
    status: "read",
    notes: "For the mornings the gym feels impossible. The 40% rule is real.",
    buyUrl: "https://www.amazon.com/dp/1544512287",
    color: "#2e2e34",
  },
  {
    id: "lean-startup",
    title: "The Lean Startup",
    author: "Eric Ries",
    status: "reading",
    notes: "Currently reading — build, measure, learn. Whispae's roadmap is shaped by this.",
    buyUrl: "https://www.amazon.com/dp/0307887898",
    color: "#c97b4a",
  },
  {
    id: "hooked",
    title: "Hooked",
    author: "Nir Eyal",
    status: "reading",
    notes: "How products form habits — and how to use that power for good in a wellness app.",
    buyUrl: "https://www.amazon.com/dp/1591847788",
    color: "#7a8c93",
  },
];

export interface Photo {
  id: string;
  url: string;
  caption: string;
}

/** Shown in the photo book until real photos are uploaded via /admin. */
export const PLACEHOLDER_PHOTOS: Photo[] = [
  { id: "p1", url: "", caption: "Matchday with the UAB soccer club" },
  { id: "p2", url: "", caption: "Sunday morning on the keys" },
  { id: "p3", url: "", caption: "Studio night — new afrobeats idea" },
  { id: "p4", url: "", caption: "Shipping Furtone 1.0" },
  { id: "p5", url: "", caption: "Lagos to Birmingham" },
  { id: "p6", url: "", caption: "Upload your photos at /admin" },
];
