import {
  AbsoluteFill,
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
const BG = "#080c1a";
const CYAN = "#4ecdc4";
const PURPLE = "#9b59b6";
const ORANGE = "#e67e22";
const RED = "#e74c3c";
const STEEL = "#7f8fa6";
const TEXT_PRIMARY = "#ecf0f1";
const TEXT_SECONDARY = "#7f8c9b";
const CARD_BG = "rgba(255,255,255,0.04)";
const FONT = "Georgia, 'Noto Serif JP', serif";
const FONT_SANS = "SF Pro Display, Helvetica Neue, sans-serif";
const FPS = 30;
const PADDING_FRAMES = 15;

// ── Schema ─────────────────────────────────────────────────
export const orphansOfTheSkySchema = z.object({
  sceneDurations: z.array(z.number()),
});
type Props = z.infer<typeof orphansOfTheSkySchema>;

// ── Audio files ────────────────────────────────────────────
const AUDIO_FILES = [
  "voiceover/orphans-of-the-sky/scene-01.mp3",
  "voiceover/orphans-of-the-sky/scene-02.mp3",
  "voiceover/orphans-of-the-sky/scene-03.mp3",
  "voiceover/orphans-of-the-sky/scene-04.mp3",
  "voiceover/orphans-of-the-sky/scene-05.mp3",
  "voiceover/orphans-of-the-sky/scene-06.mp3",
];

// ── calculateMetadata ──────────────────────────────────────
export const calculateOrphansOfTheSkyMetadata: CalculateMetadataFunction<
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

  const shipOpacity = interpolate(frame, [fps * 0.2, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [fps * 0.6, fps * 1.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [fps * 0.6, fps * 1.3], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [fps * 1, fps * 1.8], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorOpacity = interpolate(frame, [fps * 1.3, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const yearOpacity = interpolate(frame, [fps * 1.8, fps * 2.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Star field
  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: ((i * 137.5) % 100),
    y: ((i * 73.1) % 100),
    size: 1 + (i % 3),
    twinkle: interpolate(
      frame,
      [0, fps * 2, fps * 4],
      [0.3, 1, 0.3].map((v) => v * (0.5 + (i % 5) * 0.1)),
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    ),
  }));

  return (
    <AbsoluteFill
      style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center", opacity }}
    >
      {/* Star field */}
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            opacity: star.twinkle,
          }}
        />
      ))}

      {/* Ship emoji */}
      <div style={{ fontSize: 80, opacity: shipOpacity, marginBottom: 24 }}>
        🚀
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 84,
          fontWeight: 700,
          color: CYAN,
          fontFamily: FONT,
          letterSpacing: 4,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          textShadow: `0 0 40px ${CYAN}40`,
        }}
      >
        宇宙の孤児
      </div>

      {/* English title */}
      <div
        style={{
          fontSize: 28,
          color: TEXT_SECONDARY,
          fontFamily: FONT,
          fontStyle: "italic",
          opacity: titleOpacity,
          marginTop: 8,
        }}
      >
        Orphans of the Sky
      </div>

      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
          marginTop: 24,
        }}
      />

      {/* Author */}
      <div
        style={{
          fontSize: 36,
          color: TEXT_PRIMARY,
          fontFamily: FONT,
          marginTop: 28,
          opacity: authorOpacity,
        }}
      >
        ロバート・A・ハインライン
      </div>

      {/* Year */}
      <div
        style={{
          fontSize: 22,
          color: TEXT_SECONDARY,
          fontFamily: FONT_SANS,
          marginTop: 12,
          opacity: yearOpacity,
          letterSpacing: 4,
        }}
      >
        1963
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: The Ship ──────────────────────────────────────
const ShipScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    { icon: "🚀", label: "ヴァンガード号", text: "遠い恒星を目指す巨大な世代宇宙船", color: CYAN },
    { icon: "👥", label: "乗組員の子孫", text: "何世代にもわたり船内で暮らす人々", color: STEEL },
    { icon: "📖", label: "失われた記憶", text: "「船」の外に宇宙があることを誰も知らない", color: PURPLE },
    { icon: "⛪", label: "科学者＝聖職者", text: "科学は宗教と化し、真実は教義に変わった", color: ORANGE },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1600 }}>
        <div
          style={{
            fontSize: 22,
            color: CYAN,
            fontFamily: FONT_SANS,
            fontWeight: 600,
            letterSpacing: 6,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          遥かなる未来
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          世代宇宙船ヴァンガード号
        </div>

        {items.map((item, i) => {
          const delay = fps * 0.5 + i * fps * 0.6;
          const itemOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const itemX = interpolate(frame, [delay, delay + fps * 0.4], [40, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                marginBottom: 24,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: "20px 28px",
                borderLeft: `4px solid ${item.color}`,
              }}
            >
              <span style={{ fontSize: 40, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 22, color: item.color, fontFamily: FONT_SANS, fontWeight: 700 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 28, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 400 }}>
                  {item.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: The Lost Knowledge ────────────────────────────
const LostKnowledgeScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const layers = [
    { label: "操縦室（上層）", desc: "ミュータントの領域", color: RED, emoji: "👹" },
    { label: "居住区（中層）", desc: "「科学者」が支配する社会", color: ORANGE, emoji: "🏛️" },
    { label: "農業区（下層）", desc: "食料生産と日常生活", color: CYAN, emoji: "🌱" },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1500 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          閉ざされた世界
        </div>
        <div
          style={{
            fontSize: 24,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            marginBottom: 48,
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          船こそが「全宇宙」だと信じる人々
        </div>

        {/* Ship cross-section visualization */}
        {layers.map((layer, i) => {
          const delay = fps * 0.5 + i * fps * 0.7;
          const layerOpacity = interpolate(frame, [delay, delay + fps * 0.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const layerX = interpolate(frame, [delay, delay + fps * 0.5], [-30, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 28,
                marginBottom: 24,
                opacity: layerOpacity,
                transform: `translateX(${layerX}px)`,
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: "24px 32px",
                borderLeft: `4px solid ${layer.color}`,
              }}
            >
              <span style={{ fontSize: 48, flexShrink: 0 }}>{layer.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, color: layer.color, fontFamily: FONT_SANS, fontWeight: 700 }}>
                  {layer.label}
                </div>
                <div style={{ fontSize: 28, color: TEXT_PRIMARY, fontFamily: FONT }}>
                  {layer.desc}
                </div>
              </div>
            </div>
          );
        })}

        {/* Divider text */}
        {(() => {
          const textDelay = fps * 3;
          const textOpacity = interpolate(frame, [textDelay, textDelay + fps * 0.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              style={{
                marginTop: 36,
                textAlign: "center",
                opacity: textOpacity,
                fontSize: 28,
                color: PURPLE,
                fontFamily: FONT,
                fontWeight: 600,
              }}
            >
              反乱の記憶は失われ、真実は神話となった
            </div>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Hugh's Discovery ──────────────────────────────
const DiscoveryScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const events = [
    { icon: "🔍", text: "ヒュー・ホイランド、上層デッキへ侵入", color: CYAN },
    { icon: "👹", text: "二つの頭を持つミュータント、ジョー＝ジムとの出会い", color: RED },
    { icon: "🌟", text: "操縦室の窓から「星」を見る衝撃の真実", color: PURPLE },
    { icon: "📚", text: "古い航海記録から「船」の本当の目的を知る", color: ORANGE },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1500 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: CYAN,
            fontFamily: FONT,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          真実への目覚め
        </div>
        <div
          style={{
            fontSize: 24,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          ヒュー・ホイランドの冒険が始まる
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          {events.map((item, i) => {
            const delay = fps * 0.5 + i * fps * 0.5;
            const cardOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const cardScale = interpolate(frame, [delay, delay + fps * 0.4], [0.9, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  width: "46%",
                  backgroundColor: CARD_BG,
                  borderRadius: 20,
                  padding: "32px 36px",
                  borderBottom: `3px solid ${item.color}`,
                  opacity: cardOpacity,
                  transform: `scale(${cardScale})`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontSize: 28, color: TEXT_PRIMARY, fontFamily: FONT, lineHeight: 1.5 }}>
                  {item.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Struggle & Escape ─────────────────────────────
const StruggleScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const quoteOpacity = interpolate(frame, [fps * 0.5, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const conflictOpacity = interpolate(frame, [fps * 2, fps * 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const escapeOpacity = interpolate(frame, [fps * 3.5, fps * 4.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 100 }}
    >
      <div style={{ textAlign: "center", maxWidth: 1400 }}>
        {/* Quote */}
        <div
          style={{
            backgroundColor: CARD_BG,
            borderRadius: 20,
            padding: "40px 56px",
            borderLeft: `4px solid ${RED}`,
            opacity: quoteOpacity,
            textAlign: "left",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: TEXT_PRIMARY,
              fontFamily: FONT,
              fontStyle: "italic",
              lineHeight: 1.7,
            }}
          >
            ヒューは仲間に真実を伝えようとするが、
            <br />
            誰も「船の外に世界がある」ことを信じない。
          </div>
          <div style={{ fontSize: 20, color: RED, fontFamily: FONT_SANS, marginTop: 20, fontWeight: 600 }}>
            &mdash; 真実を知る者の孤独
          </div>
        </div>

        {/* Conflict */}
        <div style={{ opacity: conflictOpacity, marginBottom: 32 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: ORANGE, fontFamily: FONT, marginBottom: 16 }}>
            権力者たちの妨害と内部抗争
          </div>
          <div style={{ fontSize: 26, color: TEXT_PRIMARY, fontFamily: FONT, lineHeight: 1.6 }}>
            「科学者」たちは異端として弾圧し、ミュータント同士の争いも激化する
          </div>
        </div>

        {/* Escape */}
        <div
          style={{
            opacity: escapeOpacity,
            backgroundColor: CARD_BG,
            borderRadius: 16,
            padding: "28px 40px",
            borderLeft: `4px solid ${CYAN}`,
          }}
        >
          <div style={{ fontSize: 32, color: CYAN, fontFamily: FONT, fontWeight: 700, marginBottom: 8 }}>
            脱出
          </div>
          <div style={{ fontSize: 26, color: TEXT_PRIMARY, fontFamily: FONT, lineHeight: 1.6 }}>
            混乱の中、ヒューと少数の仲間は小型艇で船を離れ、
            <br />
            ついに新しい惑星への着陸を果たす
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

  const quoteOpacity = interpolate(frame, [fps * 0.3, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagOpacity = interpolate(frame, [fps * 1.5, fps * 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const starOpacity = interpolate(frame, [fps * 2, fps * 2.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 100 }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 50,
            fontWeight: 700,
            fontFamily: FONT,
            letterSpacing: 2,
            lineHeight: 1.6,
            background: `linear-gradient(135deg, ${CYAN}, ${PURPLE}, ${ORANGE})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: quoteOpacity,
          }}
        >
          世界の「外」を想像する勇気。
          <br />
          それが人類を前へ進める。
        </div>

        <div style={{ fontSize: 60, marginTop: 24, opacity: starOpacity }}>
          🌌
        </div>

        <div
          style={{
            fontSize: 28,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            fontWeight: 400,
            marginTop: 24,
            opacity: tagOpacity,
          }}
        >
          ロバート・A・ハインライン
        </div>
        <div
          style={{
            fontSize: 40,
            color: CYAN,
            fontFamily: FONT,
            fontWeight: 700,
            marginTop: 8,
            opacity: tagOpacity,
            letterSpacing: 4,
          }}
        >
          宇宙の孤児
        </div>
        <div
          style={{
            fontSize: 18,
            color: TEXT_SECONDARY,
            fontFamily: FONT_SANS,
            marginTop: 8,
            opacity: tagOpacity,
            fontStyle: "italic",
          }}
        >
          Orphans of the Sky &middot; 1963
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ───────────────────────────────────────────────────
export const OrphansOfTheSkyVideo: React.FC<Props> = ({ sceneDurations }) => {
  const { durationInFrames } = useVideoConfig();

  const scenes = [
    TitleScene,
    ShipScene,
    LostKnowledgeScene,
    DiscoveryScene,
    StruggleScene,
    ClosingScene,
  ];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* BGM */}
      <Audio
        src={staticFile("voiceover/orphans-of-the-sky/bgm.mp3")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, FPS * 2], [0, 0.13], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - FPS * 3, durationInFrames],
            [0.13, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
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
