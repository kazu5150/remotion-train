import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

// ── .env 読み込み ─────────────────────────────────────────
const envPath = resolve(import.meta.dirname, ".env");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID!;
const MODEL_ID = "eleven_multilingual_v2";

// ── Credit Tracking ────────────────────────────────────────
interface SubscriptionInfo {
  character_count: number;
  character_limit: number;
  tier: string;
}

async function getCredits(): Promise<SubscriptionInfo> {
  const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": API_KEY },
  });
  if (!res.ok)
    throw new Error(`Failed to get subscription info: ${res.status}`);
  return res.json() as Promise<SubscriptionInfo>;
}

function printCreditReport(
  before: SubscriptionInfo,
  after: SubscriptionInfo
) {
  const used = after.character_count - before.character_count;
  const remaining = after.character_limit - after.character_count;
  const pct = ((remaining / after.character_limit) * 100).toFixed(1);
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║      ElevenLabs Credit Report            ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log(`║  プラン:       ${after.tier.padEnd(25)}║`);
  console.log(`║  今回の使用:   ${String(used).padEnd(25)}║`);
  console.log(
    `║  累計使用:     ${`${after.character_count} / ${after.character_limit}`.padEnd(25)}║`
  );
  console.log(
    `║  残りクレジット: ${`${remaining} (${pct}%)`.padEnd(23)}║`
  );
  console.log("╚══════════════════════════════════════════╝");
}

// ── Narration scenes ───────────────────────────────────────
const scenes = [
  {
    id: "scene-01",
    text: "ディープラーニング。それは人間の脳を模倣した、驚異的な技術です。今回は、手書き数字の認識を例に、その仕組みを解き明かします。",
  },
  {
    id: "scene-02",
    text: "ディープラーニングとは、人間の脳の神経回路を模倣した、多層のニューラルネットワークです。入力データから、自動的にパターンを学習し、判断を下すことができます。",
  },
  {
    id: "scene-03",
    text: "MNISTは、手書き数字のデータセットです。28かける28ピクセルの画像が7万枚収録されています。ディープラーニングの入門として、世界中で使われています。",
  },
  {
    id: "scene-04",
    text: "ネットワークの構造を見てみましょう。入力層には784個のニューロン。28かける28ピクセルの各画素値が入力されます。隠れ層で特徴を抽出し、出力層の10個のニューロンが、0から9の確率を出力します。",
  },
  {
    id: "scene-05",
    text: "学習の流れは4ステップです。まず順伝播で予測を出し、損失関数で誤差を計算します。次に逆伝播で勾配を求め、重みを更新します。このサイクルを何千回も繰り返すことで、精度が上がっていきます。",
  },
  {
    id: "scene-06",
    text: "ディープラーニングは、MNISTのようなシンプルな例から始まり、画像認識、自然言語処理、そして生成AIまで。無限の可能性を秘めています。",
  },
];

const OUTPUT_DIR = resolve(
  import.meta.dirname,
  "public/voiceover/deep-learning-mnist"
);

// ── TTS generation ─────────────────────────────────────────
async function generateAudio(text: string): Promise<Buffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0.2 },
      }),
    }
  );
  if (!response.ok) throw new Error(`TTS API error: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

// ── BGM generation ─────────────────────────────────────────
async function generateBGM(): Promise<void> {
  const bgmPath = resolve(OUTPUT_DIR, "bgm.mp3");
  if (existsSync(bgmPath)) {
    console.log("⏭️  BGM already exists. Delete to regenerate.");
    return;
  }

  console.log("🎵 Generating BGM...");
  const response = await fetch(
    "https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128",
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt:
          "Modern, ambient electronic music with soft synth pads and gentle arpeggios. Tech-forward, educational documentary mood. Clean and minimal. 90 BPM, no vocals.",
        music_length_ms: 120000,
        model_id: "music_v1",
        force_instrumental: true,
      }),
    }
  );

  if (!response.ok) throw new Error(`Music API error: ${response.status}`);
  const audio = Buffer.from(await response.arrayBuffer());
  writeFileSync(bgmPath, audio);
  console.log("✅ BGM generated");
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const creditsBefore = await getCredits();
  console.log(
    `📊 現在のクレジット: ${creditsBefore.character_limit - creditsBefore.character_count} / ${creditsBefore.character_limit} 残り\n`
  );

  // Generate TTS for each scene
  for (const scene of scenes) {
    const outputPath = resolve(OUTPUT_DIR, `${scene.id}.mp3`);
    if (existsSync(outputPath)) {
      console.log(`⏭️  Skip: ${scene.id}`);
      continue;
    }

    console.log(`🎙️  Generating: ${scene.id}`);
    const audio = await generateAudio(scene.text);
    writeFileSync(outputPath, audio);
    console.log(`✅ Done: ${scene.id}`);
  }

  // Generate BGM
  await generateBGM();

  // Credit report with polling for Music API delay
  console.log("\n⏳ クレジット反映を待機中...");
  let creditsAfter = await getCredits();
  for (let i = 0; i < 6; i++) {
    const remaining =
      creditsAfter.character_limit - creditsAfter.character_count;
    const beforeRemaining =
      creditsBefore.character_limit - creditsBefore.character_count;
    if (remaining < beforeRemaining) break;
    await new Promise((r) => setTimeout(r, 5000));
    creditsAfter = await getCredits();
  }
  printCreditReport(creditsBefore, creditsAfter);

  console.log("\n🎬 All audio generated! Run:");
  console.log(
    "   npx remotion render DeepLearningMnist output/deep-learning-mnist.mp4"
  );
}

main();
