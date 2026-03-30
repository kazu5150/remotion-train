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

const OUT_DIR = path.resolve("public/voiceover/openai-coup");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Narration scripts ──────────────────────────────────────
const SCENES = [
  {
    name: "scene-01",
    text: "2023年11月17日金曜日。AI業界を揺るがす衝撃のニュースが飛び込んできました。OpenAIの取締役会が、CEOサム・アルトマンを電撃解任したのです。",
  },
  {
    name: "scene-02",
    text: "その日の昼、アルトマンはGoogle Meetに呼び出されました。画面の向こうには取締役会の全メンバー。チーフサイエンティストのイリア・サツケバーが解任を告げました。「コミュニケーションが一貫して率直でなかった」。ミラ・ムラティが暫定CEOに就任。翌日、共同創設者のグレッグ・ブロックマンも辞任しました。",
  },
  {
    name: "scene-03",
    text: "週末から月曜にかけて、事態は急展開します。取締役会は元Twitch CEOのエメット・シアーを暫定CEOに指名。一方、MicrosoftのナデラCEOはアルトマンを新AI研究チームのリーダーに迎えると発表しました。そして決定打。OpenAIの770人中745人が公開書簡に署名。「取締役は辞任せよ、アルトマンを復帰させよ」。驚くべきことに、解任を主導したサツケバー自身も署名し、後悔を表明しました。",
  },
  {
    name: "scene-04",
    text: "11月22日、わずか4日で決着がつきました。サム・アルトマンがCEOに復帰。ブロックマンも社長として戻りました。取締役会は刷新され、元Salesforce CEOのブレット・テイラーが新議長に就任。元米財務長官ラリー・サマーズも加わりました。",
  },
  {
    name: "scene-05",
    text: "しかし、この騒動の余波は続きました。2024年5月、サツケバーはOpenAIを去り、Safe Superintelligence Inc.を設立。8月にはブロックマンも退社。9月にはムラティCTOも辞任。解任劇に関わった主要メンバーは、一人また一人とOpenAIを離れていったのです。",
  },
  {
    name: "scene-06",
    text: "利益追求と安全性。商業化と使命。この4日間のドラマは、AI開発における根本的な対立を世界に突きつけました。OpenAI解任劇。それはAI時代の転換点として、歴史に刻まれています。",
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
          "Dark, tense, dramatic cinematic music. Deep strings and ominous piano. Building tension with subtle electronic pulses. Thriller documentary mood. 80 BPM, instrumental only, no vocals.",
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
  console.log("=== OpenAI Coup Video — Audio Generation ===\n");

  for (const scene of SCENES) {
    await generateTTS(scene.name, scene.text);
  }

  await generateBGM();

  console.log("\n🎉  All audio files generated!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
