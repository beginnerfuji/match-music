"use client";

import { Recommendation } from "@/types";

interface Props {
  index: number;
  item: Recommendation;
  onClick: (item: Recommendation) => void;
}

export default function HistoryCard({ index, item, onClick }: Props) {
  const youtubeUrl = item.youtubeVideoId
    ? `https://www.youtube.com/watch?v=${item.youtubeVideoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(item.youtubeQuery)}`;

  return (
    <div
      className="flex items-center gap-3 py-3 group"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* Track number */}
      <span
        className="shrink-0 text-xs w-5 text-right"
        style={{ fontFamily: "var(--font-mono)", color: "var(--border)" }}
      >
        {String(index).padStart(2, "0")}
      </span>

      {/* Title + artist */}
      <button
        onClick={() => onClick(item)}
        className="flex-1 text-left min-w-0 transition-opacity hover:opacity-60"
      >
        <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
          {item.title}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          {item.artist}
        </p>
      </button>

      {/* YouTube link */}
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 transition-opacity opacity-0 group-hover:opacity-100"
        style={{ color: "var(--muted)" }}
        title="YouTubeで開く"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.5 5 12 5 12 5s-4.5 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.6 19 12 19 12 19s4.5 0 7-.1c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM10 14.5v-5l5.5 2.5-5.5 2.5z" />
        </svg>
      </a>
    </div>
  );
}
