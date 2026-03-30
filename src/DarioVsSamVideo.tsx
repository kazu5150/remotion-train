import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  CalculateMetadataFunction,
} from "remotion";
import { Audio } from "@remotion/media";
import { z } from "zod";
import { getAudioDuration } from "./get-audio-duration";

// ── Design tokens ──────────────────────────────────────────
const BG = "#0a0a0a";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#a1a1aa";
const CARD_BG = "rgba(255,255,255,0.04)";
const FONT = "SF Pro Display, Helvetica Neue, sans-serif";
const FPS = 30;
const PADDING_FRAMES = 15;

// ── Schema ─────────────────────────────────────────────────
export const darioSamSchema = z.object({
  sceneDurations: z.array(z.number()),
});
type Props = z.infer<typeof darioSamSchema>;

// ── Audio files ────────────────────────────────────────────
const AUDIO_FILES = [
  "voiceover/dario-sam/scene-01.mp3",
  "voiceover/dario-sam/scene-02.mp3",
  "voiceover/dario-sam/scene-03.mp3",
  "voiceover/dario-sam/scene-04.mp3",
  "voiceover/dario-sam/scene-05.mp3",
  "voiceover/dario-sam/scene-06.mp3",
];

// ── calculateMetadata ──────────────────────────────────────
export const calculateDarioSamMetadata: CalculateMetadataFunction<
  Props
> = async () => {
  const durations = await Promise.all(
    AUDIO_FILES.map((file) => getAudioDuration(staticFile(file)))
  );
  const sceneDurations = durations.map(
    (sec) => Math.ceil(sec * FPS) + PADDING_FRAMES
  );
  return {
    durationInFrames: sceneDurations.reduce((sum, d) => sum + d, 0),
    props: { sceneDurations },
  };
};

// ── Helpers ────────────────────────────────────────────────
const useFade = (fadeIn: number, fadeOut: number, total: number) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeIn, total - fadeOut, total],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};

