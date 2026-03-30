import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { z } from "zod";
import { getAudioDuration } from "./get-audio-duration";

// ── Design tokens ──────────────────────────────────────────
const BG = "#0f0f0f";
const ACCENT = "#c084fc";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#a1a1aa";
const CARD_BG = "rgba(255,255,255,0.05)";
const FONT = "SF Pro Display, Helvetica Neue, sans-serif";
const FPS = 30;
const PADDING_FRAMES = 15; // 0.5秒の余白を各シーンの後に追加

// ── Schema ─────────────────────────────────────────────────
export const narratedSchema = z.object({
  sceneDurations: z.array(z.number()),
});

type Props = z.infer<typeof narratedSchema>;

// ── Audio files ────────────────────────────────────────────
const AUDIO_FILES = [
  "voiceover/scene-01-title.mp3",
  "voiceover/scene-02-profile.mp3",
  "voiceover/scene-03-career.mp3",
  "voiceover/scene-04-quote.mp3",
  "voiceover/scene-05-closing.mp3",
];

// ── calculateMetadata: 音声の長さに合わせてシーン時間を動的設定 ──
export const calculateNarratedMetadata: CalculateMetadataFunction<
  Props
> = async () => {
  const durations = await Promise.all(
    AUDIO_FILES.map((file) => getAudioDuration(staticFile(file)))
  );

  const sceneDurations = durations.map((sec) =>
    Math.ceil(sec * FPS) + PADDING_FRAMES
  );
  const totalFrames = sceneDurations.reduce((sum, d) => sum + d, 0);

  return {
    durationInFrames: totalFrames,
    props: { sceneDurations },
  };
};

// ── Fade helper ────────────────────────────────────────────
const useFade = (fadeIn: number, fadeOut: number, total: number) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, fadeIn, total - fadeOut, total],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};

