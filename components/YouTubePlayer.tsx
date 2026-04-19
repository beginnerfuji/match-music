"use client";

interface Props {
  videoId: string | null | undefined;
  youtubeQuery: string;
}

export default function YouTubePlayer({ videoId, youtubeQuery }: Props) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`;

  if (!videoId) {
    return (
      <div
        className="flex items-center justify-center w-full aspect-video"
        style={{ background: "#f0ece4", borderRadius: "2px" }}
      >
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 transition-opacity hover:opacity-60"
          style={{ color: "var(--muted)" }}
        >
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.5 5 12 5 12 5s-4.5 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.6 19 12 19 12 19s4.5 0 7-.1c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM10 14.5v-5l5.5 2.5-5.5 2.5z" />
          </svg>
          <span className="text-xs" style={{ fontFamily: "var(--font-mono)" }}>YouTubeで検索</span>
        </a>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video overflow-hidden" style={{ borderRadius: "2px" }}>
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
        title="YouTube player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
