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

const OUT_DIR = path.resolve("public/voiceover/orphans-of-the-sky");
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
    text: "1963年に発表されたロバート・A・ハインラインの「宇宙の孤児」。世代宇宙船という壮大なSFコンセプトを世に広めたこの作品は、閉ざされた世界で真実を求める若者の冒険を描きます。人類が宇宙に旅立ったとき、何世代もかけて星を目指す船の中で、人は何を忘れ、何を信じるのか。それがこの物語のテーマです。",
  },
  {
    name: "scene-02",
    text: "遠い未来、巨大な宇宙船ヴァンガード号は、遥か彼方の恒星を目指して航行を続けています。しかし、何世代もの時が流れるうちに、乗組員の子孫たちは致命的な事実を忘れてしまいました。自分たちが宇宙船に乗っているということを。彼らにとって「船」こそが全世界であり、科学は宗教と化し、真実は教義に書き換えられたのです。",
  },
  {
    name: "scene-03",
    text: "船内は三つの層に分かれています。上層デッキは、かつての反乱で追いやられたミュータントたちの領域。中層は「科学者」と呼ばれる聖職者たちが支配する社会。下層は農業区で、人々は日々の暮らしを営んでいます。かつて船で起きた反乱の記憶は完全に失われ、航海の目的も、船の外に広がる宇宙の存在も、すべてが神話と化していました。",
  },
  {
    name: "scene-04",
    text: "若き農夫ヒュー・ホイランドは、ある日、上層デッキに足を踏み入れます。そこで出会ったのは、二つの頭を持つミュータント、ジョー＝ジムでした。ジョー＝ジムに導かれ、ヒューは操縦室にたどり着きます。窓の向こうに広がる満天の星。それは彼の世界観を根底から覆す光景でした。古い航海記録を読み解き、ヒューはついに真実を知ります。この「世界」は、星を目指す船なのだと。",
  },
  {
    name: "scene-05",
    text: "真実を知ったヒューは、仲間に伝えようとします。しかし、誰も信じません。「船の外に世界がある」という考えは、狂気の沙汰として退けられます。科学者たちは異端として弾圧し、ミュータント同士の権力争いも激化します。やがて船内は混乱に陥り、ヒューと少数の理解者たちは、小型艇で船を脱出することを決意。激しい戦いの末、彼らはついに新しい惑星への着陸を果たすのです。",
  },
  {
    name: "scene-06",
    text: "ハインラインは「宇宙の孤児」で、人間社会の本質を宇宙船という密室に凝縮して描きました。閉ざされた世界の中で、常識を疑い、外の世界を想像する勇気。それは現代を生きる私たちへのメッセージでもあります。自分の「船」の外に何があるのか。世界の「外」を想像する勇気こそが、人類を前へ進める力なのです。「宇宙の孤児」。それは、すべての探求者への物語です。",
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
          "Dark atmospheric sci-fi ambient music with deep space drone pads and subtle metallic textures. Mysterious and vast feeling, like drifting through an endless generation ship. Slow evolving synth layers with occasional distant echoes. 60 BPM, instrumental only, no vocals.",
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
  console.log("=== 宇宙の孤児 — Audio Generation ===\n");

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
