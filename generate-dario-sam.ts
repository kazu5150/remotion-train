import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

// .env 読み込み
const envPath = resolve(import.meta.dirname, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

const API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID!;
const OUTPUT_DIR = resolve(import.meta.dirname, "public/voiceover/dario-sam");

const scenes = [
  {
    id: "scene-01",
    text: "ダリオ・アモデイ対サム・アルトマン。AI業界で最も注目される確執。安全性と商業化、二つの理念が激突する物語です。",
  },
  {
    id: "scene-02",
    text: "2015年、サム・アルトマンがOpenAIを設立。翌年、ダリオ・アモデイが研究担当副社長として参加し、GPT-2、GPT-3の開発を主導しました。しかし2021年、アモデイはOpenAIの方向性に疑問を抱き、7名の同僚と共にAnthropicを設立します。",
  },
  {
    id: "scene-03",
    text: "対立の核心は、AIの安全性。アモデイは開発速度を落とすべきだと主張。一方アルトマンは、急速な展開と商業化を推進しました。AGIの管理を政府に委ねるべきかという議論で、二人の溝は決定的になります。アモデイは後に、「心理的虐待を受けた」と語っています。",
  },
  {
    id: "scene-04",
    text: "2026年、事態はさらに深刻化。インドのAIサミットで二人が握手を拒否する場面が世界中で話題に。さらに、Anthropicが国防総省のブラックリストに指定される一方、OpenAIは同日に国防総省と契約を締結。アモデイの内部メモが流出し、OpenAIを「安全劇場」と痛烈に批判していたことが明らかになりました。",
  },
  {
    id: "scene-05",
    text: "アモデイは流出メモの中で、OpenAIの安全対策を「見せかけの安全劇場」と呼びました。一方アルトマンも、国防総省との契約が「日和見的で雑に見えた」と認めています。二人の発言は、AI業界の根深い対立を浮き彫りにしています。",
  },
  {
    id: "scene-06",
    text: "安全か、速度か。これはAI時代の最大の問いです。ダリオ・アモデイとサム・アルトマン。二人の確執は、人類の未来を左右する選択そのものなのです。",
  },
];

async function generateAudio(text: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0.2 },
    }),
  });
  if (!res.ok) throw new Error(`TTS error ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function generateBGM(): Promise<void> {
  const bgmPath = resolve(OUTPUT_DIR, "bgm.mp3");
  if (existsSync(bgmPath)) { console.log("⏭️  BGM: skip"); return; }

  console.log("🎵 BGM生成中...");
  const res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Dark, tense, cinematic electronic music. Deep bass, suspenseful synth pads, subtle glitch textures. Dramatic and confrontational mood. 85 BPM, no vocals, instrumental only.",
      music_length_ms: 120000,
      model_id: "music_v1",
      force_instrumental: true,
    }),
  });
  if (!res.ok) throw new Error(`Music error ${res.status}: ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(bgmPath, buf);
  console.log(`✅ BGM: ${(buf.length / 1024).toFixed(0)} KB`);
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  // TTS
  for (const s of scenes) {
    const p = resolve(OUTPUT_DIR, `${s.id}.mp3`);
    if (existsSync(p)) { console.log(`⏭️  ${s.id}: skip`); continue; }
    console.log(`🎙️  ${s.id}: "${s.text.slice(0, 25)}..."`);
    const audio = await generateAudio(s.text);
    writeFileSync(p, audio);
    console.log(`✅ ${s.id}: ${(audio.length / 1024).toFixed(0)} KB`);
  }

  // BGM
  await generateBGM();

  console.log("\n🎉 完了！ npx remotion render DarioVsSam output/dario-vs-sam.mp4");
}

main().catch((e) => { console.error("❌", e); process.exit(1); });
