import fs from "fs";
import path from "path";

// ── Load .env ──────────────────────────────────────────────
const envPath = path.resolve(".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    process.env[key] = value;
  }
}

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
if (!API_KEY) {
  console.error("ELEVENLABS_API_KEY is not set in .env");
  process.exit(1);
}
if (!VOICE_ID) {
  console.error("ELEVENLABS_VOICE_ID is not set in .env");
  process.exit(1);
}

const OUT_DIR = path.resolve("public/voiceover/door-into-summer");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── ElevenLabs Credit Tracking ─────────────────────────────
interface SubscriptionInfo {
  character_count: number;
  character_limit: number;
  tier: string;
}

async function getCredits(): Promise<SubscriptionInfo> {
  const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": API_KEY! },
  });
  if (!res.ok) throw new Error(`Failed to get subscription info: ${res.status}`);
  return res.json() as Promise<SubscriptionInfo>;
}

function printCreditReport(before: SubscriptionInfo, after: SubscriptionInfo) {
  const used = after.character_count - before.character_count;
  const remaining = after.character_limit - after.character_count;
  const pct = ((remaining / after.character_limit) * 100).toFixed(1);
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║      ElevenLabs Credit Report            ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log(`║  プラン:       ${after.tier.padEnd(25)}║`);
  console.log(`║  今回の使用:   ${String(used).padEnd(25)}║`);
  console.log(`║  累計使用:     ${`${after.character_count} / ${after.character_limit}`.padEnd(25)}║`);
  console.log(`║  残りクレジット: ${`${remaining} (${pct}%)`.padEnd(23)}║`);
  console.log("╚══════════════════════════════════════════╝");
}

// ── Narration scripts ──────────────────────────────────────
const SCENES = [
  {
    name: "scene-01",
    text: "1956年に発表されたロバート・A・ハインラインの「夏への扉」。SFの黄金時代を代表するこの作品は、タイムトラベル、裏切り、そして決して諦めない一人の男の物語です。特に日本では、SFファンが最も愛する作品のひとつとして、今なお読み継がれています。",
  },
  {
    name: "scene-02",
    text: "1970年、ロサンゼルス。エンジニアのダニエル・ブーン・デイヴィスは、すべてを失いました。自ら開発した万能家事ロボット「文化少女ハイヤードガール」の会社を、ビジネスパートナーのマイルズと、婚約者のベルに乗っ取られたのです。残されたのは、愛猫ピートだけでした。",
  },
  {
    name: "scene-03",
    text: "絶望したダンは、冷凍睡眠で30年後の未来、西暦2000年に飛ぶことを選びます。しかし目覚めた未来で、彼は驚くべき事実を知ります。自分の特許はすべて盗まれ、愛猫ピートも冷凍睡眠に入れられていた。そして、かつてダンを慕っていた少女リッキーが、彼の帰りを待ち続けていたのです。",
  },
  {
    name: "scene-04",
    text: "ここから物語は大きく転回します。2000年の世界で発明されたタイムマシンを使い、ダンは1970年に戻ることを決意します。過去に戻った彼は、マイルズとベルの陰謀を阻止し、特許を守り、未来のための布石を打ちます。そしてピートとリッキーの未来も、彼自身の手で守るのです。",
  },
  {
    name: "scene-05",
    text: "「夏への扉」というタイトルは、愛猫ピートの行動に由来します。冬になると、ピートは家中のドアを一つ一つ試して回ります。どこかに夏に通じるドアがあるはずだと信じて。ダンはピートのこの姿に、人生の真理を見出します。扉が閉ざされても、別の扉を探し続けること。それが「夏への扉」なのです。",
  },
  {
    name: "scene-06",
    text: "ハインラインはこの作品で、テクノロジーへの楽観と、人間の不屈の精神を描きました。裏切られても、すべてを失っても、必ず「夏への扉」は見つかる。70年近く経った今も色あせないこのメッセージが、世界中の読者の心を掴み続けています。「夏への扉」。それは、未来を信じるすべての人への贈り物です。",
  },
];

// ── TTS Generation ─────────────────────────────────────────
async function generateTTS(name: string, text: string): Promise<void> {
  const outFile = path.join(OUT_DIR, `${name}.mp3`);
  if (fs.existsSync(outFile)) {
    console.log(`⏭️  Skip ${name} (already exists)`);
    return;
  }

  console.log(`🎙️  Generating ${name}...`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY!,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.2,
        },
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TTS failed for ${name}: ${res.status} ${errText}`);
  }
  const arrayBuf = await res.arrayBuffer();
  fs.writeFileSync(outFile, Buffer.from(arrayBuf));
  console.log(`✅  ${name} saved (${Math.round(arrayBuf.byteLength / 1024)} KB)`);
}

// ── BGM Generation ─────────────────────────────────────────
async function generateBGM(): Promise<void> {
  const outFile = path.join(OUT_DIR, "bgm.mp3");
  if (fs.existsSync(outFile)) {
    console.log("⏭️  Skip BGM (already exists)");
    return;
  }

  console.log("🎵  Generating BGM...");
  const res = await fetch(
    "https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY!,
      },
      body: JSON.stringify({
        prompt:
          "Warm nostalgic cinematic music with gentle piano melody and soft strings. Hopeful and bittersweet mood, like remembering a beautiful summer day. Retro sci-fi atmosphere with subtle analog synth warmth. 72 BPM, instrumental only, no vocals.",
        music_length_ms: 120000,
        model_id: "music_v1",
        force_instrumental: true,
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`BGM generation failed: ${res.status} ${errText}`);
  }
  const arrayBuf = await res.arrayBuffer();
  fs.writeFileSync(outFile, Buffer.from(arrayBuf));
  console.log(`✅  BGM saved (${Math.round(arrayBuf.byteLength / 1024)} KB)`);
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log("=== 夏への扉 — Audio Generation ===\n");

  const creditsBefore = await getCredits();
  console.log(`📊 現在のクレジット: ${creditsBefore.character_limit - creditsBefore.character_count} / ${creditsBefore.character_limit} 残り\n`);

  for (const scene of SCENES) {
    await generateTTS(scene.name, scene.text);
  }

  await generateBGM();

  // Music APIのクレジット反映を待つ（最大30秒）
  console.log("\n⏳ クレジット反映を待機中...");
  let creditsAfter = await getCredits();
  for (let i = 0; i < 6; i++) {
    const remaining = creditsAfter.character_limit - creditsAfter.character_count;
    const beforeRemaining = creditsBefore.character_limit - creditsBefore.character_count;
    if (remaining < beforeRemaining) break;
    await new Promise((r) => setTimeout(r, 5000));
    creditsAfter = await getCredits();
  }
  printCreditReport(creditsBefore, creditsAfter);

  console.log("\n🎉  All audio files generated!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
