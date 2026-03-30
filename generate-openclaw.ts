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

const OUT_DIR = path.resolve("public/voiceover/openclaw");
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
  if (!res.ok) {
    throw new Error(`Failed to get subscription info: ${res.status}`);
  }
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
    text: "オープンソースAIエージェント「OpenClaw」の開発者、Peter Steinbergerが警鐘を鳴らしました。米国は中国のAIツールへの積極的な導入姿勢から学ぶべきだと。実験を躊躇する姿勢が、重要な技術競争で国を後れさせる可能性があると警告したのです。",
  },
  {
    name: "scene-02",
    text: "「米国では、一部の企業でOpenClawを使うと解雇されるかもしれないと感じています」。Steinbergerはサンフランシスコのインタビューでそう語りました。「一方、中国では正反対です。OpenClawを使わないと解雇されるかもしれないのです」。この対照的な二つのAI文化が、今、世界の技術覇権を左右しようとしています。",
  },
  {
    name: "scene-03",
    text: "OpenClawが11月にローンチして以来、中国では熱狂的な反応が巻き起こっています。学生、専門職、退職者が列をなし、エンジニアにソフトウェアのインストールを依頼。ある企業は各従業員の名前と「本日自動化したこと」という欄を記載したフォームまで作成しました。一方、米国ではセキュリティ上の懸念から、多くの雇用主がAIエージェントの使用を制限しています。",
  },
  {
    name: "scene-04",
    text: "OpenAI共同創業者のアンドレイ・カーパシーは、個人向けAIエージェントの実例を見せました。彼が構築した「Dobby the Elf Claw」は、照明、空調、セキュリティまで制御するホームオートメーションシステムです。彼のスマートフォンから6つのアプリが不要になりました。さらに驚くべきことに、12月以降、彼は一行もコードを書いていません。すべてAIエージェントが処理しているのです。",
  },
  {
    name: "scene-05",
    text: "NvidiaのCEO、Jensen Huangは、OpenClawを「おそらくこれまでで最も重要なソフトウェアリリース」と評しました。GitHubで10万以上のスターを獲得したOpenClawは、Nvidia、ByteDance、Tencentなどを含む独立した財団へと移行予定です。現在OpenAIのCodexチームで働くSteinbergerは、個人用とビジネス用のAIエージェントがシームレスに連携する未来の実現に取り組んでいます。",
  },
  {
    name: "scene-06",
    text: "「このテクノロジーはまだ新しすぎるため、学ぶ唯一の方法は自分たちで使用し、試してみることです」。実験か、慎重か。AI時代の競争を左右するのは、テクノロジーそのものではなく、それを受け入れる文化なのかもしれません。",
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
          "Modern tech documentary music. Pulsing synth arpeggios with ambient pads. Futuristic and urgent but not aggressive. Clean electronic production with subtle tension. 90 BPM, instrumental only, no vocals.",
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
  console.log("=== OpenClaw Video — Audio Generation ===\n");

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
