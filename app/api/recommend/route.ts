import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { ALL_DECADES, GENRE_DECADES, Genre, Recommendation } from "@/types";

const client = new Anthropic();

const GENRE_LABELS: Record<Genre, string> = {
  indierock: "インディーロック/オルタナティブ（ポストパンク、シューゲイザー、ドリームポップ、ローファイ、ノイズロックなども含む。例：Pavement, Pixies, My Bloody Valentine, Sonic Youth, The Strokes, Arctic Monkeys, Yeah Yeah Yeahs, Interpol, Tame Impala, Vampire Weekend, Mac DeMarco, Parquet Courts, Big Thief, Wet Leg, Black Country New Road, Fontaines D.C.）",
  indiepop: "インディーポップ/ネオアコースティック（UK Glasgow系のジャングリーギターポップ、Sarah Records系、トゥイー、ソフィスティポップ、スウェディッシュ・インディーポップなど。例：Orange Juice, Aztec Camera, The Pastels, The Field Mice, The Smiths, Belle and Sebastian, Prefab Sprout, The Blue Nile, Everything But the Girl, Camera Obscura, Stars, Beach Fossils, Real Estate, Alvvays, Frankie Cosmos, The Cardigans, Club 8, Jens Lekman, Peter Bjorn and John, Lykke Li, The Radio Dept., Acid House Kings, El Perro del Mar, Sambassadeur）",
  reggae: "レゲエ/スカ/ダブ/ロックステディ",
  electronic: "エレクトロニック/テクノ/ハウス/アンビエント",
  jazz: "ジャズ/ボッサノバ/モダンジャズ",
  rock: "ロック（クラシックロックからポストロックまで。ただしインディーロックは別ジャンル扱い）",
  soul: "ソウル/R&B/ファンク/ネオソウル",
  world: "ワールドミュージック（アフロビート、ラテン、中東、アジア民族音楽など）",
  hiphop: "ヒップホップ（ジャジーヒップホップ、実験系、クラシックまで）",
  folk: "フォーク/シンガーソングライター",
  citypop: "シティポップ（70s-80s日本のシティポップ黄金期、渋谷系、現代のシティポップ・リバイバル、および台湾・タイ・香港などアジア圏のシティポップ影響下にある作品。例：山下達郎、竹内まりや、大瀧詠一、細野晴臣、大貫妙子、角松敏生、松原みき、杏里、八神純子、吉田美奈子、ピチカート・ファイヴ、Cornelius、Flipper's Guitar、Lamp、Suchmos、never young beach、cero、落日飛車（Sunset Rollercoaster）、Phum Viphurit）",
  lucky: "",
};

// Random region pick adds serendipity. Each region carries an optional `from`
// decade — used to prune impossible combinations like Taiwan citypop in 1970s.
interface RegionEntry {
  region: string;
  from?: string; // earliest decade where this region's genre scene meaningfully exists
}

const DEFAULT_REGIONS: RegionEntry[] = [
  { region: "Japan" },
  { region: "UK" },
  { region: "USA" },
  { region: "France" },
  { region: "Brazil" },
  { region: "Nigeria" },
  { region: "Sweden" },
  { region: "Australia" },
  { region: "South Korea" },
  { region: "Germany" },
  { region: "Iceland", from: "1990s" },
  { region: "Jamaica" },
];

