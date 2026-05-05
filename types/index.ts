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
  year: number;
  country: string;
  description: string;
  youtubeQuery: string;
  youtubeVideoId?: string;
  reason: string;
  mood: string;
  date: string; // YYYY-MM-DD
}

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
