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
const ACCENT = "#8b5cf6"; // purple for AI/research theme
const ACCENT2 = "#06b6d4"; // cyan secondary
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#a1a1aa";
const CARD_BG = "rgba(255,255,255,0.04)";
const FONT = "SF Pro Display, Helvetica Neue, sans-serif";
const FPS = 30;
const PADDING_FRAMES = 15;

// ── Schema ─────────────────────────────────────────────────
export const ilyaSchema = z.object({
  sceneDurations: z.array(z.number()),
});
type Props = z.infer<typeof ilyaSchema>;

// ── Audio files ────────────────────────────────────────────
const AUDIO_FILES = [
  "voiceover/ilya-sutskever/scene-01.mp3",
  "voiceover/ilya-sutskever/scene-02.mp3",
  "voiceover/ilya-sutskever/scene-03.mp3",
  "voiceover/ilya-sutskever/scene-04.mp3",
  "voiceover/ilya-sutskever/scene-05.mp3",
];

// ── calculateMetadata ──────────────────────────────────────
export const calculateIlyaMetadata: CalculateMetadataFunction<
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

// ── Photo Layer (subtle background) ────────────────────────
const PhotoLayer: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30, duration - 30, duration], [0, 0.12, 0.12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, duration], [1.05, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity, justifyContent: "center", alignItems: "center" }}>
      <Img
        src={staticFile("images/ilya-sutskever.jpg")}
        style={{
          width: "60%",
          height: "auto",
          objectFit: "cover",
          transform: `scale(${scale})`,
          filter: "blur(2px) grayscale(0.5)",
        }}
      />
    </AbsoluteFill>
  );
};

