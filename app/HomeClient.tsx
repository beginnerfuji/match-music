"use client";

import { useState, useEffect, useCallback } from "react";
import { Genre, Recommendation } from "@/types";
import YouTubePlayer from "@/components/YouTubePlayer";
import HistoryCard from "@/components/HistoryCard";

const GENRES: { value: Genre; label: string; emoji: string; description: string; artists: string }[] = [
  { value: "indie", label: "インディー/オルタナ", emoji: "🎸", description: "メジャーに染まらない、尖ったギターサウンド", artists: "The Strokes, Arctic Monkeys, Vampire Weekend, Tame Impala" },
  { value: "reggae", label: "レゲエ/スカ/ダブ", emoji: "🌴", description: "ジャマイカ発、グルーヴとメッセージが宿る音楽", artists: "The Paragons, Bob Marley, Toots & the Maytals, Lee Scratch Perry" },
  { value: "electronic", label: "エレクトロニック", emoji: "🎛️", description: "機械と人間の境界を揺さぶるダンスミュージック", artists: "Aphex Twin, Four Tet, Daft Punk, Caribou, Burial" },
  { value: "jazz", label: "ジャズ/ボッサ", emoji: "🎷", description: "即興と洗練が交差する、大人のための音楽", artists: "Laufey, Bill Evans, João Gilberto, Chet Baker, Norah Jones" },
  { value: "rock", label: "ロック", emoji: "⚡", description: "時代を問わず鳴り響く、ギターとドラムの衝動", artists: "Led Zeppelin, Radiohead, Fontaines D.C., The War on Drugs" },
  { value: "soul", label: "ソウル/R&B/ファンク", emoji: "🎤", description: "体が動く、魂が揺れる黒人音楽の系譜", artists: "D'Angelo, Sharon Jones, Curtis Mayfield, Erykah Badu" },
  { value: "world", label: "ワールド", emoji: "🌍", description: "地球のどこかで生まれた、知られざる名曲たち", artists: "Fela Kuti, Buena Vista Social Club, Tinariwen, Os Mutantes" },
  { value: "hiphop", label: "ヒップホップ", emoji: "🎧", description: "ビートとライムで語られる、ストリートの詩", artists: "A Tribe Called Quest, Kendrick Lamar, J Dilla, MF DOOM" },
  { value: "folk", label: "フォーク/SSW", emoji: "🪕", description: "一本のギターと声だけで伝わる、本音の歌", artists: "Joni Mitchell, Phoebe Bridgers, Nick Drake, Sufjan Stevens" },
  { value: "citypop", label: "シティポップ/ネオアコ", emoji: "🌃", description: "渋谷系からネオアコまで、洗練されたポップの系譜", artists: "山下達郎, Phum Viphurit, 落日飛車, The Blue Nile, Everything But the Girl" },
];

