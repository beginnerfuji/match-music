export type Genre =
  | "indierock"
  | "indiepop"
  | "reggae"
  | "electronic"
  | "jazz"
  | "rock"
  | "soul"
  | "world"
  | "hiphop"
  | "folk"
  | "citypop"
  | "lucky";

export interface Recommendation {
  title: string;
  artist: string;
  genre: Genre;
  genreLabel?: string; // free-form Japanese label for display (e.g. "ネオソウル", "アンビエント")
  year: number;
  country: string;
  description: string;
  youtubeQuery: string;
  youtubeVideoId?: string;
  reason: string;
  mood: string;
  date: string; // YYYY-MM-DD
  festival?: string; // display label when recommended via a festival lineup
}

export interface Festival {
  label: string;
  emoji: string;
  artists: string[];
}

export const FESTIVAL_LINEUPS: Record<string, Festival> = {
  fujirock2026: {
    label: "FUJI ROCK 2026",
    emoji: "🏔️",
    artists: [
      "The xx",
      "ASIAN KUNG-FU GENERATION",
      "Hi-STANDARD",
      "Khruangbin",
      "Fujii Kaze",
      "XG",
      "Massive Attack",
      "Susumu Hirasawa",
      "Mitski",
      "Arlo Parks",
      "Japanese Breakfast",
      "The Beths",
      "Snail Mail",
      "Altin Gün",
      "Son Rompe Pera",
      "Tinariwen",
      "Sakanaction",
      "Takkyu Ishino",
      "Thurston Moore",
      "Geordie Greep",
    ],
  },
  summersonic2026: {
    label: "SUMMER SONIC 2026",
    emoji: "🌊",
    artists: [
      "The Strokes",
      "L'Arc-en-Ciel",
      "Jamiroquai",
      "BUMP OF CHICKEN",
      "BABYMETAL",
      "LE SSERAFIM",
      "Machine Gun Kelly",
      "FKA twigs",
      "Kasabian",
      "Keshi",
      "Audrey Nuna",
      "Ado",
      "David Byrne",
      "Jennie",
      "Alex Warren",
      "Steve Lacy",
      "Suede",
      "Cornelius",
      "Sakanaction",
      "Suchmos",
      "BINI",
    ],
  },
};

export const ALL_DECADES: string[] = [
  "1960s",
  "1970s",
  "1980s",
  "1990s",
  "2000s",
  "2010s",
  "2020s",
];

// Decades when each genre meaningfully exists. Used both server-side to filter
// random decade x region picks, and client-side to render only relevant buttons.
export const GENRE_DECADES: Record<Genre, string[]> = {
  indierock:  ["1980s", "1990s", "2000s", "2010s", "2020s"],
  indiepop:   ["1980s", "1990s", "2000s", "2010s", "2020s"],
  citypop:    ["1970s", "1980s", "2010s", "2020s"], // 90s-00s is a citypop dead zone
  hiphop:     ["1980s", "1990s", "2000s", "2010s", "2020s"],
  electronic: ["1970s", "1980s", "1990s", "2000s", "2010s", "2020s"],
  reggae:     ALL_DECADES,
  jazz:       ALL_DECADES,
  rock:       ALL_DECADES,
  soul:       ALL_DECADES,
  world:      ALL_DECADES,
  folk:       ALL_DECADES,
  lucky:      ALL_DECADES,
};