// ── Scene 1: Title ─────────────────────────────────────────
const TitleScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const vsScale = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameOpacity = interpolate(frame, [fps * 0.5, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [fps * 1, fps * 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center", opacity }}
    >
      {/* VS badge */}
      <div
        style={{
          fontSize: 160,
          fontWeight: 900,
          fontFamily: FONT,
          color: TEXT_PRIMARY,
          textShadow: `0 0 60px ${RED}, 0 0 60px ${BLUE}`,
          transform: `scale(${vsScale})`,
          letterSpacing: 8,
        }}
      >
        VS
      </div>

      {/* Names with photos */}
      <div
        style={{
          display: "flex",
          gap: 80,
          marginTop: 40,
          opacity: nameOpacity,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 400, height: 400, borderRadius: "50%", overflow: "hidden", border: `3px solid ${RED}`, boxShadow: `0 0 30px rgba(239,68,68,0.4)`, margin: "0 auto 16px" }}>
            <Img src={staticFile("images/dario-amodei.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, color: RED, fontFamily: FONT }}>
            Dario Amodei
          </div>
          <div style={{ fontSize: 28, color: TEXT_SECONDARY, fontFamily: FONT, marginTop: 8 }}>
            Anthropic CEO
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 400, height: 400, borderRadius: "50%", overflow: "hidden", border: `3px solid ${BLUE}`, boxShadow: `0 0 30px rgba(59,130,246,0.4)`, margin: "0 auto 16px" }}>
            <Img src={staticFile("images/sam-altman.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, color: BLUE, fontFamily: FONT }}>
            Sam Altman
          </div>
          <div style={{ fontSize: 28, color: TEXT_SECONDARY, fontFamily: FONT, marginTop: 8 }}>
            OpenAI CEO
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 36,
          color: TEXT_SECONDARY,
          fontFamily: FONT,
          marginTop: 48,
          opacity: subtitleOpacity,
          letterSpacing: 6,
        }}
      >
        AI時代を揺るがす二人の確執
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Origins at OpenAI ─────────────────────────────
const OriginsScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    { year: "2015", text: "Sam Altman、OpenAIを共同設立", color: BLUE },
    { year: "2016", text: "Dario Amodei、OpenAI研究VP就任", color: RED },
    { year: "2018-20", text: "共にGPT-2/GPT-3開発を主導", color: TEXT_PRIMARY },
    { year: "2021.1", text: "Amodei、OpenAIを退社", color: RED },
    { year: "2021.2", text: "Anthropicを設立。7名が離脱", color: RED },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}>
      <div style={{ width: "100%" }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: FONT, marginBottom: 40, textAlign: "center" }}>
          始まり — OpenAI時代
        </div>
        <div style={{ display: "flex", gap: 50 }}>
          {/* Timeline */}
          <div style={{ flex: 1, position: "relative", paddingLeft: 50 }}>
            {(() => {
              const lineH = interpolate(frame, [fps * 0.3, fps * 3.5], [0, 100], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp",
              });
              return (
                <div style={{ position: "absolute", left: 16, top: 10, width: 3, height: `${lineH}%`, background: `linear-gradient(${RED}, ${BLUE})`, borderRadius: 2 }} />
              );
            })()}
            {items.map((item, i) => {
              const delay = fps * 0.5 + i * fps * 0.6;
              const mOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp",
              });
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 36, opacity: mOpacity }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: item.color, flexShrink: 0, marginTop: 4, border: `3px solid ${BG}`, boxShadow: `0 0 12px ${item.color}` }} />
                  <div>
                    <div style={{ fontSize: 24, color: TEXT_SECONDARY, fontFamily: FONT, fontWeight: 600 }}>{item.year}</div>
                    <div style={{ fontSize: 34, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>{item.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* OpenAI building photo */}
          {(() => {
            const pOpacity = interpolate(frame, [fps * 0.5, fps * 1.2], [0, 1], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });
            return (
              <div style={{ flexShrink: 0, opacity: pOpacity }}>
                <div style={{ width: 960, borderRadius: 16, overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
                  <Img src={staticFile("images/openai-building.jpg")} style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
                <div style={{ fontSize: 16, color: TEXT_SECONDARY, fontFamily: FONT, textAlign: "center", marginTop: 8 }}>
                  OpenAI旧本社 — San Francisco
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Core Conflict ─────────────────────────────────
const ConflictScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    { icon: "🛡️", label: "Amodei", text: "安全性第一。開発速度を落とすべき", color: RED },
    { icon: "🚀", label: "Altman", text: "急速な展開と商業化を推進", color: BLUE },
    { icon: "⚔️", label: "対立", text: "AGIの管理を政府に売るか否か", color: TEXT_PRIMARY },
    { icon: "💔", label: "決裂", text: 'Amodei「心理的虐待を受けた」', color: RED },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 100 }}>
      <div style={{ width: "100%" }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: FONT, marginBottom: 50, textAlign: "center" }}>
          対立の核心
        </div>
        {items.map((item, i) => {
          const delay = fps * 0.5 + i * fps * 0.7;
          const itemOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          const itemX = interpolate(frame, [delay, delay + fps * 0.4], [40, 0], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, opacity: itemOpacity, transform: `translateX(${itemX}px)`, backgroundColor: CARD_BG, borderRadius: 16, padding: "20px 28px", borderLeft: `4px solid ${item.color}` }}>
              <span style={{ fontSize: 40 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 22, color: item.color, fontFamily: FONT, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 32, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 400 }}>{item.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Pentagon Crisis 2026 ──────────────────────────
const PentagonScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    { date: "2026年2月", text: "インドAIサミットで握手拒否が話題に" },
    { date: "2026年2月27日", text: "Anthropicが国防総省ブラックリストに" },
    { date: "同日", text: "OpenAIが国防総省と契約締結" },
    { date: "2026年3月", text: "Amodeiの内部メモが流出し謝罪" },
  ];

  const imgOpacity = interpolate(frame, [fps * 0.3, fps * 1], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const imgScale = interpolate(frame, [fps * 0.3, fps * 1], [0.9, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}>
      <div style={{ width: "100%" }}>
        <div style={{ fontSize: 48, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: FONT, marginBottom: 40, textAlign: "center" }}>
          2026年 — 国防総省危機
        </div>
        <div style={{ display: "flex", gap: 50, alignItems: "flex-start" }}>
          {/* India Summit photo */}
          <div style={{ opacity: imgOpacity, transform: `scale(${imgScale})`, flexShrink: 0 }}>
            <div style={{ width: 580, borderRadius: 16, overflow: "hidden", border: `2px solid rgba(255,255,255,0.1)`, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>
              <Img
                src={staticFile("images/india-summit.png")}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
            <div style={{ fontSize: 18, color: TEXT_SECONDARY, fontFamily: FONT, textAlign: "center", marginTop: 10 }}>
              インドAIサミット 2026年2月
            </div>
          </div>

          {/* Timeline items */}
          <div style={{ flex: 1 }}>
            {items.map((item, i) => {
              const delay = fps * 0.8 + i * fps * 0.7;
              const itemOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
                extrapolateLeft: "clamp", extrapolateRight: "clamp",
              });
              return (
                <div key={i} style={{ marginBottom: 24, opacity: itemOpacity, backgroundColor: CARD_BG, borderRadius: 14, padding: "18px 24px" }}>
                  <div style={{ fontSize: 20, color: TEXT_SECONDARY, fontFamily: FONT, fontWeight: 600 }}>{item.date}</div>
                  <div style={{ fontSize: 28, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 400, marginTop: 4 }}>{item.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Quotes ────────────────────────────────────────
const QuotesScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const q1Opacity = interpolate(frame, [fps * 0.3, fps * 1], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const q2Opacity = interpolate(frame, [fps * 2, fps * 2.7], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 100 }}>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 50 }}>
        {/* Amodei quote */}
        <div style={{ backgroundColor: CARD_BG, borderRadius: 20, padding: "40px 48px", borderLeft: `4px solid ${RED}`, opacity: q1Opacity, display: "flex", gap: 32, alignItems: "center" }}>
          <div style={{ width: 220, height: 220, borderRadius: "50%", overflow: "hidden", border: `2px solid ${RED}`, flexShrink: 0 }}>
            <Img src={staticFile("images/dario-amodei.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontSize: 34, color: TEXT_PRIMARY, fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.6 }}>
              &ldquo;OpenAIの安全対策は見せかけの安全劇場だ&rdquo;
            </div>
            <div style={{ fontSize: 24, color: RED, fontFamily: FONT, fontWeight: 500, marginTop: 16 }}>
              — Dario Amodei（流出メモ, 2026年）
            </div>
          </div>
        </div>
        {/* Altman quote */}
        <div style={{ backgroundColor: CARD_BG, borderRadius: 20, padding: "40px 48px", borderLeft: `4px solid ${BLUE}`, opacity: q2Opacity, display: "flex", gap: 32, alignItems: "center" }}>
          <div style={{ width: 220, height: 220, borderRadius: "50%", overflow: "hidden", border: `2px solid ${BLUE}`, flexShrink: 0 }}>
            <Img src={staticFile("images/sam-altman.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontSize: 34, color: TEXT_PRIMARY, fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.6 }}>
              &ldquo;国防総省との契約は日和見的で雑に見えた&rdquo;
            </div>
            <div style={{ fontSize: 24, color: BLUE, fontFamily: FONT, fontWeight: 500, marginTop: 16 }}>
              — Sam Altman（2026年3月）
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 6: Closing ───────────────────────────────────────
const ClosingScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const tagOpacity = interpolate(frame, [fps * 0.4, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: TEXT_PRIMARY, fontFamily: FONT, letterSpacing: -1, lineHeight: 1.3 }}>
          安全か、速度か。
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, fontFamily: FONT, letterSpacing: -1, marginTop: 8, background: `linear-gradient(90deg, ${RED}, ${BLUE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AI時代の最大の問い。
        </div>
        <div style={{ fontSize: 32, color: TEXT_SECONDARY, fontFamily: FONT, fontWeight: 400, marginTop: 32, opacity: tagOpacity }}>
          Dario Amodei vs Sam Altman
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ───────────────────────────────────────────────────
export const DarioVsSamVideo: React.FC<Props> = ({ sceneDurations }) => {
  const { durationInFrames } = useVideoConfig();

  const scenes = [TitleScene, OriginsScene, ConflictScene, PentagonScene, QuotesScene, ClosingScene];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* BGM */}
      <Audio
        src={staticFile("voiceover/dario-sam/bgm.mp3")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, FPS * 2], [0, 0.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const fadeOut = interpolate(f, [durationInFrames - FPS * 3, durationInFrames], [0.12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return Math.min(fadeIn, fadeOut);
        }}
      />

      {scenes.map((SceneComp, i) => {
        const from = offset;
        const dur = sceneDurations[i] ?? 150;
        offset += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} premountFor={15}>
            <SceneComp duration={dur} />
            <Audio src={staticFile(AUDIO_FILES[i])} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
