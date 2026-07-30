import type { DialogueContent } from "../store";

export const INTRO_DIALOGUE: DialogueContent = {
  title: "Emmanuel Ajala",
  lines: [
    "Hey — welcome! I'm Emmanuel.",
    "I make mobile apps (Whispae, Furtone), work with AI, and produce beats when the code stops compiling.",
    "This is my place. Come in, walk around, and poke at anything that glows.",
  ],
};

export interface Interactable {
  id: string;
  label: string;
  /** world position of the trigger zone */
  position: [number, number, number];
  radius: number;
  dialogue?: DialogueContent;
  action?: "library" | "vinyl" | "photos";
}

export const INTERACTABLES: Interactable[] = [
  {
    id: "tv",
    label: "Check out my apps",
    position: [-4.4, 0, -3.2],
    radius: 2.2,
    dialogue: {
      title: "The apps",
      lines: [
        "Two apps I designed, built, and shipped myself.",
        "Whispae — your safe space to let it out. Mood tracking, journaling, breathing, community.",
        "Furtone — never miss your pet's medication. Smart reminders and a clean log for the vet.",
      ],
      links: [
        { label: "whispae.com", url: "https://whispae.com" },
        { label: "furtone.app", url: "https://furtone.app" },
      ],
    },
  },
  {
    id: "books",
    label: "Browse the library",
    position: [5.6, 0, -4.2],
    radius: 2.4,
    action: "library",
  },
  {
    id: "vinyl",
    label: "Dig through the crate",
    position: [5.6, 0, 1.6],
    radius: 2.2,
    action: "vinyl",
  },
  {
    id: "photobook",
    label: "Flip the photo book",
    position: [2.9, 3.4, -5.0],
    radius: 1.9,
    action: "photos",
  },
  {
    id: "desk",
    label: "Peek at my projects",
    position: [-5.2, 0, 3.4],
    radius: 2.2,
    dialogue: {
      title: "The desk",
      lines: [
        "Where the engineering happens: real-time log analysis, RAG chatbots, image denoising with SVD, and a JPMorgan virtual experience.",
        "I also write about ML and the math underneath it on Medium.",
      ],
      links: [
        { label: "GitHub", url: "https://github.com/Ajalaemmanuel" },
        { label: "Medium", url: "https://medium.com/@emmanuelajala22" },
      ],
    },
  },
  {
    id: "posters",
    label: "Look at the posters",
    position: [4.6, 3.4, -3.8],
    radius: 2.6,
    dialogue: {
      title: "The wall",
      lines: [
        "The things that keep me sane: futbol on weekends, piano on Sundays, the gym most mornings, and afrobeats always.",
        "I played with the UAB soccer club and I play keys at church.",
      ],
    },
  },
  {
    id: "contact",
    label: "Say hello",
    position: [1.6, 0, 8.2],
    radius: 2.0,
    dialogue: {
      title: "The mailbox",
      lines: [
        "App idea? Collaboration? Debate about your favorite futbol club?",
        "My inbox is open: Emmanuelajala22@gmail.com",
      ],
      links: [
        { label: "Email me", url: "mailto:Emmanuelajala22@gmail.com" },
        { label: "LinkedIn", url: "https://linkedin.com/in/emmanuelajalaa" },
      ],
    },
  },
];

export const LOADING_TIPS = [
  "Reticulating splines…",
  "Compiling beats…",
  "Watering the monstera…",
  "Aligning the plumbob…",
  "Alphabetizing the bookshelf…",
  "Warming up the turntable…",
  "Sweeping the mezzanine…",
];
