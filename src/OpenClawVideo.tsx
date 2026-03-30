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
const BG = "#0a0a0a";
const CYAN = "#06b6d4";
const ORANGE = "#f97316";
const RED = "#ef4444";
const GREEN = "#22c55e";
const PURPLE = "#a855f7";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "#a1a1aa";
const CARD_BG = "rgba(255,255,255,0.04)";
const FONT = "SF Pro Display, Helvetica Neue, sans-serif";
const FPS = 30;
const PADDING_FRAMES = 15;

// ── Schema ─────────────────────────────────────────────────
export const openClawSchema = z.object({
  sceneDurations: z.array(z.number()),
});
type Props = z.infer<typeof openClawSchema>;

// ── Audio files ────────────────────────────────────────────
const AUDIO_FILES = [
  "voiceover/openclaw/scene-01.mp3",
  "voiceover/openclaw/scene-02.mp3",
  "voiceover/openclaw/scene-03.mp3",
  "voiceover/openclaw/scene-04.mp3",
  "voiceover/openclaw/scene-05.mp3",
  "voiceover/openclaw/scene-06.mp3",
];

// ── calculateMetadata ──────────────────────────────────────
export const calculateOpenClawMetadata: CalculateMetadataFunction<
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

  const badgeOpacity = interpolate(frame, [fps * 0.2, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleOpacity = interpolate(frame, [fps * 0.5, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [fps * 0.5, fps * 1.2], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [fps * 1, fps * 1.8], [0, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [fps * 1.5, fps * 2.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: BG, justifyContent: "center", alignItems: "center", opacity }}
    >
      {/* Source badge */}
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: CYAN,
          fontFamily: FONT,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: badgeOpacity,
          marginBottom: 28,
        }}
      >
        CNBC &middot; 2026年3月27日
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 68,
          fontWeight: 800,
          color: TEXT_PRIMARY,
          fontFamily: FONT,
          letterSpacing: -1,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        OpenClaw開発者が警鐘
      </div>

      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 4,
          background: `linear-gradient(90deg, ${CYAN}, ${ORANGE})`,
          borderRadius: 2,
          marginTop: 20,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          fontSize: 32,
          color: TEXT_SECONDARY,
          fontFamily: FONT,
          marginTop: 24,
          opacity: subtitleOpacity,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        米国に中国のAI導入姿勢から学ぶよう警告
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: Two AI Cultures ───────────────────────────────
const TwoCulturesScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const usDelay = fps * 0.5;
  const cnDelay = fps * 1.5;
  const usOpacity = interpolate(frame, [usDelay, usDelay + fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cnOpacity = interpolate(frame, [cnDelay, cnDelay + fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vsOpacity = interpolate(frame, [fps * 2.5, fps * 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const vsScale = interpolate(frame, [fps * 2.5, fps * 3], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1600 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: TEXT_PRIMARY,
            fontFamily: FONT,
            marginBottom: 48,
            textAlign: "center",
          }}
        >
          2つのAI文化
        </div>

        <div style={{ display: "flex", gap: 40, justifyContent: "center", alignItems: "stretch" }}>
          {/* US side */}
          <div
            style={{
              flex: 1,
              backgroundColor: CARD_BG,
              borderRadius: 24,
              padding: "36px 40px",
              borderTop: `4px solid ${RED}`,
              opacity: usOpacity,
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🇺🇸</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: RED, fontFamily: FONT, marginBottom: 12 }}>
              米国
            </div>
            <div style={{ fontSize: 26, color: TEXT_PRIMARY, fontFamily: FONT, lineHeight: 1.6 }}>
              &ldquo;OpenClawを使うと
              <br />
              <span style={{ color: RED, fontWeight: 700 }}>解雇されるかもしれない</span>&rdquo;
            </div>
            <div style={{ fontSize: 20, color: TEXT_SECONDARY, fontFamily: FONT, marginTop: 16 }}>
              セキュリティ懸念から使用を制限・禁止
            </div>
          </div>

          {/* VS */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              opacity: vsOpacity,
              transform: `scale(${vsScale})`,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 900,
                color: TEXT_PRIMARY,
                fontFamily: FONT,
                textShadow: `0 0 40px ${CYAN}, 0 0 40px ${ORANGE}`,
              }}
            >
              VS
            </div>
          </div>

          {/* China side */}
          <div
            style={{
              flex: 1,
              backgroundColor: CARD_BG,
              borderRadius: 24,
              padding: "36px 40px",
              borderTop: `4px solid ${GREEN}`,
              opacity: cnOpacity,
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>🇨🇳</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: GREEN, fontFamily: FONT, marginBottom: 12 }}>
              中国
            </div>
            <div style={{ fontSize: 26, color: TEXT_PRIMARY, fontFamily: FONT, lineHeight: 1.6 }}>
              &ldquo;OpenClawを使わないと
              <br />
              <span style={{ color: GREEN, fontWeight: 700 }}>解雇されるかもしれない</span>&rdquo;
            </div>
            <div style={{ fontSize: 20, color: TEXT_SECONDARY, fontFamily: FONT, marginTop: 16 }}>
              従業員の自動化成果を追跡するまでに
            </div>
          </div>
        </div>

        {/* Attribution */}
        <div
          style={{
            fontSize: 20,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            textAlign: "center",
            marginTop: 32,
            fontStyle: "italic",
            opacity: vsOpacity,
          }}
        >
          &mdash; Peter Steinberger, OpenAI本社でのBloombergインタビュー
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: China's Enthusiasm ────────────────────────────
const ChinaEnthusiasmScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    {
      icon: "🏃",
      title: "行列をなす導入熱",
      desc: "学生、専門職、退職者がイベントに殺到し、インストールを依頼",
      color: GREEN,
    },
    {
      icon: "📋",
      title: "自動化成果の追跡",
      desc: "「本日自動化したこと」を記録するフォームを企業が作成",
      color: CYAN,
    },
    {
      icon: "🔒",
      title: "米国の慎重な姿勢",
      desc: "セキュリティ懸念から多くの企業がAIエージェントの使用を制限",
      color: RED,
    },
    {
      icon: "⚡",
      title: "Steinbergerの主張",
      desc: "「テクノロジーは新しすぎる。学ぶ唯一の方法は自分たちで試すこと」",
      color: ORANGE,
    },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1600 }}>
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
          中国の熱狂と米国の慎重さ
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          {items.map((item, i) => {
            const delay = fps * 0.5 + i * fps * 0.6;
            const cardOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const cardY = interpolate(frame, [delay, delay + fps * 0.4], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  width: "47%",
                  backgroundColor: CARD_BG,
                  borderRadius: 20,
                  padding: "28px 32px",
                  borderTop: `3px solid ${item.color}`,
                  opacity: cardOpacity,
                  transform: `translateY(${cardY}px)`,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: TEXT_PRIMARY,
                    fontFamily: FONT,
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: TEXT_SECONDARY,
                    fontFamily: FONT,
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: Karpathy's Dobby ──────────────────────────────
const KarpathyScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const titleOpacity = interpolate(frame, [fps * 0.3, fps * 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const quoteOpacity = interpolate(frame, [fps * 1.2, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const features = [
    { label: "照明", icon: "💡" },
    { label: "空調", icon: "❄️" },
    { label: "ブラインド", icon: "🪟" },
    { label: "プール & スパ", icon: "🏊" },
    { label: "セキュリティ", icon: "🔐" },
  ];

  const statsItems = [
    { stat: "6", label: "不要になったアプリ数" },
    { stat: "0", label: "12月以降に書いたコード行数" },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1600 }}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: PURPLE,
            fontFamily: FONT,
            marginBottom: 12,
            textAlign: "center",
            opacity: titleOpacity,
          }}
        >
          カーパシーの「屋敷しもべ妖精ドビー」
        </div>
        <div
          style={{
            fontSize: 22,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            marginBottom: 40,
            textAlign: "center",
            opacity: titleOpacity,
          }}
        >
          OpenAI共同創業者が構築したAIホームオートメーション
        </div>

        {/* Features */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 36 }}>
          {features.map((f, i) => {
            const delay = fps * 0.8 + i * fps * 0.3;
            const fOpacity = interpolate(frame, [delay, delay + fps * 0.3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  backgroundColor: CARD_BG,
                  borderRadius: 16,
                  padding: "16px 24px",
                  textAlign: "center",
                  border: `1px solid ${PURPLE}30`,
                  opacity: fOpacity,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 18, color: TEXT_PRIMARY, fontFamily: FONT }}>{f.label}</div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginBottom: 36 }}>
          {statsItems.map((s, i) => {
            const delay = fps * 2 + i * fps * 0.5;
            const sOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  backgroundColor: CARD_BG,
                  borderRadius: 20,
                  padding: "28px 48px",
                  textAlign: "center",
                  borderBottom: `3px solid ${PURPLE}`,
                  opacity: sOpacity,
                }}
              >
                <div
                  style={{
                    fontSize: 72,
                    fontWeight: 900,
                    color: PURPLE,
                    fontFamily: FONT,
                  }}
                >
                  {s.stat}
                </div>
                <div style={{ fontSize: 20, color: TEXT_SECONDARY, fontFamily: FONT, marginTop: 8 }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quote */}
        <div
          style={{
            backgroundColor: CARD_BG,
            borderRadius: 16,
            padding: "20px 32px",
            borderLeft: `4px solid ${PURPLE}`,
            opacity: quoteOpacity,
          }}
        >
          <div
            style={{
              fontSize: 26,
              color: TEXT_PRIMARY,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              lineHeight: 1.6,
            }}
          >
            &ldquo;FedExのトラックが来ましたよ。確認したほうがいいかもしれません&rdquo;
          </div>
          <div style={{ fontSize: 18, color: PURPLE, fontFamily: FONT, marginTop: 8 }}>
            &mdash; Dobbyからのwhatsappメッセージ
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: Future of OpenClaw ────────────────────────────
const FutureScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = useFade(fps * 0.5, fps * 0.5, duration);

  const items = [
    {
      icon: "⭐",
      title: "GitHub 10万+ スター",
      desc: "オープンソースAIエージェントとして圧倒的な支持",
      color: ORANGE,
    },
    {
      icon: "🏛️",
      title: "独立財団へ移行",
      desc: "Nvidia、ByteDance、Tencentなどがパートナーに",
      color: CYAN,
    },
    {
      icon: "🧠",
      title: "Jensen Huangの評価",
      desc: "「おそらくこれまでで最も重要なソフトウェアリリース」",
      color: GREEN,
    },
    {
      icon: "🔮",
      title: "Steinbergerの現在",
      desc: "OpenAI Codexチームで個人・ビジネス用AIエージェント統合に従事",
      color: PURPLE,
    },
  ];

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 80 }}
    >
      <div style={{ width: "100%", maxWidth: 1600 }}>
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
          OpenClawの未来
        </div>

        {items.map((item, i) => {
          const delay = fps * 0.5 + i * fps * 0.6;
          const itemOpacity = interpolate(frame, [delay, delay + fps * 0.4], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const itemX = interpolate(frame, [delay, delay + fps * 0.4], [50, 0], {
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
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: TEXT_PRIMARY,
                    fontFamily: FONT,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    color: TEXT_SECONDARY,
                    fontFamily: FONT,
                    marginTop: 4,
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
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

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", opacity, padding: 100 }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 50,
            fontWeight: 800,
            fontFamily: FONT,
            letterSpacing: -1,
            lineHeight: 1.5,
            background: `linear-gradient(135deg, ${CYAN}, ${ORANGE}, ${GREEN})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: quoteOpacity,
          }}
        >
          実験か、慎重か。
          <br />
          AI時代の競争を左右するのは文化。
        </div>
        <div
          style={{
            fontSize: 28,
            color: TEXT_SECONDARY,
            fontFamily: FONT,
            fontWeight: 400,
            marginTop: 36,
            opacity: tagOpacity,
            letterSpacing: 4,
          }}
        >
          OpenClaw &mdash; 2つのAI文化の物語
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ───────────────────────────────────────────────────
export const OpenClawVideo: React.FC<Props> = ({ sceneDurations }) => {
  const { durationInFrames } = useVideoConfig();

  const scenes = [
    TitleScene,
    TwoCulturesScene,
    ChinaEnthusiasmScene,
    KarpathyScene,
    FutureScene,
    ClosingScene,
  ];

  let offset = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* BGM */}
      <Audio
        src={staticFile("voiceover/openclaw/bgm.mp3")}
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
