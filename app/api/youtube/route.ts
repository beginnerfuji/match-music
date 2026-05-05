import { NextRequest, NextResponse } from "next/server";

interface YouTubeSearchItem {
  id?: { videoId?: string };
  snippet?: { title?: string; channelTitle?: string };
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-_'"!?,.()&]+/g, "").trim();
}

function pickBestMatch(
  items: YouTubeSearchItem[],
  artist: string,
  title: string
): string | null {
  const normArtist = normalize(artist);
  const normTitle = normalize(title);

  let best: { id: string; score: number } | null = null;
  for (const item of items) {
    const id = item.id?.videoId;
    if (!id) continue;
    const haystack = normalize(
      `${item.snippet?.title ?? ""} ${item.snippet?.channelTitle ?? ""}`
    );
    let score = 0;
    if (normArtist && haystack.includes(normArtist)) score += 10;
    if (normTitle && haystack.includes(normTitle)) score += 5;
    if (score > 0 && (!best || score > best.score)) {
      best = { id, score };
    }
  }

  // Require artist match at minimum (score >= 10).
  return best && best.score >= 10 ? best.id : null;
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const artist = req.nextUrl.searchParams.get("artist") ?? "";
  const title = req.nextUrl.searchParams.get("title") ?? "";
  if (!query) {
    return NextResponse.json({ error: "q is required" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ videoId: null });
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("maxResults", "5");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();
    const items: YouTubeSearchItem[] = data.items ?? [];
    const videoId = pickBestMatch(items, artist, title);
    return NextResponse.json({ videoId });
  } catch {
    return NextResponse.json({ videoId: null });
  }
}