// ── Scene 1: Title ─────────────────────────────────────────
const TitleScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const nameOpacity = interpolate(frame, [fps * 0.3, fps * 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const nameY = interpolate(frame, [fps * 0.3, fps * 1], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const accentWidth = interpolate(frame, [fps * 0.8, fps * 1.5], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [fps * 1.2, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const photoOpacity = interpolate(frame, [fps * 0.5, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const photoScale = interpolate(frame, [fps * 0.5, fps * 1.2], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center", opacity }}
    >
      {/* Photo */}
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid ${ACCENT}`,
          boxShadow: `0 0 40px rgba(139,92,246,0.4)`,
          marginBottom: 32,
          opacity: photoOpacity,
          transform: `scale(${photoScale})`,
        }}
      >
        <Img
          src={staticFile("images/ilya-sutskever.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: TEXT_PRIMARY,
          fontFamily: FONT,
          letterSpacing: -1,
          opacity: nameOpacity,
          transform: `translateY(${nameY}px)`,
        }}
      >
        Ilya Sutskever
      </div>

      {/* Accent line */}
      <div
        style={{
          width: accentWidth,
          height: 4,
          background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
          borderRadius: 2,
          marginTop: 16,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontSize: 32,
          color: TEXT_SECONDARY,
          fontFamily: FONT,
          marginTop: 20,
          opacity: subtitleOpacity,
          letterSpacing: 4,
        }}
      >
        ディープラーニングの先駆者
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Profile ───────────────────────────────────────
const ProfileScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    { icon: "🇷🇺", text: "1986年 ロシア生まれ、イスラエル・カナダで育つ" },
    { icon: "🎓", text: "トロント大学でGeoffrey Hintonに師事" },
    { icon: "🧠", text: "AlexNet共同開発 — ディープラーニング革命の起点" },
    { icon: "🤖", text: "OpenAI共同創設者・チーフサイエンティスト" },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}>
      <div style={{ width: "100%" }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 48,
            textAlign: "center",
          }}
        >
          Who is Ilya Sutskever?
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
                marginBottom: 28,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: "20px 28px",
                borderLeft: `4px solid ${ACCENT}`,
              }}
            >
              <span style={{ fontSize: 40 }}>{item.icon}</span>
              <div style={{ fontSize: 32, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 400 }}>
                {item.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Career Timeline ───────────────────────────────
const CareerScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const milestones = [
    { year: "2012", text: "AlexNetで画像認識を革新", color: ACCENT },
    { year: "2014", text: "Sequence-to-Sequence学習を提案", color: ACCENT2 },
    { year: "2015", text: "OpenAI共同創設", color: ACCENT },
    { year: "2020", text: "GPTシリーズの研究を主導", color: ACCENT2 },
    { year: "2023", text: "OpenAI取締役会の反乱に関与", color: "#ef4444" },
    { year: "2024", text: "Safe Superintelligence Inc.を設立", color: ACCENT },
  ];

  const lineH = interpolate(frame, [fps * 0.3, fps * 4], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}>
      <div style={{ width: "100%" }}>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          キャリアの軌跡
        </div>
        <div style={{ position: "relative", paddingLeft: 50, maxWidth: 1600, margin: "0 auto" }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 10,
              width: 3,
              height: `${lineH}%`,
              background: `linear-gradient(${ACCENT}, ${ACCENT2})`,
              borderRadius: 2,
            }}
          />
          {milestones.map((item, i) => {
            const delay = fps * 0.5 + i * fps * 0.55;
            const mOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 24,
                  marginBottom: 28,
                  opacity: mOpacity,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: item.color,
                    flexShrink: 0,
                    marginTop: 6,
                    border: `3px solid ${BG}`,
                    boxShadow: `0 0 12px ${item.color}`,
                  }}
                />
                <div>
                  <div style={{ fontSize: 22, color: TEXT_SECONDARY, fontFamily: FONT, fontWeight: 600 }}>
                    {item.year}
                  </div>
                  <div style={{ fontSize: 32, color: TEXT_PRIMARY, fontFamily: FONT, fontWeight: 500, marginTop: 2 }}>
                    {item.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Quote ─────────────────────────────────────────
const QuoteScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const quoteOpacity = interpolate(frame, [fps * 0.3, fps * 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorOpacity = interpolate(frame, [fps * 1.5, fps * 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, padding: 100 }}>
      <div
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 24,
          padding: "60px 72px",
          borderLeft: `4px solid ${ACCENT}`,
          maxWidth: 1400,
        }}
      >
        <div
          style={{
            fontSize: 42,
            color: TEXT_PRIMARY,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            lineHeight: 1.7,
            opacity: quoteOpacity,
          }}
        >
          &ldquo;超知能は人類の歴史を終わらせうる技術だ。
          <br />
          それにふさわしい真剣さで取り組むべきだ。&rdquo;
        </div>
        <div
          style={{
            fontSize: 28,
            color: ACCENT,
            fontFamily: FONT,
            fontWeight: 500,
            marginTop: 32,
            opacity: authorOpacity,
          }}
        >
          — Ilya Sutskever
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Closing ───────────────────────────────────────
const ClosingScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const tagOpacity = interpolate(frame, [fps * 0.4, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ssiOpacity = interpolate(frame, [fps * 1.5, fps * 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            fontFamily: FONT,
            letterSpacing: -1,
            lineHeight: 1.4,
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          安全な超知能の実現へ
        </div>
        <div
          style={{
            fontSize: 36,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            fontWeight: 400,
            marginTop: 24,
            opacity: tagOpacity,
          }}
        >
          Ilya Sutskever
        </div>
        <div
          style={{
            fontSize: 28,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            fontWeight: 300,
            marginTop: 12,
            opacity: ssiOpacity,
            letterSpacing: 4,
          }}
        >
          Safe Superintelligence Inc. CEO
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ───────────────────────────────────────────────────
export const IlyaSutskeverVideo: React.FC<Props> = ({ sceneDurations }) => {
  const { durationInFrames } = useVideoConfig();

  const scenes = [TitleScene, ProfileScene, CareerScene, QuoteScene, ClosingScene];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Background photo layer */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <PhotoLayer duration={durationInFrames} />
      </Sequence>

      {/* BGM */}
      <Audio
        src={staticFile("voiceover/ilya-sutskever/bgm.mp3")}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, FPS * 2], [0, 0.15], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const fadeOut = interpolate(
            f,
            [durationInFrames - FPS * 3, durationInFrames],
            [0.15, 0],
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