// ── Photo layer ────────────────────────────────────────────
const PhotoLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const photoOpacity = interpolate(
    frame,
    [0, fps * 0.6, durationInFrames - fps * 0.5, durationInFrames],
    [0, 0.35, 0.35, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const photoScale = interpolate(frame, [0, fps * 0.8], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        opacity: photoOpacity,
        transform: `scale(${photoScale})`,
      }}
    >
      <div
        style={{
          width: 1080,
          height: 1080,
          overflow: "hidden",
          border: `4px solid ${ACCENT}`,
          boxShadow: `0 0 80px rgba(192, 132, 252, 0.15)`,
        }}
      >
        <Img
          src={staticFile("images/amanda-askell2..png")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 1: Title ─────────────────────────────────────────
const TitleScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const nameY = interpolate(frame, [0, fps * 0.6], [40, 0], {
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(
    frame,
    [fps * 0.4, fps * 1.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const lineWidth = interpolate(frame, [fps * 0.6, fps * 1.5], [0, 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 200,
        opacity,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            letterSpacing: -2,
            transform: `translateY(${nameY}px)`,
          }}
        >
          Amanda Askell
        </div>
        <div
          style={{
            width: lineWidth,
            height: 4,
            backgroundColor: ACCENT,
            margin: "20px auto",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 36,
            color: ACCENT,
            fontFamily: FONT,
            fontWeight: 500,
            opacity: subtitleOpacity,
            letterSpacing: 3,
          }}
        >
          Philosopher &middot; AI Researcher &middot; Anthropic
        </div>
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
    { icon: "🎓", text: "哲学博士 (NYU) — 無限倫理学" },
    { icon: "🧠", text: "Claudeの性格設計の責任者" },
    { icon: "📝", text: 'Claudeの"魂"を定義する\n3万語の憲法を執筆' },
    { icon: "🏆", text: "TIME誌 AI最も影響力ある\n100人 (2024)" },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
        opacity,
      }}
    >
      <div style={{ width: 900, padding: "0 60px" }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: ACCENT,
            fontFamily: FONT,
            marginBottom: 44,
            textAlign: "center",
          }}
        >
          Who is Amanda Askell?
        </div>
        {items.map((item, i) => {
          const delay = fps * 0.5 + i * fps * 0.6;
          const itemOpacity = interpolate(
            frame,
            [delay, delay + fps * 0.4],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const itemX = interpolate(
            frame,
            [delay, delay + fps * 0.4],
            [30, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 28,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
              }}
            >
              <span style={{ fontSize: 48, flexShrink: 0 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 42,
                  color: TEXT_PRIMARY,
                  fontFamily: FONT,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  whiteSpace: "pre-line",
                }}
              >
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Career ────────────────────────────────────────
const CareerScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const milestones = [
    { year: "〜2018", label: "NYU 哲学博士号取得", sub: "無限倫理学を研究" },
    { year: "2018", label: "OpenAI 入社", sub: "GPT-3論文を共同執筆" },
    {
      year: "2021",
      label: "Anthropic 入社",
      sub: "Claudeの性格チームをリード",
    },
    {
      year: "2024",
      label: "TIME 100 AI 選出",
      sub: "AI界で最も影響力ある人物に",
    },
  ];

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 120,
        opacity,
      }}
    >
      <div style={{ width: 900, padding: "0 60px" }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: ACCENT,
            fontFamily: FONT,
            marginBottom: 44,
            textAlign: "center",
          }}
        >
          Career Journey
        </div>
        <div style={{ position: "relative", paddingLeft: 36 }}>
          {(() => {
            const lineH = interpolate(
              frame,
              [fps * 0.3, fps * 3.5],
              [0, 100],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: 8,
                  width: 3,
                  height: `${lineH}%`,
                  backgroundColor: ACCENT,
                  borderRadius: 2,
                }}
              />
            );
          })()}
          {milestones.map((m, i) => {
            const delay = fps * 0.6 + i * fps * 0.7;
            const mOpacity = interpolate(
              frame,
              [delay, delay + fps * 0.4],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 22,
                  marginBottom: 32,
                  opacity: mOpacity,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    backgroundColor: ACCENT,
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 34,
                      color: TEXT_SECONDARY,
                      fontFamily: FONT,
                      fontWeight: 600,
                    }}
                  >
                    {m.year}
                  </div>
                  <div
                    style={{
                      fontSize: 42,
                      color: TEXT_PRIMARY,
                      fontFamily: FONT,
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {m.label}
                  </div>
                  <div
                    style={{
                      fontSize: 30,
                      color: TEXT_SECONDARY,
                      fontFamily: FONT,
                      fontWeight: 400,
                      marginTop: 2,
                    }}
                  >
                    {m.sub}
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

  const quoteOpacity = interpolate(
    frame,
    [fps * 0.3, fps * 1.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const quoteScale = interpolate(
    frame,
    [fps * 0.3, fps * 1.2],
    [0.95, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const authorOpacity = interpolate(
    frame,
    [fps * 1.5, fps * 2.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 180,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: CARD_BG,
          borderRadius: 20,
          padding: "48px 56px",
          borderLeft: `4px solid ${ACCENT}`,
          opacity: quoteOpacity,
          transform: `scale(${quoteScale})`,
          margin: "0 60px",
        }}
      >
        <div
          style={{
            fontSize: 48,
            color: TEXT_PRIMARY,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          &ldquo;AIには、物事がうまくいかなくなる方法が数多くある&rdquo;
        </div>
        <div
          style={{
            fontSize: 34,
            color: ACCENT,
            fontFamily: FONT,
            fontWeight: 500,
            marginTop: 28,
            opacity: authorOpacity,
          }}
        >
          — Amanda Askell, Der Spiegel
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

  const taglineOpacity = interpolate(
    frame,
    [fps * 0.4, fps * 1.2],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 260,
        opacity,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            letterSpacing: -1,
          }}
        >
          AIに魂を与える哲学者
        </div>
        <div
          style={{
            fontSize: 44,
            color: ACCENT,
            fontFamily: FONT,
            fontWeight: 500,
            marginTop: 20,
            opacity: taglineOpacity,
            letterSpacing: 2,
          }}
        >
          Amanda Askell
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main composition ───────────────────────────────────────
export const AmandaAskellTikTokNarrated: React.FC<Props> = ({
  sceneDurations,
}) => {
  const { durationInFrames } = useVideoConfig();

  const sceneComponents = [
    TitleScene,
    ProfileScene,
    CareerScene,
    QuoteScene,
    ClosingScene,
  ];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Photo always visible */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <PhotoLayer />
      </Sequence>

      {/* BGM — low volume, fade in/out */}
      <Audio
        src={staticFile("voiceover/bgm.mp3")}
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

      {/* Scenes with synced audio */}
      {sceneComponents.map((SceneComp, i) => {
        const from = offset;
        const dur = sceneDurations[i] ?? 150;
        offset += dur;
        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={dur}
            premountFor={15}
          >
            <SceneComp duration={dur} />
            <Audio src={staticFile(AUDIO_FILES[i])} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