const GENRE_REGIONS: Partial<Record<Genre, RegionEntry[]>> = {
  indierock: [
    { region: "UK" },
    { region: "USA" },
    { region: "USA" },
    { region: "Australia" },
    { region: "Iceland", from: "1990s" },
    { region: "Canada" },
    { region: "France", from: "1990s" },
    { region: "Japan" },
  ],
  indiepop: [
    { region: "UK" },
    { region: "Scotland" },
    { region: "Sweden", from: "1990s" },
    { region: "Sweden", from: "1990s" },
    { region: "USA" },
    { region: "Japan", from: "2000s" },
    { region: "Norway", from: "1990s" },
    { region: "Australia" },
  ],
  citypop: [
    { region: "Japan" },
    { region: "Japan" },
    { region: "Japan" },
    { region: "Japan" },
    { region: "Taiwan", from: "2010s" },
    { region: "Thailand", from: "2010s" },
    { region: "Hong Kong" },
  ],
  reggae: [
    { region: "Jamaica" },
    { region: "Jamaica" },
    { region: "Jamaica" },
    { region: "UK", from: "1970s" },
    { region: "USA" },
    { region: "Trinidad and Tobago" },
    { region: "Nigeria", from: "1980s" },
  ],
  hiphop: [
    { region: "USA" },
    { region: "USA" },
    { region: "USA" },
    { region: "UK", from: "1990s" },
    { region: "France", from: "1990s" },
    { region: "Japan", from: "1990s" },
  ],
  world: [
    { region: "Nigeria" },
    { region: "Brazil" },
    { region: "Cuba" },
    { region: "Mali" },
    { region: "Senegal" },
    { region: "Colombia" },
    { region: "Ethiopia" },
    { region: "Algeria" },
    { region: "Portugal" },
    { region: "India" },
    { region: "Japan" },
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function decadeIndex(d: string): number {
  return ALL_DECADES.indexOf(d);
}

export async function POST(req: NextRequest) {
  try {
    const { genre, decades: clientDecades, date }: { genre: Genre; decades?: string[]; date: string } = await req.json();

    if (!genre || !date) {
      return NextResponse.json({ error: "genre and date are required" }, { status: 400 });
    }

    const isLucky = genre === "lucky";
    let genreInstruction: string;

    if (isLucky) {
      genreInstruction = `Genre: completely your choice — surprise us. Pick any genre, era, or region you feel is perfect for today. This is your moment to share something you genuinely love.`;
    } else {
      // Pick decade from intersection of (client selection) ∩ (decades where this genre exists).
      // Falls back to genre's full valid set if the intersection is empty.
      const genreDecades = GENRE_DECADES[genre];
      const clientPool = clientDecades && clientDecades.length > 0 ? clientDecades : ALL_DECADES;
      const intersection = clientPool.filter((d) => genreDecades.includes(d));
      const decadePool = intersection.length > 0 ? intersection : genreDecades;
      const decade = pickRandom(decadePool);

      // Pick region from genre's pool, filtered to those whose scene existed by `decade`.
      const regionEntries = GENRE_REGIONS[genre] ?? DEFAULT_REGIONS;
      const decadeIdx = decadeIndex(decade);
      const validRegions = regionEntries.filter(
        (r) => !r.from || decadeIndex(r.from) <= decadeIdx
      );
      const region = pickRandom(validRegions).region;

      const genreLabel = GENRE_LABELS[genre] ?? genre;
      genreInstruction = `Requested genre: ${genreLabel}\nConstraint for serendipity: Focus on music from the ${decade}, from ${region} (or influenced by that region/era).`;
    }

    const prompt = `You are a seasoned music curator — imagine the owner of a beloved independent record shop in Shimokitazawa, Tokyo. You have encyclopedic knowledge across genres and eras, with a gift for finding songs that feel like a discovery: not obscure enough to alienate, but never obvious.

Today's date: ${date}
${genreInstruction}

Your task: Recommend exactly ONE song that fits these criteria:
- Well-known within its scene, but not a mainstream radio hit
- Available on YouTube (at least ~1M views is a good proxy for findability)
- Genuinely good — the kind of song a knowledgeable friend would be excited to share
- Connects to the mood of the current season or day if possible (it's ${new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })})

Respond ONLY with a valid JSON object. No markdown, no explanation outside JSON.

{
  "title": "song title in original language",
  "artist": "artist name",
  "year": 1234,
  "country": "country of origin in Japanese (e.g. 'アメリカ', 'イギリス', '日本', 'ブラジル')",
  "description": "1 sentence in Japanese describing what kind of song this is — tempo, instruments, atmosphere. Write as a passionate record store clerk talking directly to a customer (e.g. 'ゆったりしたテンポにアコースティックギターとファルセットが絡み合って、聴いた瞬間に引き込まれますよ。')",
  "youtubeQuery": "best search string to find this exact song on YouTube (artist + title + year or 'official')",
  "reason": "2–3 sentences in Japanese, written as a knowledgeable and enthusiastic record store clerk recommending this song to a customer. Be specific, warm, and a little passionate — like you genuinely love this record. Mention why it's special within its genre, any interesting backstory, and why it feels right for today.",
  "mood": "one evocative Japanese phrase capturing the vibe (e.g. '夜明け前の静けさ')"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse recommendation" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const recommendation: Recommendation = {
      ...parsed,
      genre,
      date,
    };

    return NextResponse.json(recommendation);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
