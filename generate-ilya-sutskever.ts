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

const OUT_DIR = path.resolve("public/voiceover/ilya-sutskever");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Narration scripts ──────────────────────────────────────
const SCENES = [
  {
    name: "scene-01",
    text: "イリア・サツケバー。ディープラーニングの先駆者であり、AI安全性研究の旗手。彼の物語を紹介します。",
  },
  {
    name: "scene-02",
    text: "1986年ロシアに生まれ、イスラエルとカナダで育ったサツケバーは、トロント大学でジェフリー・ヒントンに師事。2012年、アレックスネットを共同開発し、ディープラーニング革命の火蓋を切りました。そしてOpenAIの共同創設者兼チーフサイエンティストとして、GPTシリーズの開発を主導しました。",
  },
  {
    name: "scene-03",
    text: "2012年のアレックスネットで画像認識を一変させ、2014年にはシーケンス・トゥ・シーケンス学習を提案。2015年にOpenAIを共同創設し、GPTの研究を牽引しました。2023年のOpenAI取締役会の反乱を経て、2024年にはSafe Superintelligence Inc.を設立。評価額は320億ドルに達しています。",
  },
  {
    name: "scene-04",
    text: "サツケバーはこう語ります。「超知能は人類の歴史を終わらせうる技術だ。それにふさわしい真剣さで取り組むべきだ。」彼にとって安全性と能力は表裏一体。その信念がSSIの原動力です。",
  },
  {
    name: "scene-05",
    text: "スケーリングの時代から、研究の時代へ。イリア・サツケバーは今、安全な超知能の実現という人類最大の挑戦に挑んでいます。",
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
          "Cinematic, inspiring, minimal ambient electronic music. Soft piano and gentle synth pads with subtle strings. Calm, thoughtful, and hopeful mood. 70 BPM, no vocals. Perfect for a tech documentary or AI researcher profile.",
        music_length_ms: 80000,
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
  console.log("=== Ilya Sutskever Video — Audio Generation ===\n");

  // Generate all TTS in sequence
  for (const scene of SCENES) {
    await generateTTS(scene.name, scene.text);
  }

  // Generate BGM
  await generateBGM();

  console.log("\n🎉  All audio files generated!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
