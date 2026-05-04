import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Genre, Recommendation } from "@/types";

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

// Randomly pick decade and region to add serendipity
const DECADES = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "early 2020s"];
const REGIONS: Record<string, string[]> = {
  default: ["Japan", "UK", "USA", "France", "Brazil", "Nigeria", "Sweden", "Australia", "South Korea", "Germany", "Iceland", "Jamaica"],
  indierock: ["UK", "USA", "USA", "Australia", "Iceland", "Canada", "France", "Japan"],
  indiepop: ["UK", "Scotland", "Sweden", "Sweden", "USA", "Japan", "Norway", "Australia"],
  citypop: ["Japan", "Japan", "Japan", "Japan", "Taiwan", "Thailand", "Hong Kong"],
  reggae: ["Jamaica", "Jamaica", "Jamaica", "UK", "USA", "Trinidad and Tobago", "Nigeria"],
  world: ["Nigeria", "Brazil", "Cuba", "Mali", "Senegal", "Colombia", "Ethiopia", "Algeria", "Portugal", "India", "Japan"],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: NextRequest) {
  try {
    const { genre, decades: clientDecades, date }: { genre: Genre; decades?: string[]; date: string } = await req.json();

    if (!genre || !date) {
      return NextResponse.json({ error: "genre and date are required" }, { status: 400 });
    }

    const decadePool = clientDecades && clientDecades.length > 0 ? clientDecades : DECADES;
    const decade = pickRandom(decadePool);
    const regionPool = REGIONS[genre] ?? REGIONS.default;
    const region = pickRandom(regionPool);
    const genreLabel = GENRE_LABELS[genre] ?? genre;

    const isLucky = genre === "lucky";
    const genreInstruction = isLucky
      ? `Genre: completely your choice — surprise us. Pick any genre, era, or region you feel is perfect for today. This is your moment to share something you genuinely love.`
      : `Requested genre: ${genreLabel}\nConstraint for serendipity: Focus on music from the ${decade}, from ${region} (or influenced by that region/era).`;

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