const STORAGE_KEY = "daily-tune-history";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function loadHistory(): Recommendation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToHistory(rec: Recommendation) {
  const history = loadHistory();
  const exists = history.some((h) => h.date === rec.date && h.title === rec.title);
  if (!exists) {
    const updated = [rec, ...history].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}

export default function HomeClient() {
  const [selectedGenre, setSelectedGenre] = useState<Genre>("indie");
  const [selectedDecades, setSelectedDecades] = useState<string[]>(["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const fetchVideoId = useCallback(async (query: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/youtube?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      return data.videoId ?? null;
    } catch {
      return null;
    }
  }, []);

  const handleRecommend = useCallback(async (genre: Genre = selectedGenre) => {
    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre, decades: selectedDecades, date: getTodayString() }),
      });

      if (!res.ok) throw new Error("推薦の取得に失敗しました");

      const rec: Recommendation = await res.json();
      const videoId = await fetchVideoId(rec.youtubeQuery);
      rec.youtubeVideoId = videoId ?? undefined;

      setRecommendation(rec);
      saveToHistory(rec);
      setHistory(loadHistory());
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, fetchVideoId]);

  const handleHistoryClick = useCallback((item: Recommendation) => {
    setRecommendation(item);
    setShowHistory(false);
  }, []);

  const dateLabel = new Date().toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>

      {/* Header */}
      <header style={{ borderBottom: "1.5px solid var(--foreground)" }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl font-bold tracking-tight leading-none">
              Daily Tune
            </h1>
            <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              今日の一曲
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
            style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            履歴
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">

        {/* Left: main content */}
        <div className="flex-1 px-6 py-10 flex flex-col gap-8">

          {/* Date */}
          <p style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }} className="text-xs tracking-widest uppercase">
            {dateLabel}
          </p>

          {/* Genre selector */}
          <div>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Genre
            </p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <div key={g.value} className="relative group">
                  <button
                    onClick={() => setSelectedGenre(g.value)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      border: `1px solid ${selectedGenre === g.value ? "var(--foreground)" : "var(--border)"}`,
                      background: selectedGenre === g.value ? "var(--foreground)" : "transparent",
                      color: selectedGenre === g.value ? "var(--background)" : "var(--foreground)",
                    }}
                  >
                    <span>{g.emoji}</span>
                    <span>{g.label}</span>
                  </button>
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-52 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="rounded-lg px-3 py-2 shadow-lg" style={{ background: "var(--foreground)", color: "var(--background)" }}>
                      <p className="text-xs font-medium mb-1">{g.description}</p>
                      <p className="text-[10px] opacity-60 leading-relaxed">{g.artists}</p>
                    </div>
                    <div className="w-2 h-2 rotate-45 ml-4 -mt-1" style={{ background: "var(--foreground)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decade selector */}
          <div>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Decade
              <button
                onClick={() => setSelectedDecades(["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"])}
                className="ml-3 normal-case tracking-normal transition-opacity hover:opacity-60"
                style={{ color: "var(--accent)" }}
              >
                全選択
              </button>
            </p>
            <div className="flex flex-wrap gap-2">
              {["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"].map((d) => {
                const isSelected = selectedDecades.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() =>
                      setSelectedDecades((prev) =>
                        isSelected ? prev.filter((x) => x !== d) : [...prev, d]
                      )
                    }
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      border: `1px solid ${isSelected ? "var(--foreground)" : "var(--border)"}`,
                      background: isSelected ? "var(--foreground)" : "transparent",
                      color: isSelected ? "var(--background)" : "var(--foreground)",
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border)" }} />

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 w-full max-w-sm mx-auto items-center">
            <button
              onClick={() => handleRecommend()}
              disabled={loading}
              className="w-full py-3.5 text-sm font-semibold tracking-wide transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              style={{
                background: "var(--foreground)",
                color: "var(--background)",
                borderRadius: "2px",
              }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  選曲中...
                </>
              ) : (
                "今日の一曲を見つける"
              )}
            </button>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleRecommend("lucky")}
                disabled={loading}
                className="w-full py-3 text-sm font-medium tracking-wide transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--muted)",
                  borderRadius: "2px",
                  background: "transparent",
                }}
              >
                <span>🎲</span>
                今日の円盤
              </button>
              <p className="text-xs text-center" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                ジャンルを問わず、今日の一曲をランダムに提案
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm" style={{ color: "var(--accent)" }}>{error}</p>
          )}

          {/* Recommendation */}
          {recommendation && (
            <div className="flex flex-col gap-6">
              <div style={{ borderTop: "1px solid var(--border)" }} />

              {/* Title block */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 style={{ fontFamily: "var(--font-serif)" }} className="text-3xl font-bold leading-tight">
                    {recommendation.title}
                  </h2>
                  <p className="mt-1 text-base" style={{ color: "var(--muted)" }}>
                    {recommendation.artist}
                  </p>
                  <div className="flex items-center gap-3 mt-2" style={{ fontFamily: "var(--font-mono)" }}>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{recommendation.year}</span>
                    {recommendation.country && (
                      <>
                        <span style={{ color: "var(--border)" }}>·</span>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>{recommendation.country}</span>
                      </>
                    )}
                  </div>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recommendation.youtubeQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 text-xs transition-opacity hover:opacity-60"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.5 5 12 5 12 5s-4.5 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.8C6.6 19 12 19 12 19s4.5 0 7-.1c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM10 14.5v-5l5.5 2.5-5.5 2.5z" />
                  </svg>
                  YouTubeで開く
                </a>
              </div>

              {/* Player */}
              <YouTubePlayer
                videoId={recommendation.youtubeVideoId}
                youtubeQuery={recommendation.youtubeQuery}
              />

              {/* Mood + Commentary */}
              <div className="flex flex-col gap-4">
                <span
                  className="self-start text-xs px-3 py-1 tracking-widest uppercase"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    borderRadius: "2px",
                  }}
                >
                  {recommendation.mood}
                </span>

                <div className="pl-4" style={{ borderLeft: "2px solid var(--border)" }}>
                  <p className="text-xs mb-2 tracking-widest uppercase" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                    店員より
                  </p>
                  {recommendation.description && (
                    <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--foreground)" }}>
                      {recommendation.description}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                    {recommendation.reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: history sidebar */}
        {history.length > 0 && (
          <aside
            className="hidden lg:block w-80 shrink-0 sticky top-0 h-screen overflow-y-auto"
            style={{ borderLeft: "1px solid var(--border)" }}
          >
            <div className="px-6 py-8">
              <p className="text-xs tracking-widest uppercase mb-6" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                History
              </p>
              <div className="flex flex-col">
                {history.map((item, i) => (
                  <HistoryCard key={i} index={i + 1} item={item} onClick={handleHistoryClick} />
                ))}
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* Mobile history drawer */}
      {showHistory && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col" style={{ background: "var(--background)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-serif)" }}>History</h2>
            <button onClick={() => setShowHistory(false)} className="transition-opacity hover:opacity-60" style={{ color: "var(--muted)" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {history.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>まだ履歴がありません</p>
            ) : (
              <div className="flex flex-col">
                {history.map((item, i) => (
                  <HistoryCard key={i} index={i + 1} item={item} onClick={handleHistoryClick} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
