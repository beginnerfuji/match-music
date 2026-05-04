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
