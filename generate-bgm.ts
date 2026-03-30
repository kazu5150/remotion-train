import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

// ── .env 読み込み ────────────────────────────────────────
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

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY || API_KEY === "ここにAPIキーを貼り付けてください") {
  console.error("❌ .env に ELEVENLABS_API_KEY を設定してください");
  process.exit(1);
}

const OUTPUT_DIR = resolve(import.meta.dirname, "public/voiceover");
const OUTPUT_PATH = resolve(OUTPUT_DIR, "bgm.mp3");

async function generateBGM() {
  if (existsSync(OUTPUT_PATH)) {
    console.log("⏭️  BGMは既に存在します。再生成する場合は public/voiceover/bgm.mp3 を削除してください");
    return;
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🎵 BGMを生成中...");

  const response = await fetch(
    "https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128",
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt:
          "Cinematic, inspiring, minimal ambient electronic music. Soft piano and gentle synth pads. Calm and thoughtful mood, suitable as background music for a documentary profile video about a philosopher. 70 BPM, no vocals.",
        music_length_ms: 70000, // 70秒（動画は約65秒 + 余裕）
        model_id: "music_v1",
        force_instrumental: true,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs Music API error (${response.status}): ${error}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(OUTPUT_PATH, audioBuffer);
  console.log(
    `✅ BGM保存: ${OUTPUT_PATH} (${(audioBuffer.length / 1024).toFixed(0)} KB)`
  );
}

generateBGM().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
