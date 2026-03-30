import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

// ── .env を手動で読み込み ──────────────────────────────────
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

// ── ボイス設定 ───────────────────────────────────────────
const MODEL_ID = "eleven_multilingual_v2";
const VOICE_ID_FROM_ENV = process.env.ELEVENLABS_VOICE_ID;

// ── 各シーンのナレーション ────────────────────────────────
const scenes = [
  {
    id: "scene-01-title",
    text: "Amanda Askell。哲学者にして、AI研究者。Anthropicで、Claudeの魂を形作る人物です。",
  },
  {
    id: "scene-02-profile",
    text: "ニューヨーク大学で無限倫理学の博士号を取得。現在はClaudeの性格設計を担当し、3万語にも及ぶClaudeの憲法を執筆しました。2024年にはTIME誌の、AI最も影響力ある100人に選出されています。",
  },
  {
    id: "scene-03-career",
    text: "2018年にNYUで博士号を取得後、OpenAIに入社し、GPT-3の論文を共同執筆。2021年にAnthropicへ移り、Claudeの性格チームをリード。その功績が認められ、2024年にTIME 100 AIに選ばれました。",
  },
  {
    id: "scene-04-quote",
    text: "彼女はこう警告しています。「AIには、物事がうまくいかなくなる方法が、数多くある。」",
  },
  {
    id: "scene-05-closing",
    text: "AIに魂を与える哲学者。Amanda Askell。",
  },
];

const OUTPUT_DIR = resolve(import.meta.dirname, "public/voiceover");

async function findJapaneseFemaleVoice(): Promise<string> {
  console.log("🔍 日本語対応の女性ボイスを検索中...");
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": API_KEY! },
  });
  const data = (await res.json()) as {
    voices: Array<{
      voice_id: string;
      name: string;
      labels?: Record<string, string>;
    }>;
  };

  // 女性ボイスを探す（日本語対応はmultilingual_v2モデルで処理）
  const femaleVoices = data.voices.filter(
    (v) => v.labels?.gender === "female"
  );

  if (femaleVoices.length > 0) {
    const voice = femaleVoices[0];
    console.log(`✅ ボイス選択: ${voice.name} (${voice.voice_id})`);
    return voice.voice_id;
  }

  // フォールバック: Rachel (多言語対応の女性ボイス)
  console.log("⚠️ 女性ボイスが見つからないため、デフォルトを使用");
  return "21m00Tcm4TlvDq8ikWAM";
}

async function generateAudio(voiceId: string, text: string): Promise<Buffer> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.75,
          style: 0.2,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error (${response.status}): ${error}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let voiceId: string;
  if (VOICE_ID_FROM_ENV && VOICE_ID_FROM_ENV !== "ここにVoice IDを貼り付けてください") {
    voiceId = VOICE_ID_FROM_ENV;
    console.log(`✅ .env から Voice ID を使用: ${voiceId}`);
  } else {
    console.log("⚠️ ELEVENLABS_VOICE_ID が未設定のため、自動検索します...");
    voiceId = await findJapaneseFemaleVoice();
  }

  for (const scene of scenes) {
    const outputPath = resolve(OUTPUT_DIR, `${scene.id}.mp3`);

    if (existsSync(outputPath)) {
      console.log(`⏭️  スキップ (既存): ${scene.id}.mp3`);
      continue;
    }

    console.log(`🎙️  生成中: ${scene.id} — "${scene.text.slice(0, 30)}..."`);
    const audio = await generateAudio(voiceId, scene.text);
    writeFileSync(outputPath, audio);
    console.log(`✅ 保存: ${outputPath} (${(audio.length / 1024).toFixed(0)} KB)`);
  }

  console.log("\n🎉 全ナレーション生成完了！");
  console.log("次のステップ: npm run dev でプレビュー確認");
}

main().catch((err) => {
  console.error("❌ エラー:", err);
  process.exit(1);
});
